// const { expect, assert } = require("chai");
// const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree");
// const wasm_tester = require("circom_tester").wasm;
// const path = require("path");
// const { utilsMarket, utilsCrypto } = require('private-market-utils');
// const { Keypair } = require("maci-domainobjs");
// const { encrypt, decrypt } = require("maci-crypto");
// const generateTornadoDepositNote = require('../../core/scripts/tornado.js');
// const MimcSponge = require("../../core/scripts/mimcSponge.js");

// describe("Circuit Tests", function () {

//     let merkleTreeProof;
//     let buyer;
//     let seller;

//     this.timeout(10000000);

//     before(async () => {

//         const mimcSponge = new MimcSponge();
//         await mimcSponge.prepare();
//         const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
//         tree.insert(BigInt(1));
//         const index = tree.indexOf(BigInt(1));
//         merkleTreeProof = tree.createProof(index);

//         // Build buyer and seller key pairs
//         buyer = new utilsMarket.User(
//             utilsCrypto.getRandomECDSAPrivKey(false)
//         );
//         seller = new utilsMarket.User(
//             utilsCrypto.getRandomECDSAPrivKey(false)
//         );
//     });

//     it("Should generate a valid proof for encryptionVerifierCircuit", async () => {

//         let encryptionVerifierCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'encryptionVerifier.circom'));

//         // generate tornado cash deposit note
//         const tcDepositNode = await generateTornadoDepositNote();

//         // generate shared key
//         const sharedKeyBuyer = Keypair.genEcdhSharedKey(
//             buyer.privJubJubKey,
//             seller.pubJubJubKey
//         );
//         const sharedKeySeller = Keypair.genEcdhSharedKey(
//             seller.privJubJubKey,
//             buyer.pubJubJubKey
//         );

//         // encryption
//         const poseidonNonce = BigInt(Date.now().toString());
//         const encryptedCommitment = encrypt(
//             [tcDepositNode.commitment],
//             sharedKeySeller,
//             poseidonNonce
//         )
        
//         let input = {
//             "commitment": tcDepositNode.commitment,
//             "sharedKey": sharedKeyBuyer,
//             "encryptedCommitment": encryptedCommitment,
//             "poseidonNonce": poseidonNonce
//         };

//         let witness = await encryptionVerifierCircuit.calculateWitness(input);

//         await encryptionVerifierCircuit.checkConstraints(witness);
//     });

//     it("Should generate an invalid proof for encryptionVerifierCircuit", async () => {

//         let encryptionVerifierCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'encryptionVerifier.circom'));

//         // generate tornado cash deposit note
//         const tcDepositNode = await generateTornadoDepositNote();

//         // generate sharedKey
//         const sharedKeyBuyer = Keypair.genEcdhSharedKey(
//             buyer.privJubJubKey,
//             seller.pubJubJubKey
//         );
//         const sharedKeySeller = Keypair.genEcdhSharedKey(
//             seller.privJubJubKey,
//             buyer.pubJubJubKey
//         );

//         // encryption
//         const poseidonNonce = BigInt(Date.now().toString());
//         const encryptedCommitment = encrypt(
//             [tcDepositNode.commitment],
//             sharedKeySeller,
//             poseidonNonce
//         )

//         let invalid_input = {
//             "commitment": 1n,
//             "sharedKey": sharedKeyBuyer,
//             "encryptedCommitment": encryptedCommitment,
//             "poseidonNonce": poseidonNonce
//         };

        

//         // the bool constraint at the end of the circuit is not satisfied
//         try {
//             await encryptionVerifierCircuit.calculateWitness(invalid_input);
//         } catch (error) {
//             if (error instanceof Error)
//                 assert.include(error.message, 'Error in template EncryptionVerifier_75 line: 26');
//         }
//     });

//     it("Should generate a valid proof for ouragan Circuit", async () => {

//         let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

//         // generate tornado cash deposit note
//         const tcDepositNode = await generateTornadoDepositNote();

//         // create tornado cash merkle tree and add commitment to it
//         const mimcSponge = new MimcSponge();
//         await mimcSponge.prepare();
//         const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
//         tree.insert(tcDepositNode.commitment);
//         const indexCommitment = tree.indexOf(tcDepositNode.commitment);
//         merkleTreeProof = tree.createProof(indexCommitment);

//         // generate shared key 
//         const sharedKey = Keypair.genEcdhSharedKey(
//             buyer.privJubJubKey,
//             seller.pubJubJubKey
//         );

