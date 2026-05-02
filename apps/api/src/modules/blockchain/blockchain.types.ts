/**
 * Blockchain module shared types & interfaces.
 * Keeping types separate keeps the service clean and scalable.
 */

export interface OnchainCampaign {
    offchainId: string;
    creator: string;
    goalAmount: bigint;
    raisedAmount: bigint;
    withdrawnAmount: bigint;
    /** 0=ACTIVE | 1=SUCCESS | 2=FAILED | 3=COMPLETED */
    status: number;
    exists: boolean;
}

export interface DepositResult {
    txHash: string;
    blockNumber: number;
    polAmount: string; // human-readable POL (ether units)
    gasUsed: string;
}

export interface DisburseResult {
    txHash: string;
    blockNumber: number;
    polSentToCreator: string;  // human-readable POL after fee
    feeCollected: string;      // platform fee in POL
    gasUsed: string;
}
