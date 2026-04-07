export const KINDLINK_CAMPAIGN_ABI = [
    "function donate(bytes32 campaignKey) external payable",
    "function getCampaign(bytes32 campaignKey) external view returns (tuple(string offchainId, address creator, uint256 goalAmount, uint256 raisedAmount, uint8 status, bool withdrawRequested, bool exists))",
    "function getCampaignKey(string offchainId) external pure returns (bytes32)"
];

// CHÚ Ý: Sau khi bạn chạy lệnh deploy xong, hãy dán địa chỉ contract vào đây!
export const KINDLINK_CAMPAIGN_ADDRESS = "0x0000000000000000000000000000000000000000";

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
