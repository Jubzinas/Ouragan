// From https://github.com/tornadocash/tornado-core/blob/master/circuits/merkleTree.circom
include "../../node_modules/circomlib/circuits/mimcsponge.circom";

/*
    Computes MiMC([left, right])
*/
template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    component hasher = MiMCSponge(2, 220, 1); // compared to the original, added "220" which is the number of round according to the new version of CircomLib
    hasher.ins[0] <== left;
    hasher.ins[1] <== right;
    hasher.k <== 0;
    hash <== hasher.outs[0];
}
/*
    if s == 0 returns [in[0], in[1]]
    if s == 1 returns [in[1], in[0]]
*/
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

/*
    Inputs:
    ---------
    - leaf: leaf that we want to prove inclusion in a merkle tree
    - root: root of the merkle tree
    - pathElements[levels]: sibling elements on the merkle path
    - pathIndices[levels]: binary selector that indicates whether given element in pathElements is on the left or right side of merkle path

    Parameters:
    ------------
    - levels: number of levels in the merkle tree

    Functionality:
    --------------
    1. Verifies that the leaf is in the merkle tree with the given root 
*/
template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component selectors[levels];
    component hashers[levels];

    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf : hashers[i - 1].hash;
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = HashLeftRight();
        hashers[i].left <== selectors[i].out[0];
        hashers[i].right <== selectors[i].out[1];
    }

    root === hashers[levels - 1].hash;
}