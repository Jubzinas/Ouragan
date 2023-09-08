pragma circom 2.1.6;

include "../lib/poseidon.circom";

/*
    Inputs:
    ---------
    - commitment : commitment that the seller claims to have added to the Tornado Cash Merkle Tree
    - sharedKey[2] : DH shared key between the seller and the buyer
    - encryptedCommitment[4]: Poseidon encryption of the commitment with the shared key and a nonce
    - poseidonNonce: nonce used in the Poseidon encryption

    Functionality:
    --------------
    1. Enforce correctness of encryption, encryptedCommitment == poseidonEncryption(commitment, sharedKey, poseidonNonce)
*/
template EncryptionVerifier() {

    signal input commitment;
    signal input sharedKey[2];
    signal input encryptedCommitment[4];
    signal input poseidonNonce;

    var i;

    component poseidonEncryptCheck = PoseidonEncryptCheck(1);
    
    poseidonEncryptCheck.nonce <== poseidonNonce;
    for(i=0; i<4; i++) {
        poseidonEncryptCheck.ciphertext[i] <== encryptedCommitment[i];
    }
    poseidonEncryptCheck.message[0] <== commitment;
    poseidonEncryptCheck.key[0] <== sharedKey[0];
    poseidonEncryptCheck.key[1] <== sharedKey[1];

    poseidonEncryptCheck.out === 1;
    
}

