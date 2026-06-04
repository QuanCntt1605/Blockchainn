import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * DEPLOYMENT SCRIPT - WARRANTY NFT CONTRACT
 * 
 * Chạy lệnh:
 * npx hardhat run scripts/deploy-warranty.ts --network sepolia
 */

async function main() {
    console.log("\n════════════════════════════════════════════");
    console.log("📋 DEPLOYING WARRANTY NFT CONTRACT");
    console.log("════════════════════════════════════════════\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Deploying with account: ${deployer.address}`);
    console.log(`💰 Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

    // Deploy contract
    console.log("📦 Deploying WarrantyNFT contract...");
    const WarrantyNFT = await ethers.getContractFactory("WarrantyNFT");
    const contract = await WarrantyNFT.deploy();
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log(`✅ WarrantyNFT deployed at: ${contractAddress}\n`);

    // Verify deployment
    const admin = await contract.admin();
    console.log(`🔐 Admin address: ${admin}`);
    console.log(`✓ Contract verified\n`);

    // Save deployment info
    const deploymentInfo = {
        contractName: "WarrantyNFT",
        address: contractAddress,
        admin: admin,
        deployedAt: new Date().toISOString(),
        network: "sepolia",
        deployer: deployer.address
    };

    const deploymentPath = path.join(process.cwd(), "deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`📄 Deployment info saved to deployment.json`);
    console.log("\n════════════════════════════════════════════");
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("════════════════════════════════════════════");
    console.log(`\n✅ NEXT STEPS:`);
    console.log(`\n1. Update .env file with:`);
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`\n2. Update warranty-flow.html with:`);
    console.log(`   const CONTRACT_ADDRESS = "${contractAddress}";`);
    console.log(`\n3. Start backend server:`);
    console.log(`   node backend.js`);
    console.log(`\n4. Open in browser:`);
    console.log(`   http://localhost:8000/warranty-flow.html`);
    console.log("\n════════════════════════════════════════════\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
