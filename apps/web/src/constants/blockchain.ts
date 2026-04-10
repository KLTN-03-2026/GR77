export const KINDLINK_CAMPAIGN_ABI = [
    "function donate(bytes32 campaignKey) external payable",
    "function getCampaign(bytes32 campaignKey) external view returns (tuple(string offchainId, address creator, uint256 goalAmount, uint256 raisedAmount, uint8 status, bool withdrawRequested, bool exists))",
    "function getCampaignKey(string offchainId) external pure returns (bytes32)",
    "function createCampaign(string offchainId, address creator, uint256 goalAmount) external",
    "function markSuccess(bytes32 campaignKey) external",
    "function markFailed(bytes32 campaignKey) external",
    "function approveWithdraw(bytes32 campaignKey) external",
    "function requestWithdraw(bytes32 campaignKey) external"
];

// CHÚ Ý: Đã cập nhật địa chỉ sau khi deploy thành công
export const KINDLINK_CAMPAIGN_ADDRESS = "0x632a886c044B0A5D929F2df8d9eAC4409BE4Fd62";

export const AMOY_NETWORK_CONFIG = {
    chainId: '0x13882', // 80002 in hex
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
        name: 'POL',
        symbol: 'POL',
        decimals: 18
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com']
};

export const MATIC_VND_RATE = 20000; // Tỷ giá giả lập: 1 POL = 20,000 VND
