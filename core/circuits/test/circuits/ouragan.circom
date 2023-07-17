pragma circom 2.0.16;

include "../../src/ouragan.circom";

component main{ public [ root, encryptedCommitment, poseidonNonce ] } = Ouragan();