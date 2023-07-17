#!/bin/sh

set -e

generate_proof() {
  CIRCUIT="$(pwd)/build/$1"
  CIRCUIT_JS="$(pwd)/build/$1/$1_js"
  INPUT_JSON_PATH=$2  # Add this line to get the path from the script argument

    # Check for correct number of arguments
    if [ "$#" -ne 2 ]
    then
        echo "Usage: $0 CIRCUIT_NAME INPUT_JSON_PATH" >&2
        echo "Example: ./generate-proof.sh ouragan /path/to/input.json" >&2
        exit 1
    fi

  node $CIRCUIT_JS/generate_witness.js $CIRCUIT/circuit.wasm $INPUT_JSON_PATH $CIRCUIT_JS/witness.wtns  # Replace with $INPUT_JSON_PATH

  snarkjs groth16 prove $CIRCUIT/circuit_final.zkey $CIRCUIT_JS/witness.wtns $CIRCUIT_JS/proof.json $CIRCUIT_JS/public.json

  snarkjs groth16 verify $CIRCUIT/verification_key.json $CIRCUIT_JS/public.json $CIRCUIT_JS/proof.json

  snarkjs zkey export soliditycalldata $CIRCUIT_JS/public.json $CIRCUIT_JS/proof.json
}

generate_proof $1 $2
