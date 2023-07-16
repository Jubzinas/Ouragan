// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "src/ETHTornado.sol";
import "src/Verifier.sol";
import "src/MiMC.sol";
import "src/MerkleTreeWithHistory.sol";

contract ETHTornadoScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        Verifier verifier = new Verifier();
        MiMC mimc = new MiMC();
        new ETHTornado(verifier, mimc, 0.05 ether, 20);
        vm.stopBroadcast();
    }
}
