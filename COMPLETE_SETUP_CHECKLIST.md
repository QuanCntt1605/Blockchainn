# ✅ COMPLETE SETUP CHECKLIST - WARRANTY CERTIFICATE SYSTEM

## 📋 File được tạo/cập nhật

### Smart Contract
- ✅ **contracts/WarrantyNFT.sol** (NEW)
  - Smart contract cấp chứng chỉ bảo hành
  - 400+ lines
  - Hỗ trợ signature verification, NFT minting

### Frontend
- ✅ **warranty-flow.html** (NEW)
  - Giao diện web 5 bước
  - Kết nối MetaMask
  - Ký message + cấp chứng chỉ
  - 600+ lines

### Backend
- ✅ **backend.js** (NEW)
  - Node.js/Express server
  - API endpoints (verify, mint, get)
  - JWT token authentication
  - 400+ lines

### Deployment
- ✅ **scripts/deploy-warranty.ts** (NEW)
  - Deploy script cho Hardhat
  - Output deployment info
  - Tạo deployment.json

### Configuration
- ✅ **.env.example** (NEW)
  - Template cấu hình
  - RPC URL, private keys
  - Contract address, ports

- ✅ **package.json** (UPDATED)
  - Thêm backend dependencies (express, cors, dotenv)
  - Thêm npm scripts (backend, deploy, compile)

### Documentation
- ✅ **WARRANTY_README.md** (NEW)
  - README chính
  - Giới thiệu & features
  - Quick start 4 bước

- ✅ **QUICKSTART.md** (NEW)
  - Triển khai trong 5 phút
  - Lệnh nhanh
  - Troubleshooting

- ✅ **IMPLEMENTATION_GUIDE.md** (NEW)
  - Hướng dẫn chi tiết 100%
  - Cấu trúc hệ thống
  - Cảnh báo security
  - FAQ

- ✅ **DETAILED_FLOW.md** (NEW)
  - Sơ đồ luồng hoạt động
  - Data flow chi tiết
  - Từng bước ký message & mint
  - Blockchain transaction

- ✅ **API_REFERENCE.md** (NEW)
  - Tài liệu API backend
  - 5 endpoints
  - Request/response examples
  - cURL commands

---

## 🚀 BƯỚC 1: Chuẩn bị Môi trường (5 phút)

### 1.1 Cài đặt Dependencies
```bash
# 1. Cài npm packages
npm install

# 2. Cài backend packages
npm install express cors dotenv --save

# ✓ Done: node_modules/ được tạo
```

### 1.2 Cấu hình File .env
```bash
# Copy template
cp .env.example .env

# Sửa .env (mở file .env):
# RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# ADMIN_PRIVATE_KEY=0x... (từ MetaMask)

# ✓ Done: .env được cấu hình
```

### 1.3 Cài MetaMask
- Tải: https://metamask.io/
- Tạo ví hoặc import ví
- Chọn Sepolia Testnet
- ✓ Done: MetaMask ready

---

## 🧩 BƯỚC 2: Deploy Smart Contract (10 phút)

### 2.1 Compile Contract
```bash
# Compile WarrantyNFT.sol
npx hardhat compile

# Output:
# ✓ contracts/WarrantyNFT.sol compiled successfully
```

### 2.2 Deploy lên Sepolia
```bash
# Deploy
npx hardhat run scripts/deploy-warranty.ts --network sepolia

# Output:
# 📋 DEPLOYING WARRANTY NFT CONTRACT
# ✅ WarrantyNFT deployed at: 0x1234567890...
```

### 2.3 Lưu Contract Address
```bash
# Copy address từ output
# VD: 0x1234567890abcdef1234567890abcdef12345678

# Sửa .env:
CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# ✓ Done: Contract deployed
```

### 2.4 Verify trên Etherscan
```
Mở: https://sepolia.etherscan.io/address/0x...
Kiểm tra contract details
✓ Done: Verify on Etherscan
```

---

## 🖥️ BƯỚC 3: Chạy Backend Server (5 phút)

### 3.1 Cấu hình Backend
```bash
# File: .env
# Cần:
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...
PORT=3000
JWT_SECRET=your-secret-key
```

### 3.2 Chạy Backend
```bash
# Terminal 1: Chạy backend
node backend.js

# Output:
# 🚀 WARRANTY CERTIFICATE BACKEND
# Server running at http://localhost:3000
# Admin wallet: 0x...
# Contract: 0x...
```

### 3.3 Test Backend
```bash
# Terminal 2: Test health check
curl http://localhost:3000/api/health

# Response:
# { "status": "ok", "timestamp": "...", "contractAddress": "0x..." }

# ✓ Done: Backend running
```

---

## 🌐 BƯỚC 4: Chạy Frontend (5 phút)

