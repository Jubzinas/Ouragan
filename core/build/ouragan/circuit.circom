pragma circom 2.0.16;

include "../../circuits/src/ouragan.circom";

component main{ public [ root, encryptedCommitment, poseidonNonce ] } = Ouragan();