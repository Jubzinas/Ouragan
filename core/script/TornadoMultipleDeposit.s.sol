// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "../src/ETHTornado.sol";
import "forge-std/console.sol";

contract TornadoMultipleDeposit is Script {
    uint256 FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    ETHTornado tornado = ETHTornado(0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD);

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        bytes32[3] memory array = [bytes32("a"), bytes32("b"), bytes32("c")];
        for (uint256 index = 0; index < array.length; index++) {
            bytes32 finalCommitment = bytes32(uint256(array[index]) % FIELD_SIZE);
            tornado.deposit{value: 100000000000000000}(finalCommitment);
        }
        vm.stopBroadcast();
    }
}
