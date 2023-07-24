<p align="center">
<img width="185" alt="ouragan" src="https://github.com/Jubzinas/Ouragan/assets/23149200/7621f927-2c2d-47c7-a665-93d6536b9472">
</p>


![](https://img.shields.io/badge/circom-2.1.6-lightgrey) ![](https://img.shields.io/badge/forge-0.2.0-blue) 

# Ouragan

*A LambdaZKWeek project*

Ouragan is a permissionless and censorship resistant Tornado Cash offramp. 

It consists of a suite of circuits and contracts which make it possible for two unrelated parties to trustessly and privately seed wallets with ETH. 

This is an interesting setup for a number of reasons:
- Alice might not want to reveal her identity to the Tornado Cash relayer when seeding her wallet
- Alice might not want her wallet to interact with Tornado Cash when withdrawing funds
- Bob gets a premium for providing Alice the ability to seed her wallet

![](./imgs/Ouragan_updated.jpeg)

### Setup

Install the packages and run all tests:

```
$ npm install 
$ npm run ouragan:tests
```

We deployed our own Tornado Cash [instance](https://sepolia.etherscan.io/address/0x23d8b4dc62327ee727d1e11feb43cac656c500bd) on Sepolia. Tests will run against a Sepolia fork to emulate real-world conditions.

### Architecture Limitations

- Bob knows Alice’s seeded address. In particular Bob can correlate the address that Alice used to deposit funds in Tornado Cash at step 3 with the address that got seeded at step 5.
- The protocol doesn't work if Alice has already deposited into Tornado Cash. Ideally the protocol should work retroactively.
- We would like to be able to do 1 TC deposit to seed N addresses. Might be possible to update TC protocol and leverage recursivity. One TC deposit note could be used for seeding N wallets.

### Implementation TODOs

- [ ] Add timelock to Ouragan contract. As of now Bob's funds are locked into the contract until Alice provides a valid proof. Ideally, the funds should be released back to Bob after a certain amount of time.
- [ ] Test integration with withdraw function on tornado cash. 
- [ ] Enforce a check that the deposit amount related to `_tornado` contract used in the constructor matches the `_depositAmount` passed in the constructor.
- [ ] Extend it to ERC20 Pools



