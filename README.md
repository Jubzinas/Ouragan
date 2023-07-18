<p align="center">
<img width="185" alt="ouragan" src="https://github.com/Jubzinas/Ouragan/assets/23149200/7621f927-2c2d-47c7-a665-93d6536b9472">
</p>


![](https://img.shields.io/badge/circom-2.0.3-lightgrey) ![](https://img.shields.io/badge/forge-0.2.0-blue) 

# Ouragan

*A LambdaZKWeek project*

Ouragan is a permissionless and censorship resistant Tornado Cash offramp. 

It consists of a suite of circuits and contracts which make it possible for two unrelated parties to trustessly and privately seed wallets with ETH. 

This is an interesting setup for a number of reasons:
- Alice might not want to reveal her identity to the Tornado Cash relayer when seeding her wallet
- Alice might not want her wallet to interact with Tornado Cash when withdrawing funds
- Bob gets a premium for providing Alice the ability to seed her wallet


### Setup

Install the packages and run all tests:

```
$ npm install 
$ npm run ouragan:tests
```

We deployed our own Tornado Cash [instance](https://sepolia.etherscan.io/address/0x23d8b4dc62327ee727d1e11feb43cac656c500bd) on Sepolia. Tests will run against a Sepolia fork to emulate real-world conditions.