// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Hệ Thống Quản Lý và Xác Thực Chứng Nhận Bảo Hành Điện Tử
contract WarrantyCertificateRegistry {
    address public admin;

    struct WarrantyCertificate {
        string productName;
        string warrantyDescription;
        uint256 issueDate;
        bool isValid;
    }

    mapping(bytes32 => WarrantyCertificate) public warrantyCertificates;

    constructor() {
        admin = msg.sender;
    }

    // Hàm cấp chứng nhận bảo hành
    function issueCertificate(string memory _id, string memory _name, string memory _course) public {
        require(msg.sender == admin, "Only admin can issue");
        bytes32 certHash = keccak256(abi.encodePacked(_id));
        warrantyCertificates[certHash] = WarrantyCertificate(_name, _course, block.timestamp, true);
    }

    // Hàm xác thực chứng nhận bảo hành
    function verifyCertificate(string memory _id) public view returns (string memory, string memory, uint256, bool) {
        bytes32 certHash = keccak256(abi.encodePacked(_id));
        WarrantyCertificate memory cert = warrantyCertificates[certHash];
        return (cert.productName, cert.warrantyDescription, cert.issueDate, cert.isValid);
    }
}