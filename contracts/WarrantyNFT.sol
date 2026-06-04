// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title WarrantyNFT
 * @dev Hệ thống cấp chứng chỉ bảo hành dưới dạng NFT
 * 
 * Quy trình:
 * 1. User ký message trên frontend (không mất gas)
 * 2. Backend verify signature
 * 3. Admin gọi mintCertificate với signature đã verify
 */

contract WarrantyNFT {
    // ============ EVENTS ============
    event CertificateMinted(
        address indexed recipient,
        uint256 indexed certificateId,
        string productName,
        uint256 warrantyEndDate
    );

    event SignatureVerified(
        address indexed user,
        bytes32 messageHash
    );

    // ============ STRUCTS ============
    struct Certificate {
        address owner;
        string productName;
        string productSN;
        uint256 issueDate;
        uint256 warrantyEndDate;
        string description;
        bool isValid;
    }

    // ============ STATE VARIABLES ============
    address public admin;
    uint256 private certificateCounter;

    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public userCertificates;
    mapping(bytes32 => bool) public usedSignatures; // Prevent replay attacks

    // ============ MODIFIERS ============
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // ============ CONSTRUCTOR ============
    constructor() {
        admin = msg.sender;
        certificateCounter = 0;
    }

    // ============ MESSAGE SIGNING & VERIFICATION ============
    /**
     * @dev Flexible message signing verification with nonce support
     * Frontend signs: "Verify ownership of 0x{address} nonce: {timestamp}"
     * This function recreates the EXACT hash that ethers.signMessage() would create
     * 
     * The message length varies based on nonce:
     * "Verify ownership of 0x393dd823e009744c4083e5e0bf75496e59aebcbf nonce: 1717411234567" (88 bytes)
     */
    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature,
        string memory originalMessage
    ) public pure returns (address) {
        // Calculate the actual length of the original message
        uint256 messageLength = bytes(originalMessage).length;
        
        // Recreate what ethers.js signMessage() creates:
        // keccak256("\x19Ethereum Signed Message:\n" + length_string + message)
        bytes memory lengthStr = _uintToString(messageLength);
        
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                lengthStr,
                originalMessage
            )
        );
        return recoverSignerFromEthSignedMessage(ethSignedMessageHash, signature);
    }
    
    /**
     * @dev Convert uint to string for message length
     */
    function _uintToString(uint256 value) internal pure returns (bytes memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits = 0;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        
        return buffer;
    }

    function getEthSignedMessageHash(
        bytes32 messageHash
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    messageHash
                )
            );
    }

    function recoverSignerFromEthSignedMessage(
        bytes32 ethSignedMessageHash,
        bytes memory signature
    ) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature v");
    }

    // ============ HELPER FUNCTIONS ============
    /**
     * @dev Construct the original message that was signed on the frontend
     * Format: "Verify ownership of 0x{lowercase address}"
     */
    function _constructMessage(address recipient) internal pure returns (string memory) {
        string memory addrStr = _addressToLowercaseString(recipient);
        return string(abi.encodePacked("Verify ownership of ", addrStr));
    }

    /**
     * @dev Convert address to lowercase hex string with 0x prefix
     */
    function _addressToLowercaseString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(42);
        buffer[0] = '0';
        buffer[1] = 'x';
        
        bytes20 addrBytes = bytes20(addr);
        bytes16 hexChars = "0123456789abcdef";
        
        for (uint i = 0; i < 20; i++) {
            buffer[2 + i * 2] = hexChars[uint8(addrBytes[i]) >> 4];
            buffer[3 + i * 2] = hexChars[uint8(addrBytes[i]) & 0x0f];
        }
        
        return string(buffer);
    }

    // ============ CERTIFICATE MINTING ============
    /**
     * @dev Admin gọi hàm này để cấp chứng chỉ sau khi verify signature
     * @param recipient Địa chỉ nhận chứng chỉ
     * @param messageHash Hash của message đã ký (keccak256("Verify ownership of 0x... nonce: ..."))
     * @param signature Chữ ký từ MetaMask
     * @param originalMessage Message đầy đủ có nonce (để verify signature)
     * @param productName Tên sản phẩm
     * @param productSN Serial number sản phẩm
     * @param warrantyMonths Thời gian bảo hành (tính bằng tháng)
     * @param description Mô tả chi tiết
     */
    function mintCertificate(
        address recipient,
        bytes32 messageHash,
        bytes memory signature,
        string memory originalMessage,
        string memory productName,
        string memory productSN,
        uint256 warrantyMonths,
        string memory description
    ) public onlyAdmin returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(warrantyMonths > 0, "Warranty period must be greater than 0");

        // Verify signature để đảm bảo recipient đã ký xác nhận
        // Use the originalMessage passed from backend (which includes nonce)
        address signer = recoverSigner(messageHash, signature, originalMessage);
        require(signer == recipient, "Signature does not match recipient");

        // Prevent replay attack
        require(!usedSignatures[messageHash], "Signature already used");

        // Mark signature as used
        usedSignatures[messageHash] = true;

        // Tạo chứng chỉ mới
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

        // Ghi lại chứng chỉ cho user
        userCertificates[recipient].push(certificateId);

        // Phát event
        emit CertificateMinted(
            recipient,
            certificateId,
            productName,
            warrantyEndDate
        );

        return certificateId;
    }

    // ============ CERTIFICATE VERIFICATION ============
    /**
     * @dev Kiểm tra chứng chỉ
     */
    function verifyCertificate(
        uint256 certificateId
    )
        public
        view
        returns (
            address owner,
            string memory productName,
            string memory productSN,
            uint256 issueDate,
            uint256 warrantyEndDate,
            string memory description,
            bool isValid,
            bool isExpired
        )
    {
        Certificate memory cert = certificates[certificateId];
        require(cert.owner != address(0), "Certificate does not exist");

        return (
            cert.owner,
            cert.productName,
            cert.productSN,
            cert.issueDate,
            cert.warrantyEndDate,
            cert.description,
            cert.isValid,
            block.timestamp > cert.warrantyEndDate
        );
    }

    /**
     * @dev Lấy danh sách chứng chỉ của user
     */
    function getUserCertificates(address user)
        public
        view
        returns (uint256[] memory)
    {
        return userCertificates[user];
    }

    /**
     * @dev Kiểm tra chứng chỉ còn hiệu lực không
     */
    function isCertificateValid(uint256 certificateId)
        public
        view
        returns (bool)
    {
        Certificate memory cert = certificates[certificateId];
        return (cert.isValid && block.timestamp <= cert.warrantyEndDate);
    }

    // ============ ADMIN FUNCTIONS ============
    /**
     * @dev Admin hủy bỏ chứng chỉ nếu cần thiết
     */
    function revokeCertificate(uint256 certificateId) public onlyAdmin {
        require(
            certificates[certificateId].owner != address(0),
            "Certificate does not exist"
        );
        certificates[certificateId].isValid = false;
    }

    /**
     * @dev Thay đổi admin
     */
    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}
