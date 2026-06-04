# 🔄 LUỒNG HOẠT ĐỘNG CHI TIẾT - HỆ THỐNG CHỨNG CHỈ BẢO HÀNH

## 📊 Sơ đồ Luồng Tổng Quát

```
┌──────────────────────────────────────────────────────────────────┐
│                     NGƯỜI DÙNG (USER)                             │
│                    Mở warranty-flow.html                          │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │     FRONTEND (Browser + ethers.js)   │
        │  - Kết nối MetaMask                  │
        │  - Tạo message hash                  │
        │  - Gửi request API                   │
        └──────────┬───────────────────────────┘
                   │
        ┌──────────▼───────────────────────────┐
        │  METAMASK (Wallet Extension)         │
        │  - Ký message (không mất gas)        │
        │  - Xác nhận giao dịch (mất gas)      │
        └──────────┬───────────────────────────┘
                   │    
        ┌──────────▼───────────────────────────┐
        │    BACKEND SERVER (Node.js)          │
        │    Port: 3000                        │
        │  - Verify signature                  │
        │  - Tạo JWT token                     │
        │  - Gọi smart contract               │
        │  - Lưu dữ liệu                       │
        └──────────┬───────────────────────────┘
                   │
        ┌──────────▼───────────────────────────┐
        │  SMART CONTRACT (Solidity)           │
        │  WarrantyNFT.sol                     │
        │  - Verify signature                  │
        │  - Mint certificate NFT              │
        │  - Phát event CertificateMinted      │
        └──────────┬───────────────────────────┘
                   │
        ┌──────────▼───────────────────────────┐
        │    BLOCKCHAIN (Sepolia Network)      │
        │  - Ghi dữ liệu permanent             │
        │  - Tạo transaction                   │
        │  - Tiêu thụ gas                      │
        └──────────────────────────────────────┘
```

---

## 📱 STEP 1: Kết nối MetaMask

### Frontend Code:
```javascript
async function connectWallet() {
    // Yêu cầu MetaMask cấp quyền
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });
    
    currentAddress = accounts[0]; // VD: 0x742d35Cc6634C0532925a3b844Bc9e7595f...
    
    // Tạo provider & signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
}
```

### MetaMask Dialog:
```
┌─────────────────────────────────────┐
│   MetaMask                          │
├─────────────────────────────────────┤
│ Select an account to connect        │
│                                     │
│ ☑ Account 1 (0x742d...)            │
│ ☐ Account 2                         │
│ ☐ Account 3                         │
│                                     │
│  [Cancel]                   [Next]  │
└─────────────────────────────────────┘
```

### Kết quả:
```
✓ Đã kết nối: 0x742d35Cc6634C0532925a3b844Bc9e7595f...
```

---

## 🖊️ STEP 2: Ký Thông Điệp (KHÔNG MẤT GAS)

### Frontend Code:
```javascript
async function signMessage() {
    // 1. Tạo message
    const timestamp = Math.floor(Date.now() / 1000); // VD: 1704067200
    const message = `Verify ownership of ${currentAddress} at ${timestamp}`;
    // Message: "Verify ownership of 0x742d... at 1704067200"
    
    // 2. Hash message
    const messageHash = ethers.id(message);
    // messageHash: 0xabcd1234...
    
    // 3. User ký message trong MetaMask
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    // signature: 0x1234567890abcdef...
}
```

### MetaMask Dialog:
```
┌──────────────────────────────────────────┐
│          MetaMask                        │
├──────────────────────────────────────────┤
│ Signature Request                        │
│                                          │
│ Only sign this message if you trust      │
│ the requesting website.                  │
│                                          │
│ Message:                                 │
│ Verify ownership of 0x742d... at...     │
│                                          │
│         [Reject]         [Sign]         │
└──────────────────────────────────────────┘
```

### Kết quả:
```
✓ Ký thông điệp thành công!
✓ Message Hash: 0xabcd1234...
✓ Signature: 0x1234567890abcdef...
✓ KHÔNG tạo giao dịch
✓ KHÔNG mất gas
```

### Điểm quan trọng:
- **KHÔNG** có giao dịch blockchain
- **KHÔNG** mất gas
- Chỉ để xác minh người dùng sở hữu ví
- Signature có thể verify offline

---

## ✅ STEP 3: Xác minh Chữ ký (Backend Verification)

### Frontend gửi request:
```javascript
// API Call
const response = await fetch("http://localhost:3000/api/verify-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
        messageHash: "0xabcd1234...",
        signature: "0x1234567890abcdef..."
    })
});

const { token } = await response.json();
// token: "eyJhbGc..." (JWT token)
```

### Backend xử lý:

