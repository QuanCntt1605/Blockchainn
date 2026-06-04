# 📡 API REFERENCE - Backend REST Endpoints

## 🌐 Base URL
```
http://localhost:3000
```

---

## 1️⃣ Health Check (Public)

### Endpoint
```
GET /api/health
```

### Description
Kiểm tra server đang chạy và contract address

### Request
```bash
curl http://localhost:3000/api/health
```

### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "contractAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

---

## 2️⃣ Verify Signature

### Endpoint
```
POST /api/verify-signature
```

### Description
Verify signature từ user ký message, tạo JWT token

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
  "messageHash": "0xabcd1234567890abcdef1234567890abcdef1234",
  "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12"
}
```

### Request Example (JavaScript)
```javascript
const response = await fetch('http://localhost:3000/api/verify-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        address: currentAddress,
        messageHash: currentMessageHash,
        signature: currentSignature
    })
});

const result = await response.json();
console.log(result.token); // JWT token
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Signature verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHg3NDJkMzVjYzY2MzRjMDUzMjkyNWEzYjg0NGJjOWU3NTk1ZjEyMzQ1NiIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MTUzNjAwfQ.abcd1234567890"
}
```

### Response (400 Bad Request)
```json
{
  "message": "Signature does not match address"
}
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | ✓ Signature verified successfully |
| 400 | ✗ Invalid signature or missing fields |
| 500 | ✗ Server error |

---

## 3️⃣ Mint Certificate

### Endpoint
```
POST /api/mint-certificate
```

### Description
Cấp chứng chỉ bảo hành mới (yêu cầu xác thực)

### Authentication
```
Authorization: Bearer {token}
```
Token được lấy từ endpoint `/api/verify-signature`

### Headers
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Body
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
  "productName": "iPhone 15 Pro",
  "productSN": "A1B2C3D4E5F6",
  "warrantyMonths": 12,
  "description": "Bảo hành 12 tháng từ ngày mua"
}
```

### Request Example (JavaScript)
```javascript
const response = await fetch('http://localhost:3000/api/mint-certificate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
        address: currentAddress,
        productName: 'iPhone 15 Pro',
        productSN: 'A1B2C3D4E5F6',
        warrantyMonths: 12,
        description: 'Bảo hành 12 tháng từ ngày mua'
    })
});

const result = await response.json();
console.log(result.transactionHash);  // TX hash
console.log(result.certificateId);    // Certificate ID
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Certificate minted successfully",
  "certificateId": "1",
  "transactionHash": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e",
  "blockNumber": 5234567
}
```

### Response (401 Unauthorized)
```json
{
  "message": "Invalid or expired token"
}
```

### Response (400 Bad Request)
```json
{
  "message": "Missing required fields"
}
```

### Response (500 Server Error)
```json
{
  "message": "Error minting certificate: ..."
}
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | ✓ Certificate minted successfully |
| 400 | ✗ Missing fields or invalid data |
| 401 | ✗ Unauthorized (invalid token) |
| 500 | ✗ Server error (contract error) |

### Notes
- Yêu cầu token hợp lệ từ `/api/verify-signature`
- Gas sẽ được tiêu thụ trên blockchain
- Transaction mất 1-2 phút để confirm
- Signature chỉ có thể dùng 1 lần (prevent replay)

---

## 4️⃣ Get User Certificates

### Endpoint
```
GET /api/certificates/{address}
```

### Description
Lấy danh sách tất cả chứng chỉ của user (yêu cầu xác thực)

### Authentication
```
Authorization: Bearer {token}
```

### URL Parameters
```
address: 0x742d35Cc6634C0532925a3b844Bc9e7595f123456
```

### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Example (JavaScript)
```javascript
const response = await fetch(
    `http://localhost:3000/api/certificates/${currentAddress}`,
    {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    }
);

const result = await response.json();
console.log(result.certificates); // Array of certificates
```

### Response (200 OK)
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
  "total": 2,
  "certificates": [
    {
      "id": "1",
      "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
      "productName": "iPhone 15 Pro",
      "productSN": "A1B2C3D4E5F6",
      "issueDate": "1704067200",
      "warrantyEndDate": "1735689600",
      "description": "Bảo hành 12 tháng từ ngày mua",
      "isValid": true,
      "isExpired": false
    },
    {
      "id": "2",
      "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
      "productName": "AirPods Pro",
      "productSN": "B2C3D4E5F6A7",
      "issueDate": "1704153600",
      "warrantyEndDate": "1735776000",
      "description": "Bảo hành 1 năm",
      "isValid": true,
      "isExpired": false
    }
  ]
}
```

### Response (403 Forbidden)
```json
{
  "message": "Unauthorized"
}
```

