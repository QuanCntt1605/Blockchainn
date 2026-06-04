const { ethers } = require('ethers');

// All 10 default Hardhat account keys
const keys = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb476cadccb33bcf3645f7f8319a0", // #0?
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "0x5de4111afa1a4b94908f83103db1fb1da08b20ae9b91a7d895e30f140612bb1f",
  "0x7c852118294e51e653712a81e05800f419a5e9f9a5f51be5de78e386c08b86ae",
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19137e894519",
  "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e8175e8eb0f13",
  "0x92db14e403fa2407b8541147d310ac27ec1a64ecd8704b4ac8dd0165b67e2fac",
  "0x4bbbf85ce3377467afe5d46f2d16fb50d5ee2183d38126bddccd45b67ff56244",
  "0xdbda1821b80551c9d65939329250298aa3e7c60c888f8cb6f56d7659f7cea12d3",
  "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1f7c7a1d4e1dcb2cb",
];

const targetAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

console.log("\n🔍 Finding Account #0 (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266):\n");

let found = false;
keys.forEach((key, index) => {
  try {
    const wallet = new ethers.Wallet(key);
    const match = wallet.address.toLowerCase() === targetAddress.toLowerCase();
    const marker = match ? "✅ FOUND!" : "";
    
    console.log(`Account #${index}: ${wallet.address} ${marker}`);
    if (match) {
      console.log(`\n🎯 CORRECT PRIVATE KEY:\n${key}\n`);
      found = true;
    }
  } catch (e) {
    console.log(`Account #${index}: ERROR - ${e.message}`);
  }
});

if (!found) {
  console.log("\n⚠️  NOT FOUND IN DEFAULT KEYS!");
  console.log("⚠️  Check Terminal 1 (hardhat node) output for actual Account #0 key!");
}
