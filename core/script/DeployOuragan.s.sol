// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "../src/ETHTornado.sol";
import "../src/Ouragan.sol";
import "../src/OuraganVerifier.sol";

contract DeployOuragan is Script {
    ETHTornado tornado = ETHTornado(0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD);
    address ouraganVerifierAddress = address(new Verifier());
    IOuraganVerifier ouraganVerifierInterface = IOuraganVerifier(ouraganVerifierAddress);
    uint256 depositAmount = 0.01 ether;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        new Ouragan(ouraganVerifierInterface, address(tornado), depositAmount);
        vm.stopBroadcast();
    }
}
