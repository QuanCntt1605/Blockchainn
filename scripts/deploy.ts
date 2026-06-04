const hre = require("hardhat");

async function main() {
  // Kiểm tra xem mạng localhost có đang chạy không
  await hre.run("compile"); 

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Registry = await hre.ethers.getContractFactory("CertificateRegistry");
  const registry = await Registry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("\n***********************************************");
  console.log("THANH CONG! Dia chi Contract la:");
  console.log(address);
  console.log("***********************************************\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});