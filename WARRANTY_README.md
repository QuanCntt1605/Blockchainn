# 🎫 WARRANTY CERTIFICATE SYSTEM - HỆ THỐNG CHỨNG CHỈ BẢO HÀNH

[![Solidity](https://img.shields.io/badge/solidity-0.8.19-blue)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/node.js-16+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

## 🌟 Giới thiệu

Hệ thống cấp chứng chỉ bảo hành điện tử sử dụng **Blockchain** và **MetaMask Integration**. 

### ✨ Tính năng chính:

✅ **Ký thông điệp không mất gas** - Xác minh chủ sở hữu ví  
✅ **Cấp chứng chỉ NFT** - Gắn với địa chỉ ví trên blockchain  
✅ **Verify chứng chỉ** - Ai cũng có thể kiểm tra tính hợp lệ  
✅ **Quản lý bảo hành** - Theo dõi thời gian bảo hành sản phẩm  
✅ **Bảo mật cao** - Dùng signature recovery + JWT token  
✅ **Prevent replay attack** - Mỗi signature dùng 1 lần  

---

## 📋 Quy trình 4 bước

```
STEP 1: Kết nối MetaMask
    ↓ (Lấy address ví)
STEP 2: Ký thông điệp (KHÔNG MẤT GAS)
    ↓ (MetaMask popup, user ký)
STEP 3: Xác minh chữ ký (Backend)
    ↓ (Tạo JWT token)
STEP 4: Cấp chứng chỉ (MẤT GAS)
    ↓ (MetaMask popup xác nhận, ghi blockchain)
✅ HOÀN THÀNH
```

---

## 🚀 Bắt đầu nhanh

### 1. Chuẩn bị

```bash
# Cài npm dependencies
npm install

# Copy cấu hình
cp .env.example .env

# Sửa .env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=0x...
ADMIN_PRIVATE_KEY=0x...
```

### 2. Deploy Smart Contract

```bash
# Compile
npx hardhat compile

# Deploy lên Sepolia
npx hardhat run scripts/deploy-warranty.ts --network sepolia

# 💾 Lưu CONTRACT_ADDRESS từ output
```

### 3. Chạy Backend

```bash
# Terminal 1: Backend server
node backend.js

# Output: 🚀 Server running at http://localhost:3000
```

### 4. Chạy Frontend

```bash
# Terminal 2: Web server
python -m http.server 8000

# Mở: http://localhost:8000/warranty-flow.html
```

---

## 📁 Cấu trúc dự án

```
blockchain/
├── contracts/
│   └── WarrantyNFT.sol              ← Smart contract chính
├── scripts/
│   └── deploy-warranty.ts           ← Deploy script
├── warranty-flow.html                ← Frontend giao diện
├── backend.js                        ← Backend server
├── .env.example                      ← Cấu hình mẫu
├── package.json                      ← Dependencies
└── docs/
    ├── QUICKSTART.md                 ← Bắt đầu nhanh (5 phút)
    ├── IMPLEMENTATION_GUIDE.md       ← Hướng dẫn chi tiết
    ├── DETAILED_FLOW.md              ← Luồng hoạt động chi tiết
    └── API_REFERENCE.md              ← Tài liệu API
```

---

## 🎯 Các tài liệu chính

| Tài liệu | Nội dung |
|---------|---------|
| **QUICKSTART.md** | Triển khai trong 5 phút |
| **IMPLEMENTATION_GUIDE.md** | Hướng dẫn chi tiết 100% |
| **DETAILED_FLOW.md** | Sơ đồ + luồng dữ liệu chi tiết |
| **API_REFERENCE.md** | Tài liệu API backend |

### 👉 **Bắt đầu từ:** [QUICKSTART.md](QUICKSTART.md)

---

## 📡 API Endpoints

### 1. Health Check (Public)
```
GET /api/health
```

### 2. Verify Signature
```
POST /api/verify-signature
{
  "address": "0x...",
  "messageHash": "0x...",
  "signature": "0x..."
}
→ { "token": "eyJh..." }
```

### 3. Mint Certificate (Protected)
```
POST /api/mint-certificate
Authorization: Bearer {token}
{
  "address": "0x...",
  "productName": "iPhone 15 Pro",
  "productSN": "A1B2C3D4E5F6",
  "warrantyMonths": 12,
  "description": "..."
}
→ { "certificateId": "1", "transactionHash": "0x..." }
```

### 4. Get Certificates (Protected)
```
GET /api/certificates/{address}
Authorization: Bearer {token}
→ { "certificates": [...] }
```

### 5. Verify Certificate (Public)
```
GET /api/verify-certificate/{certificateId}
→ { "isValid": true, "isExpired": false, ... }
```

**Chi tiết:** Xem [API_REFERENCE.md](API_REFERENCE.md)

---

## 🔧 Technology Stack

### Frontend
- **Language**: HTML5 + JavaScript
- **Blockchain Library**: ethers.js v6
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome 6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT
- **Blockchain RPC**: ethers.js

### Blockchain
- **Language**: Solidity 0.8.19
- **Network**: Sepolia Testnet
- **Contract Type**: ERC-721 (NFT)

---

## 📊 Smart Contract Functions

### WarrantyNFT.sol

#### Public Functions

**1. `recoverSigner(messageHash, signature)`**
- Recover address từ signature
- Dùng ecrecover để verify

**2. `mintCertificate(...)`**
- Cấp chứng chỉ mới
- Verify signature
- Prevent replay attack
- Phát event CertificateMinted

**3. `verifyCertificate(certificateId)`**
- Lấy thông tin chứng chỉ
- Kiểm tra hiệu lực

**4. `getUserCertificates(address)`**
- Lấy danh sách chứng chỉ của user
- Return array of certificate IDs

**5. `isCertificateValid(certificateId)`**
- Kiểm tra chứng chỉ còn hiệu lực không
- Return boolean

---

## 🔐 Bảo mật

### 1. Signature Verification
- Dùng ECDSA (Elliptic Curve Digital Signature Algorithm)
- Backend verify signature bằng ecrecover
- Smart contract verify lại trước mint

### 2. Replay Attack Prevention
- Mỗi signature dùng 1 lần
- Lưu `usedSignatures` mapping
- Throw error nếu dùng lại

### 3. JWT Token
- Token hết hạn sau 24 giờ
- Signed với secret key
- Dùng cho protected endpoints

### 4. Access Control
- Chỉ admin có thể mint certificate
- User chỉ xem certificate của chính mình
- Public verify endpoint không cần auth

---

## 📚 Ví dụ sử dụng

### JavaScript Frontend

```javascript
// 1. Kết nối MetaMask
const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
});
const address = accounts[0];

// 2. Ký message
const message = `Verify ownership of ${address} at ${timestamp}`;
const messageHash = ethers.id(message);
const signature = await signer.signMessage(ethers.getBytes(messageHash));

// 3. Verify signature
const verifyRes = await fetch('http://localhost:3000/api/verify-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, messageHash, signature })
});
const { token } = await verifyRes.json();

// 4. Mint certificate
const mintRes = await fetch('http://localhost:3000/api/mint-certificate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        address,
        productName: 'iPhone 15 Pro',
        productSN: 'A1B2C3D4E5F6',
        warrantyMonths: 12,
        description: 'Bảo hành 1 năm'
    })
});
const { certificateId } = await mintRes.json();
console.log('Certificate created:', certificateId);
```

### cURL

```bash
# 1. Verify signature
curl -X POST http://localhost:3000/api/verify-signature \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","messageHash":"0x...","signature":"0x..."}'

# 2. Get token response
# { "token": "eyJh..." }

# 3. Mint certificate
curl -X POST http://localhost:3000/api/mint-certificate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJh..." \
  -d '{
    "address": "0x...",
    "productName": "iPhone 15 Pro",
    "productSN": "A1B2C3D4E5F6",
    "warrantyMonths": 12,
    "description": "Bảo hành 1 năm"
  }'
```

---

## 🧪 Testing

### Test Frontend
```bash
# Open browser
http://localhost:8000/warranty-flow.html

# Test steps:
1. Click "Kết nối MetaMask"
2. Click "Ký Thông Điệp"
3. Click "Xác minh Chữ ký"
4. Fill product info
5. Click "Cấp Chứng Chỉ"
6. Confirm in MetaMask
7. Check result
```

### Test Backend API
```bash
# Health check
curl http://localhost:3000/api/health

# Verify signature
curl -X POST http://localhost:3000/api/verify-signature \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","messageHash":"0x...","signature":"0x..."}'

# Get certificates
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/certificates/0x...
```

### Test Smart Contract
```bash
# Compile
npx hardhat compile

# Deploy locally
npx hardhat run scripts/deploy-warranty.ts

# Check Sepolia Etherscan
https://sepolia.etherscan.io/address/0x...
```

---

## 🐛 Troubleshooting

### MetaMask Issues
- **"MetaMask not installed"**: Cài MetaMask từ https://metamask.io/
- **"User rejected the request"**: Thử lại, chọn "Connect"
- **"Network wrong"**: Chọn Sepolia Testnet trong MetaMask

### Backend Issues
- **"Cannot connect to backend"**: Chạy `node backend.js`
- **"CORS error"**: Kiểm tra BACKEND_URL trong HTML
- **"Port 3000 in use"**: Kill process: `netstat -ano | findstr :3000`

### Contract Issues
- **"Contract address not found"**: Deploy trước
- **"Insufficient gas"**: Lấy testnet ETH từ faucet
- **"Signature does not match"**: Kiểm tra message hash

### Full Troubleshooting: [QUICKSTART.md](QUICKSTART.md#-troubleshooting-nhanh)

---

## 📞 Support

- **Hỏi đáp chung**: Xem [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md#-troubleshooting)
- **Luồng chi tiết**: Xem [DETAILED_FLOW.md](DETAILED_FLOW.md)
- **API**: Xem [API_REFERENCE.md](API_REFERENCE.md)
- **Quick start**: Xem [QUICKSTART.md](QUICKSTART.md)

---

## 📝 License

MIT License - Tự do sử dụng, chỉnh sửa, phân phối

---

## 🎓 Học thêm

### Blockchain
- [Ethereum Documentation](https://ethereum.org/en/developers/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Web Development
- [ethers.js Documentation](https://docs.ethers.org/)
- [Express.js Guide](https://expressjs.com/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

### Testnet
- [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Infura API](https://www.infura.io/)

---

## 🗺️ Roadmap

- [ ] Thêm database (MongoDB/PostgreSQL)
- [ ] Hỗ trợ multiple networks
- [ ] NFT image/metadata
- [ ] QR code verification
- [ ] Batch minting
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Mainnet deployment

---

## 📊 Statistics

```
Smart Contract:      ~400 lines
Frontend:            ~600 lines
Backend:             ~400 lines
Documentation:       ~3000 lines
Total:               ~4400 lines
```

---

## 👥 Contributors

- **Tác giả**: Your Name
- **Ngày tạo**: 2024-01-01
- **Phiên bản**: 1.0.0

---

## 🙏 Cảm ơn

- MetaMask team
- Ethereum community
- ethers.js developers
- Hardhat team

---

**Made with ❤️ for Warranty Certificate System**

**Phiên bản**: 1.0.0 | **Trạng thái**: ✅ Production Ready | **Network**: Sepolia
