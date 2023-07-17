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
        uint256 _depositPrice = 0.9 ether;
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

    function testValidOrder() public {
        uint256 _depositPrice = 0.9 ether;
        uint256 _pubKeyXSeller = uint256(15430015336001722193966819359708318811700128056390661628499195673486547298964);
        uint256 _pubKeyYSeller = uint256(11573373846379315116502871589355718173351167651646298682224258307256681860108);
        ouragan.ask(_depositPrice, [_pubKeyXSeller, _pubKeyYSeller]);

        uint256[4] memory _encryptedCommitment = [uint256(7885989991963624885052814254504701339759252530460181116314983730256366144913), uint256(2646566958917503132642967528466846268284651335654432351896974825159758774978), uint256(12650302736213368280611243449853952237076835291414893414224937225336215283883), uint256(166387177834622879238403904669098332513166069802069365887898287023439356556)];
        uint256 _pubKeyXBuyer = uint256(5892619949504634450976995513719455705333200182928146226043470671978045428960);
        uint256 _pubKeyYBuyer = uint256(21059771556387588850832772281010768662992569476912259865449449284941375802777);
        uint256 _nonce = uint256(1689612175424);
        ouragan.order{value: _depositPrice}(_encryptedCommitment, [_pubKeyXBuyer, _pubKeyYBuyer], _nonce);
    }

    function testInvalidOrder() public {
        uint256 _depositPrice = 0.9 ether;
        uint256 _pubKeyXSeller = uint256(15430015336001722193966819359708318811700128056390661628499195673486547298964);
        uint256 _pubKeyYSeller = uint256(11573373846379315116502871589355718173351167651646298682224258307256681860108);
        ouragan.ask(_depositPrice, [_pubKeyXSeller, _pubKeyYSeller]);

        uint256[4] memory _encryptedCommitment = [uint256(7885989991963624885052814254504701339759252530460181116314983730256366144913), uint256(2646566958917503132642967528466846268284651335654432351896974825159758774978), uint256(12650302736213368280611243449853952237076835291414893414224937225336215283883), uint256(166387177834622879238403904669098332513166069802069365887898287023439356556)];
        uint256 _pubKeyXBuyer = uint256(5892619949504634450976995513719455705333200182928146226043470671978045428960);
        uint256 _pubKeyYBuyer = uint256(21059771556387588850832772281010768662992569476912259865449449284941375802777);
        uint256 _nonce = uint256(1689612175424);
        vm.expectRevert(bytes("Ouragan: value to be sent must be equal to deposit price"));
        ouragan.order{value: 0.89 ether}(_encryptedCommitment, [_pubKeyXBuyer, _pubKeyYBuyer], _nonce);
    }

    function testInvalidRoot() public {}

    function testFullFlow() public {}
}
