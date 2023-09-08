import { EcdhSharedKey, encrypt, decrypt, Ciphertext, Plaintext } from 'maci-crypto';

export type EncryptedCommitment = {
  encryptedData: Ciphertext;
  nonce: bigint;
};

export function encryptCommitment(commitment: bigint, sharedKey: EcdhSharedKey): EncryptedCommitment {
  const poseidonNonce = BigInt(Date.now().toString());
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
