/**
 * BACKEND NODEJS - WARRANTY CERTIFICATE SYSTEM
 * 
 * Chạy lệnh:
 * npm install express cors ethers dotenv
 * node backend.js
 * 
 * Server sẽ chạy tại http://localhost:3000
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ============ CONFIGURATION ============
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============ ENVIRONMENT VARIABLES ============
const PRIVATE_KEY_ENV = process.env.ADMIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02960247590bf87"; // Admin private key
const RPC_URL = process.env.RPC_URL || "http://localhost:8545"; // RPC endpoint
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // WarrantyNFT contract address (deployed)

// Hardhat Account #0 (Deployer - Admin) - CORRECT KEY
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// JWT secret (dùng để tạo token)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// ============ ETHERS SETUP ============
const provider = new ethers.JsonRpcProvider(RPC_URL);
const adminSigner = new ethers.Wallet(PRIVATE_KEY, provider);

// Load contract ABI
const contractABI = [
    "function mintCertificate(address recipient, bytes32 messageHash, bytes memory signature, string memory originalMessage, string memory productName, string memory productSN, uint256 warrantyMonths, string memory description) public returns (uint256)",
    "function verifyCertificate(uint256 certificateId) public view returns (address owner, string memory productName, string memory productSN, uint256 issueDate, uint256 warrantyEndDate, string memory description, bool isValid, bool isExpired)",
    "function getUserCertificates(address user) public view returns (uint256[] memory)",
    "function isCertificateValid(uint256 certificateId) public view returns (bool)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, adminSigner);

// ============ IN-MEMORY STORAGE (Thay bằng database trong production) ============
const verifiedSignatures = new Map(); // { messageHash => { address, timestamp } }
const users = new Map(); // { address => { token, verifiedAt } }

// ============ HELPER FUNCTIONS ============

/**
 * Verify signature từ frontend
 */
function verifySigner(messageHash, signature, expectedAddress) {
    try {
        // Tái tạo message hash
        const message = `Verify ownership of ${expectedAddress} at ...`;
        const ethSignedMessageHash = ethers.hashMessage(ethers.toBeHex(messageHash));
        
        // Recover signer từ signature
        const recoveredAddress = ethers.recoverAddress(ethSignedMessageHash, signature);
        
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error("Error verifying signature:", error);
        return false;
    }
}

/**
 * Tạo JWT token
 */
function generateToken(address) {
    // Simplified JWT (trong production dùng thư viện jsonwebtoken)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ 
        address: address.toLowerCase(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    })).toString('base64');
    
    const signature = require('crypto')
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64');
    
    return `${header}.${payload}.${signature}`;
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const [header, payload, signature] = parts;
        
        // Verify signature
        const expectedSig = require('crypto')
            .createHmac('sha256', JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest('base64');
        
        if (signature !== expectedSig) return null;
        
        // Decode payload
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        
        // Check expiration
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        
        return decoded.address;
    } catch (error) {
        return null;
    }
}

/**
 * Middleware để verify token
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Missing authorization header" });
    }
    
    const token = authHeader.split(' ')[1];
    const address = verifyToken(token);
    
    if (!address) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    req.user = { address };
    next();
}

// ============ API ROUTES ============

/**
 * API 1: Verify Signature
 * POST /api/verify-signature
 * Body: { address, messageHash, signature }
 * Response: { token }
 */
