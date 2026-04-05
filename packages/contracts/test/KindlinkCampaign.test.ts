import { expect } from 'chai';
import { ethers } from 'hardhat';
import { KindlinkCampaign } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('KindlinkCampaign', function () {
    let contract: KindlinkCampaign;
    let owner: HardhatEthersSigner;
    let platform: HardhatEthersSigner;
    let creator: HardhatEthersSigner;
    let donor1: HardhatEthersSigner;
    let donor2: HardhatEthersSigner;

    const OFFCHAIN_ID = 'test-campaign-uuid-001';
    const GOAL = ethers.parseEther('10'); // 10 POL
    let campaignKey: string;

    beforeEach(async function () {
        [owner, platform, creator, donor1, donor2] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory('KindlinkCampaign');
        contract = await Factory.deploy(platform.address);

        campaignKey = await contract.getCampaignKey(OFFCHAIN_ID);
    });

    // ─────── createCampaign ───────
    describe('createCampaign', function () {
        it('Should create a campaign successfully', async function () {
            await contract.createCampaign(OFFCHAIN_ID, creator.address, GOAL);
            const c = await contract.getCampaign(campaignKey);
            expect(c.exists).to.equal(true);
            expect(c.creator).to.equal(creator.address);
            expect(c.goalAmount).to.equal(GOAL);
            expect(c.status).to.equal(0); // ACTIVE
        });

        it('Should revert if campaign already exists', async function () {
            await contract.createCampaign(OFFCHAIN_ID, creator.address, GOAL);
            await expect(
                contract.createCampaign(OFFCHAIN_ID, creator.address, GOAL)
            ).to.be.revertedWith('Campaign already exists');
        });

        it('Should revert if non-owner tries to create', async function () {
            await expect(
                contract.connect(donor1).createCampaign(OFFCHAIN_ID, creator.address, GOAL)
            ).to.be.reverted;
        });
    });

    // ─────── donate ───────
    describe('donate', function () {
        beforeEach(async function () {
            await contract.createCampaign(OFFCHAIN_ID, creator.address, GOAL);
        });

        it('Should accept donations', async function () {
            const amount = ethers.parseEther('1');
            await contract.connect(donor1).donate(campaignKey, { value: amount });
            const c = await contract.getCampaign(campaignKey);
            expect(c.raisedAmount).to.equal(amount);
            expect(await contract.getDonation(campaignKey, donor1.address)).to.equal(amount);
        });

        it('Should accumulate donations from multiple donors', async function () {
            await contract.connect(donor1).donate(campaignKey, { value: ethers.parseEther('3') });
            await contract.connect(donor2).donate(campaignKey, { value: ethers.parseEther('4') });
            const c = await contract.getCampaign(campaignKey);
            expect(c.raisedAmount).to.equal(ethers.parseEther('7'));
        });

        it('Should revert if campaign is not active', async function () {
            await contract.markFailed(campaignKey);
            await expect(
                contract.connect(donor1).donate(campaignKey, { value: ethers.parseEther('1') })
            ).to.be.revertedWith('Campaign not accepting donations');
        });
    });

    // ─────── SUCCESS flow ───────
    describe('Success & Withdrawal flow', function () {
        const donationAmount = ethers.parseEther('5');

        beforeEach(async function () {
            await contract.createCampaign(OFFCHAIN_ID, creator.address, GOAL);
            await contract.connect(donor1).donate(campaignKey, { value: donationAmount });
            await contract.markSuccess(campaignKey);
        });

        it('Creator can request withdraw', async function () {
            await contract.connect(creator).requestWithdraw(campaignKey);
            const c = await contract.getCampaign(campaignKey);
            expect(c.withdrawRequested).to.equal(true);
        });

        it('Admin approves and creator receives funds minus fee', async function () {
            await contract.connect(creator).requestWithdraw(campaignKey);

            const creatorBefore = await ethers.provider.getBalance(creator.address);
            const platformBefore = await ethers.provider.getBalance(platform.address);

            await contract.approveWithdraw(campaignKey);

            const creatorAfter = await ethers.provider.getBalance(creator.address);
            const platformAfter = await ethers.provider.getBalance(platform.address);

            const fee = (donationAmount * 200n) / 10000n; // 2%
            const expectedCreator = donationAmount - fee;

            expect(creatorAfter - creatorBefore).to.equal(expectedCreator);
            expect(platformAfter - platformBefore).to.equal(fee);
        });

        it('Should revert if creator already requested withdrawal', async function () {
            await contract.connect(creator).requestWithdraw(campaignKey);
            await expect(
                contract.connect(creator).requestWithdraw(campaignKey)
            ).to.be.revertedWith('Withdrawal already requested');
        });
    });

    // ─────── FAILED flow (refund) ───────
    describe('Failed & Refund flow', function () {
        beforeEach(async function () {
            await contract.createCampaign(OFFCHAIN_ID, creator.address, GOAL);
            await contract.connect(donor1).donate(campaignKey, { value: ethers.parseEther('2') });
            await contract.connect(donor2).donate(campaignKey, { value: ethers.parseEther('3') });
            await contract.markFailed(campaignKey);
        });

        it('Donors can claim full refund', async function () {
            const before = await ethers.provider.getBalance(donor1.address);
            const tx = await contract.connect(donor1).claimRefund(campaignKey);
            const receipt = await tx.wait();
            const gasCost = receipt!.gasUsed * receipt!.gasPrice;
            const after = await ethers.provider.getBalance(donor1.address);

            expect(after + gasCost - before).to.equal(ethers.parseEther('2'));
        });

        it('Should revert if donor has no donation', async function () {
            await expect(
                contract.connect(creator).claimRefund(campaignKey)
            ).to.be.revertedWith('No donation to refund');
        });

        it('Should revert double refund', async function () {
            await contract.connect(donor1).claimRefund(campaignKey);
            await expect(
                contract.connect(donor1).claimRefund(campaignKey)
            ).to.be.revertedWith('No donation to refund');
        });
    });
});
