# ⚡ QUICK START - BẮT ĐẦU NHANH

## 🚀 Triển khai trong 5 phút

### 1️⃣ Cái đặt (2 phút)

```bash
# 1. Cài npm packages
npm install
npm install express cors dotenv --save

# 2. Copy .env
cp .env.example .env

# 3. Sửa .env với:
#    - RPC_URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
#    - ADMIN_PRIVATE_KEY: 0x...
```

### 2️⃣ Deploy Smart Contract (1 phút)

```bash
# Compile
npx hardhat compile

# Deploy (nhớ thay --network sepolia nếu cần)
npx hardhat run scripts/deploy-warranty.ts --network sepolia

# 💾 Lưu contract address từ output
# Copy vào .env: CONTRACT_ADDRESS=0x...
```

### 3️⃣ Chạy Backend (1 phút)

```bash
# Terminal 1: Chạy backend
node backend.js

# Output:
# 🚀 WARRANTY CERTIFICATE BACKEND
# Server running at http://localhost:3000
```

### 4️⃣ Chạy Frontend (1 phút)

```bash
# Terminal 2: Web server
python -m http.server 8000

# Mở browser:
# http://localhost:8000/warranty-flow.html
```

---

## 📋 Quy trình Sử dụng

### Người Dùng:

```
1. Click "Kết nối MetaMask" → Select ví
2. Click "Ký Thông Điệp" → MetaMask popup → Click "Sign"
   ✓ KHÔNG MẤT GAS
3. Click "Xác minh Chữ ký với Backend" → Nhận token
4. Điền thông tin sản phẩm → Click "Cấp Chứng Chỉ"
   → MetaMask popup → Click "Confirm"
   ✓ MẤT GAS (ghi vào blockchain)
5. Chứng chỉ được tạo ✅
```

---

## 🔧 Lệnh Hữu Ích

```bash
# Compile contract
npx hardhat compile

# Deploy trên local
npx hardhat run scripts/deploy-warranty.ts

# Deploy trên Sepolia
npx hardhat run scripts/deploy-warranty.ts --network sepolia

# Test contract
npx hardhat test

# Lấy tester ETH (faucet)
# https://sepolia-faucet.pk910.de/

# Kiểm tra transaction
# https://sepolia.etherscan.io/
```

---

## 📍 Kiểm tra từng bước

### ✅ Step 1: Smart Contract deployed?
```bash
# Check contract trên Sepolia Etherscan
# https://sepolia.etherscan.io/address/0x...
```

### ✅ Step 2: Backend chạy ok?
```bash
curl http://localhost:3000/api/health
# { "status": "ok", ... }
```

### ✅ Step 3: Frontend load ok?
```bash
# Mở http://localhost:8000/warranty-flow.html
# Nếu 404: Đảm bảo chạy web server
```

### ✅ Step 4: MetaMask connect ok?
```
1. Kết nối MetaMask
2. Kiểm tra address hiển thị
3. Kiểm tra balance có Sepolia ETH không
```

### ✅ Step 5: Ký message ok?
```
1. Click "Ký Thông Điệp"
2. MetaMask popup xuất hiện
3. Click "Sign"
4. Kiểm tra signature hiển thị
```

### ✅ Step 6: Verify ok?
```
1. Click "Xác minh Chữ ký với Backend"
2. Kiểm tra token hiển thị
3. Kiểm tra backend logs
```

### ✅ Step 7: Mint ok?
```
1. Điền thông tin sản phẩm
2. Click "Cấp Chứng Chỉ"
3. MetaMask popup xác nhận giao dịch
4. Click "Confirm"
5. Chờ confirm (~1-2 phút)
6. Kiểm tra Etherscan
```

---

## 🆘 Troubleshooting nhanh

| Lỗi | Giải pháp |
|-----|----------|
| MetaMask not found | Cài MetaMask: https://metamask.io/ |
| Contract address not found | Deploy trước: `npx hardhat run scripts/deploy-warranty.ts` |
| Backend not responding | Chạy: `node backend.js` |
| CORS error | Đảm bảo BACKEND_URL = "http://localhost:3000" |
| Insufficient gas | Lấy testnet ETH: https://sepolia-faucet.pk910.de/ |
| Network wrong | Chọn Sepolia trong MetaMask |

---

## 📚 Tệp quan trọng

| Tệp | Mục đích |
|-----|---------|
| `contracts/WarrantyNFT.sol` | Smart contract |
| `warranty-flow.html` | Frontend |
| `backend.js` | Backend server |
| `.env` | Cấu hình (không commit) |
| `scripts/deploy-warranty.ts` | Deploy script |

---

## 🎯 Kế tiếp?

- [ ] Test trên testnet
- [ ] Deploy lên mainnet
- [ ] Cập nhật cơ sở dữ liệu
- [ ] Thêm xác thực 2FA
- [ ] Hình ảnh QR code cho chứng chỉ
- [ ] Tích hợp với hệ thống CRM

---

**Hỗ trợ: Xem IMPLEMENTATION_GUIDE.md để chi tiết**
