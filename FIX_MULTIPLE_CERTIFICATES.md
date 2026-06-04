# Fix: Multiple Certificate Minting Issues

## Problems Identified

### 1. **BigInt Type Error** ❌
**Error**: `TypeError: Cannot mix BigInt and other types, use explicit conversions`

**Root Cause**: ethers.js returns `uint256` values as BigInt, but we were directly multiplying them:
```javascript
new Date(certData.issueDate * 1000)  // ❌ BigInt * Number = Error
```

**Fix**: Convert BigInt to Number explicitly:
```javascript
new Date(Number(certData.issueDate) * 1000)  // ✅ Correct
```

### 2. **Signature Replay Attack** ❌
**Error**: `Execution reverted: "Signature already used"`

**Root Cause**: 
- Each signature can only be used ONCE on-chain (to prevent replay attacks)
- The backend was reusing the same signature for multiple mints
- The signature message was static: `"Verify ownership of 0x{address}"`
- After first successful mint, the signature was deleted from backend storage

**Why This Matters**:
- User signs once: `"Verify ownership of 0x..."`
- First mint ✅ works, signature marked as used on-chain
- Second mint ❌ fails because trying to reuse same signature

**Fix**: Each mint requires a **UNIQUE** signature with a different nonce:
1. Get nonce from `/api/get-nonce` endpoint
2. Sign unique message: `"Verify ownership of 0x{address} nonce: {timestamp}"`
3. Each signature is different = no replay attack

### 3. **Certificate ID Parsing** ❌
**Issue**: Certificate ID shown as "unknown" after minting

**Root Cause**: Event argument not accessed correctly
```javascript
event.args.certificateId.toString()  // ❌ Incorrect
```

**Fix**: Access by index:
```javascript
event.args[1].toString()  // ✅ Correct (index 1 is certificateId in CertificateMinted event)
```

---

## How to Mint Multiple Certificates (Updated Flow)

### Frontend Workflow

```javascript
// Step 1: Get a nonce
const nonceRes = await fetch('http://localhost:3000/api/get-nonce');
const { nonce } = await nonceRes.json();

// Step 2: Create unique message with nonce
const message = `Verify ownership of ${userAddress} nonce: ${nonce}`;

// Step 3: Sign the message with MetaMask
const signature = await provider.getSigner().signMessage(message);

// Step 4: Calculate messageHash
const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));

// Step 5: Send to backend with signature + messageHash
const mintRes = await fetch('http://localhost:3000/api/mint-certificate', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        productName: 'Điện thoại iPhone 11',
        productSN: 'IPHONE',
        warrantyMonths: 12,
        description: 'Description',
        signature: signature,           // ← NEW: Send signature
        messageHash: messageHash        // ← NEW: Send messageHash
    })
});
```

### Backend Changes

1. **Removed**: No longer stores one signature per user
2. **Changed**: Accept signature + messageHash in request body
3. **Added**: `/api/get-nonce` endpoint to generate unique nonces
4. **Fixed**: BigInt conversion in date calculations

### API Endpoints

#### 1. Get Nonce
```
GET /api/get-nonce
Response: { nonce, instruction }
```

#### 2. Verify Signature (No longer needed for minting)
```
POST /api/verify-signature
Body: { address, signature, messageHash }
Response: { success, message, token }
```

#### 3. Mint Certificate (Updated)
```
POST /api/mint-certificate
Headers: Authorization: Bearer {token}
Body: {
    productName: string,
    productSN: string,
    warrantyMonths: number,
    description: string,
    signature: string,        ← NEW
    messageHash: string       ← NEW
}
Response: { success, certificateId, transactionHash }
```

#### 4. Get User Certificates
```
GET /api/certificates/{address}
Headers: Authorization: Bearer {token}
```

#### 5. Verify Certificate
```
GET /api/verify-certificate/{certificateId}
```

---

## Testing the Fix

### Terminal Test
```bash
# 1. Get nonce
curl http://localhost:3000/api/get-nonce

# 2. Sign message with MetaMask (in frontend)
# Message: "Verify ownership of 0x393dd823e009744c4083e5e0bf75496e59aebcbf nonce: 1717411234567"

# 3. Mint first certificate
curl -X POST http://localhost:3000/api/mint-certificate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "iPhone 11",
    "productSN": "IPHONE",
    "warrantyMonths": 12,
    "description": "Test",
    "signature": "0x...",
    "messageHash": "0x..."
  }'

# 4. Get new nonce
curl http://localhost:3000/api/get-nonce

# 5. Sign with NEW nonce

# 6. Mint second certificate ✅ NOW WORKS!
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `backend.js` | • Fixed BigInt → Number conversion<br>• Fixed event.args access for certificateId<br>• Updated mint endpoint to accept signature from request body<br>• Removed signature deletion after mint<br>• Added `/api/get-nonce` endpoint |
| `WarrantyNFT.sol` | No changes needed (replay protection already in place) |

---

## Why This Is More Secure

✅ **Prevents Replay Attacks**: Each mint uses unique signature (different nonce)
✅ **Smart Contract Protected**: `usedSignatures` mapping prevents on-chain reuse
✅ **No Signature Storage**: Backend doesn't store signatures (they come from request)
✅ **Stateless Minting**: Each mint is independent, no shared state

---

## Next Steps

1. ✅ Update frontend to use new nonce-based flow
2. ✅ Test minting multiple certificates
3. ✅ Verify certificates are retrievable and valid
4. ✅ Deploy to production with updated flow

