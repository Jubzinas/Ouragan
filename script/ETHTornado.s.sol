// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "src/ETHTornado.sol";
import "src/Verifier.sol";
import "src/MerkleTreeWithHistory.sol";

contract ETHTornadoScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        Verifier verifier = new Verifier();
        // deploy mimc contract hasher
        new ETHTornado(verifier, hasher, 0.05, 20);
        vm.stopBroadcast();
    }
}
