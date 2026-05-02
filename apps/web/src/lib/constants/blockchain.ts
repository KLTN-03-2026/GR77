/**
 * ABI of KindlinkCampaign Smart Contract (VERSION 2)
 */
export const KINDLINK_CAMPAIGN_ABI = [
    {
        "inputs": [{ "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "offchainId", "type": "string" }],
        "name": "getCampaignKey",
        "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "getCampaign",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "offchainId", "type": "string" },
                    { "internalType": "address", "name": "creator", "type": "address" },
                    { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
                    { "internalType": "uint256", "name": "raisedAmount", "type": "uint256" },
                    { "internalType": "uint256", "name": "withdrawnAmount", "type": "uint256" },
                    { "internalType": "uint8", "name": "status", "type": "uint8" },
                    { "internalType": "bool", "name": "exists", "type": "bool" }
                ],
                "internalType": "struct KindlinkCampaign.Campaign",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" },
            { "internalType": "string", "name": "withdrawalRequestId", "type": "string" },
            { "internalType": "uint256", "name": "amountWei", "type": "uint256" }
        ],
        "name": "approveWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

/** Polygon Amoy Testnet Configuration */
export const AMOY_NETWORK_CONFIG = {
    chainId: '0x13882', // 80002 in hex
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
        name: 'POL',
        symbol: 'POL',
        decimals: 18
    },
    rpcUrls: ['https://polygon-amoy-bor-rpc.publicnode.com', 'https://rpc.ankr.com/polygon_amoy'],
    blockExplorerUrls: ['https://amoy.polygonscan.com']
};

/** Rate: 1 VND = ? POL. Must match the backend .env POL_PER_VND */
export const POL_PER_VND = Number(process.env.NEXT_PUBLIC_POL_PER_VND ?? '0.00001');
