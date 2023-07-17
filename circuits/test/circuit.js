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

    let treeCircuit;
    let encryptionVerifierCircuit;
    let merkleTreeProof;
    let buyer;
    let seller;

    this.timeout(10000000);

    before(async () => {
        treeCircuit = await wasm_tester(path.join(__dirname, "../src", "tree.circom"));
        encryptionVerifierCircuit = await wasm_tester(path.join(__dirname, "../src", 'encryptionVerifier.circom'));

        // Build tree
        const tree = new IncrementalMerkleTree(poseidon2, 32, BigInt(0), 2) // Binary tree.
        tree.insert(BigInt(1));
        const index = tree.indexOf(BigInt(1));
        merkleTreeProof = tree.createProof(index);

        // Build buyer and seller key pairs
        buyer = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
        seller = new utilsMarket.User(
            utilsCrypto.getRandomECDSAPrivKey(false)
        );
    });

    it("Should generate a valid proof for merkle tree circuit", async () => {

        let input = {
            "leaf": merkleTreeProof.leaf,
            "pathIndices": merkleTreeProof.pathIndices,
            "siblings": merkleTreeProof.siblings,
            "root": merkleTreeProof.root
        };

        let witness = await treeCircuit.calculateWitness(input);

        await treeCircuit.checkConstraints(witness);
    });

    it("Should generate an invalid proof for merkle tree circuit", async () => {

        let invalid_input = {
            "leaf": merkleTreeProof.leaf + 1n,
            "pathIndices": merkleTreeProof.pathIndices,
            "siblings": merkleTreeProof.siblings,
            "root": merkleTreeProof.root
        };

        // the input root should not match the root generated from the circuit.
        try {
            await treeCircuit.calculateWitness(invalid_input);
        } catch (error) {
            if (error instanceof Error)
                assert.include(error.message, 'Error in template MerkleTreeInclusionProof_69 line: 39');
        }
    });

    it('Should calculate the same ECDH shared key for both buyer and seller', () => {

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

        // generate user commitment
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        expect(commitment).to.exist;
    });

    it('Should verify commitment == Dec(Enc(commitment))', async () => {

        // generate user commitment
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        // generate shared key
        const sharedKeyBuyer = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );
        const sharedKeySeller = Keypair.genEcdhSharedKey(
            seller.privJubJubKey,
            buyer.pubJubJubKey
        );

        // encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [commitment],
            sharedKeySeller,
            poseidonNonce
        )
        
        // decryption
        const decriptedCommitment = decrypt(
            encryptedCommitment,
            sharedKeyBuyer,
            poseidonNonce,
            1
        )
        assert.deepEqual(decriptedCommitment, [commitment]);
    });

    it("Should generate a valid proof for encryptionVerifierCircuit", async () => {

        // generate user commitment
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        // generate shared key
        const sharedKeyBuyer = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );
        const sharedKeySeller = Keypair.genEcdhSharedKey(
            seller.privJubJubKey,
            buyer.pubJubJubKey
        );

        // encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [commitment],
            sharedKeySeller,
            poseidonNonce
        )

        let input = {
            "commitment": commitment,
            "sharedKey": sharedKeyBuyer,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };

        let witness = await encryptionVerifierCircuit.calculateWitness(input);

        await encryptionVerifierCircuit.checkConstraints(witness);
    });

    it("Should generate an invalid proof for encryptionVerifierCircuit", async () => {

        // generate user commitment
        let deposit = {
            secret: rbigint(31),
            nullifier: rbigint(31),
        }
        const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
        let babyJub = await buildBabyjub();
        let pedersen = await buildPedersenHash();
        const pedersenHash = (data) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]) //we used this code https://github.com/KuTuGu/proof-of-innocence/blob/dc89bf6c6b2af47b1ec08eebdb3924f3bd614a3f/circuit/js/util.mjs#L10
        const commitment = pedersenHash(preimage);

        // generate sharedKey
        const sharedKeyBuyer = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );
        const sharedKeySeller = Keypair.genEcdhSharedKey(
            seller.privJubJubKey,
            buyer.pubJubJubKey
        );

        // encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [commitment],
            sharedKeySeller,
            poseidonNonce
        )

        let invalid_input = {
            "commitment": 1n,
            "sharedKey": sharedKeyBuyer,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };

        // the bool constraint at the end of the circuit is not satisfied
        try {
            await encryptionVerifierCircuit.calculateWitness(invalid_input);
        } catch (error) {
            if (error instanceof Error)
                assert.include(error.message, 'Error in template EncryptionVerifier_75 line: 26');
        }
    });
});
