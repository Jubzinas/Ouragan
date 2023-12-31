<p align="center">
<img width="185" alt="ouragan" src="https://github.com/Jubzinas/Ouragan/assets/23149200/7621f927-2c2d-47c7-a665-93d6536b9472">
</p>

![](https://img.shields.io/badge/circom-2.1.6-lightgrey)

# Ouragan

*A LambdaZKWeek project - 3rd place 🥂*

Ouragan is a permissionless and censorship resistant Tornado Cash offramp. 

It consists of a suite of circuits and contracts which make it possible for two unrelated parties to trustessly and privately seed wallets with ETH. 

This is an interesting setup for a number of reasons:
- Alice might not want to reveal her identity to the Tornado Cash relayer when seeding her wallet
- Alice might not want her wallet to interact with Tornado Cash when withdrawing funds
- Bob gets a premium for providing Alice the ability to seed her wallet

![](./imgs/Ouragan_updated.png)

### Main Components

- `core`: Contains the circuits and contracts that make up the core of the protocol.
- `front`: Contains a simple frontend implementation of the protocol. (WIP)

Install the packages and run all tests:

```
$ cd core
$ npm install 
$ npm test
```

### Setup

The Circuit Verifier contract has been deployed using a test trusted setup. All the artifcats generated by the trusted setup are contained in the `build` folder. If you want to run the trusted setup yourself, you can do so: 

```
$ npm run setup
```

Note that this will generate a new `verifier.sol` Contract. In order to add it to the project, you need to:
- Duplicate the `verifier.sol` contract from the `build/ouragan` folder
- Change contract name to `OuraganVerifier` 
- Change the file name to `OuraganVerifier.sol` 
- Update the solidity compiler version to `0.7.0`
- Place it in the `contracts` folder

### Architecture Limitations

- Bob knows Alice’s seeded address. In particular Bob can correlate the address that Alice used to deposit funds in Tornado Cash at step 3 with the address that got seeded at step 5.
- The protocol doesn't work if Alice has already deposited into Tornado Cash. Alice needs to agree on the deal with Bob before depositing to Tornado Cash. Ideally the protocol should work retroactively.
- We would like to be able to do 1 TC deposit to seed N addresses. Might be possible to update TC protocol and leverage recursivity. One TC deposit note could be used for seeding N wallets.
