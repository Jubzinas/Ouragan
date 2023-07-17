/**
 *   .g8""8q. `7MMF'   `7MF'`7MM"""Mq.        db       .g8"""bgd       db      `7MN.   `7MF'
 * .dP'    `YM. MM       M    MM   `MM.      ;MM:    .dP'     `M      ;MM:       MMN.    M  
 * dM'      `MM MM       M    MM   ,M9      ,V^MM.   dM'       `     ,V^MM.      M YMb   M  
 * MM        MM MM       M    MMmmdM9      ,M  `MM   MM             ,M  `MM      M  `MN. M  
 * MM.      ,MP MM       M    MM  YM.      AbmmmqMA  MM.    `7MMF'  AbmmmqMA     M   `MM.M  
 * `Mb.    ,dP' YM.     ,M    MM   `Mb.   A'     VML `Mb.     MM   A'     VML    M     YMM  
 *   `"bmmd"'    `bmmmmd"'  .JMML. .JMM..AMA.   .AMMA. `"bmmmdPY .AMA.   .AMMA..JML.    YM
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./ETHTornado.sol";

interface IOuraganVerifier {
    function verifyProof(uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[6] memory input)
        external view returns(bool);
}

contract Ouragan {
    
    ETHTornado public tornado;
    address public depositor;
    uint256 public depositPrice;
    uint256 public depositAmount;
    uint256[] public depositorPubkey;
    uint256[] public withdrawerPubkey;
    uint256[] public encryptedCommitment;
    uint256 public nonce;

    IOuraganVerifier verifier;

    constructor(
        IOuraganVerifier _verifier,
        address _tornado
    ) {
        verifier = _verifier;
        tornado = ETHTornado(_tornado);
    }

    function ask(uint256 _depositAmount, uint256 _depositPrice, uint256[2] memory _depositorPubkey) public {
        require(_depositPrice <= _depositAmount, "Ouragan: deposit price must be less or equal to deposit amount");
        depositorPubkey = _depositorPubkey;
    }

    function order(uint256[] memory _encryptedCommitment, uint256[] memory _withdrawerPubkey, uint256 _nonce) public payable {
        require(msg.value == depositPrice, "Ouragan: invalid deposit price");
        encryptedCommitment = _encryptedCommitment;
        withdrawerPubkey = _withdrawerPubkey;
        nonce = _nonce;
    }

    function fill(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[6] memory publicSignals
    ) public {
        bytes32 _root = bytes32(publicSignals[0]);
        uint256 _nonce = uint256(publicSignals[5]);

        require(isKnownRoot(_root), "Tornado: invalid root");
        require(publicSignals[1] == encryptedCommitment[0], "Ouragan: invalid encrypted commitment");
        require(publicSignals[2] == encryptedCommitment[1], "Ouragan: invalid encrypted commitment");
        require(publicSignals[3] == encryptedCommitment[2], "Ouragan: invalid encrypted commitment");
        require(publicSignals[4] == encryptedCommitment[3], "Ouragan: invalid encrypted commitment");
        require(_nonce == nonce, "Ouragan: invalid nonce");
        
        require(
            verifier.verifyProof(a, b, c, publicSignals),
            "Ouragan: invalid proof"
        );

        payable(msg.sender).transfer(depositPrice);
    }

    function isKnownRoot(bytes32 _root) public view returns (bool) {
        return tornado.isKnownRoot(_root);
    }

}