//         // encryption
//         const poseidonNonce = BigInt(Date.now().toString());
//         const encryptedCommitment = encrypt(
//             [tcDepositNode.commitment],
//             sharedKey,
//             poseidonNonce
//         )

//         let input = {
//             "pathIndices": merkleTreeProof.pathIndices,
//             "siblings": merkleTreeProof.siblings,
//             "root": merkleTreeProof.root,
//             "commitment": tcDepositNode.commitment,
//             "sharedKey": sharedKey,
//             "encryptedCommitment": encryptedCommitment,
//             "poseidonNonce": poseidonNonce
//         };

//         let witness = await ouraganCircuit.calculateWitness(input);

//         await ouraganCircuit.checkConstraints(witness);

//     });

//     it("Should generate an invalid proof for ouragan Circuit if we modify the poseidon nonce", async () => {

//         let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

//         // generate tornado cash deposit note
//         const tcDepositNode = await generateTornadoDepositNote();

//         // create tornado cash merkle tree and add commitment to it
//         const mimcSponge = new MimcSponge();
//         await mimcSponge.prepare();
//         const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
//         tree.insert(tcDepositNode.commitment);
//         const indexCommitment = tree.indexOf(tcDepositNode.commitment);
//         merkleTreeProof = tree.createProof(indexCommitment);

//         // generate shared key 
//         const sharedKey = Keypair.genEcdhSharedKey(
//             buyer.privJubJubKey,
//             seller.pubJubJubKey
//         );

//         // encryption
//         const poseidonNonce = BigInt(Date.now().toString());
//         const encryptedCommitment = encrypt(
//             [tcDepositNode.commitment],
//             sharedKey,
//             poseidonNonce
//         )

//         let invalidInput = {
//             "pathIndices": merkleTreeProof.pathIndices,
//             "siblings": merkleTreeProof.siblings,
//             "root": merkleTreeProof.root,
//             "commitment": tcDepositNode.commitment,
//             "sharedKey": sharedKey,
//             "encryptedCommitment": encryptedCommitment,
//             "poseidonNonce": poseidonNonce + 1n
//         };

//         try {
//             await ouraganCircuit.calculateWitness(invalidInput);
//         } catch (error) {
//             if (error instanceof Error)
//                 assert.include(error.message, 'Ouragan_81 line: 39'); 
//         }
//     });

//     it("Should generate an invalid encryption for ouragan Circuit if we modify the encryption key", async () => {

//         let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

//         // generate tornado cash deposit note
//         const tcDepositNode = await generateTornadoDepositNote();

//         // create tornado cash merkle tree and add commitment to it
//         const mimcSponge = new MimcSponge();
//         await mimcSponge.prepare();
//         const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
//         tree.insert(tcDepositNode.commitment);
//         const indexCommitment = tree.indexOf(tcDepositNode.commitment);
//         merkleTreeProof = tree.createProof(indexCommitment);

//         // generate shared key 
//         const sharedKey = Keypair.genEcdhSharedKey(
//             buyer.privJubJubKey,
//             seller.pubJubJubKey
//         );

//         // encryption
//         const poseidonNonce = BigInt(Date.now().toString());
//         const encryptedCommitment = encrypt(
//             [tcDepositNode.commitment],
//             sharedKey,
//             poseidonNonce
//         )

//         let invalidSharedKey = [sharedKey[0] + 1n, sharedKey[1] + 1n];

//         let invalidInput = {
//             "pathIndices": merkleTreeProof.pathIndices,
//             "siblings": merkleTreeProof.siblings,
//             "root": merkleTreeProof.root,
//             "commitment": tcDepositNode.commitment,
//             "sharedKey": invalidSharedKey,
//             "encryptedCommitment": encryptedCommitment,
//             "poseidonNonce": poseidonNonce
//         };

//         try {
//             await ouraganCircuit.calculateWitness(invalidInput);
//         } catch (error) {
//             if (error instanceof Error)
//                 assert.include(error.message, 'Ouragan_81 line: 39'); 
//         }
//     });

//     it("Should generate an invalid proof for ouragan Circuit if we modify the commitment", async () => {

//         let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

//         // generate tornado cash deposit note
//         const tcDepositNode = await generateTornadoDepositNote();

//         // create tornado cash merkle tree and add commitment to it
//         const mimcSponge = new MimcSponge();
//         await mimcSponge.prepare();
//         const tree = new IncrementalMerkleTree(mimcSponge.hash.bind(mimcSponge), 20, BigInt(0), 2) // Binary tree.
//         tree.insert(tcDepositNode.commitment);
//         const indexCommitment = tree.indexOf(tcDepositNode.commitment);
//         merkleTreeProof = tree.createProof(indexCommitment);