#### backend.js - API Endpoint:
```javascript
app.post('/api/verify-signature', async (req, res) => {
    const { address, messageHash, signature } = req.body;
    
    // 1. Recover address từ signature
    const recoveredAddress = ethers.recoverAddress(messageHash, signature);
    
    // 2. So sánh với address gửi lên
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(400).json({ 
            message: "Signature does not match address" 
        });
    }
    
    // 3. Tạo JWT token
    const token = generateToken(address);
    // token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    
    // 4. Lưu vào database/in-memory
    users.set(address.toLowerCase(), {
        token,
        signature,
        messageHash,
        verifiedAt: new Date()
    });
    
    // 5. Trả token
    res.json({ token });
});
```

### Backend Logs:
```
✓ Signature verified for 0x742d35Cc6634C0532925a3b844Bc9e7595f...
Token created: eyJhbGc...
User stored in database
```

### Kết quả Frontend:
```
✓ Xác minh chữ ký thành công!
✓ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✓ Bước tiếp theo: Cấp chứng chỉ
```

---

## 💎 STEP 4: Cấp Chứng Chỉ Bảo Hành (MẤT GAS)

### Frontend gửi request:
```javascript
const response = await fetch("http://localhost:3000/api/mint-certificate", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Token từ step 3
    },
    body: JSON.stringify({
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
        productName: "iPhone 15 Pro",
        productSN: "A1B2C3D4E5F6",
        warrantyMonths: 12,
        description: "Bảo hành 1 năm từ ngày mua"
    })
});
```

### Backend xử lý:

#### 1. Verify token:
```javascript
app.post('/api/mint-certificate', authMiddleware, async (req, res) => {
    // authMiddleware kiểm tra token
    const recipientAddress = req.user.address;
    // recipientAddress: 0x742d35Cc6634C0532925a3b844Bc9e7595f...
```

#### 2. Gọi smart contract:
```javascript
const tx = await contract.mintCertificate(
    recipientAddress,           // Địa chỉ nhận chứng chỉ
    messageHash,                // Hash của message đã ký
    signature,                  // Chữ ký từ step 2
    "iPhone 15 Pro",           // Product name
    "A1B2C3D4E5F6",           // Product S/N
    12,                         // Warranty months
    "Bảo hành 1 năm từ ngày mua" // Description
);

// tx.hash: 0x1a2b3c4d5e6f... (Transaction hash)
```

#### 3. Chờ transaction confirm:
```javascript
const receipt = await tx.wait();

// receipt.blockNumber: 5234567
// receipt.hash: 0x1a2b3c4d5e6f...
// receipt.gasUsed: 215000
```

### Smart Contract xử lý:

#### WarrantyNFT.sol:
```solidity
function mintCertificate(
    address recipient,
    bytes32 messageHash,
    bytes memory signature,
    string memory productName,
    string memory productSN,
    uint256 warrantyMonths,
    string memory description
) public onlyAdmin returns (uint256) {
    
    // 1. Verify lại signature trong contract
    address signer = recoverSigner(messageHash, signature);
    require(signer == recipient, "Signature does not match");
    
    // 2. Prevent replay attack
    require(!usedSignatures[messageHash], "Signature already used");
    usedSignatures[messageHash] = true;
    
    // 3. Tạo Certificate NFT
    uint256 certificateId = certificateCounter++;  // VD: 1
    
    uint256 warrantyEndDate = block.timestamp + (warrantyMonths * 30 days);
    // warrantyEndDate = 1704067200 + (12 * 30 * 86400)
    
    certificates[1] = Certificate({
        owner: 0x742d35Cc6634C0532925a3b844Bc9e7595f...,
        productName: "iPhone 15 Pro",
        productSN: "A1B2C3D4E5F6",
        issueDate: 1704067200,
        warrantyEndDate: 1735689600,
        description: "Bảo hành 1 năm từ ngày mua",
        isValid: true
    });
    
    // 4. Ghi user -> Certificate mapping
    userCertificates[0x742d...].push(1);
    
    // 5. Phát event
    emit CertificateMinted(
        0x742d35Cc6634C0532925a3b844Bc9e7595f...,
        1,
        "iPhone 15 Pro",
        1735689600
    );
    
    return 1; // Certificate ID
}
```

### MetaMask Dialog (Confirm Transaction):
```
┌────────────────────────────────────────────┐
│              MetaMask                      │
├────────────────────────────────────────────┤
│ Contract Interaction                       │
│                                            │
│ From: 0x742d35Cc6634C0532925a3b844Bc9e... │
│ To: 0x1234567890abcdef1234567890abcdef... │
│                                            │
│ Function: mintCertificate                  │
│ Gas Limit: 215,000                         │
│ Gas Price: 25 gwei                         │
│ Total Gas Fee: 0.005375 ETH ≈ $20          │
│                                            │
│        [Reject]              [Confirm]    │
└────────────────────────────────────────────┘
```

### Blockchain Transaction:

