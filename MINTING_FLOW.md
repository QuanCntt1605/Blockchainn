# 🔐 Quy Trình Cấp Chứng Chỉ (Minting) - Chi Tiết

## Quy Trình Mới (Có Nonce)

Khi bạn click "Cấp chứng chỉ", frontend sẽ tự động thực hiện các bước sau:

### **Bước 1️⃣: Lấy Nonce từ Backend**
```
Frontend → Backend: GET /api/get-nonce
Backend → Frontend: { nonce: "1717411234567" }
```
Nonce là một số timestamp **duy nhất** mỗi lần gọi.

---

### **Bước 2️⃣: Tạo Message Duy Nhất Với Nonce**
```
Message = "Verify ownership of 0x393dd823e009744c4083e5e0bf75496e59aebcbf nonce: 1717411234567"
```
**Chú ý**: Mỗi lần cấp chứng chỉ, nonce khác nhau = message khác nhau

---

### **Bước 3️⃣: MetaMask Hiện Popup Ký**
```
MetaMask Popup:
┌─────────────────────────────────────┐
│  Tài khoản: 0x393dd...eAbcbf        │
│  Yêu cầu ký message:                │
│  "Verify ownership of 0x393d...     │
│   nonce: 1717411234567"             │
│                                     │
│  [Từ chối]  [Ký]                   │
└─────────────────────────────────────┘
```
**👉 Bạn click "Ký" để xác nhận**

---

### **Bước 4️⃣: Tính Toán Message Hash**
```
Frontend calculates:
messageHash = keccak256("Verify ownership of 0x... nonce: 1717411234567")
signature = "0xd40ca0267c8438986d..."
```

---

### **Bước 5️⃣: Gửi Signature + MessageHash Lên Backend**
```
POST /api/mint-certificate
{
  "productName": "iPhone 12",
  "productSN": "IPHONE",
  "warrantyMonths": 12,
  "description": "Test",
  "signature": "0xd40ca0267c8438986d...",      ← ĐÃC BIỆT
  "messageHash": "0x98bc4974f62cb10f8cb..."   ← ĐÃC BIỆT
}
```

---

### **Bước 6️⃣: Backend Cấp Chứng Chỉ**
```
Backend:
1. Verify signature (xác nhận là bạn ký)
2. Check usedSignatures mapping
   - Nếu signature chưa dùng → ✓ Cấp
   - Nếu signature đã dùng → ✗ Lỗi "Signature already used"
3. Mint certificate trên blockchain
4. Return certificateId + transactionHash
```

---

## ⚠️ Khi Nào Bạn Sẽ Thấy MetaMask Popup?

| Hành động | Popup MetaMask |
|-----------|---|
| Kết nối ví lần đầu | ✓ Hiện (khi connectWallet) |
| Cấp chứng chỉ lần đầu | ✓ Hiện (bước 3) |
| Cấp chứng chỉ lần thứ 2 | ✓ Hiện (bước 3) |
| Cấp chứng chỉ lần thứ 3 | ✓ Hiện (bước 3) |

**Mỗi lần cấp = Mỗi lần ký message MỚI (vì nonce khác nhau)**

---

## 🐛 Gỡ Lỗi Nếu Có Vấn Đề

### 1. **MetaMask không hiện popup**
```
Nguyên nhân: Signer không đúng hoặc browser block popup
Cách sửa:
- Kiểm tra console (F12) xem có lỗi nào không
- Cho phép popup cho localhost:5500
- Thử browser khác
```

### 2. **Lỗi "Signature already used"**
```
Nguyên nhân: Frontend ký cùng message 2 lần
Cách sửa: Quy trình mới phải lấy nonce mỗi lần
- Frontend đã sửa ✓
- Thử cấp chứng chỉ mới lại
```

### 3. **Lỗi "BigInt and other types"**
```
Nguyên nhân: JavaScript cộng BigInt + Number
Cách sửa: Backend đã sửa ✓
```

### 4. **Lỗi "Missing required fields"**
```
Nguyên nhân: Frontend không gửi signature + messageHash
Cách sửa: Frontend đã cập nhật ✓
```

---

## ✅ Quy Trình Test Hoàn Chỉnh

### **Terminal 1: Chạy Smart Contract**
```bash
cd blockchain
npx hardhat node
```

### **Terminal 2: Chạy Backend**
```bash
cd blockchain
node backend.js
```

### **Browser: Truy cập Frontend**
```
http://localhost:5500/blockchain/warranty-flow.html
```

### **Step-by-Step Test**
1. ✓ Click "Kết nối MetaMask"
   - MetaMask popup: yêu cầu chọn account
   - Sau khi kết nối: hiện "✓ Đã kết nối"
   - Console log: "🎉 Wallet verification complete!"

2. ✓ Điền form:
   - Mã số / Model: `IPHONE`
   - Số serial: `12`
   - Thương hiệu: `Điện thoại iPhone 12`
   - Thời hạn bảo hành: `12`

3. ✓ Click "Cấp chứng chỉ"
   - Console log: "📤 Bước 1: Lấy nonce từ backend..."
   - Backend logs: "GET /api/get-nonce"
   - Console log: "✓ Nonce nhận được: ..."
   - Console log: "📤 Bước 3: MetaMask sẽ yêu cầu ký message..."
   - **MetaMask Popup**: "Sign" để ký
   - Console log: "✓ Signature: 0x..."
   - Console log: "📤 Bước 5: Gửi yêu cầu cấp chứng chỉ lên backend..."
   - Backend logs: "POST /api/mint-certificate ✓"
   - Alert: "✅ Chứng chỉ đã được cấp thành công!"

4. ✓ Cấp chứng chỉ thứ 2
   - Lặp lại bước 2-3
   - **MetaMask Popup** hiện lại (vì nonce khác)
   - ✓ Cấp thành công

---

## 📊 So Sánh: Cũ vs Mới

### Quy Trình Cũ (Lỗi)
```
Kết nối ví → Ký 1 message → Cấp chứng chỉ #1 ✓
                         → Cấp chứng chỉ #2 ✗ "Signature already used"
```

### Quy Trình Mới (Sửa)
```
Kết nối ví → Ký message #1 → Cấp chứng chỉ #1 ✓
                         → Ký message #2 (nonce mới) → Cấp chứng chỉ #2 ✓
                         → Ký message #3 (nonce mới) → Cấp chứng chỉ #3 ✓
```

---

## 🎯 Những Gì Đã Sửa

| Thành phần | Cũ | Mới |
|-----------|----|----|
| **Frontend** | Không lấy nonce | ✓ GET `/api/get-nonce` |
| **Frontend** | Không ký với nonce | ✓ Ký message với nonce duy nhất |
| **Frontend** | Không gửi signature | ✓ Gửi signature + messageHash |
| **Backend** | Lưu signature để reuse | ✓ Chấp nhận signature từ request |
| **Backend** | BigInt type error | ✓ Chuyển đổi `Number(BigInt)` |
| **Contract** | Kiểm tra `usedSignatures` | ✓ Giữ nguyên (prevent replay) |

---

## 🚀 Tiếp Theo

Giờ bạn có thể:
- ✅ Cấp nhiều chứng chỉ liên tiếp
- ✅ Mỗi lần cấp = Mỗi lần ký (MetaMask hiện popup)
- ✅ Không còn lỗi "Signature already used"
- ✅ Xem được Transaction Hash + Block Number

**Hãy thử test ngay!** 🎉

