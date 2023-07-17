// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "forge-std/Test.sol";
import "../src/ETHTornado.sol";
import "../src/OuraganVerifier.sol";
import "../src/Ouragan.sol";
import "../src/Shared.sol";
import "forge-std/console.sol";

contract OuraganTest is Test, Shared {
    ETHTornado tornado;
    Verifier ouraganVerifier;
    Ouragan ouragan;
    address tornadoAddress = address(0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD);
    address ouraganVerifierAddress = address(new Verifier());
    uint256 depositAmount = 1 ether;

    function setUp() public {
        vm.deal(seller, 1 ether);
        vm.deal(buyer, 1 ether);
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
        vm.startBroadcast(seller);
        ouragan.ask(_depositPrice, [_pubKeyX, _pubKeyY]);
        vm.stopBroadcast();
    }

    function testInvalidAsk() public {
        uint256 _depositPrice = 2 ether;
        uint256 _pubKeyX = uint256(15430015336001722193966819359708318811700128056390661628499195673486547298964);
        uint256 _pubKeyY = uint256(11573373846379315116502871589355718173351167651646298682224258307256681860108);
        vm.expectRevert(bytes("Ouragan: deposit price must be less or equal to deposit amount"));
        vm.startBroadcast(seller);
        ouragan.ask(_depositPrice, [_pubKeyX, _pubKeyY]);
        vm.stopBroadcast();
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
        vm.startBroadcast(buyer);
        ouragan.order{value: _depositPrice}(_encryptedCommitment, [_pubKeyXBuyer, _pubKeyYBuyer], _nonce);
        vm.stopBroadcast();
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
        vm.startBroadcast(buyer);
        ouragan.order{value: 0.89 ether}(_encryptedCommitment, [_pubKeyXBuyer, _pubKeyYBuyer], _nonce);
        vm.stopBroadcast();
    }

    function testFullFlow() public {

        uint256 FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

        bytes32[3] memory array = [bytes32("a"), bytes32("b"), bytes32("c")];
        for (uint256 index = 0; index < array.length; index++) {
            bytes32 finalCommitment = bytes32(uint256(array[index]) % FIELD_SIZE);
            tornado.deposit{value: 100000000000000000}(finalCommitment);
        }

        uint256 _depositPrice = 0.9 ether;
        uint256 _pubKeyXSeller = uint256(12158529233928573881159286828270887848760618208657114638501534452731412956359);
        uint256 _pubKeyYSeller = uint256(17380441513620955351958302474115590163471415097202391638991501713433775249524);
        vm.startBroadcast(seller);
        ouragan.ask(_depositPrice, [_pubKeyXSeller, _pubKeyYSeller]);
        vm.stopBroadcast();

        uint256[4] memory _encryptedCommitment = [uint256(9558624899006714625118821269125552146339125376878096346374208417351185536973), uint256(16607808218271684882226249129207022312311570440786450501356013817605402578103), uint256(13469127386071864510368960769146887063052007797593966513018445731173741577390), uint256(8312510246340922072347760400014575838952599309879478589213907321484149939077)];
        uint256 _pubKeyXBuyer = uint256(17564958401408790042677118324802114219708128768248636874076873183289490057883);
        uint256 _pubKeyYBuyer = uint256(18634528695366686497477543907603708290059660814710069682729265305675547097173);
        uint256 _nonce = uint256(1689619023691);
        vm.startBroadcast(buyer);
        ouragan.order{value: 0.9 ether}(_encryptedCommitment, [_pubKeyXBuyer, _pubKeyYBuyer], _nonce);
        vm.stopBroadcast();

        uint[2] memory a = [0x0716844d41fd9e2d9f2735a73741a4c47a49d541974d4afdfc5977f311d87300, 0x2c481962598a835fff87245462c61eab127bb24d8c3eeae64bb8b5f33725290d];
    
        uint256[2][2] memory b = [
            [
                0x2b2b1bd0fb2d0583ebebe3393c67031775f1dd4e2eb4ca12cc55568fa56a28d8,
                0x1fdf42276ea3bad8e1156b38e59188e1545f3d62bdc67647b2ebfca502700361
            ],
            [
                0x2bea8e99fbe2c846dbccde63c73ba43481ef7828e6e3b068a3bb4277ad893545,
                0x04abbca93fe592307567a239b0348c35ad0ca9cb60d457da53ffcf9a1d1f9cd0
            ]
        ];

        uint256[2] memory c = [
            0x0bcff319e6a1361c37d4bafbda5a6f521ee3ee565f09acbb495b9590861063b3,
            0x27fc42151bfb0e0ba5d115205710c89c3c5418d81119fb34d95948f363707d65
        ];

        uint256[6] memory input = [
            0x1c693345475c334b9f36fcf1dd0e8f67f69df7441807987215e9bf77c8fafd46,
            0x1521fd6eacd31dc7b5c6613b74afff7e7f3f1142570dbcd5f70f7f7f86c917cd,
            0x24b7afb3ed2f64301e53ce97f3c38eda71f4636073e59f19808d7122bddaccb7,
            0x1dc7418572b6c7b8cdabddf3daf90b167fe6ac6ba76af7f45807fa5b25d744ae,
            0x1260b6cd5573e4112b52d81d548df6134e411d999bb969ac0e7af3491a2a5b85,
            0x000000000000000000000000000000000000000000000000000001896524474b
        ];

        vm.startBroadcast(seller);
        ouragan.fill(a, b, c, input);
        vm.stopBroadcast();

    }
}
