export const KINDLINK_CAMPAIGN_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "_platformWallet", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" },
            { "indexed": false, "internalType": "string", "name": "offchainId", "type": "string" },
            { "indexed": false, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "goalAmount", "type": "uint256" }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "CampaignMarkedFailed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "CampaignMarkedSuccess",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" },
            { "indexed": false, "internalType": "address", "name": "donor", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "Donated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" },
            { "indexed": false, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "withdrawalRequestId", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "netAmount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }
        ],
        "name": "WithdrawApproved",
        "type": "event"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "markSuccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "markFailed",
        "outputs": [],
        "stateMutability": "nonpayable",
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
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" }],
        "name": "claimRefund",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "offchainId", "type": "string" },
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "uint256", "name": "goalAmount", "type": "uint256" }
        ],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
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
                    { "internalType": "enum KindlinkCampaign.CampaignStatus", "name": "status", "type": "uint8" },
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
        "inputs": [{ "internalType": "string", "name": "offchainId", "type": "string" }],
        "name": "getCampaignKey",
        "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "campaignKey", "type": "bytes32" },
            { "internalType": "address", "name": "donor", "type": "address" }
        ],
        "name": "getDonation",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "platformWallet",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "platformFeeBps",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "FEE_DENOMINATOR",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];
