// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "src/ETHTornado.sol";
import "src/Verifier.sol";
import "src/MiMC.sol";
import "src/MerkleTreeWithHistory.sol";

contract TornadoMultipleDeposit is Script {
    uint256 FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    ETHTornado tornado = ETHTornado(0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0);
    uint256 commitment = uint256(bytes32("a"));
    bytes32 finalCommitment = bytes32(commitment % FIELD_SIZE);

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        tornado.deposit{value: 100000000000000000}(finalCommitment);
        vm.stopBroadcast();
    }
}
