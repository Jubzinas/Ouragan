import { EcdhSharedKey, encrypt, decrypt, Ciphertext, Plaintext } from 'maci-crypto';

export type EncryptedCommitment = {
  encryptedData: Ciphertext;
  nonce: bigint;
};

export function encryptCommitment(
  commitment: bigint | string, 
  sharedKey: EcdhSharedKey, 
  poseidonNonce?: bigint
): EncryptedCommitment {

  // If poseidonNonce is not provided, default to the current time
  poseidonNonce = poseidonNonce || BigInt(Date.now().toString());

  if (typeof commitment === 'string') {
    commitment = BigInt(commitment);
  }

  const encryptedData = encrypt([commitment], sharedKey, poseidonNonce);
  return {
    encryptedData,
    nonce: poseidonNonce,
  };
}


export function decryptCommitment(encrypted: EncryptedCommitment, sharedKey: EcdhSharedKey): Plaintext {
  const decrypted = decrypt(encrypted.encryptedData, sharedKey, encrypted.nonce, 1);
  if (decrypted.length !== 1) {
    throw new Error('Decryption failed or produced unexpected output size');
  }
  return decrypted;
}
