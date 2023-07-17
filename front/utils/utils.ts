//@ts-ignore
const { toBN } = require('web3-utils');
//@ts-ignore
const merkleTree = require('fixed-merkle-tree');
import { Leaf } from "../../core/ts-scripts/utils";

export async function generateMerkleProof(cachedEvents: Leaf[], merkleTreeHeight: number, commitmentHex: string) {
  let leafIndex = -1;
  const leaves = cachedEvents
      .sort((a, b) => Number(a.leafIndex) - Number(b.leafIndex))
      .map((e) => {
          const index = toBN(e.leafIndex.toString(16)).toNumber();
          if (toBN(e.commitment).eq(toBN(commitmentHex))) {
              leafIndex = index;
          }
          return toBN(e.commitment).toString(10);
      });
  const tree = new merkleTree(merkleTreeHeight, leaves);
  const root = tree.root();
  const { pathElements, pathIndices } = tree.path(leafIndex);
  return { root, pathElements, pathIndices };
}