// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KindlinkCampaign
 * @notice Smart contract for transparent and trustless crowdfunding on Polygon.
 * 
 * VERSION 2: Supports partial withdrawals while ACTIVE.
 */
contract KindlinkCampaign is ReentrancyGuard, Ownable {
    // ---------- Constants ----------
    uint256 public constant FEE_DENOMINATOR = 10000; // basis points

    // ---------- Types ----------
    enum CampaignStatus {
        ACTIVE,      // Accepting donations
        SUCCESS,     // Admin marked as success (finalized)
        FAILED,      // Admin marked as failed; refunds available
        COMPLETED    // Fully withdrawn and closed
    }

    struct Campaign {
        string  offchainId;     // UUID from DB (e.g. "abc-123")
        address creator;        // Campaign owner (wallet address)
        uint256 goalAmount;     // Funding goal in wei
        uint256 raisedAmount;   // Total donated in wei
        uint256 withdrawnAmount;// Total ever withdrawn to creator/platform
        CampaignStatus status;
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
    event WithdrawApproved(bytes32 indexed campaignKey, address creator, string withdrawalRequestId, uint256 netAmount, uint256 fee);
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
            withdrawnAmount: 0,
            status: CampaignStatus.ACTIVE,
            exists: true
        });

        emit CampaignCreated(campaignKey, offchainId, creator, goalAmount);
    }

    function markSuccess(bytes32 campaignKey) external onlyOwner campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.ACTIVE, "Campaign not active");
        c.status = CampaignStatus.SUCCESS;
        emit CampaignMarkedSuccess(campaignKey);
    }

    function markFailed(bytes32 campaignKey) external onlyOwner campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.ACTIVE, "Campaign not active");
        c.status = CampaignStatus.FAILED;
        emit CampaignMarkedFailed(campaignKey);
    }

    /**
     * @notice Approve disbursement. Supports partial withdrawals in ACTIVE or SUCCESS status.
     * @param campaignKey         Hash of the campaign UUID
     * @param withdrawalRequestId Off-chain ID for tracking
     * @param amountWei           Amount to disburse in wei
     */
    function approveWithdraw(
        bytes32 campaignKey,
        string calldata withdrawalRequestId,
        uint256 amountWei
    ) external onlyOwner nonReentrant campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        
        require(
            c.status == CampaignStatus.ACTIVE || c.status == CampaignStatus.SUCCESS,
            "Campaign not in withdrawable state"
        );
        require(amountWei > 0, "Amount must be > 0");
        
        uint256 available = c.raisedAmount - c.withdrawnAmount;
        require(amountWei <= available, "Insufficient on-chain balance");

        uint256 fee = (amountWei * platformFeeBps) / FEE_DENOMINATOR;
        uint256 netAmount = amountWei - fee;

        c.withdrawnAmount += amountWei;
        
        // If it was SUCCESS and we just emptied it, we can mark as COMPLETED
        if (c.status == CampaignStatus.SUCCESS && c.withdrawnAmount == c.raisedAmount) {
            c.status = CampaignStatus.COMPLETED;
        }

        (bool sent, ) = platformWallet.call{value: amountWei}("");
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

    function donate(bytes32 campaignKey) external payable nonReentrant campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.ACTIVE, "Campaign not accepting donations");
        require(msg.value > 0, "Must send POL to donate");

        c.raisedAmount += msg.value;
        donations[campaignKey][msg.sender] += msg.value;

        emit Donated(campaignKey, msg.sender, msg.value);
    }

    function claimRefund(bytes32 campaignKey) external nonReentrant campaignExists(campaignKey) {
        Campaign storage c = campaigns[campaignKey];
        require(c.status == CampaignStatus.FAILED, "Campaign has not failed");

        uint256 amount = donations[campaignKey][msg.sender];
        require(amount > 0, "No donation to refund");

        // Note: For partial withdrawals, refunds might technically be complex if 
        // some money was already withdrawn. But usually markFailed is only 
        // used if NO money was ever withdrawn or if the platform covers it.
        // For simplicity, we refund based on donor's original donation if possible.
        require(amount <= address(this).balance, "Contract has insufficient balance for refund");

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
