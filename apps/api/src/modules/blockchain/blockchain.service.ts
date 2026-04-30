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
            const contractAddress = this.config.getOrThrow<string>('CONTRACT_ADDRESS');
            const ownerKey = this.config.getOrThrow<string>('OWNER_WALLET_PRIVATE_KEY');
            const hotKey = this.config.getOrThrow<string>('HOT_WALLET_PRIVATE_KEY');

            this.provider = new ethers.JsonRpcProvider(rpc);

            const ownerWallet = new ethers.Wallet(ownerKey, this.provider);
            const hotWallet = new ethers.Wallet(hotKey, this.provider);

            this.ownerContract = new ethers.Contract(contractAddress, KINDLINK_CAMPAIGN_ABI, ownerWallet);
            this.hotContract = new ethers.Contract(contractAddress, KINDLINK_CAMPAIGN_ABI, hotWallet);
            this.readContract = new ethers.Contract(contractAddress, KINDLINK_CAMPAIGN_ABI, this.provider);

            this.logger.log(`✅ BlockchainService initialised`);
            this.logger.log(`   Owner  : ${ownerWallet.address}`);
            this.logger.log(`   HotWallet: ${hotWallet.address}`);
            this.logger.log(`   Contract : ${contractAddress}`);
            this.logger.log(`   Rate     : 1 POL = ${1 / this.VND_TO_POL} VND`);
        } catch (err: any) {
            this.logger.error(`❌ BlockchainService init FAILED: ${err.message}`);
            // Do not throw — allow app to boot; individual calls will return safe errors.
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

        this.logger.log(
            `[HotWallet] deposit ${polAmount} POL (${amountVND} VND) for campaign ${campaignId} — donor: ${donorLabel}`,
        );

        try {
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
            throw new InternalServerErrorException(
                `Blockchain deposit failed: ${err.shortMessage ?? err.message}`,
            );
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
    async disburseWithdrawal(campaignId: string, withdrawalRequestId: string): Promise<DisburseResult> {
        this.ensureReady();

        const campaignKey = await this.getCampaignKey(campaignId);

        // Snapshot balance BEFORE withdraw so we can compute amounts
        const onchain = await this.getOnchainCampaign(campaignId);
        const totalPolWei = onchain.raisedAmount;

        // Mirror the SC fee computation (same formula as SC)
        const feeBps = await this.readContract.platformFeeBps() as bigint;
        const feeDenominator = await this.readContract.FEE_DENOMINATOR() as bigint;
        const feeWei = (totalPolWei * feeBps) / feeDenominator;
        const creatorAmountWei = totalPolWei - feeWei;

        this.logger.log(
            `[OwnerWallet] approveWithdraw campaign ${campaignId} — ` +
            `total: ${ethers.formatEther(totalPolWei)} POL, ` +
            `fee: ${ethers.formatEther(feeWei)} POL`,
        );

        try {
            const tx: ethers.TransactionResponse = await this.ownerContract.approveWithdraw(campaignKey, withdrawalRequestId);
            const receipt = await tx.wait();
            if (!receipt) throw new Error('Transaction receipt is null');

            const result: DisburseResult = {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                polSentToPlatform: ethers.formatEther(creatorAmountWei),
                feeCollected: ethers.formatEther(feeWei),
                gasUsed: receipt.gasUsed.toString(),
            };

            this.logger.log(`[OwnerWallet] ✅ approveWithdraw confirmed — txHash: ${result.txHash}`);
            return result;
        } catch (err: any) {
            this.logger.error(`[OwnerWallet] approveWithdraw FAILED: ${err.message}`);
            throw new InternalServerErrorException(
                `Blockchain withdraw failed: ${err.shortMessage ?? err.message}`,
            );
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
            status: Number(raw.status),
            withdrawRequested: raw.withdrawRequested,
            exists: raw.exists,
        };
    }

    /** Get the bytes32 key used by SC for a campaign UUID */
    async getCampaignKey(campaignId: string): Promise<string> {
        this.ensureReady();
        return this.readContract.getCampaignKey(campaignId);
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
