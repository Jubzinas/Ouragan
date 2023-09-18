import { TornadoDeposit, TornadoMerkleProof } from './tornadoUtils';
import { encryptCommitment, EncryptedCommitment } from './poseidonEncryption';
import { EcdhSharedKey, Ciphertext } from 'maci-crypto';
const wc = require('../build/ouragan/ouragan_js/witness_calculator');
const snarkjs = require('snarkjs');
import fs from 'fs';

export type OuraganCircuitInput = {
  pathIndices: number[];
  siblings: BigInt[];
  root: BigInt;
  commitment: BigInt;
  sharedKey: EcdhSharedKey;
  encryptedCommitment: Ciphertext;
  poseidonNonce: BigInt;
};

export async function generateWitness (
  circuitInputs: OuraganCircuitInput,
  witness_path: string,
  wasm_path: string,
  ) {
  const buffer = fs.readFileSync(wasm_path);
  const witnessCalculator = await wc(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(circuitInputs, 0);
  fs.writeFileSync(witness_path, buff);
};

export async function getCircuitInputs(
  sharedKey: EcdhSharedKey,
  buyer_commitment: bigint,
  merkleTreeProof: TornadoMerkleProof,
  poseidonNonce?: bigint
): Promise<OuraganCircuitInput> {
  const encryptedCommitment: EncryptedCommitment = encryptCommitment(buyer_commitment, sharedKey, poseidonNonce);

  return {
    pathIndices: merkleTreeProof.pathIndices,
    siblings: merkleTreeProof.pathElements,
    root: merkleTreeProof.root,
    commitment: merkleTreeProof.commitmentBigInt,
    sharedKey,
    encryptedCommitment: encryptedCommitment.encryptedData,
    poseidonNonce: encryptedCommitment.nonce,
  };
}

export async function convertProofToSolidityCalldata(
  proof: any,
  publicSignals: any,
): Promise<{ a: any; b: any; c: any; pubSignals: any }> {
  
  const solidityCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

  const argv = solidityCallData
    .replace(/["[\]\s]/g, "")
    .split(",")

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const pubSignals = [];

  for (let i = 8; i < argv.length; i++) {
    pubSignals.push(argv[i]);
  }

  return { a, b, c, pubSignals };
}