### Response (401 Unauthorized)
```json
{
  "message": "Invalid or expired token"
}
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | ✓ Certificates retrieved successfully |
| 401 | ✗ Unauthorized (invalid token) |
| 403 | ✗ Forbidden (trying to view other's certs) |
| 500 | ✗ Server error |

### Notes
- User chỉ có thể xem chứng chỉ của chính mình
- Nếu cố gắng xem chứng chỉ của user khác sẽ bị 403
- Data được lấy trực tiếp từ smart contract

---

## 5️⃣ Verify Certificate (Public)

### Endpoint
```
GET /api/verify-certificate/{certificateId}
```

### Description
Verify chứng chỉ (công khai, không cần authentication)

### URL Parameters
```
certificateId: 1
```

### Request Example (JavaScript)
```javascript
const response = await fetch(
    'http://localhost:3000/api/verify-certificate/1'
);

const result = await response.json();
console.log(result);
```

### Response (200 OK)
```json
{
  "success": true,
  "certificateId": "1",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
  "productName": "iPhone 15 Pro",
  "productSN": "A1B2C3D4E5F6",
  "issueDate": "2024-01-01T00:00:00.000Z",
  "warrantyEndDate": "2025-01-01T00:00:00.000Z",
  "description": "Bảo hành 12 tháng từ ngày mua",
  "isValid": true,
  "isExpired": false
}
```

### Response (500 Server Error)
```json
{
  "message": "Certificate does not exist"
}
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | ✓ Certificate found and valid |
| 500 | ✗ Certificate not found |

### Notes
- Endpoint này **PUBLIC**, không cần token
- Ai cũng có thể verify chứng chỉ
- Dùng để kiểm tra chứng chỉ trên website
- ID chứng chỉ trả về từ API mint-certificate

---

## 🔐 Authentication

### JWT Token Format
```
Header.Payload.Signature
```

### Token Payload
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
  "iat": 1704067200,
  "exp": 1704153600
}
```

### Token Lifetime
- **Expire after**: 24 hours (86400 seconds)
- **Can refresh**: No (cần re-verify signature)

### How to use
```javascript
const authHeader = `Bearer ${token}`;

fetch(url, {
    headers: {
        'Authorization': authHeader
    }
});
```

---

## 📊 Error Codes

| Code | Message | Giải pháp |
|------|---------|----------|
| 400 | Missing required fields | Kiểm tra request body |
| 400 | Signature does not match address | Ký lại message |
| 400 | Invalid signature length | Signature format sai |
| 401 | Missing authorization header | Thêm token vào header |
| 401 | Invalid or expired token | Verify signature lại |
| 403 | Unauthorized | Cố gắng xem chứng chỉ của user khác |
| 500 | Internal server error | Kiểm tra backend logs |

---

## 🛠️ Development Tools

### cURL Examples

```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. Verify signature
curl -X POST http://localhost:3000/api/verify-signature \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
    "messageHash": "0xabcd1234...",
    "signature": "0x1234567..."
  }'

# 3. Mint certificate
curl -X POST http://localhost:3000/api/mint-certificate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
    "productName": "iPhone 15 Pro",
    "productSN": "A1B2C3D4E5F6",
    "warrantyMonths": 12,
    "description": "Bảo hành 12 tháng"
  }'

# 4. Get certificates
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/certificates/0x742d35Cc6634C0532925a3b844Bc9e7595f123456

# 5. Verify certificate
curl http://localhost:3000/api/verify-certificate/1
```

### Postman Collection
[Tạo file `warranty-api.postman_collection.json`]

```json
{
  "info": {
    "name": "Warranty Certificate API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "Verify Signature",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/verify-signature",
        "body": {
          "mode": "raw",
          "raw": "{\"address\": \"\", \"messageHash\": \"\", \"signature\": \"\"}"
        }
      }
    }
  ]
}
```

---

## 🎯 Quy trình API Call

```
┌─────────────────────────────────┐
│  User đăng ký/đăng nhập         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  POST /api/verify-signature     │
│  Input: address, messageHash    │
│  Output: token                  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  POST /api/mint-certificate     │
│  Input: token, product info     │
│  Output: certificateId, txHash  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  GET /api/certificates/{address}│
│  Input: address, token          │
│  Output: list of certificates   │
└─────────────────────────────────┘
```

---

## 📝 Notes

- Tất cả request/response là JSON
- Timestamps tính bằng Unix epoch (seconds)
- Addresses phải là Ethereum addresses (0x...)
- Token hết hạn sau 24 giờ
- Signature chỉ dùng được 1 lần
- Gas fee tính động based on network conditions

---

**API Version**: 1.0.0  
**Last Updated**: 2024-01-01  
**Status**: Production Ready
