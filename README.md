<p align="center">
<img width="185" alt="ouragan" src="https://github.com/Jubzinas/Ouragan/assets/23149200/7621f927-2c2d-47c7-a665-93d6536b9472">
</p>

# Ouragan

Requires 
- `circom 2.1.6` 
- `forge 0.2.0`
- Sepolia RPC API

### Usage

Install the packages
```
$ npm install
```

For testing the circuits run
```
$ cd core 
$ npm run test-circuits
```

(all the next commands should be run from the `core` folder)

For testing the full flow with the smart contract interaction

```
forge test --fork-url <your_sepolia_rpc_api>
```

To run the circuit setup
```
$ bash scripts/run-setup.sh circuits/test/circuits/ouragan.circom
```

To get the input.json file for the proof generation (note: you need to run in parallel a local fork of sepolia network)

- Add a private key to `core/.env` file
- Run in paraller a local fork of sepolia network

```
$ anvil --fork-url <your_sepolia_rpc_api>
```

- Generate the input.json file

```
$ forge script script/TornadoMultipleDeposit.s.sol --rpc-url http://localhost:8545 --broadcast
$ npx ts-node ts-scripts/getCircuitInput.ts
```

To generate the proof
```
$ bash scripts/generate-proof.sh ouragan ts-scripts/out/input.json
```

