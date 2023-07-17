const { expect, assert } = require("chai");
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree");
const wasm_tester = require("circom_tester").wasm;
const path = require("path");
const { utilsMarket, utilsCrypto } = require('private-market-utils');
const { Keypair } = require("maci-domainobjs");
const { encrypt, decrypt } = require("maci-crypto");
const generateTornadoDepositNote = require('../../scripts/tornado.js');
const MimcSponge = require("../../scripts/mimcSponge.js");

describe("Circuit Tests", function () {

    let merkleTreeProof;
    let buyer;
    let seller;

    this.timeout(10000000);

    before(async () => {

        const mimcSponge = new MimcSponge();
        await mimcSponge.prepare();
        const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
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

    it('Should create a valid tornado deposit note, namely nullifier, secret, and H(nullifier, secret) == commitment', async () => {
        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();
        expect(tcDepositNode.commitment).to.exist;        
        expect(tcDepositNode.nullifier).to.exist;
        expect(tcDepositNode.secret).to.exist;
    });

    it('Should verify commitment == Dec(Enc(commitment))', async () => {

        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();

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
            [tcDepositNode.commitment],
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
        assert.deepEqual(decriptedCommitment, [tcDepositNode.commitment]);
    });

    it("Should generate a valid proof for encryptionVerifierCircuit", async () => {

        let encryptionVerifierCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'encryptionVerifier.circom'));

        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();

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
            [tcDepositNode.commitment],
            sharedKeySeller,
            poseidonNonce
        )
        
        let input = {
            "commitment": tcDepositNode.commitment,
            "sharedKey": sharedKeyBuyer,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };

        let witness = await encryptionVerifierCircuit.calculateWitness(input);

        await encryptionVerifierCircuit.checkConstraints(witness);
    });

    it("Should generate an invalid proof for encryptionVerifierCircuit", async () => {

        let encryptionVerifierCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'encryptionVerifier.circom'));

        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();

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
            [tcDepositNode.commitment],
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

    it("Should generate a valid proof for ouragan Circuit", async () => {

        let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();

        // create tornado cash merkle tree and add commitment to it
        const mimcSponge = new MimcSponge();
        await mimcSponge.prepare();
        const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
        tree.insert(tcDepositNode.commitment);
        const indexCommitment = tree.indexOf(tcDepositNode.commitment);
        merkleTreeProof = tree.createProof(indexCommitment);

        // generate shared key 
        const sharedKey = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );

        // encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [tcDepositNode.commitment],
            sharedKey,
            poseidonNonce
        )

        let input = {
            "pathIndices": merkleTreeProof.pathIndices,
            "siblings": merkleTreeProof.siblings,
            "root": merkleTreeProof.root,
            "commitment": tcDepositNode.commitment,
            "sharedKey": sharedKey,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };

        let witness = await ouraganCircuit.calculateWitness(input);

        await ouraganCircuit.checkConstraints(witness);

    });

    it("Should generate an invalid proof for ouragan Circuit if we modify the poseidon nonce", async () => {

        let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();

        // create tornado cash merkle tree and add commitment to it
        const mimcSponge = new MimcSponge();
        await mimcSponge.prepare();
        const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
        tree.insert(tcDepositNode.commitment);
        const indexCommitment = tree.indexOf(tcDepositNode.commitment);
        merkleTreeProof = tree.createProof(indexCommitment);

        // generate shared key 
        const sharedKey = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );

        // encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [tcDepositNode.commitment],
            sharedKey,
            poseidonNonce
        )

        let invalidInput = {
            "pathIndices": merkleTreeProof.pathIndices,
            "siblings": merkleTreeProof.siblings,
            "root": merkleTreeProof.root,
            "commitment": tcDepositNode.commitment,
            "sharedKey": sharedKey,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce + 1n
        };

        try {
            await ouraganCircuit.calculateWitness(invalidInput);
        } catch (error) {
            if (error instanceof Error)
                assert.include(error.message, 'Ouragan_81 line: 39'); 
        }
    });

    it("Should generate an invalid encryption for ouragan Circuit if we modify the encryption key", async () => {

        let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();

        // create tornado cash merkle tree and add commitment to it
        const mimcSponge = new MimcSponge();
        await mimcSponge.prepare();
        const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
        tree.insert(tcDepositNode.commitment);
        const indexCommitment = tree.indexOf(tcDepositNode.commitment);
        merkleTreeProof = tree.createProof(indexCommitment);

        // generate shared key 
        const sharedKey = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );

        // encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [tcDepositNode.commitment],
            sharedKey,
            poseidonNonce
        )

        let invalidSharedKey = [sharedKey[0] + 1n, sharedKey[1] + 1n];

        let invalidInput = {
            "pathIndices": merkleTreeProof.pathIndices,
            "siblings": merkleTreeProof.siblings,
            "root": merkleTreeProof.root,
            "commitment": tcDepositNode.commitment,
            "sharedKey": invalidSharedKey,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };

        try {
            await ouraganCircuit.calculateWitness(invalidInput);
        } catch (error) {
            if (error instanceof Error)
                assert.include(error.message, 'Ouragan_81 line: 39'); 
        }
    });

    it("Should generate an invalid proof for ouragan Circuit if we modify the commitment", async () => {

        let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

        // generate tornado cash deposit note
        const tcDepositNode = await generateTornadoDepositNote();

        // create tornado cash merkle tree and add commitment to it
        const mimcSponge = new MimcSponge();
        await mimcSponge.prepare();
        const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
        tree.insert(tcDepositNode.commitment);
        const indexCommitment = tree.indexOf(tcDepositNode.commitment);
        merkleTreeProof = tree.createProof(indexCommitment);

        // generate shared key 
        const sharedKey = Keypair.genEcdhSharedKey(
            buyer.privJubJubKey,
            seller.pubJubJubKey
        );

        // encryption
        const poseidonNonce = BigInt(Date.now().toString());
        const encryptedCommitment = encrypt(
            [tcDepositNode.commitment],
            sharedKey,
            poseidonNonce
        )

        let invalidInput = {
            "pathIndices": merkleTreeProof.pathIndices,
            "siblings": merkleTreeProof.siblings,
            "root": merkleTreeProof.root,
            "commitment": tcDepositNode.commitment + 1n,
            "sharedKey": sharedKey,
            "encryptedCommitment": encryptedCommitment,
            "poseidonNonce": poseidonNonce
        };
        
        try {
            await ouraganCircuit.calculateWitness(invalidInput);
        } catch (error) {
            if (error instanceof Error)
                assert.include(error.message, 'Ouragan_81 line: 29'); 
        }
    });

});

