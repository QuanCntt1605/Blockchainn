# 🔧 Hướng Dẫn Khắc Phục - Cấp Chứng Chỉ Trên MetaMask

> **Tình Trạng Hiện Tại**: Yellow warning "Bạn chưa xác minh ví"  
> **Nguyên Nhân**: Backend không chạy + JWT token chưa được tạo  
> **Giải Pháp**: Thực hiện 5 bước dưới đây

---

## 📋 Checklist 5 Bước

### **Bước 1️⃣: Chuẩn Bị Infura API Key**

**Mục đích**: Kết nối RPC provider để tương tác với Sepolia testnet

**Thực hiện**:
```
1. Truy cập https://infura.io
2. Đăng ký tài khoản (hoặc login)
3. Click "Create Project"
4. Chọn "Ethereum" → "Sepolia"
5. Copy Project ID
```

**Copy vào .env**:
```env
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID_HERE
```

**Ví dụ**:
```env
RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
```

---

### **Bước 2️⃣: Deploy Smart Contract**

**Mục đích**: Triển khai WarrantyNFT contract lên Sepolia testnet

**Kiểm Tra**:
```powershell
# Mở terminal PowerShell tại folder blockchain
cd C:\Users\MSI\Downloads\MonThayCong\blockchain

# Kiểm tra contract compile OK
npx hardhat compile
```

**Deploy**:
```powershell
npx hardhat run scripts/deploy-warranty.ts --network sepolia
```

**Output sẽ trông như**:
```
Deploying WarrantyNFT contract...
Contract deployed to: 0x1234567890123456789012345678901234567890
Deployment info saved to deployment.json
```

---

### **Bước 3️⃣: Copy Contract Address**

**Mục đích**: Lưu địa chỉ contract để gọi các hàm smart contract

**Thực hiện**:

1. **Cách A - Từ Terminal Output**:
   - Mở file `deployment.json` nếu được tạo
   - Copy `address` field

2. **Cách B - Từ Hardhat Artifacts**:
   - Mở thư mục `artifacts/contracts/WarrantyNFT.sol/`
   - Tìm file `.json` chứa contract metadata

**Copy vào .env**:
```env
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

---

### **Bước 4️⃣: Export Private Key từ MetaMask**

**Mục đích**: Cho backend quyền ký các giao dịch minting

**⚠️ CẢNH BÁO BẢNG**: 
- **KHÔNG share** private key cho ai
- **KHÔNG push** lên GitHub
- .env file đã thêm vào .gitignore

**Thực Hiện**:
```
1. Mở MetaMask extension
2. Nhấn vào account ở trên cùng
3. Chọn "Account Details"
4. Nhấn "Show Private Key"
5. Nhập password MetaMask
6. Copy key (kèm 0x prefix)
```

**Copy vào .env**:
```env
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cadccb33bcf3645f7f8319a0
```

---

### **Bước 5️⃣: Khởi Động Backend**

**Mục đích**: Backend cần chạy để xử lý signature verification và minting

**Chuẩn Bị**:
```powershell
# Mở terminal PowerShell tại folder blockchain
cd C:\Users\MSI\Downloads\MonThayCong\blockchain

# Cài dependencies (nếu chưa)
npm install

# Kiểm tra .env đã config
# RPC_URL, CONTRACT_ADDRESS, ADMIN_PRIVATE_KEY phải có giá trị thực
```

**Khởi Động**:
```powershell
node backend.js
```

**Output mong đợi**:
```
[Server Info] Starting WARRANTY CERTIFICATE BACKEND
📝 Loaded environment variables:
  ✓ RPC_URL: https://sepolia.infura.io/v3/...
  ✓ CONTRACT_ADDRESS: 0x1234...
  ✓ ADMIN_PRIVATE_KEY: 0x****... (hidden)
  ✓ PORT: 3000
✓ Server running on port 3000
```

**Nếu bị lỗi**:

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| `RPC URL not configured` | `.env` không có RPC_URL | Thêm Infura URL |
| `CONTRACT_ADDRESS must be valid` | Contract address sai format | Copy lại contract address |
| `Invalid private key` | Private key sai | Export lại từ MetaMask |
| `Port 3000 already in use` | Có process khác dùng port 3000 | Dùng port khác hoặc kill process |

---

## 🧪 Test Workflow

### **Test 1: Verify Backend Chạy**

Mở browser console (F12) và dán:
```javascript
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend status:', d))
  .catch(e => console.error('Backend not running:', e))
