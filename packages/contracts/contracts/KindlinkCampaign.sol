// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KindlinkCampaign
 * @notice Smart contract for transparent and trustless crowdfunding on Polygon.
 *
 * FLOW:
 *  1. Admin creates campaign on-chain (mirrors off-chain DB)
 *  2. Donors call donate(campaignId) and send POL
 *  3a. SUCCESS: Admin calls markSuccess() → creator requests withdraw → admin approves → creator gets funds
 *  3b. FAILED:  Admin calls markFailed() → donors call claimRefund() → full refund
 *
 *  Platform fee (default 2%) is sent to the platform wallet on withdrawal.
 */
contract KindlinkCampaign is ReentrancyGuard, Ownable {
    // ---------- Constants ----------
    uint256 public constant FEE_DENOMINATOR = 10000; // basis points

    // ---------- Types ----------
    enum CampaignStatus {
        ACTIVE,      // Accepting donations
        SUCCESS,     // Admin marked as success; withdrawal pending
        FAILED,      // Admin marked as failed; refunds available
        WITHDRAWN    // Funds fully withdrawn by creator
    }

    struct Campaign {
        string  offchainId;     // UUID from DB (e.g. "abc-123")
        address creator;        // Campaign owner (wallet address)
        uint256 goalAmount;     // Funding goal in wei
        uint256 raisedAmount;   // Total donated in wei
        CampaignStatus status;
        bool    withdrawRequested;
        bool    exists;
    }

    // ---------- State ----------
    address public platformWallet;          // Receives platform fee
    uint256 public platformFeeBps = 200;    // 2% in basis points

    mapping(bytes32 => Campaign) private campaigns;          // campaignKey => Campaign
    mapping(bytes32 => mapping(address => uint256)) private donations; // campaignKey => donor => amount

    // ---------- Events ----------
    event CampaignCreated(bytes32 indexed campaignKey, string offchainId, address creator, uint256 goalAmount);
    event Donated(bytes32 indexed campaignKey, address donor, uint256 amount);
    event CampaignMarkedSuccess(bytes32 indexed campaignKey);
    event CampaignMarkedFailed(bytes32 indexed campaignKey);
    event WithdrawRequested(bytes32 indexed campaignKey, address creator);
    event WithdrawApproved(bytes32 indexed campaignKey, address creator, string withdrawalRequestId, uint256 amount, uint256 fee);
    event RefundClaimed(bytes32 indexed campaignKey, address donor, uint256 amount);
    event PlatformFeeUpdated(uint256 newFeeBps);
    event PlatformWalletUpdated(address newWallet);

    // ---------- Constructor ----------
    constructor(address _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    // ---------- Modifiers ----------
    modifier campaignExists(bytes32 campaignKey) {
        require(campaigns[campaignKey].exists, "Campaign does not exist");
        _;
    }

    // ---------- Admin Functions ----------

    /**
     * @notice Create a new campaign on-chain, mirroring the off-chain DB entry.
     * @param offchainId UUID of the campaign in the database
     * @param creator    Wallet address of the campaign owner
     * @param goalAmount Funding goal in wei
     */
    function createCampaign(
        string calldata offchainId,
        address creator,
        uint256 goalAmount
    ) external onlyOwner {
        require(creator != address(0), "Invalid creator");
        require(goalAmount > 0, "Goal must be > 0");

        bytes32 campaignKey = keccak256(abi.encodePacked(offchainId));
        require(!campaigns[campaignKey].exists, "Campaign already exists");

        campaigns[campaignKey] = Campaign({
            offchainId: offchainId,
            creator: creator,
            goalAmount: goalAmount,
            raisedAmount: 0,
            status: CampaignStatus.ACTIVE,
            withdrawRequested: false,
            exists: true
        });

        emit CampaignCreated(campaignKey, offchainId, creator, goalAmount);
    }

    /**
     * @notice Mark a campaign as successfully funded. Only admin.
     */
    function markSuccess(bytes32 campaignKey) external onlyOwner campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.ACTIVE, "Campaign not active");
        c.status = CampaignStatus.SUCCESS;
        emit CampaignMarkedSuccess(campaignKey);
    }

    /**
     * @notice Mark a campaign as failed. Enables donor refunds. Only admin.
     */
    function markFailed(bytes32 campaignKey) external onlyOwner campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.ACTIVE, "Campaign not active");
        c.status = CampaignStatus.FAILED;
        emit CampaignMarkedFailed(campaignKey);
    }

    /**
     * @notice Approve creator's withdrawal. Sends ALL raised POL to platformWallet.
     *         The platform then disburses equivalent VND to the creator's bank account.
     *         Off-chain withdrawalRequestId is included in the event for DB traceability.
     * @param campaignKey        keccak256 of off-chain campaign UUID
     * @param withdrawalRequestId  Off-chain withdrawal request ID (for event indexing)
     */
    function approveWithdraw(
        bytes32 campaignKey,
        string calldata withdrawalRequestId
    ) external onlyOwner nonReentrant campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.SUCCESS, "Campaign not successful");
        require(c.withdrawRequested, "Creator has not requested withdrawal");

        uint256 total = c.raisedAmount;
        require(total > 0, "Nothing to withdraw");

        uint256 fee = (total * platformFeeBps) / FEE_DENOMINATOR;
        uint256 netAmount = total - fee;

        c.status = CampaignStatus.WITHDRAWN;
        c.raisedAmount = 0;

        // Fee goes to dedicated fee sub-account (same platformWallet for simplicity)
        // Net goes to platformWallet — admin then pays creator in VND via bank transfer
        (bool sent, ) = platformWallet.call{value: total}("");
        require(sent, "Transfer to platform failed");

        emit WithdrawApproved(campaignKey, c.creator, withdrawalRequestId, netAmount, fee);
    }


    // ---------- Platform Config ----------

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee cannot exceed 10%");
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        platformWallet = newWallet;
        emit PlatformWalletUpdated(newWallet);
    }

    // ---------- Public Functions ----------

    /**
     * @notice Donate to a campaign. Sends POL (native token) directly.
     * @param campaignKey keccak256 hash of the off-chain campaign ID
     */
    function donate(bytes32 campaignKey) external payable nonReentrant campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.ACTIVE, "Campaign not accepting donations");
        require(msg.value > 0, "Must send POL to donate");

        c.raisedAmount += msg.value;
        donations[campaignKey][msg.sender] += msg.value;

        emit Donated(campaignKey, msg.sender, msg.value);
    }

    /**
     * @notice Creator requests to withdraw funds after campaign is marked SUCCESS.
     */
    function requestWithdraw(bytes32 campaignKey) external campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.SUCCESS, "Campaign not successful");
        require(msg.sender == c.creator, "Only the creator can request withdrawal");
        require(!c.withdrawRequested, "Withdrawal already requested");
        c.withdrawRequested = true;
        emit WithdrawRequested(campaignKey, msg.sender);
    }

    /**
     * @notice Donor claims a full refund when campaign has FAILED.
     */
    function claimRefund(bytes32 campaignKey) external nonReentrant campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.FAILED, "Campaign has not failed");

        uint256 amount = donations[campaignKey][msg.sender];
        require(amount > 0, "No donation to refund");

        donations[campaignKey][msg.sender] = 0;
        c.raisedAmount -= amount;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Refund transfer failed");

        emit RefundClaimed(campaignKey, msg.sender, amount);
    }

    // ---------- View Functions ----------

    function getCampaign(bytes32 campaignKey) external view returns (Campaign memory) {
        return campaigns[campaignKey];
    }

    function getCampaignKey(string calldata offchainId) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(offchainId));
    }

    function getDonation(bytes32 campaignKey, address donor) external view returns (uint256) {
        return donations[campaignKey][donor];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