app.post('/api/verify-signature', async (req, res) => {
    try {
        const { address, messageHash, signature } = req.body;

        if (!address || !signature) {
            return res.status(400).json({ message: "Missing required fields: address, signature" });
        }

        // Normalize address to lowercase for consistent message
        const normalizedAddress = address.toLowerCase();

        console.log("🔐 Verifying signature...");
        console.log("  Address:", normalizedAddress);
        console.log("  Signature:", signature.substring(0, 20) + "...");

        // Reconstruct message (must match frontend exactly!)
        const messageToSign = `Verify ownership of ${normalizedAddress}`;
        
        // Use ethers.verifyMessage() to properly recover address
        // This handles EIP-191 message format automatically
        let recoveredAddress;
        try {
            recoveredAddress = ethers.verifyMessage(messageToSign, signature);
        } catch (error) {
            console.error("❌ Signature recovery failed:", error.message);
            return res.status(400).json({ message: "Invalid signature format" });
        }

        console.log("✓ Recovered address:", recoveredAddress);
        console.log("  Expected address: ", normalizedAddress);

        if (recoveredAddress.toLowerCase() !== normalizedAddress.toLowerCase()) {
            console.warn("⚠️ Address mismatch!");
            return res.status(400).json({ message: "Signature does not match address" });
        }

        console.log("✓ Signature verified!");

        // Lưu signature đã verify
        verifiedSignatures.set(messageHash || signature, {
            address: normalizedAddress,
            timestamp: Date.now(),
            signature: signature
        });

        // Tạo JWT token
        const token = generateToken(normalizedAddress);
        users.set(normalizedAddress, {
            token,
            verifiedAt: new Date(),
            signature: signature,
            messageHash: messageHash
        });

        console.log("✓ JWT token generated for:", normalizedAddress);
        
        res.json({ 
            success: true,
            message: "Signature verified successfully",
            token: token 
        });
    } catch (error) {
        console.error("❌ Error verifying signature:", error.message);
        res.status(500).json({ message: error.message });
    }
});

/**
 * API 2: Mint Certificate
 * POST /api/mint-certificate
 * Headers: Authorization: Bearer {token}
 * Body: { productName, productSN, warrantyMonths, description, address }
 * Response: { certificateId, transactionHash }
 */
