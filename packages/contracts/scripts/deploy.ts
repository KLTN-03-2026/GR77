import { ethers } from 'hardhat';

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying KindlinkCampaign with account:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'POL');

    // The platform wallet receives the 2% fee from each withdrawal
    // Change this to your own admin/platform wallet address
    const PLATFORM_WALLET = process.env.PLATFORM_WALLET || deployer.address;
    console.log('Platform wallet:', PLATFORM_WALLET);

    const KindlinkCampaign = await ethers.getContractFactory('KindlinkCampaign');
    const contract = await KindlinkCampaign.deploy(PLATFORM_WALLET);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log('✅ KindlinkCampaign deployed to:', address);
    console.log('');
    console.log('👇 Save these values to your environment variables:');
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
    console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
