# 📋 HƯỚNG DẪN CHI TIẾT: HỆ THỐNG CHỨNG CHỈ BẢO HÀNH VỚI METAMASK

## 📚 MỤC LỤC
1. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
2. [Chuẩn bị môi trường](#chuẩn-bị-môi-trường)
3. [Triển khai Smart Contract](#triển-khai-smart-contract)
4. [Chạy Backend Server](#chạy-backend-server)
5. [Sử dụng Frontend](#sử-dụng-frontend)
6. [Quy trình chi tiết](#quy-trình-chi-tiết)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Browser)                      │
│  - warranty-flow.html                                        │
│  - Kết nối MetaMask                                          │
│  - Ký message (không mất gas)                               │
│  - Hiển thị giao dịch                                        │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
         ┌───────▼───────────┐      ┌────────▼──────────┐
         │   METAMASK        │      │  BACKEND (Node)   │
         │   - Ký message    │      │  - backend.js     │
         │   - Xác nhận tx   │      │  - Port: 3000     │
         │   - Gửi gas       │      │  - Verify sig     │
         └───────────────────┘      │  - Mint cert      │
                                    │  - JWT token      │
                                    └────────┬──────────┘
                                             │
                        ┌────────────────────▼───────────────┐
                        │  SMART CONTRACT (Ethereum)         │
                        │  - WarrantyNFT.sol                 │
                        │  - Tạo chứng chỉ NFT               │
                        │  - Verify signature                │
                        │  - Lưu dữ liệu blockchain          │
                        └────────────────────────────────────┘
```

### Quy trình 4 bước:

```
┌─────────────────────────────────────┐
│  1. CONNECT WALLET                  │
│  - User kết nối MetaMask            │
│  - Lấy address ví                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. SIGN MESSAGE (KHÔNG MẤT GAS)    │
│  - User ký message xác minh ví      │
│  - MetaMask hiện popup               │
│  - Không tạo giao dịch               │
│  - Không mất gas                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. VERIFY SIGNATURE (Backend)      │
│  - Backend verify chữ ký             │
│  - Tạo JWT token                    │
│  - Lưu session user                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. MINT CERTIFICATE (MẤT GAS)      │
│  - Smart contract tạo chứng chỉ     │
│  - MetaMask hiện popup xác nhận      │
│  - User ký xác nhận giao dịch        │
│  - Mất gas để ghi vào blockchain     │
│  - Chứng chỉ gắn với ví             │
└─────────────────────────────────────┘
```

---

## 🛠️ Chuẩn bị môi trường

### 1. Cài đặt dependencies

```bash
# Cài đặt npm packages
npm install

# Cài đặt backend dependencies
npm install express cors dotenv

# Hoặc cài toàn bộ:
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers ethers
npm install --save express cors dotenv
```

### 2. Cài đặt MetaMask
- Tải MetaMask: https://metamask.io/
- Tạo ví hoặc import ví hiện tại
- Cài đặt network: Sepolia Testnet

### 3. Cấu hình network Hardhat

File `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    hardhat: {
      chainId: 31337
    }
  }
};
```

### 4. Cấu hình file .env

```bash
# Copy từ .env.example
cp .env.example .env

# Sửa .env với thông tin của bạn:
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=0x... (Private key từ MetaMask)
CONTRACT_ADDRESS=0x... (Sẽ update sau deploy)
ADMIN_PRIVATE_KEY=0x... (Private key admin)
```

> ⚠️ **CẢNH BÁO**: Không commit .env file lên GitHub!

---

## 🚀 Triển khai Smart Contract

### Bước 1: Compile Contract

```bash
# Compile WarrantyNFT.sol
npx hardhat compile

# Kiểm tra lỗi
```

### Bước 2: Deploy lên Sepolia Testnet

```bash
# Deploy contract
npx hardhat run scripts/deploy-warranty.ts --network sepolia

# Output:
# ✅ WarrantyNFT deployed at: 0x... 
```

### Bước 3: Lưu Contract Address

Sau khi deploy, bạn sẽ nhận được `deployment.json`:
```json
{
  "contractName": "WarrantyNFT",
  "address": "0x...",
  "admin": "0x...",
  "deployedAt": "2024-01-01T00:00:00.000Z",
  "network": "sepolia"
}
```

**Cập nhật:**
1. File `.env`:
   ```
   CONTRACT_ADDRESS=0x...
   ```

2. File `warranty-flow.html` (dòng ~400):
   ```javascript
   const CONTRACT_ADDRESS = "0x...";
   ```

3. File `backend.js` (nếu chạy trên Sepolia):
   ```javascript
   const RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";
   const CONTRACT_ADDRESS = "0x...";
   ```

---

## 🖥️ Chạy Backend Server

### Bước 1: Cài đặt dependencies

```bash
npm install express cors dotenv ethers
```

### Bước 2: Tạo file .env

```bash
# Với Sepolia testnet
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...
PORT=3000
JWT_SECRET=your-secret-key
```

### Bước 3: Chạy server

```bash
node backend.js

# Output:
# 🚀 WARRANTY CERTIFICATE BACKEND
# Server running at http://localhost:3000
# Admin wallet: 0x...
# Contract: 0x...
```

### Bước 4: Test API

```bash
# Health check
curl http://localhost:3000/api/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "contractAddress": "0x..."
# }
```

---

## 🌐 Sử dụng Frontend

### Bước 1: Chạy Web Server

```bash
# Dùng Python (có sẵn trên Windows):
python -m http.server 8000

# Hoặc dùng Node.js:
npm install -g http-server
http-server

# Hoặc dùng VS Code:
# Cài extension "Live Server", rồi click "Go Live"
```

### Bước 2: Mở Frontend

```
http://localhost:8000/warranty-flow.html
```

### Bước 3: Sử dụng giao diện

1. **STEP 1 - Kết nối MetaMask**
   - Click "Kết nối MetaMask"
   - MetaMask sẽ hiện popup
   - Chọn tài khoản cần kết nối
   - Nhấn "Connect"

2. **STEP 2 - Ký Thông Điệp**
   - Click "Ký Thông Điệp"
   - MetaMask hiện popup yêu cầu ký
   - Nhấn "Sign" để ký (KHÔNG MẤT GAS)
   - Hệ thống sẽ hiển thị messageHash và signature

3. **STEP 3 - Xác minh với Backend**
   - Click "Xác minh Chữ ký với Backend"
   - Backend sẽ verify signature
   - Nhận được JWT token

4. **STEP 4 - Cấp Chứng Chỉ**
   - Điền thông tin sản phẩm:
     - Tên sản phẩm: "iPhone 15 Pro"
     - Serial Number: "A1B2C3D4"
     - Warranty: "12" (tháng)
     - Mô tả: "Bảo hành 12 tháng"
   - Click "Cấp Chứng Chỉ Bảo Hành"
   - MetaMask hiện popup xác nhận giao dịch
   - Nhấn "Confirm" (MẤT GAS)
   - Chờ giao dịch được confirm (~1-2 phút)

5. **STEP 5 - Xem Chứng Chỉ**
   - Click "Xem Chứng Chỉ Của Tôi"
   - Hiển thị danh sách chứng chỉ đã cấp

---

## 📖 Quy trình Chi Tiết

### A. Phía Frontend (Browser)

```javascript
// 1. Kết nối MetaMask
const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
});
// Lấy được địa chỉ ví

// 2. Ký message (KHÔNG MẤT GAS)
const message = `Verify ownership of ${address} at ${timestamp}`;
const messageHash = ethers.id(message);
const signature = await signer.signMessage(ethers.getBytes(messageHash));
// MetaMask hiện popup, user ký, KHÔNG tạo giao dịch

// 3. Gửi signature tới backend
const response = await fetch("http://localhost:3000/api/verify-signature", {
    method: "POST",
    body: JSON.stringify({
        address,
        messageHash,
        signature
    })
});
const { token } = await response.json();
// Nhận JWT token từ backend

// 4. Cấp chứng chỉ (MẤT GAS)
const tx = await contract.mintCertificate(
    address,
    messageHash,
    signature,
    productName,
    productSN,
    warrantyMonths,
    description
);
// MetaMask hiện popup xác nhận giao dịch
// User ký xác nhận
// Giao dịch được gửi lên blockchain
// MẤT GAS để thực hiện
```

### B. Phía Backend (Node.js)

```javascript
// 1. Nhận signature từ frontend
app.post('/api/verify-signature', (req, res) => {
    const { address, messageHash, signature } = req.body;
    
    // 2. Recover address từ signature
    const recoveredAddress = ethers.recoverAddress(messageHash, signature);
    
    // 3. Kiểm tra xem signature có hợp lệ không
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    
    // 4. Tạo JWT token
    const token = generateToken(address);
    
    // 5. Lưu vào database (hoặc in-memory)
    users.set(address, { token, signature, messageHash });
    
    // 6. Trả token cho frontend
    res.json({ token });
});

// 7. Khi frontend gọi mint, backend sẽ:
app.post('/api/mint-certificate', authMiddleware, (req, res) => {
    // 8. Kiểm tra token
    const address = req.user.address;
    
    // 9. Gọi smart contract
    const tx = await contract.mintCertificate(
        address,
        messageHash,
        signature,
        productName,
        productSN,
        warrantyMonths,
        description
    );
    
    // 10. Chờ transaction confirm
    const receipt = await tx.wait();
    
    // 11. Trả kết quả
    res.json({
        certificateId: certId,
        transactionHash: receipt.hash
    });
});
```

### C. Phía Smart Contract (Solidity)

```solidity
// 1. User frontend ký message (off-chain)
// messageHash được tạo từ: keccak256(abi.encodePacked(address, timestamp))

// 2. Backend verify signature
// recoveredAddress = ecrecover(messageHash, v, r, s);
// Kiểm tra: recoveredAddress == userAddress

// 3. Backend gọi mintCertificate
function mintCertificate(
    address recipient,        // Địa chỉ nhận chứng chỉ
    bytes32 messageHash,      // Hash của message đã ký
    bytes memory signature,   // Chữ ký từ ecrecover
    string memory productName,
    string memory productSN,
    uint256 warrantyMonths,
    string memory description
) public onlyAdmin returns (uint256) {
    
    // 4. Verify lại signature trong contract
    address signer = recoverSigner(messageHash, signature);
    require(signer == recipient, "Signature mismatch");
    
    // 5. Prevent replay attack
    require(!usedSignatures[messageHash], "Signature already used");
    usedSignatures[messageHash] = true;
    
    // 6. Tạo certificate NFT
    uint256 certificateId = certificateCounter++;
    uint256 warrantyEndDate = block.timestamp + (warrantyMonths * 30 days);
    
    certificates[certificateId] = Certificate({
        owner: recipient,
        productName: productName,
        productSN: productSN,
        issueDate: block.timestamp,
        warrantyEndDate: warrantyEndDate,
        description: description,
        isValid: true
    });
    
    userCertificates[recipient].push(certificateId);
    
    // 7. Phát event
    emit CertificateMinted(recipient, certificateId, productName, warrantyEndDate);
    
    return certificateId;
}
```

---

## 🐛 Troubleshooting

### Lỗi 1: "MetaMask not installed"
**Giải pháp:**
- Cài MetaMask: https://metamask.io/
- Reload trang web

### Lỗi 2: "User rejected the request"
**Giải pháp:**
- User không chọn "Connect"
- Hoặc không ký message
- Thử lại

### Lỗi 3: "Signature does not match address"
**Giải pháp:**
- Frontend và backend sử dụng message hash khác nhau
- Kiểm tra hàm `ethers.id()` tính toán hash đúng không
- Đảm bảo backend recover signature đúng cách

### Lỗi 4: "Only admin can perform this action"
**Giải pháp:**
- Admin private key không đúng
- Backend signer không phải là admin
- Kiểm tra `adminSigner.address` trong backend

### Lỗi 5: "Contract address not found"
**Giải pháp:**
- Deploy contract trước:
  ```bash
  npx hardhat run scripts/deploy-warranty.ts --network sepolia
  ```
- Update `CONTRACT_ADDRESS` trong .env
- Update `CONTRACT_ADDRESS` trong warranty-flow.html

### Lỗi 6: "Backend CORS error"
**Giải pháp:**
- Đảm bảo backend chạy:
  ```bash
  node backend.js
  ```
- Kiểm tra port 3000 không bị chiếm:
  ```bash
  netstat -ano | findstr :3000  # Windows
  lsof -i :3000                 # macOS/Linux
  ```
- Update BACKEND_URL trong warranty-flow.html:
  ```javascript
  const BACKEND_URL = "http://localhost:3000";
  ```

### Lỗi 7: "Insufficient gas"
**Giải pháp:**
- Cần Sepolia ETH testnet
- Lấy free testnet ETH: https://sepolia-faucet.pk910.de/
- Kiểm tra balance:
  ```bash
  ethers.provider.getBalance(address)
  ```

---

## 📊 Data Flow

### Signing Process (KHÔNG MẤT GAS)
```
User → MetaMask → Frontend → ✓ Ký message
                      ↓
                Signature được tạo
                (Off-chain, không mất gas)
```

### Minting Process (MẤT GAS)
```
Frontend
    ↓
Backend (Verify Signature)
    ↓
Smart Contract (Mint Certificate)
    ↓
Blockchain (Ghi dữ liệu)
    ↓
Event (CertificateMinted)
    ↓
✓ Hoàn thành
```

---

## 📝 File Structure

```
blockchain/
├── contracts/
│   ├── WarrantyNFT.sol           ← Smart contract chính
│   └── CertificateRegistry.sol   ← Contract cũ (giữ lại)
├── scripts/
│   ├── deploy-warranty.ts        ← Deploy script
│   └── deploy.ts
├── warranty-flow.html             ← Frontend
├── backend.js                      ← Backend server
├── .env.example                    ← Cấu hình mẫu
├── .env                            ← Cấu hình thực (không commit)
└── hardhat.config.js
```

---

## ✅ Checklist Triển Khai

- [ ] Cài đặt MetaMask
- [ ] Cài đặt npm dependencies
- [ ] Cấu hình Hardhat network
- [ ] Deploy WarrantyNFT.sol
- [ ] Copy contract address vào .env
- [ ] Copy contract address vào warranty-flow.html
- [ ] Cấu hình backend .env
- [ ] Chạy backend server
- [ ] Chạy web server
- [ ] Mở warranty-flow.html
- [ ] Test kết nối MetaMask
- [ ] Test ký message
- [ ] Test verify signature
- [ ] Test mint certificate
- [ ] Kiểm tra blockchain explorer

---

## 🎯 Kết quả cuối cùng

Sau khi hoàn thành, bạn sẽ có:

✅ **Smart Contract** - WarrantyNFT.sol deployed trên blockchain
✅ **Backend** - Node.js server xác minh signature
✅ **Frontend** - Giao diện web để cấp chứng chỉ
✅ **Quy trình bảo mật** - 2 bước: Ký message + Verify signature
✅ **Chứng chỉ NFT** - Gắn với địa chỉ ví của user
✅ **Dữ liệu persistent** - Lưu trên blockchain (immutable)

---

**Made with ❤️ for Warranty Certificate System**
