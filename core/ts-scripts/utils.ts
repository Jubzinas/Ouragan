//@ts-ignore
const { toBN } = require('web3-utils');
//@ts-ignore
const merkleTree = require('fixed-merkle-tree');

export interface Leaf { commitment: string, leafIndex: BigInt }
