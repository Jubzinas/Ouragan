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

contract Ouragan {
    
    ETHTornado tornado;
    address public depositor;
    uint256 public depositPrice;
    uint256 public depositAmount;
    uint256[] public depositorPubkey;
    uint256[] public withdrawerPubkey;
    uint256[] public encryptedCommitment;
    uint256 public sharedKeyHash;
    uint256 public nonce;

    constructor(address _tornado) {
        tornado = ETHTornado(_tornado);
    }

    function ask(uint256 _depositAmount, uint256 _depositPrice, uint256[] memory _depositorPubkey) public {
        require(_depositPrice <= _depositAmount, "Ouragan: deposit price must be less or equal to deposit amount");
        depositorPubkey = _depositorPubkey;
    }

    function order(uint256[] memory _encryptedCommitment, uint256 _sharedKeyHash, uint256[] memory _withdrawerPubkey, uint256 _nonce) public payable {
        require(msg.value == depositPrice, "Ouragan: invalid deposit price");
        encryptedCommitment = _encryptedCommitment;
        withdrawerPubkey = _withdrawerPubkey;
        sharedKeyHash = _sharedKeyHash;
        nonce = _nonce;
    }

    function fill(uint256[] memory proof, uint256[] memory publicSignals) public {
        bytes32 _root = bytes32(publicSignals[1]);
        uint256 _nonce = uint256(publicSignals[2]);
        
        require(isKnownRoot(_root), "Tornado: invalid root");
        require(_nonce == nonce, "Ouragan: invalid nonce");
        
        // check that the encrypted commitment is correct

        require(true, "Ouragan: invalid proof");
        payable(msg.sender).transfer(depositPrice);
    }

    function isKnownRoot(bytes32 _root) public view returns (bool) {
        return tornado.isKnownRoot(_root);
    }
}
