const { expect, assert } = require("chai");
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree");
const { poseidon2 } = require("poseidon-lite/poseidon2");
const wasm_tester = require("circom_tester").wasm;
const path = require("path");
const { utilsMarket, utilsCrypto } = require('private-market-utils');
const { Keypair } = require("maci-domainobjs");
const crypto = require("crypto");
const { buildBabyjub, buildPedersenHash } = require("circomlibjs");
const utils = require("ffjavascript").utils;
const rbigint = (nbytes) => utils.leBuff2int(crypto.randomBytes(nbytes))
const { encrypt, decrypt } = require("maci-crypto");

describe("Circuit Test", function () {

    let circuit;
    let proof;
    let circuit_b;

    this.timeout(10000000);

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "../src", "tree.circom"));
        circuit_b = await wasm_tester(path.join(__dirname, "../src", 'encryptionVerifier.circom'));

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

    it('Should calculate the same ECDH value for both buyer and seller', () => {
        const buyer = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
        const seller = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );

        const sharedKeyBuyer = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );
        const sharedKeySeller = Keypair.genEcdhSharedKey(
            seller.privJubJubKey,
            buyer.pubJubJubKey
        );

        // assert both keys are equal (buyer and seller)
        assert.deepEqual(sharedKeyBuyer, sharedKeySeller);
    });

    it('Should create a nullifier and secret - hash them and create commitment', async () => {
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        //unPackpoint
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        expect(commitment).to.exist;
    });

    it('Should verify the encrypted commitment', async () => {
        //commitment
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        //sharedKey
        const buyer = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
        const seller = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );

        const sharedKeyBuyer = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );
        const sharedKeySeller = Keypair.genEcdhSharedKey(
            seller.privJubJubKey,
            buyer.pubJubJubKey
        );

        //encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [commitment],
            sharedKeySeller,
            poseidonNonce
        )

        const decriptedCommitment = decrypt(
            encryptedCommitment,
            sharedKeyBuyer,
            poseidonNonce,
            1
        )
        assert.deepEqual(decriptedCommitment, [commitment]);
    });

    it("Should generate a valid proof for circuit_b", async () => {
        //commitment
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        //sharedKey
        const buyer = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
        const seller = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );

        const sharedKeyBuyer = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );
        const sharedKeySeller = Keypair.genEcdhSharedKey(
            seller.privJubJubKey,
            buyer.pubJubJubKey
        );

        //encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [commitment],
            sharedKeySeller,
            poseidonNonce
        )

        const decriptedCommitment = decrypt(
            encryptedCommitment,
            sharedKeyBuyer,
            poseidonNonce,
            1
        )

        let input = {
            "commitment": commitment,
            "sharedKey": sharedKeyBuyer,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };

        let witness = await circuit_b.calculateWitness(input);

        await circuit_b.checkConstraints(witness);
    });

    it("Should generate an invalid proof for circuit_b", async () => {
        //commitment
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        //sharedKey
        const buyer = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
        const seller = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );

        const sharedKeyBuyer = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );
        const sharedKeySeller = Keypair.genEcdhSharedKey(
            seller.privJubJubKey,
            buyer.pubJubJubKey
        );

        //encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [commitment],
            sharedKeySeller,
            poseidonNonce
        )

        const decriptedCommitment = decrypt(
            encryptedCommitment,
            sharedKeyBuyer,
            poseidonNonce,
            1
        )

        let invalid_input = {
            "commitment": 1n,
            "sharedKey": sharedKeyBuyer,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };

        try {
            await circuit_b.calculateWitness(invalid_input);
        } catch (error) {
            if (error instanceof Error)
                assert.include(error.message, 'Error in template EncryptionVerifier_75 line: 26');
        }
    });
});
