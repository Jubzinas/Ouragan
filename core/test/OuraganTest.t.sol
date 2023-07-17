// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "forge-std/Test.sol";
import "../src/ETHTornado.sol";
import "../src/Ouragan.sol";
import "forge-std/console.sol";

contract OuraganTest is Test {
    
    ETHTornado tornado;
    Ouragan ouragan;
    address tornadoAddress = address(0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0);

    function setUp() public {
        tornado = ETHTornado(tornadoAddress); 
        ouragan = new Ouragan(tornadoAddress);
    }

    function testValidRoot() public {
        bytes32 lastRoot = tornado.getLastRoot();
        tornado.isKnownRoot(lastRoot);
    }

    function testInvalidRoot() public {
    }

    function testFullFlow() public {
        
    }
}
