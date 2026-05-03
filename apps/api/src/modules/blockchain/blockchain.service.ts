import {
    Injectable,
    Logger,
    OnModuleInit,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { KINDLINK_CAMPAIGN_ABI } from '../../constants/blockchain.constants';
import { DepositResult, DisburseResult, OnchainCampaign } from './blockchain.types';

/**
 * BlockchainService
 * ─────────────────
 * Central gateway for ALL on-chain interactions.
 *
 * Wallet architecture:
 *  - ownerWallet  : contract owner — createCampaign, markSuccess/Failed, approveWithdraw
 *  - hotWallet    : high-frequency operations — donate() on behalf of banking donors
 *
 * Both wallets are read from env at startup and validated eagerly.
 */
@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);

    private provider: ethers.JsonRpcProvider;

    /** Signed with OWNER key — for admin-only SC functions */
    private ownerContract: ethers.Contract;

    /** Signed with HOT-WALLET key — for donate() calls */
    private hotContract: ethers.Contract;

    private ownerWallet: ethers.Wallet;
    private hotWallet: ethers.Wallet;

    /** Read-only instance for view calls */
    private readContract: ethers.Contract;

    /** Internal rate: VND → POL  (set once, immutable per deployment) */
    private readonly VND_TO_POL: number; // e.g. 0.001 means 1000 VND = 1 POL

    constructor(private readonly config: ConfigService) {
        this.VND_TO_POL = Number(config.get<string>('POL_PER_VND') ?? '0.001');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    async onModuleInit() {
        try {
            const rpc = this.config.getOrThrow<string>('POLYGON_RPC_URL');
            const contractAddress = this.config.getOrThrow<string>('CONTRACT_ADDRESS').trim();
            const ownerKey = this.config.getOrThrow<string>('OWNER_WALLET_PRIVATE_KEY');
            const hotKey = this.config.getOrThrow<string>('HOT_WALLET_PRIVATE_KEY');

            if (!ethers.isAddress(contractAddress)) {
                throw new Error(`Invalid CONTRACT_ADDRESS in .env: "${contractAddress}"`);
            }

            const cleanAddress = ethers.getAddress(contractAddress);

            this.provider = new ethers.JsonRpcProvider(rpc);

            this.ownerWallet = new ethers.Wallet(ownerKey, this.provider);
            this.hotWallet = new ethers.Wallet(hotKey, this.provider);

            this.ownerContract = new ethers.Contract(cleanAddress, KINDLINK_CAMPAIGN_ABI, this.ownerWallet);
            this.hotContract = new ethers.Contract(cleanAddress, KINDLINK_CAMPAIGN_ABI, this.hotWallet);
            this.readContract = new ethers.Contract(cleanAddress, KINDLINK_CAMPAIGN_ABI, this.provider);

            this.logger.log(`✅ BlockchainService initialised`);
            this.logger.log(`   Owner Wallet  : ${this.ownerWallet.address}`);
            this.logger.log(`   Hot Wallet    : ${this.hotWallet.address}`);
            this.logger.log(`   Contract Addr : ${cleanAddress}`);
        } catch (err: any) {
            this.logger.error(`❌ BlockchainService init FAILED: ${err.stack || err.message}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API — Deposits
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by DonationsService after a banking (PayOS) webhook confirms payment.
     * Hot-wallet sends equivalent POL into the smart-contract on behalf of the donor.
     *
     * @param campaignId  Off-chain UUID of the campaign
     * @param amountVND   Donation amount in VND (integer, e.g. 500000)
     * @param donorLabel  Human label for logs (e.g. user email or "Guest")
     */
    async depositForBankingDonation(
        campaignId: string,
        amountVND: number,
        donorLabel = 'Guest',
    ): Promise<DepositResult> {
        this.ensureReady();

        const polAmount = this.vndToPol(amountVND);
        const polWei = ethers.parseEther(polAmount.toFixed(18));
        const campaignKey = await this.getCampaignKey(campaignId);

        const balance = await this.provider.getBalance(this.hotContract.target);
        this.logger.log(
            `[HotWallet] deposit ${polAmount} POL (${amountVND} VND) for campaign ${campaignId}. ` +
            `Key: ${campaignKey}. Target: ${this.hotContract.target}. Balance: ${ethers.formatEther(balance)} POL`,
        );

        try {
            if (!campaignKey || !campaignKey.startsWith('0x')) {
                throw new Error(`Invalid campaign key received: ${campaignKey}`);
            }

            // Check if campaign exists on-chain first (prevents confusing gas estimation errors)
            const onchain = await this.getOnchainCampaign(campaignId);
            if (!onchain.exists) {
                throw new Error(`Chiến dịch này chưa được khởi tạo trên Smart Contract mới. Vui lòng duyệt lại chiến dịch.`);
            }

            // Check Hot Wallet balance
            const balance = await this.provider.getBalance(this.hotWallet.address);
            if (balance < polWei) {
                throw new Error(`Số dư ví hệ thống (Hot Wallet) không đủ: Cần ${polAmount} POL nhưng hiện chỉ có ${ethers.formatEther(balance)} POL.`);
            }

            const tx: ethers.TransactionResponse = await this.hotContract.donate(campaignKey, {
                value: polWei,
            });
            const receipt = await tx.wait();
            if (!receipt) throw new Error('Transaction receipt is null');

            const result: DepositResult = {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                polAmount: polAmount.toFixed(6),
                gasUsed: receipt.gasUsed.toString(),
            };

            this.logger.log(`[HotWallet] ✅ deposit confirmed — txHash: ${result.txHash}`);
            return result;
        } catch (err: any) {
            this.logger.error(`[HotWallet] deposit FAILED: ${err.message}`);

            // Refine error message for UX
            let userFriendlyMessage = err.message;
            if (err.code === 'INSUFFICIENT_FUNDS') {
                userFriendlyMessage = "Ví hệ thống không đủ phí gas để thực hiện giao dịch.";
            } else if (err.code === 'CALL_EXCEPTION') {
                userFriendlyMessage = "Giao dịch bị từ chối bởi Smart Contract (có thể do chiến dịch chưa sẵn sàng).";
            }

            throw new InternalServerErrorException(`Lỗi Blockchain: ${userFriendlyMessage}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API — Withdrawals
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by WithdrawalsService when admin confirms disbursement.
     * Owner-wallet calls approveWithdraw() → SC sends POL to platformWallet.
     *
     * @param campaignId  Off-chain UUID
     * @returns           DisburseResult with txHash and amounts
     */
    async disburseWithdrawal(campaignId: string, withdrawalRequestId: string, amountVND: number): Promise<DisburseResult> {
        this.ensureReady();

        const campaignKey = await this.getCampaignKey(campaignId);

        // Convert VND amount to Wei for the specific withdrawal request
        const polAmount = this.vndToPol(amountVND);
        const amountWei = ethers.parseEther(polAmount.toFixed(18));

        // Mirror the SC fee computation (same formula as SC)
        const feeBps = await this.readContract.platformFeeBps() as bigint;
        const feeDenominator = await this.readContract.FEE_DENOMINATOR() as bigint;
        const feeWei = (amountWei * feeBps) / feeDenominator;

        this.logger.log(
            `[OwnerWallet] approveWithdraw campaign ${campaignId} — ` +
            `request: ${polAmount} POL, ` +
            `fee: ${ethers.formatEther(feeWei)} POL`,
        );

        try {
            // New Version 2 signature: approveWithdraw(bytes32 campaignKey, string withdrawalRequestId, uint256 amountWei)
            const tx: ethers.TransactionResponse = await this.ownerContract.approveWithdraw(
                campaignKey,
                withdrawalRequestId,
                amountWei
            );
            const receipt = await tx.wait();
            if (!receipt) throw new Error('Transaction receipt is null');

            const result: DisburseResult = {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                polSentToCreator: ethers.formatEther(amountWei - feeWei),
                feeCollected: ethers.formatEther(feeWei),
                gasUsed: receipt.gasUsed.toString(),
            };

            this.logger.log(`[OwnerWallet] ✅ approveWithdraw confirmed — txHash: ${result.txHash}`);
            return result;
        } catch (err: any) {
            this.logger.error(`[OwnerWallet] approveWithdraw FAILED: ${err.message}`);
            throw new InternalServerErrorException(
                `Blockchain approveWithdraw failed: ${err.shortMessage ?? err.message}`
            );
        }
    }

    /** Mark a campaign as SUCCESS on-chain (allows withdrawals) */
    async markCampaignSuccess(campaignId: string): Promise<string> {
        this.ensureReady();
        const campaignKey = await this.getCampaignKey(campaignId);
        try {
            const tx: ethers.TransactionResponse = await this.ownerContract.markSuccess(campaignKey);
            const receipt = await tx.wait();
            return receipt?.hash || '';
        } catch (err: any) {
            this.logger.error(`[OwnerWallet] markSuccess FAILED: ${err.message}`);
            throw new InternalServerErrorException(`markSuccess failed: ${err.shortMessage ?? err.message}`);
        }
    }

    /** Mark a campaign as FAILED on-chain (allows refunds) */
    async markCampaignFailed(campaignId: string): Promise<string> {
        this.ensureReady();
        const campaignKey = await this.getCampaignKey(campaignId);
        try {
            const tx: ethers.TransactionResponse = await this.ownerContract.markFailed(campaignKey);
            const receipt = await tx.wait();
            return receipt?.hash || '';
        } catch (err: any) {
            this.logger.error(`[OwnerWallet] markFailed FAILED: ${err.message}`);
            throw new InternalServerErrorException(`markFailed failed: ${err.shortMessage ?? err.message}`);
        }
    }

    /**
     * Called by CampaignsService when admin approves a campaign.
     * Owner-wallet calls createCampaign() on SC.
     * @param campaignId Off-chain UUID
     * @param creatorAddress EVM wallet address of the creator
     * @param goalAmountVND Goal amount in VND
     */
    async createCampaignOnchain(campaignId: string, creatorAddress: string | null, goalAmountVND: number): Promise<string> {
        this.ensureReady();
        const polAmount = this.vndToPol(goalAmountVND);
        const polWei = ethers.parseEther(polAmount.toFixed(18));

        // If creator hasn't linked a valid EVM address, we fallback to platform owner temporarily
        // so the SC function doesn't revert from invalid address.
        let validCreator: string;
        if (creatorAddress && ethers.isAddress(creatorAddress)) {
            validCreator = ethers.getAddress(creatorAddress);
        } else {
            // Use the address from the signer
            const signer = this.ownerContract.runner as ethers.Wallet;
            validCreator = signer.address;
        }

        this.logger.log(`[OwnerWallet] createCampaignOnchain ${campaignId} - goal: ${polAmount} POL, creator: ${validCreator}`);

        try {
            // Check Owner Wallet balance
            const balance = await this.provider.getBalance(this.ownerWallet.address);
            // Rough gas estimate for createCampaign is ~150k gas. With 50 Gwei, that's ~0.0075 POL.
            // Actual error reports need ~0.07 POL in total.
            if (balance < ethers.parseEther("0.1")) { // Require at least 0.1 POL for safety
                this.logger.warn(`[OwnerWallet] Low balance: ${ethers.formatEther(balance)} POL. Transaction might fail.`);
            }

            const tx: ethers.TransactionResponse = await this.ownerContract.createCampaign(
                campaignId,
                validCreator,
                polWei
            );
            const receipt = await tx.wait();
            if (!receipt) throw new Error('Transaction receipt is null');

            this.logger.log(`[OwnerWallet] ✅ createCampaign confirmed - txHash: ${receipt.hash}`);
            return receipt.hash;
        } catch (err: any) {
            this.logger.error(`[OwnerWallet] createCampaign FAILED: ${err.message}`);

            let userFriendlyMessage = err.message;
            if (err.code === 'INSUFFICIENT_FUNDS') {
                userFriendlyMessage = `Ví Owner không đủ số dư để tạo chiến dịch trên Blockchain. (Hiện có: ${ethers.formatEther(await this.provider.getBalance(this.ownerWallet.address))} POL)`;
            } else if (err.code === 'CALL_EXCEPTION') {
                userFriendlyMessage = "Lỗi thực thi Smart Contract khi tạo chiến dịch.";
            }

            throw new InternalServerErrorException(`Lỗi Blockchain: ${userFriendlyMessage}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API — Reads
    // ─────────────────────────────────────────────────────────────────────────

    /** Get on-chain campaign state (read-only, no gas) */
    async getOnchainCampaign(campaignId: string): Promise<OnchainCampaign> {
        this.ensureReady();
        const campaignKey = await this.getCampaignKey(campaignId);
        const raw = await this.readContract.getCampaign(campaignKey);
        return {
            offchainId: raw.offchainId,
            creator: raw.creator,
            goalAmount: raw.goalAmount,
            raisedAmount: raw.raisedAmount,
            withdrawnAmount: raw.withdrawnAmount,
            status: Number(raw.status),
            exists: raw.exists,
        };
    }

    /** Get the bytes32 key used by SC for a campaign UUID */
    async getCampaignKey(campaignId: string): Promise<string> {
        // SC logic: keccak256(abi.encodePacked(offchainId))
        return ethers.solidityPackedKeccak256(['string'], [campaignId]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Conversion helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Convert VND → POL using the fixed internal rate */
    vndToPol(amountVND: number): number {
        return amountVND * this.VND_TO_POL;
    }

    /** Convert POL → VND */
    polToVnd(polAmount: number): number {
        return polAmount / this.VND_TO_POL;
    }

    /** Exchange rate: VND per 1 POL */
    get exchangeRateVnd(): number {
        return 1 / this.VND_TO_POL;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────────

    private ensureReady() {
        if (!this.ownerContract || !this.hotContract) {
            throw new InternalServerErrorException(
                'BlockchainService is not initialised. Check OWNER_WALLET_PRIVATE_KEY, HOT_WALLET_PRIVATE_KEY, CONTRACT_ADDRESS, POLYGON_RPC_URL in .env',
            );
        }
    }
}
