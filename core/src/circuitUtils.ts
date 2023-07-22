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
  tcDepositNote: TornadoDeposit,
  merkleTreeProof: TornadoMerkleProof,
): Promise<OuraganCircuitInput> {
  const encryptedCommitment: EncryptedCommitment = encryptCommitment(tcDepositNote.commitment, sharedKey);

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
