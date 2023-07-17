<p align="center">
<img width="185" alt="ouragan" src="https://github.com/Jubzinas/Ouragan/assets/23149200/7621f927-2c2d-47c7-a665-93d6536b9472">
</p>

# Ouragan

Requires `circom 2.1.6` 

### Usage

Install the packages
```
$ npm install
```

For testing the circuits run
```
$ cd core && npm run test-circuits
```

For testing the full flow with the smart contract interaction

```
forge test --fork-url https://sepolia.infura.io/v3/<your_rpc_api>
```

To run the circuit setup
```
$ cd core && bash scripts/run-setup.sh circuits/test/circuits/ouragan.circom
```

To get the input.json file for the proof generation

```
$ anvil --fork-url https://sepolia.infura.io/v3/<your_rpc_api>
$ cd core
$ forge script script/TornadoMultipleDeposit.s.sol --rpc-url http://localhost:8545 --broadcast
$ npx ts-node ts-scripts/getCircuitInput.ts
```

To generate the proof
```
$ cd code && bash scripts/generate-proof.sh ouragan ts-scripts/out/input.json
```