### 4.1 Update Contract Address
```javascript
// File: warranty-flow.html
// Line ~400: Tìm dòng này:
const CONTRACT_ADDRESS = "0x...";

// Sửa thành:
const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

// ✓ Done: Contract address updated
```

### 4.2 Update Backend URL (nếu cần)
```javascript
// File: warranty-flow.html
// Line ~401: Kiểm tra:
const BACKEND_URL = "http://localhost:3000";

// ✓ Already correct
```

### 4.3 Chạy Web Server
```bash
# Terminal 2: Web server
python -m http.server 8000

# Output:
# Serving HTTP on 0.0.0.0 port 8000

# Hoặc dùng VS Code Live Server
```

### 4.4 Mở Frontend
```
Mở browser: http://localhost:8000/warranty-flow.html
Kiểm tra page load OK
✓ Done: Frontend running
```

---

## ✨ BƯỚC 5: Test Toàn Bộ Quy Trình (10 phút)

### 5.1 Test STEP 1: Kết nối MetaMask
```
1. Click "Kết nối MetaMask"
2. MetaMask popup xuất hiện
3. Chọn account
4. Click "Next" → "Connect"
5. ✓ Address hiển thị trên page

Expected:
- Address hiển thị đúng
- Button "Kết nối MetaMask" disabled
- Button "Ký Thông Điệp" enabled
```

### 5.2 Test STEP 2: Ký Thông Điệp
```
1. Click "Ký Thông Điệp"
2. MetaMask popup yêu cầu ký
3. Click "Sign"
4. ✓ Message Hash và Signature hiển thị

Expected:
- KHÔNG mất gas
- KHÔNG tạo giao dịch
- Signature hiển thị dạng: 0x...
- Button "Ký Thông Điệp" disabled
- Button "Xác minh Chữ ký" enabled
```

### 5.3 Test STEP 3: Xác minh Chữ ký
```
1. Click "Xác minh Chữ ký với Backend"
2. ⏳ Waiting...
3. ✓ Token hiển thị

Expected:
- Backend logs show signature verified
- Token hiển thị dạng: eyJh...
- Button "Xác minh" disabled
- Button "Cấp Chứng Chỉ" enabled
```

### 5.4 Test STEP 4: Cấp Chứng Chỉ
```
1. Điền thông tin:
   - Tên: "iPhone 15 Pro"
   - S/N: "A1B2C3D4E5F6"
   - Warranty: "12"
   - Mô tả: "Bảo hành 1 năm"

2. Click "Cấp Chứng Chỉ Bảo Hành"

3. MetaMask popup xác nhận giao dịch
   - Check gas fee (thường ~0.005 ETH)
   - Click "Confirm"

4. ⏳ Waiting for confirmation (1-2 phút)

5. ✓ Kết quả hiển thị:
   - Certificate ID
   - Transaction Hash
   - Block Number

Expected:
- MẤT gas (~0.005 ETH)
- TẠO giao dịch
- Transaction confirm trong 1-2 phút
- Certificate ID trả về từ backend
```

### 5.5 Test STEP 5: Xem Chứng Chỉ
```
1. Click "Xem Chứng Chỉ Của Tôi"

2. ✓ Danh sách chứng chỉ hiển thị:
   - Certificate ID
   - Product Name
   - S/N
   - Issue Date
   - Warranty End Date
   - Status

Expected:
- Chứng chỉ vừa cấp hiển thị
- Status: "Còn hiệu lực"
- Warranty End Date đúng (12 tháng từ ngày cấp)
```

### 5.6 Test Verify Certificate (Public)
```bash
# Lấy Certificate ID từ STEP 4 output
CERT_ID=1

# Test public verify API
curl http://localhost:3000/api/verify-certificate/${CERT_ID}

# Response:
{
  "success": true,
  "certificateId": "1",
  "owner": "0x...",
  "productName": "iPhone 15 Pro",
  "isValid": true,
  "isExpired": false
}

Expected:
- Ai cũng có thể verify
- Không cần token
- Trả về thông tin chứng chỉ
```

---

## 🎉 BƯỚC 6: Verify Kết Quả (5 phút)

### 6.1 Kiểm tra Blockchain
```
1. Mở Etherscan: https://sepolia.etherscan.io/

2. Tìm Transaction Hash từ STEP 4 output

3. Kiểm tra:
   ✓ Status: Success (xanh)
   ✓ From: Wallet address của bạn
   ✓ To: Smart contract address
   ✓ Value: 0 ETH
   ✓ Gas Used: ~215,000
   ✓ Gas Fee: ~0.005 ETH

Expected:
- Transaction confirmed
- Data encoded trong input
- Event CertificateMinted phát ra
```

### 6.2 Kiểm tra Smart Contract
```
1. Mở Etherscan: https://sepolia.etherscan.io/address/0x...

2. Click "Read Contract"

3. Call: getUserCertificates(yourAddress)
   → Trả về: [1] (Certificate ID)

4. Call: verifyCertificate(1)
   → Trả về: owner, productName, warranty...

Expected:
- Chứng chỉ được lưu trên blockchain
- Data persistent & immutable
```

