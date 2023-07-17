pragma circom 2.1.6;

include "./encryptionVerifier.circom";
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
    component merkleTreeInclusionProof = MerkleTreeInclusionProof(20); // same height as tornado cash

    /* 
      1. Check that the commitment is in the merkle tree 
    */

    merkleTreeInclusionProof.leaf <== commitment;
    merkleTreeInclusionProof.siblings <== siblings;
    merkleTreeInclusionProof.pathIndices <== pathIndices;
    merkleTreeInclusionProof.root <== root;



}


template MerkleTreeInclusionProof(nLevels) {

    signal input leaf;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];
    signal input root;

    component poseidons[nLevels];
    component mux[nLevels];

    signal hashes[nLevels + 1];
    hashes[0] <== leaf;

    for (var i = 0; i < nLevels; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        poseidons[i] = Poseidon(2);
        mux[i] = MultiMux1(2);

        mux[i].c[0][0] <== hashes[i];
        mux[i].c[0][1] <== siblings[i];

        mux[i].c[1][0] <== siblings[i];
        mux[i].c[1][1] <== hashes[i];

        mux[i].s <== pathIndices[i];

        poseidons[i].inputs[0] <== mux[i].out[0];
        poseidons[i].inputs[1] <== mux[i].out[1];

        hashes[i + 1] <== poseidons[i].out;
    }

    root === hashes[nLevels];
}