//         // generate shared key 
//         const sharedKey = Keypair.genEcdhSharedKey(
//             buyer.privJubJubKey,
//             seller.pubJubJubKey
//         );

//         // encryption
//         const poseidonNonce = BigInt(Date.now().toString());
//         const encryptedCommitment = encrypt(
//             [tcDepositNode.commitment],
//             sharedKey,
//             poseidonNonce
//         )

//         let invalidInput = {
//             "pathIndices": merkleTreeProof.pathIndices,
//             "siblings": merkleTreeProof.siblings,
//             "root": merkleTreeProof.root,
//             "commitment": tcDepositNode.commitment + 1n,
//             "sharedKey": sharedKey,
//             "encryptedCommitment": encryptedCommitment,
//             "poseidonNonce": poseidonNonce
//         };
        
//         try {
//             await ouraganCircuit.calculateWitness(invalidInput);
//         } catch (error) {
//             if (error instanceof Error)
//                 assert.include(error.message, 'Ouragan_81 line: 29'); 
//         }
//     });


//     it("Should generate a valid proof for ouragan Circuit fetching the tree from tornado cash", async () => {

//         let ouraganCircuit = await wasm_tester(path.join(__dirname, "./circuits", 'ouragan.circom'));

//         // get merkle proof from getLeaves.ts script
//         let commitment = BigInt('550173417481555616092956208123789547983187203983459733958448004877627949054');

//         let pathElements = [
//             BigInt('97860568898289227719632047933602407931351326383301280679316817346717286398'),
//             BigInt('16950207498907065931483353016202514746690694976176073770519376018233335802548'),
//             BigInt('7833458610320835472520144237082236871909694928684820466656733259024982655488'),
//             BigInt('14506027710748750947258687001455876266559341618222612722926156490737302846427'),
//             BigInt('4766583705360062980279572762279781527342845808161105063909171241304075622345'),
//             BigInt('16640205414190175414380077665118269450294358858897019640557533278896634808665'),
//             BigInt('13024477302430254842915163302704885770955784224100349847438808884122720088412'),
//             BigInt('11345696205391376769769683860277269518617256738724086786512014734609753488820'),
//             BigInt('17235543131546745471991808272245772046758360534180976603221801364506032471936'),
//             BigInt('155962837046691114236524362966874066300454611955781275944230309195800494087'),
//             BigInt('14030416097908897320437553787826300082392928432242046897689557706485311282736'),
//             BigInt('12626316503845421241020584259526236205728737442715389902276517188414400172517'),
//             BigInt('6729873933803351171051407921027021443029157982378522227479748669930764447503'),
//             BigInt('12963910739953248305308691828220784129233893953613908022664851984069510335421'),
//             BigInt('8697310796973811813791996651816817650608143394255750603240183429036696711432'),
//             BigInt('9001816533475173848300051969191408053495003693097546138634479732228054209462'),
//             BigInt('13882856022500117449912597249521445907860641470008251408376408693167665584212'),
//             BigInt('6167697920744083294431071781953545901493956884412099107903554924846764168938'),
//             BigInt('16572499860108808790864031418434474032816278079272694833180094335573354127261'),
//             BigInt('11544818037702067293688063426012553693851444915243122674915303779243865603077')
//           ] 

//         let pathIndices = [
//             1, 0, 0, 0, 0, 0, 0,
//             0, 0, 0, 0, 0, 0, 0,
//             0, 0, 0, 0, 0, 0
//           ]

//         let root = BigInt('12850632558948297323019398550793895064492104757983220549124946741667533880646');

//         // generate shared key 
//         const sharedKey = Keypair.genEcdhSharedKey(
//             buyer.privJubJubKey,
//             seller.pubJubJubKey
//         );

//         // encryption
//         const poseidonNonce = BigInt(Date.now().toString());
//         const encryptedCommitment = encrypt(
//             [commitment],
//             sharedKey,
//             poseidonNonce
//         )

//         let input = {
//             "pathIndices": pathIndices,
//             "siblings": pathElements,
//             "root": root,
//             "commitment": commitment,
//             "sharedKey": sharedKey,
//             "encryptedCommitment": encryptedCommitment,
//             "poseidonNonce": poseidonNonce
//         };

//         let witness = await ouraganCircuit.calculateWitness(input);

//         await ouraganCircuit.checkConstraints(witness);

//     });


// });

