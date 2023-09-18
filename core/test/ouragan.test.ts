import { OuraganUser } from '../src/ouraganUser';
import { TornadoMerkleProof, generateTornadoDepositNote, toFixedHex } from '../src/tornadoUtils';
import { utilsCrypto } from 'private-market-utils';
import { encryptCommitment, decryptCommitment } from '../src/poseidonEncryption';
import { generateTornadoMerkleProof } from '../src/tornadoUtils';
import { getCircuitInputs, generateWitness, convertProofToSolidityCalldata} from '../src/circuitUtils';
import { assert, expect} from 'chai';
import * as circom_tester from 'circom_tester';
const wasm_tester = circom_tester.wasm;
const path = require('path');
const snarkjs = require('snarkjs');
import fs from 'fs';
import { Leaf } from '../src/tornadoUtils';

describe('Ouragan User Class Tests', () => {
  it('should instantiate with a provided private key', () => {
    const privKey = BigInt(123456789);
    const user = new OuraganUser(privKey);
    assert.ok(user);
  });

  it('should instantiate without a provided private key', () => {
    const user = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));

    assert.ok(user);
  });

  it('should generate a shared key with another user', () => {
    const user1 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const user2 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const sharedKey1 = user1.generateSharedKeyWith(user2.user);
    const sharedKey2 = user2.generateSharedKeyWith(user1.user);
    assert.equal(sharedKey1.toString(), sharedKey2.toString());
  });
});

describe('Poseidon Encryption Class Test', () => {
  it('should encrypt a commitment', async () => {
    const user1 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const user2 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const deposit = await generateTornadoDepositNote();
    const sharedKey = user1.generateSharedKeyWith(user2.user);
    const encryptedCommitment = encryptCommitment(deposit.commitment, sharedKey);
    assert.ok(encryptedCommitment);
  });

  it('Should verify commitment == Dec(Enc(commitment))', async () => {
    const user1 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const user2 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const deposit = await generateTornadoDepositNote();
    const sharedKey = user1.generateSharedKeyWith(user2.user);
    const encryptedCommitment = encryptCommitment(deposit.commitment, sharedKey);
    const decryptedCommitment = decryptCommitment(encryptedCommitment, sharedKey);
    assert.equal(decryptedCommitment.toString(), deposit.commitment.toString());
  });
});

describe('Circuit Proof + Tornado Cash Contract Interaction Test', function () {
  async function deployTornadoCashContract() {
    const Verifier = await ethers.getContractFactory('Verifier');
    const verifier = await Verifier.deploy();

    const data = fs.readFileSync('./contracts/hasher.json', 'utf8');
    const contractData = JSON.parse(data);

    const Hasher = await ethers.getContractFactory(contractData.abi, contractData.bytecode);
    const hasher = await Hasher.deploy();

    const denomination = '1000000000000000000'; // 1 ETH, for instance
    const merkleTreeHeight = 20; // An example value

    const Tornado = await ethers.getContractFactory('ETHTornado');
    const tornado = await Tornado.deploy(verifier.target, hasher.target, denomination, merkleTreeHeight);
    return tornado;
  }

  it("Seller should be able to generate a valid proof of deposit to tornado using buyer's commitment", async function () {
    const seller = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const buyer = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const sharedKey = seller.generateSharedKeyWith(buyer.user);

    // buyer generates a deposit note and shares only the commitment with the seller
    const tcDepositNote = await generateTornadoDepositNote();

    const buyer_commitment = tcDepositNote.commitment;

    // deploy tornado cash contract
    const tornado = await deployTornadoCashContract();

    // seller executes a deposit to the tornado contract of 1 eth using the commitment shared by the buyer
    const value = '1000000000000000000';

    const commitment = toFixedHex(tcDepositNote.commitment);

    const signer = await ethers.provider.getSigner(0);

    await tornado.deposit(commitment, { value, from: signer.address });

    const leaf: Leaf = {
      commitment,
      leafIndex: BigInt(0),
    };
    // fetch merkle proof for the commitment from the tornado contract.
    // For now there's only one leaf in the contract
    const tcMerkleProof: TornadoMerkleProof = await generateTornadoMerkleProof([leaf], leaf.commitment);

    // generate circuits inputs. The seller is trying to prove that the he deposited to the Tornado Cash Contract 
    // using the commitment shared by the buyer. The circuit should pass.
    const input = await getCircuitInputs(sharedKey, buyer_commitment, tcMerkleProof);

    let ouraganCircuit = await wasm_tester(path.join(__dirname, './circuits', 'ouragan.circom'));

    // check if witness is valid
    let witness = await ouraganCircuit.calculateWitness(input);

    await ouraganCircuit.checkConstraints(witness);
  });

  it('Seller should not be able to generate a valid proof of deposit to tornado if using another commitment', async function () {
    const seller = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const buyer = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const sharedKey = seller.generateSharedKeyWith(buyer.user);

    // buyer generates a deposit note and shares only the commitment with the seller
    const tcDepositNote = await generateTornadoDepositNote();

    const buyer_commitment = tcDepositNote.commitment;

    // deploy tornado cash contract
    const tornado = await deployTornadoCashContract();

    // seller executes a deposit to the tornado contract of 1 eth a commitment different from the one shared by the buyer
    const value = '1000000000000000000';

    const invalidCommitment = toFixedHex(42);

    const signer = await ethers.provider.getSigner(0);

    await tornado.deposit(invalidCommitment, { value, from: signer.address });

    // This is the leaf that was added to the Tornado Cash Tree in the Smart Contract
    const leaf: Leaf = {
      commitment: invalidCommitment,
      leafIndex: BigInt(0),
    };

    // fetch merkle proof for the commitment from the tornado contract.
    // For now there's only one leaf in the contract
    const tcMerkleProof: TornadoMerkleProof = await generateTornadoMerkleProof([leaf], leaf.commitment);

    // generate circuits inputs. The seller is trying to prove that the he deposited to the Tornado Cash Contract 
    // using the commitment shared by the buyer, but he actually used another commitment. The circuit should fail
    const input = await getCircuitInputs(sharedKey, buyer_commitment, tcMerkleProof);

    let ouraganCircuit = await wasm_tester(path.join(__dirname, './circuits', 'ouragan.circom'));

    try {
      await ouraganCircuit.calculateWitness(input);
    } catch (error) {
      if (error instanceof Error) assert.include(error.message, 'Ouragan_81 line: 55');
    }
  });
});

