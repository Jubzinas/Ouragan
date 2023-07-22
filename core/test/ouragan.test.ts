import { OuraganUser } from '../src/ouraganUser';
import { TornadoMerkleProof, generateTornadoDepositNote, toFixedHex } from '../src/tornadoUtils';
import { utilsCrypto } from 'private-market-utils';
import { encryptCommitment, decryptCommitment } from '../src/poseidonEncryption';
import { generateTornadoMerkleProof } from '../src/tornadoUtils';
import { getCircuitInputs } from '../src/circuitUtils';
import { assert } from 'chai';
import * as circom_tester from 'circom_tester';
const wasm_tester = circom_tester.wasm;
const path = require('path');
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

describe('Tornado Cash Contract Interaction', function () {
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

    // deploy tornado cash contract
    const tornado = await deployTornadoCashContract();

    // sellet executes a deposit to the tornado contract of 1 eth using the commitment shared by the buyer
    const value = '1000000000000000000';

    const leaf: Leaf = {
      commitment: toFixedHex(tcDepositNote.commitment),
      leafIndex: BigInt(0),
    };

    const signer = await ethers.provider.getSigner(0);

    await tornado.deposit(leaf.commitment, { value, from: signer.address });

    // fetch merkle proof for the commitment from the tornado contract.
    // For now there's only one leaf in the contract
    const tcMerkleProof: TornadoMerkleProof = await generateTornadoMerkleProof([leaf], leaf.commitment);

    // generate circuits inputs
    const input = await getCircuitInputs(sharedKey, tcDepositNote, tcMerkleProof);

    let ouraganCircuit = await wasm_tester(path.join(__dirname, './circuits', 'ouragan.circom'));

    // check if witness is valid
    let witness = await ouraganCircuit.calculateWitness(input);

    await ouraganCircuit.checkConstraints(witness);
  });

  // Add: test should fail for wrong encryption
  // Add: test should fail for wrong merkle proof
  // Add: test to actually send the proof to the tornado contract
  // Add: Ouragan tests
});