### 6.3 Kiểm tra Backend Logs
```
Backend logs show:
✓ Signature verified for 0x...
✓ Transaction sent: 0x...
✓ Transaction confirmed in block 5234567
✓ Certificate ID: 1
✓ Minting completed

Expected:
- Tất cả steps được log
- Không có error
```

---

## 📁 FINAL CHECKLIST

### ✅ File & Folders
- [ ] WarrantyNFT.sol compiled
- [ ] deployment.json tạo ra
- [ ] .env configured
- [ ] warranty-flow.html có contract address
- [ ] backend.js chạy được
- [ ] node_modules/ tồn tại

### ✅ Deployment
- [ ] Contract deployed on Sepolia
- [ ] Contract address verified on Etherscan
- [ ] Admin wallet có Sepolia ETH
- [ ] Infura RPC key valid

### ✅ Backend
- [ ] node backend.js chạy OK
- [ ] /api/health trả về 200
- [ ] Port 3000 available
- [ ] .env có đầy đủ config

### ✅ Frontend
- [ ] warranty-flow.html load OK
- [ ] MetaMask kết nối được
- [ ] All 5 steps work

### ✅ Testing
- [ ] STEP 1: Connect ✓
- [ ] STEP 2: Sign message (no gas) ✓
- [ ] STEP 3: Verify signature ✓
- [ ] STEP 4: Mint certificate (with gas) ✓
- [ ] STEP 5: View certificates ✓
- [ ] Transaction confirmed on blockchain ✓
- [ ] Certificate verified on Etherscan ✓

---

## 📚 DOCUMENTATION GUIDE

| Tài liệu | Khi nào đọc |
|---------|-----------|
| **WARRANTY_README.md** | Tổng quan dự án |
| **QUICKSTART.md** | Triển khai nhanh |
| **IMPLEMENTATION_GUIDE.md** | Chi tiết từng bước |
| **DETAILED_FLOW.md** | Hiểu luồng hoạt động |
| **API_REFERENCE.md** | Gọi API backend |

### Đọc theo thứ tự:
1. WARRANTY_README.md (2 phút)
2. QUICKSTART.md (5 phút)
3. IMPLEMENTATION_GUIDE.md (30 phút)
4. DETAILED_FLOW.md (20 phút)
5. API_REFERENCE.md (10 phút khi cần)

---

## 🆘 QUICK TROUBLESHOOTING

| Vấn đề | Giải pháp |
|-------|----------|
| MetaMask not found | Cài từ https://metamask.io/ |
| Contract not deploying | Check RPC URL, private key |
| Backend won't start | node backend.js, check .env |
| CORS error | Đảm bảo BACKEND_URL đúng |
| Insufficient gas | Lấy testnet ETH từ faucet |

**Chi tiết:** Xem QUICKSTART.md hoặc IMPLEMENTATION_GUIDE.md

---

## 🎯 NEXT STEPS

### Sau khi setup xong:

1. **Test trên testnet**: Cấp vài chứng chỉ test
2. **Tìm hiểu smart contract**: Đọc comments trong WarrantyNFT.sol
3. **Thêm database**: Lưu data ngoài blockchain (MongoDB/PostgreSQL)
4. **Thêm features**: QR code, batch minting, analytics
5. **Deploy mainnet**: Khi ready, deploy lên Ethereum mainnet

---

## 🔗 USEFUL LINKS

### Blockchain
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
- [Ethereum Docs](https://ethereum.org/en/developers/)

### Tools
- [MetaMask](https://metamask.io/)
- [Hardhat](https://hardhat.org/)
- [ethers.js](https://docs.ethers.org/)

### Learning
- [Solidity Docs](https://docs.soliditylang.org/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Web3 Dev](https://www.web3dev.io/)

---

## 📞 SUPPORT

Có vấn đề? 

1. Kiểm tra [QUICKSTART.md](QUICKSTART.md) troubleshooting section
2. Xem [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) troubleshooting
3. Đọc log chi tiết trong DETAILED_FLOW.md
4. Check backend logs: `node backend.js`
5. Check browser console: F12 → Console tab

---

## ✨ THÀNH CÔNG!

Nếu bạn hoàn thành tất cả các bước trên, bạn đã có:

✅ Smart contract cấp chứng chỉ NFT  
✅ Backend xác minh signature  
✅ Frontend giao diện hoàn chỉnh  
✅ Quy trình bảo mật (2 bước ký)  
✅ Data lưu trên blockchain  
✅ Public API verify certificate  

**Chúc mừng!** Hệ thống của bạn đã sẵn sàng! 🎉

---

**Made with ❤️**  
**Version**: 1.0.0 | **Status**: ✅ Production Ready
