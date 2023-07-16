// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "src/Verifier.sol";
import "src/MiMC.sol";

contract MiMCAndVerifierScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        new Verifier();
        vm.stopBroadcast();
    }
}