```

**Output tốt**:
```
Backend status: {status: "ok"}
```

---

### **Test 2: Kết Nối MetaMask**

1. **Mở**: http://localhost:8000/warranty-flow.html
2. **Nhấn**: "Kết nối MetaMask"
3. **Console (F12)** sẽ hiển thị:

```
🔗 Step 1/3: Connecting to MetaMask...
✓ Address: 0x1234...abcd
📊 Fetching balance...
✓ Balance: 3.2052 ETH
🔐 Step 2/3: Signing message for wallet verification...
✓ Message signed successfully
📝 Signature: 0x1234...
🔄 Step 3/3: Verifying signature with backend...
✓ JWT Token received and stored
🎉 Wallet verification complete!
```

**Nếu bị lỗi**: Xem chi tiết trong Console (F12)

---

### **Test 3: Cấp Chứng Chỉ**

1. **Điền form**:
   - Mã số: "IPHONE-11"
   - Số serial: "ABC123XYZ"
   - Thương hiệu: "Apple"
   - Thời hạn: 12 tháng

2. **Nhấn**: "✓ Đã kết nối" button để cấp chứng chỉ

3. **Console (F12)** sẽ hiển thị:
```
📤 Step 1: Preparing mint request...
📤 Step 2: Sending to backend...
📤 Step 3: Backend response status: 200
✓ Certificate minted successfully
```

---

## 🚨 Troubleshooting

### ❌ "Bạn chưa xác minh ví"

**Nguyên nhân**: authToken chưa được set

**Fix**:
```
1. ✓ Mở console F12
2. ✓ Kiểm tra có error không
3. ✓ Backend chạy: node backend.js?
4. ✓ RPC_URL, CONTRACT_ADDRESS đúng?
5. ✓ Disconnect wallet, kết nối lại
```

---

### ❌ "Failed to fetch"

**Nguyên nhân**: Backend không chạy hoặc port 3000 không mở

**Fix**:
```powershell
# Terminal 1: Start backend
cd blockchain
node backend.js

# Terminal 2: Check if port 3000 listening
netstat -ano | findstr :3000

# If not listening:
# Kill the process: taskkill /PID {PID} /F
# Then: node backend.js again
```

---

### ❌ "JWT Token không hợp lệ"

**Nguyên nhân**: Token hết hạn hoặc signature verify fail

**Fix**:
```javascript
// Console: Check token
console.log("Auth token:", authToken)

// Disconnect & reconnect
disconnectWallet()
connectWallet()

// Try mint again
```

---

### ❌ Contract Address không hợp lệ

**Nguyên nhân**: .env có contract address sai

**Fix**:
```
1. ✓ Redeploy contract: npx hardhat run scripts/deploy-warranty.ts --network sepolia
2. ✓ Copy address mới từ console
3. ✓ Update .env CONTRACT_ADDRESS
4. ✓ Restart backend: node backend.js
5. ✓ Test lại
```

---

## 📊 Thứ Tự Chính Xác

```
1️⃣ Tạo RPC (Infura Key)
      ↓
2️⃣ Deploy Contract (npx hardhat...)
      ↓
3️⃣ Copy Contract Address
      ↓
4️⃣ Export Private Key
      ↓
5️⃣ Update .env với 3 giá trị
      ↓
6️⃣ Start Backend (node backend.js)
      ↓
7️⃣ Connect MetaMask (http://localhost:8000)
      ↓
8️⃣ Cấp Chứng Chỉ
      ↓
✅ Xem trong mycerts
```

---

## 📁 File Cấu Hình

**Các file quan trọng**:
- `.env` - Backend configuration (đã cập nhật)
- `backend.js` - Express server
- `warranty-flow.html` - Frontend (đã cập nhật)
- `contracts/WarrantyNFT.sol` - Smart contract
- `scripts/deploy-warranty.ts` - Deploy script

**Folder log**:
```
blockchain/
├── deployment.json (contract address sau deploy)
└── node_modules/ (dependencies)
```

---

## 🎯 Kết Quả Cuối Cùng

Sau khi hoàn tất 5 bước:

✅ **Wallet kết nối thành công** - Hiển thị address + balance  
✅ **Ví được xác minh** - Không còn warning  
✅ **Cấp chứng chỉ thành công** - Mint NFT lên blockchain  
✅ **Xem danh sách** - View Mycerts tab  
✅ **Lưu MetaMask** - Có thể import NFT vào MetaMask  

---

**Last Updated**: May 30, 2026  
**Status**: Ready for implementation  
**Created By**: GitHub Copilot
