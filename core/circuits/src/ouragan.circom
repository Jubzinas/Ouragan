pragma circom 2.1.6;

include "./encryptionVerifier.circom";
include "./tree.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

template Ouragan() {

    signal input pathIndices[20]; // private
    signal input siblings[20]; // private
    signal input root; // public
    signal input commitment; // private
    signal input sharedKey[2]; // private
    signal input encryptedCommitment[4]; // public
    signal input poseidonNonce; // public 

    var i;

    component encryptionVerifier = EncryptionVerifier();
    component merkleTreeChecker = MerkleTreeChecker(20); // same height as tornado cash

    /* 
      1. Check that the commitment is in the merkle tree 
    */

    merkleTreeChecker.leaf <== commitment;
    merkleTreeChecker.pathElements <== siblings;
    merkleTreeChecker.pathIndices <== pathIndices;
    merkleTreeChecker.root <== root;

    /* 
      2. Check that the encryptedCommitment = Enc(commitment, sharedKey)
    */
    encryptionVerifier.commitment <== commitment;
    encryptionVerifier.sharedKey[0] <== sharedKey[0];
    encryptionVerifier.sharedKey[1] <== sharedKey[1];
    encryptionVerifier.poseidonNonce <== poseidonNonce;
    for(i=0; i<4; i++) {
        encryptionVerifier.encryptedCommitment[i] <== encryptedCommitment[i];
    }

}

