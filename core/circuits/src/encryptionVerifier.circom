pragma circom 2.1.6;

include "../lib/poseidon.circom";

template EncryptionVerifier() {

    signal input commitment;
    signal input sharedKey[2];
    signal input encryptedCommitment[4];
    signal input poseidonNonce;

    var i;
    /* 
      Check correctness of encryption, encrypted commitment == poseidonEncryption(commitment, sharedKey, poseidonNonce)
    */
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

component main = EncryptionVerifier(); 