app.post('/api/mint-certificate', authMiddleware, async (req, res) => {
    try {
        const { productName, productSN, warrantyMonths, description, signature, messageHash, originalMessage } = req.body;
        const recipientAddress = req.user.address;

        if (!productName || !productSN || !warrantyMonths || !description || !signature || !messageHash || !originalMessage) {
            return res.status(400).json({ message: "Missing required fields. Need: productName, productSN, warrantyMonths, description, signature, messageHash, originalMessage" });
        }

        console.log(`\nMinting certificate for ${recipientAddress}`);
        console.log(`Product: ${productName}, S/N: ${productSN}, Warranty: ${warrantyMonths} months`);

        const normalizedAddress = recipientAddress.toLowerCase();

        console.log(`  - Signature: ${signature.substring(0, 20)}...`);
        console.log(`  - Message hash: ${messageHash}`);
        console.log(`  - Original message: "${originalMessage}"`);

        // Verify signature format
        try {
            if (!messageHash.startsWith('0x') || messageHash.length !== 66) {
                return res.status(400).json({ message: "Invalid message hash format" });
            }
            if (!signature.startsWith('0x') || signature.length !== 132) {
                return res.status(400).json({ message: "Invalid signature format" });
            }
            console.log(`  ✓ Signature format verified`);
        } catch (verifyError) {
            console.error("  ❌ Signature verification error:", verifyError.message);
            return res.status(400).json({ message: "Invalid signature format" });
        }

        // Convert warrantyMonths to number if string
        const warrantyMonthsNum = parseInt(warrantyMonths, 10);
        if (isNaN(warrantyMonthsNum)) {
            return res.status(400).json({ message: "Invalid warranty months" });
        }

        // Chuẩn bị tham số gọi contract
        console.log(`  📦 Calling contract.mintCertificate()...`);
        const result = await contract.mintCertificate(
            normalizedAddress,
            messageHash,
            signature,
            originalMessage,  // ← THÊM ORIGINAL MESSAGE VỚI NONCE
            productName,
            productSN,
            warrantyMonthsNum,
            description
        );

        console.log(`✓ Transaction sent: ${result.hash}`);
        console.log(`⏳ Waiting for confirmation...`);

        // Chờ transaction được confirm
        const receipt = await result.wait();

        console.log(`✓ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`  📋 Total logs: ${receipt.logs.length}`);

        // Parse event để lấy certificateId
        let certificateId = 'unknown';
        let foundEvent = null;

        for (const log of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog(log);
                console.log(`  📝 Event found: ${parsed.name}`);
                
                if (parsed.name === 'CertificateMinted') {
                    foundEvent = parsed;
                    // Extract certificateId (second parameter: recipient, certificateId, productName, warrantyEndDate)
                    const certId = parsed.args[1];
                    certificateId = typeof certId === 'bigint' ? certId.toString() : String(certId);
                    console.log(`  ✓ Certificate ID extracted: ${certificateId}`);
                    break;
                }
            } catch (parseError) {
                // Log parsing attempts
            }
        }

        if (foundEvent) {
            console.log(`✅ Certificate #${certificateId} minted successfully!\n`);
        } else {
            console.log(`⚠️  Event CertificateMinted not found in logs, but TX confirmed. Certificate ID: ${certificateId}\n`);
        }

        res.json({
            success: true,
            message: "Certificate minted successfully",
            certificateId: certificateId,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        console.error("❌ Error minting certificate:", error.message);
        res.status(500).json({ message: error.message });
    }
});

/**
 * API 3: Get User Certificates
 * GET /api/certificates/{address}
 * Headers: Authorization: Bearer {token}
 */
app.get('/api/certificates/:address', authMiddleware, async (req, res) => {
    try {
        const address = req.params.address;

        // Verify user can only view their own certificates
        if (address.toLowerCase() !== req.user.address.toLowerCase()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        console.log(`Fetching certificates for ${address}`);

        // Lấy danh sách ID chứng chỉ
        const certificateIds = await contract.getUserCertificates(address);

        console.log(`Found ${certificateIds.length} certificates`);

        // Lấy thông tin từng chứng chỉ
        const certificates = [];
        for (const certId of certificateIds) {
            try {
                const certData = await contract.verifyCertificate(certId);
                certificates.push({
                    id: certId.toString(),
                    owner: certData.owner,
                    productName: certData.productName,
                    productSN: certData.productSN,
                    issueDate: new Date(Number(certData.issueDate) * 1000).toISOString(),
                    warrantyEndDate: new Date(Number(certData.warrantyEndDate) * 1000).toISOString(),
                    description: certData.description,
                    isValid: certData.isValid,
                    isExpired: certData.isExpired
                });
            } catch (error) {
                console.error(`Error fetching certificate ${certId}:`, error);
            }
        }

        res.json({
            success: true,
            address: address,
            certificates: certificates,
            total: certificates.length
        });
    } catch (error) {
        console.error("Error fetching certificates:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * API 4: Verify Certificate (Public)
 * GET /api/verify-certificate/{certificateId}
 */
app.get('/api/verify-certificate/:certificateId', async (req, res) => {
    try {
        const { certificateId } = req.params;

        console.log(`Verifying certificate ${certificateId}`);

        const certData = await contract.verifyCertificate(certificateId);
        const isValid = await contract.isCertificateValid(certificateId);

        res.json({
            success: true,
            certificateId: certificateId,
            owner: certData.owner,
            productName: certData.productName,
            productSN: certData.productSN,
            issueDate: new Date(Number(certData.issueDate) * 1000).toISOString(),
            warrantyEndDate: new Date(Number(certData.warrantyEndDate) * 1000).toISOString(),
            description: certData.description,
            isValid: isValid,
            isExpired: certData.isExpired
        });
    } catch (error) {
        console.error("Error verifying certificate:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * API 5: Health Check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        contractAddress: CONTRACT_ADDRESS
    });
});

/**
 * API: Generate Nonce for Minting
 * GET /api/get-nonce
 * Response: { nonce } - Use this nonce in your signing message
 * 
 * Usage:
 * 1. Get nonce from this endpoint
 * 2. Sign message: "Verify ownership of 0x{address} nonce: {nonce}"
 * 3. Use signature + messageHash in mint-certificate request
 */
app.get('/api/get-nonce', (req, res) => {
    const nonce = Date.now().toString();
    res.json({
        nonce: nonce,
        instruction: `Sign this message: "Verify ownership of 0x{yourAddress} nonce: ${nonce}"`
    });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`\n════════════════════════════════════════════`);
    console.log(`🚀 WARRANTY CERTIFICATE BACKEND`);
    console.log(`════════════════════════════════════════════`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin wallet: ${adminSigner.address}`);
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`RPC: ${RPC_URL}`);
    console.log(`════════════════════════════════════════════\n`);
});

module.exports = app;
