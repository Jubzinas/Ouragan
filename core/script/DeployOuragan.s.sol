// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "../src/ETHTornado.sol";
import "../src/Ouragan.sol";
import "../src/OuraganVerifier.sol";

contract DeployOuragan is Script {
    ETHTornado tornado = ETHTornado(0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0);
    address ouraganVerifierAddress = address(new Verifier());
    IOuraganVerifier ouraganVerifierInterface = IOuraganVerifier(ouraganVerifierAddress);

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        new Ouragan(ouraganVerifierInterface, address(tornado));
        vm.stopBroadcast();
    }
}
