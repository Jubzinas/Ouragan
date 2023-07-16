const { expect, assert } = require("chai");
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree");
const { poseidon2 } = require("poseidon-lite/poseidon2");
const wasm_tester = require("circom_tester").wasm;
const path = require("path");
const { utilsMarket, utilsCrypto } = require('private-market-utils');

describe("Circuit Test", function () {

    let circuit;
    let proof;

    this.timeout(10000000);

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "../src", "tree.circom"));

        const tree = new IncrementalMerkleTree(poseidon2, 32, BigInt(0), 2) // Binary tree.

        tree.insert(BigInt(1));

        const index = tree.indexOf(BigInt(1));

        proof = tree.createProof(index);
    });

    it("Should generate a valid proof", async () => {

        let input = {
            "leaf": proof.leaf,
            "pathIndices": proof.pathIndices,
            "siblings": proof.siblings,
            "root": proof.root
        };

        let witness = await circuit.calculateWitness(input);

        await circuit.assertOut(witness, { root: proof.root })
        await circuit.checkConstraints(witness);
    });

    it("Should generate an invalid proof", async () => {

        let invalid_input = {
            "leaf": proof.leaf + 1n,
            "pathIndices": proof.pathIndices,
            "siblings": proof.siblings,
            "root": proof.root
        };

        // the input root should not match the root generated from the circuit.
        try {
            await circuit.calculateWitness(invalid_input);
        } catch (error) {
            if (error instanceof Error)
                assert.include(error.message, 'Error in template MerkleTreeInclusionProof_69 line: 39');
        }
    });

    it("Should generate a user key pair", async () => {
        const user = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
        // user should exist
        expect(user.ecdsaKeypair).to.exist;
        expect(user.jubJubKeypair).to.exist;
    });

});