describe('Ouragan Contract', () => {
  async function deployOuragan() {
    const Verifier = await ethers.getContractFactory('Verifier');
    const verifier = await Verifier.deploy();

    const data = fs.readFileSync('./contracts/hasher.json', 'utf8');
    const contractData = JSON.parse(data);

    const Hasher = await ethers.getContractFactory(contractData.abi, contractData.bytecode);
    const hasher = await Hasher.deploy();

    const denomination = '1000000000000000000'; // 1 ETH, for instance
    const merkleTreeHeight = 20; // An example value

    const Tornado = await ethers.getContractFactory('ETHTornado');
    const tornado = await Tornado.deploy(verifier.target, hasher.target, denomination, merkleTreeHeight);

    const OuraganVerifier = await ethers.getContractFactory('OuraganVerifier');
    const ouraganVerifier = await OuraganVerifier.deploy();

    const Ouragan = await ethers.getContractFactory('Ouragan');
    const ouragan = await Ouragan.deploy(ouraganVerifier.target, tornado.target, denomination);

    return { tornado, ouragan };
  }

  it('Should deploy the Ouragan Contract Correctly', async () => {
    const { tornado, ouragan } = await deployOuragan();
    assert.ok(tornado);
    assert.ok(ouragan);
  });

  it('Should accept a valid Ask', async () => {
    const { tornado, ouragan } = await deployOuragan();

    const seller = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));

    const depositPrice = '800000000000000000'; // 0.8 ETH

    const depositorPubKey = seller.user.pubJubJubKey.rawPubKey;

    await ouragan.ask(depositPrice, depositorPubKey);

    const depositPriceFromContract = await ouragan.depositPrice();

    expect(depositPriceFromContract.toString()).to.equal(depositPrice);

    const depositorPubKeyXFromContract = await ouragan.depositorPubkey(0);
    const depositorPubKeyYFromContract = await ouragan.depositorPubkey(1);

    expect(depositorPubKeyXFromContract.toString()).to.equal(depositorPubKey[0].toString());
    expect(depositorPubKeyYFromContract.toString()).to.equal(depositorPubKey[1].toString());
  });

  it('Should refuse an Ask with a deposit price greater than the deposit amount', async () => {
    const { tornado, ouragan } = await deployOuragan();

    const seller = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));

    const depositPrice = '1100000000000000000'; // 1.1 ETH

    const depositorPubKey = seller.user.pubJubJubKey.rawPubKey;

    await expect(ouragan.ask(depositPrice, depositorPubKey)).to.be.revertedWith('Ouragan: deposit price must be less or equal to deposit amount');
  });

  it('Should accept a valid Order', async () => {
    const { tornado, ouragan } = await deployOuragan();

    const seller = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));

    const depositPrice = '800000000000000000'; // 0.8 ETH

    const depositorPubKey = seller.user.pubJubJubKey.rawPubKey;

    await ouragan.ask(depositPrice, depositorPubKey);

    const buyer = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false)); // Buyer generates a new keypair

    const buyerPubKey = buyer.user.pubJubJubKey.rawPubKey;

    const sharedKey = buyer.generateSharedKeyWith(seller.user); // Buyer generates a shared key with the seller

    const deposit = await generateTornadoDepositNote(); // Buyer generates a deposit note

    const encryptedCommitment = encryptCommitment(deposit.commitment, sharedKey); // Buyer encrypts the commitment with the shared key

    // Buyer performs the order 
    await ouragan.order(encryptedCommitment.encryptedData, buyer.user.pubJubJubKey.rawPubKey, encryptedCommitment.nonce,
    {
      value: depositPrice
    });

    const encryptedCommitmentFromContract0 = await ouragan.encryptedCommitment(0);
    const encryptedCommitmentFromContract1 = await ouragan.encryptedCommitment(1);
    const encryptedCommitmentFromContract2 = await ouragan.encryptedCommitment(2);
    const encryptedCommitmentFromContract3 = await ouragan.encryptedCommitment(3);

    expect(encryptedCommitmentFromContract0.toString()).to.equal(encryptedCommitment.encryptedData[0].toString());
    expect(encryptedCommitmentFromContract1.toString()).to.equal(encryptedCommitment.encryptedData[1].toString());
    expect(encryptedCommitmentFromContract2.toString()).to.equal(encryptedCommitment.encryptedData[2].toString());
    expect(encryptedCommitmentFromContract3.toString()).to.equal(encryptedCommitment.encryptedData[3].toString());

    const nonceFromContract = await ouragan.nonce();
    expect (nonceFromContract.toString()).to.equal(encryptedCommitment.nonce.toString());

    const buyerPubKeyXFromContract = await ouragan.withdrawerPubkey(0);
    const buyerPubKeyYFromContract = await ouragan.withdrawerPubkey(1);

    expect(buyerPubKeyXFromContract.toString()).to.equal(buyerPubKey[0].toString());
    expect(buyerPubKeyYFromContract.toString()).to.equal(buyerPubKey[1].toString());

  });

  it('Should refuse an Order with a value attached that is different from the deposit price', async () => {
    const { tornado, ouragan } = await deployOuragan();

    const seller = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));

    const depositPrice = '800000000000000000'; // 0.8 ETH

    const depositorPubKey = seller.user.pubJubJubKey.rawPubKey;

    await ouragan.ask(depositPrice, depositorPubKey);

    const buyer = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false)); // Buyer generates a new keypair

    const sharedKey = buyer.generateSharedKeyWith(seller.user); // Buyer generates a shared key with the seller

    const deposit = await generateTornadoDepositNote(); // Buyer generates a deposit note

    const encryptedCommitment = encryptCommitment(deposit.commitment, sharedKey); // Buyer encrypts the commitment with the shared key

    const invalidPrice = '700000000000000000'; // 0.7 ETH

    await expect(ouragan.order(encryptedCommitment.encryptedData, buyer.user.pubJubJubKey.rawPubKey, encryptedCommitment.nonce,
      {
        value: invalidPrice
      })).to.be.revertedWith('Ouragan: value to be sent must be equal to deposit price');
  });

  it('Should complete a full flow', async () => {
    const { tornado, ouragan } = await deployOuragan();

    const seller = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));

    const depositPrice = '800000000000000000'; // 0.8 ETH

    const depositorPubKey = seller.user.pubJubJubKey.rawPubKey;

    await ouragan.ask(depositPrice, depositorPubKey); // Seller performs ask

    const buyer = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false)); // Buyer generates a new keypair

    const sharedKey = buyer.generateSharedKeyWith(seller.user); // Buyer generates a shared key with the seller

    const tcDepositNote = await generateTornadoDepositNote(); // Buyer generates a deposit note

    const commitment = toFixedHex(tcDepositNote.commitment);

    const encryptedCommitment = encryptCommitment(commitment, sharedKey); // Buyer encrypts the commitment with the shared key

    // Buyer performs the order 
    await ouragan.order(encryptedCommitment.encryptedData, buyer.user.pubJubJubKey.rawPubKey, encryptedCommitment.nonce,
    {
      value: depositPrice
    });

    // Seller decrypts the commitment
    const decryptedCommitment = decryptCommitment(encryptedCommitment, sharedKey);
    
    const decryptCommitmentToHex = toFixedHex(decryptedCommitment);

    // Seller performs the deposit of 1 ETH to the Tornado Cash Contract using the commitment of the buyer
    await tornado.deposit(decryptCommitmentToHex, { value: '1000000000000000000' });

    // Seller should now be able to generate a proof that he/she performed a deposit to the Tornado Cash Contract using the commitment of the buyer and withdraw the funds
    // Time to generate the proof..

    // fetch merkle proof for the commitment from the tornado contract.
    // For now there's only one leaf in the contract
    const leaf: Leaf = {
      commitment: decryptCommitmentToHex,
      leafIndex: BigInt(0),
    };

    const tcMerkleProof: TornadoMerkleProof = await generateTornadoMerkleProof([leaf], leaf.commitment);

    const input = await getCircuitInputs(sharedKey, BigInt(decryptCommitmentToHex), tcMerkleProof, encryptedCommitment.nonce);

    // generate witness
    const witness_path = "build/ouragan/witness.wtns";
    const wasm_path = "build/ouragan/circuit.wasm";

    await generateWitness(input, witness_path, wasm_path);

    // generate proof
    const zkey_path = "build/ouragan/circuit_final.zkey";
    const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_path, witness_path);

    // convert proof to solidity calldata
    const solidityCallData = await convertProofToSolidityCalldata(proof, publicSignals);

    // fill the order with the valid proof 
    await ouragan.fill(solidityCallData.a, solidityCallData.b, solidityCallData.c, solidityCallData.pubSignals);
  });
});
