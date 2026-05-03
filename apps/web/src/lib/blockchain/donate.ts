"use client";

import { KINDLINK_CAMPAIGN_ABI, POL_PER_VND } from "@/lib/constants/blockchain";
import { API_BASE_URL } from "@/lib/constants/endpoints";

interface BlockchainDonateParams {
    campaignId: string;
    amountVnd: number;
    message?: string;
    /** Access token for backend API */
    token: string | null;
}

interface BlockchainDonateResult {
    txHash: string;
    walletAddress: string;
}

/**
 * Shared utility: donate to a campaign via Smart Contract using MetaMask.
 *
 * Flow:
 *  1. Connect MetaMask → get signer
 *  2. Compute campaignKey (keccak256 of offchain UUID)
 *  3. Convert VND → POL at POL_PER_VND rate
 *  4. Call contract.donate(campaignKey, { value: polWei })
 *  5. Await receipt → return txHash
 *
 * Throws on MetaMask not installed, user rejection, SC revert, etc.
 * Caller is responsible for try/catch and UX state.
 */
export async function executeBlockchainDonate({
    campaignId,
    amountVnd,
    message,
    token,
}: BlockchainDonateParams): Promise<BlockchainDonateResult> {
    if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
        throw new Error("Vui lòng cài đặt MetaMask!");
    }

    const { ethers } = await import("ethers");

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim();
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
        throw new Error(`Hệ thống chưa cấu hình địa chỉ Smart Contract hợp lệ. (Hiện tại: ${contractAddress || 'Trống'})`);
    }

    const cleanAddress = ethers.getAddress(contractAddress);

    // 1. Connect MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();

    // 2. Build contract instance
    const contract = new ethers.Contract(cleanAddress, KINDLINK_CAMPAIGN_ABI, signer);

    // 3. campaignKey = keccak256(abi.encodePacked(offchainId)) — matches backend logic
    const campaignKey = ethers.solidityPackedKeccak256(["string"], [campaignId]);

    // 4. Convert VND → POL
    const polAmount = amountVnd * POL_PER_VND;
    const polWei = ethers.parseEther(polAmount.toFixed(18));

    // 5. Call donate() — override gas for Polygon Amoy minimum (25 Gwei)
    const tx = await contract.donate(campaignKey, {
        value: polWei,
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.parseUnits("60", "gwei"),
    });
    const receipt = await tx.wait();
    const txHash: string = receipt.hash;

    // 6. Record donation in backend
    await fetch(`${API_BASE_URL}/donations/blockchain`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ campaignId, amount: amountVnd, txHash, walletAddress, message }),
    });

    return { txHash, walletAddress };
}
