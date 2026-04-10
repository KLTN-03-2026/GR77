
import { ethers } from 'hardhat';
import * as fs from 'fs';

async function main() {
    const [deployer] = await ethers.getSigners();
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    const deployedAddress = ethers.getCreateAddress({
        from: deployer.address,
        nonce: nonce - 1
    });

    const code = await ethers.provider.getCode(deployedAddress);
    if (code !== '0x') {
        console.log('Contract found at', deployedAddress);
        fs.writeFileSync('deployed_address.txt', deployedAddress);
    } else {
        console.log('No contract found');
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
