import { TornadoDeposit, TornadoMerkleProof } from './tornadoUtils';
import { encryptCommitment, EncryptedCommitment } from './poseidonEncryption';
import { EcdhSharedKey, Ciphertext } from 'maci-crypto';

export type OuraganCircuitInput = {
  pathIndices: number[];
  siblings: BigInt[];
  root: BigInt;
  commitment: BigInt;
  sharedKey: EcdhSharedKey;
  encryptedCommitment: Ciphertext;
  poseidonNonce: BigInt;
};

export async function getCircuitInputs(
  sharedKey: EcdhSharedKey,
  buyer_commitment: bigint,
  merkleTreeProof: TornadoMerkleProof,
): Promise<OuraganCircuitInput> {
  const encryptedCommitment: EncryptedCommitment = encryptCommitment(buyer_commitment, sharedKey);

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
