import { ethTornadoABI } from '../wagmi-src/generated';
import { ethers } from 'ethers';
import fs from "fs";
//@ts-ignore
const { toBN } = require('web3-utils');
//@ts-ignore
const merkleTree = require('fixed-merkle-tree');

export type Leaf = { commitment: string, leafIndex: BigInt }

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};


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

export const main = async () => {
    const provider = new ethers.JsonRpcProvider('http://0.0.0.0:8545');
    const contract = new ethers.Contract('0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD', ethTornadoABI, provider);
    const logs = await contract.queryFilter("Deposit")
    const leaves: Leaf[] = [];
    logs.forEach((log) => {
        const leaf = {
            // @ts-ignore
            commitment: log.args.commitment,
            // @ts-ignore
            leafIndex: log.args.leafIndex,
        }
        leaves.push(leaf);
    })
    const { root, pathElements, pathIndices } = await generateMerkleProof(leaves, 20, '0x0137631a3d9cbfac8f5f7492fcfd4f45af982f6f0c8d1edd783c14d81ffffffe')
    console.log(root, pathElements, pathIndices);
    const curRoot = await contract.getLastRoot()
    console.log(BigInt(curRoot));
    
    fs.writeFileSync('ts-scripts/out/commitments.json', JSON.stringify(leaves));
}

main()
    .then(() => console.log('Done'))
    .catch(console.error)
    .finally(() => process.exit(0))