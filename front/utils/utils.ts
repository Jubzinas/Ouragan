//@ts-ignore
const { toBN } = require('web3-utils');
//@ts-ignore
const merkleTree = require('fixed-merkle-tree');
import { Leaf } from "../../core/src/tornadoUtils";

export async function generateMerkleProof(cachedEvents: Leaf[], merkleTreeHeight: number, commitmentHex: string) {
    let leafIndex = -1;
    let commitmentBigInt = BigInt(0);
    const leaves = cachedEvents
        .sort((a, b) => Number(a.leafIndex) - Number(b.leafIndex))
        .map((e) => {
            const index = toBN(e.leafIndex.toString(16)).toNumber();
            const commitment = toBN(e.commitment);
            if (commitment.eq(toBN(commitmentHex))) {
                leafIndex = index;
                commitmentBigInt = BigInt(commitment.toString(10)); // convert commitment to BigInt
            }
            return commitment.toString(10);
        });
    const tree = new merkleTree(merkleTreeHeight, leaves);
    const root = tree.root();
    const { pathElements, pathIndices } = tree.path(leafIndex);
    return { root, pathElements, pathIndices, commitmentBigInt };
  }
  