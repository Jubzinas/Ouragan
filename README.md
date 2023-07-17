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

For running the whole script run:

```
$ cd && core npm start
```

For testing the circuits run
```
$ cd core && npm run test-circuits
```

To run the circuit setup
```
$ cd core && bash scripts/run-setup.sh circuits/test/circuits/ouragan.circom
```

To generate the proof

```
$ cd code && bash scripts/generate-proof.sh ouragan examples/input.json
```

