#!/bin/sh
set -e

PTAU_NAME="powersOfTau28_hez_final_13.ptau"

compile_and_ts() {
    CIRCUIT_PATH="$1"
    CIRCUIT=`basename "$CIRCUIT" .circom`

    mkdir -p "$CIRCUIT"
    cd "$CIRCUIT"

    cp "$CIRCUIT_PATH" circuit.circom

    set -x
    time circom --r1cs --wasm --sym "$CIRCUIT_PATH"
    mv "${CIRCUIT}.r1cs" circuit.r1cs
    mv "${CIRCUIT}_js/${CIRCUIT}.wasm" circuit.wasm
    mv "${CIRCUIT}.sym" circuit.sym
    snarkjs r1cs info circuit.r1cs

    time snarkjs groth16 setup circuit.r1cs "$PTAU" circuit_0000.zkey

    ENTROPY1=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)
    ENTROPY2=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)
    ENTROPY3=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)

    time snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contribution" -v -e="$ENTROPY1"
    time snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name="2nd Contribution" -v -e="$ENTROPY2"
    time snarkjs zkey contribute circuit_0002.zkey circuit_0003.zkey --name="3rd Contribution" -v -e="$ENTROPY3"
    time snarkjs zkey verify circuit.r1cs "$PTAU" circuit_0003.zkey
    time snarkjs zkey beacon circuit_0003.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
    time snarkjs zkey verify circuit.r1cs "$PTAU" circuit_final.zkey
    time snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
    time snarkjs zkey export json circuit_final.zkey circuit_final.zkey.json
    time snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
    set +x
}

if [ "$#" -ne 1 ]
then
    echo "Usage:   $0 CIRCUIT_PATH">&2
    echo "Example: ./compile-circuit.sh example.circom" >&2
    exit 1
fi

set -u

CIRCUIT="$(pwd)/$1"
mkdir -p build
cd build

# Download the ptau file into the build directory
wget -O $PTAU_NAME https://hermez.s3-eu-west-1.amazonaws.com/$PTAU_NAME
PTAU="$(pwd)/$PTAU_NAME"
PATH="$(pwd)/node_modules/.bin:$PATH"

compile_and_ts "$CIRCUIT"