**Status: PENDING**
```
Hash: 0x1a2b3c4d5e6f...
From: 0x742d35Cc6634C0532925a3b844Bc9e...
To: 0x1234567890abcdef1234567890abcdef...
Value: 0 ETH
Gas Used: 215,000
Gas Price: 25 gwei
⏳ Pending in mempool...
```

**Status: CONFIRMED (1-2 phút sau)**
```
✓ Hash: 0x1a2b3c4d5e6f...
✓ Block: 5234567
✓ Gas Used: 215,000 (100%)
✓ Gas Fee: 0.005375 ETH ≈ $20
✓ Status: Success
✓ Confirmations: 15
```

### Backend Logs:
```
✓ Transaction sent: 0x1a2b3c4d5e6f...
⏳ Waiting for confirmation...
✓ Transaction confirmed in block 5234567
✓ Certificate ID: 1
✓ Minting completed
```

### Frontend Kết quả:
```
✓ Chứng chỉ đã được cấp thành công!
✓ Certificate ID: 1
✓ Transaction Hash: 0x1a2b3c4d5e6f...
✓ Block Number: 5234567
✓ Gas Fee Paid: 0.005375 ETH
```

---

## 📋 STEP 5: Xem Chứng Chỉ

### Frontend request:
```javascript
const response = await fetch(
    `http://localhost:3000/api/certificates/${currentAddress}`,
    { headers: { "Authorization": `Bearer ${token}` } }
);

const { certificates } = await response.json();
```

### Backend xử lý:
```javascript
app.get('/api/certificates/:address', authMiddleware, async (req, res) => {
    const address = req.params.address;
    
    // Lấy danh sách certificate IDs
    const certificateIds = await contract.getUserCertificates(address);
    // VD: [1, 2, 3]
    
    // Lấy chi tiết từng certificate
    const certificates = [];
    for (const certId of certificateIds) {
        const certData = await contract.verifyCertificate(certId);
        certificates.push({
            id: "1",
            owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
            productName: "iPhone 15 Pro",
            productSN: "A1B2C3D4E5F6",
            issueDate: "1704067200",
            warrantyEndDate: "1735689600",
            description: "Bảo hành 1 năm từ ngày mua",
            isValid: true,
            isExpired: false
        });
    }
    
    res.json({ certificates });
});
```

### Frontend Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Danh sách chứng chỉ (1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📜 #1
Sản phẩm: iPhone 15 Pro
S/N: A1B2C3D4E5F6
Cấp ngày: 01/01/2024
Hết hạn: 01/01/2025
Trạng thái: ✓ Còn hiệu lực

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔐 So sánh 2 bước ký

| | STEP 2: Ký Message | STEP 4: Cấp Chứng Chỉ |
|---|---|---|
| **Tác dụng** | Xác minh ví | Tạo chứng chỉ |
| **MetaMask** | Popup ký | Popup xác nhận giao dịch |
| **Blockchain** | OFF-CHAIN | ON-CHAIN |
| **Giao dịch** | KHÔNG | CÓ |
| **Gas** | KHÔNG MẤT | CÓ MẤT |
| **Data lưu** | Signature | Certificate NFT |
| **Thời gian** | Ngay lập tức | 1-2 phút |

---

## 📊 Data Flow Diagram

### Message Signing:
```
User Message
    ↓
ethers.id() ─────────────► Message Hash
    ↓
MetaMask Sign ──────────► Signature
    ↓
Frontend → Backend ──────► Verify
    ↓
JWT Token ◄──────────────── Verified!
```

### Certificate Minting:
```
User Input (Product, S/N, Warranty)
    ↓
Frontend → Backend ──────────┐
    │                        │
    │ + Token                │
    │ + Signature            ↓
    │ + Message Hash   Backend Call Smart Contract
    │                        ↓
    │                  Contract: Verify Signature
    │                        ↓
    │                  Contract: Create Certificate
    │                        ↓
    │              Transaction → Blockchain
    │                        ↓
    └──────────────────────► Wait for Confirmation
                             ↓
                      ✓ Certificate Created
                             ↓
                      ✓ NFT gắn với ví
                             ↓
                      ✓ Data on Blockchain
```

---

## 🎯 Tóm tắt

| Bước | Mục đích | MetaMask | Blockchain | Gas |
|------|---------|----------|-----------|-----|
| 1. Kết nối | Lấy address | Popup | Không | 0 |
| 2. Ký message | Verify ví | Popup | Không | 0 |
| 3. Verify | Tạo token | Không | Không | 0 |
| 4. Mint cert | Tạo NFT | Confirm | Có | Có |
| 5. View cert | Hiển thị | Không | Đọc | 0 |

---

## 📞 Hỗ trợ

- Signature verify: Xem `recoverSigner()` trong WarrantyNFT.sol
- JWT token: Xem `generateToken()` trong backend.js
- Event: Xem `CertificateMinted` event
- Test Etherscan: https://sepolia.etherscan.io/
