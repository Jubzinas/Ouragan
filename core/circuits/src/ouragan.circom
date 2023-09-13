pragma circom 2.1.6;

include "./encryptionVerifier.circom";
include "./tree.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

/*
  Inputs:
  ---------
  - commitment: commitment that the seller claims to be included in the TC Merkle Tree
  - root: root of the TC Merkle Tree 
  - siblings[20] : siblings of the commitment in the TC Merkle Tree
  - pathIndices[20] : binary array indicating  whether given element in pathElements is on the left or right side of merkle path
  - sharedKey[2] : DH shared key between the seller and the buyer
  - encryptedCommitment[4]: Poseidon encryption of the commitment with the shared key and a nonce
  - poseidonNonce: nonce used in the Poseidon encryption

  Output:
  ---------
  - sharedKeyHash: poseidon hash of the shared key

  Functionality:
  --------------
  1. Check that the commitment is in the merkle tree 
  2. Check that the encryptedCommitment = Enc(commitment, sharedKey)
  3. Perform a poseidon hash of the shared key and return it
*/
template Ouragan() {

    signal input commitment; // private
    signal input root; // public
    signal input siblings[20]; // private
    signal input pathIndices[20]; // private
    signal input sharedKey[2]; // private
    signal input encryptedCommitment[4]; // public
    signal input poseidonNonce; // public 

    signal output sharedKeyHash; // public

    var i;

    component encryptionVerifier = EncryptionVerifier();
    component merkleTreeChecker = MerkleTreeChecker(20); // same height as tornado cash

    /* 
      1. 
    */

    merkleTreeChecker.leaf <== commitment;
    merkleTreeChecker.pathElements <== siblings;
    merkleTreeChecker.pathIndices <== pathIndices;
    merkleTreeChecker.root <== root;

    /* 
      2.
    */
    encryptionVerifier.commitment <== commitment;
    encryptionVerifier.sharedKey[0] <== sharedKey[0];
    encryptionVerifier.sharedKey[1] <== sharedKey[1];
    encryptionVerifier.poseidonNonce <== poseidonNonce;
    for(i=0; i<4; i++) {
        encryptionVerifier.encryptedCommitment[i] <== encryptedCommitment[i];
    }

    /* 
      3.
    */
    component poseidonHasher = Poseidon(2);
    poseidonHasher.inputs[0] <== sharedKey[0];
    poseidonHasher.inputs[1] <== sharedKey[1];

    sharedKeyHash <== poseidonHasher.out;

}

