// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "forge-std/Test.sol";
import "../src/ETHTornado.sol";
import "../src/OuraganVerifier.sol";
import "../src/Ouragan.sol";
import "forge-std/console.sol";

contract OuraganTest is Test {
    ETHTornado tornado;
    Verifier ouraganVerifier;
    Ouragan ouragan;
    address tornadoAddress = address(0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD);
    address ouraganVerifierAddress = address(new Verifier());
    uint256 depositAmount = 1 ether;

    function setUp() public {
        tornado = ETHTornado(tornadoAddress);
        IOuraganVerifier ouraganVerifierInterface = IOuraganVerifier(ouraganVerifierAddress);
        ouragan = new Ouragan(ouraganVerifierInterface, tornadoAddress, depositAmount);
    }

    function testValidRoot() public {
        bytes32 lastRoot = tornado.getLastRoot();
        tornado.isKnownRoot(lastRoot);
    }

    function testValidAsk() public {
        uint256 _depositPrice = uint256(1);
        uint256 _pubKeyX = uint256(15430015336001722193966819359708318811700128056390661628499195673486547298964);
        uint256 _pubKeyY = uint256(11573373846379315116502871589355718173351167651646298682224258307256681860108);
        ouragan.ask(_depositPrice, [_pubKeyX, _pubKeyY]);
    }

    function testInvalidAsk() public {
        uint256 _depositPrice = 2 ether;
        uint256 _pubKeyX = uint256(15430015336001722193966819359708318811700128056390661628499195673486547298964);
        uint256 _pubKeyY = uint256(11573373846379315116502871589355718173351167651646298682224258307256681860108);

        vm.expectRevert(bytes("Ouragan: deposit price must be less or equal to deposit amount"));
        ouragan.ask(_depositPrice, [_pubKeyX, _pubKeyY]);
    }

    function testInvalidRoot() public {}

    function testFullFlow() public {}
}
