// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "forge-std/Script.sol";
import "src/ETHTornado.sol";
import "src/Verifier.sol";
import "src/MiMC.sol";
import "src/MerkleTreeWithHistory.sol";

contract ETHTornadoScript is Script {
    function setUp() public {}

    IVerifier verifier = IVerifier(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
    IHasher hasher = IHasher(0x5FbDB2315678afecb367f032d93F642f64180aa3);

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        ETHTornado tornado = new ETHTornado(verifier, hasher, 0.05 ether, 20);
        vm.stopBroadcast();
    }
}
