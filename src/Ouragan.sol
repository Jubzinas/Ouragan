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
    address depositor;
    uint256 depositPrice;
    uint256 depositAmount;
    uint256[] depositorPubkey;
    uint256[] withdrawerPubkey;

    constructor(address _tornado) public {
        tornado = ETHTornado(_tornado);
    }

    function ask(uint256 _depositAmount, uint256 _depositPrice, uint256 _depositorPubkey) public {
        require(_depositPrice <= _depositAmount, "Ouragan: deposit price must be less or equal to deposit amount");
    }

    function fill(uint256[] memory proof, uint256[] memory publicSignals) public {
        bytes32 root = bytes32(publicSignals[1]);
        require(tornado.isKnownRoot(root), "Tornado: invalid root");
        require(true, "Ouragan: invalid proof");
    }
}
