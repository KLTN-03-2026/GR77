
import { ethers } from 'hardhat';

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);

    // Get the transaction count (nonce)
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log('Current Nonce:', nonce);

    // The contract is deployed at a deterministic address based on deployer + (nonce - 1)
    const deployedAddress = ethers.getCreateAddress({
        from: deployer.address,
        nonce: nonce - 1
    });

    console.log('Possible Latest Contract Address:', deployedAddress);

    // Check if there is code at that address
    const code = await ethers.provider.getCode(deployedAddress);
    if (code !== '0x') {
        console.log('✅ Verified: Contract exists at', deployedAddress);
    } else {
        console.log('❌ No contract code found at', deployedAddress);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
