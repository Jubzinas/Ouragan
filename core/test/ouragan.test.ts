import { OuraganUser } from '../src/ouraganUser';
import { TornadoMerkleProof, generateTornadoDepositNote, toFixedHex } from '../src/tornadoUtils';
import { utilsCrypto } from 'private-market-utils';
import { encryptCommitment, decryptCommitment } from '../src/poseidonEncryption';
import { generateTornadoMerkleProof } from '../src/tornadoUtils';
import { getCircuitInputs } from '../src/circuitUtils';
import { assert } from 'chai';
import { poseidon2 } from "poseidon-lite/poseidon2"
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

  it('should generate the same hash of the shared key', () => {
    const user1 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const user2 = new OuraganUser(utilsCrypto.getRandomECDSAPrivKey(false));
    const sharedKey1 = user1.generateSharedKeyWith(user2.user);
    const sharedKey2 = user2.generateSharedKeyWith(user1.user);
    const sharedKeyHash1 = user1.generateSharedKeyHash(sharedKey1);
    const sharedKeyHash2 = user2.generateSharedKeyHash(sharedKey2);
    assert.equal(sharedKeyHash1.toString(), sharedKeyHash2.toString());
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
            
    // Evaluate witness to output sharedKeyHash is equal to the poseidon hash of the shared key
    const expectedSharedKeyHash = seller.generateSharedKeyHash(sharedKey);

    await ouraganCircuit.assertOut(witness, {sharedKeyHash: expectedSharedKeyHash})

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
      if (error instanceof Error) assert.include(error.message, 'Ouragan_149 line: 62');
    }
  });
});
