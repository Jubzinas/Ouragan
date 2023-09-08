import { buildBabyjub, buildPedersenHash } from 'circomlibjs';
import * as crypto from 'crypto';
const utils = require('ffjavascript').utils;
import { ethers } from 'ethers';
import { ethTornadoABI } from './abi/tornado';
import { toBN } from 'web3-utils';
const merkleTree = require('fixed-merkle-tree');

export type TornadoDeposit = {
  secret: bigint;
  nullifier: bigint;
  commitment: bigint;
};

export type Leaf = {
  commitment: string;
  leafIndex: bigint;
};

export type TornadoMerkleProof = {
  root: bigint;
  pathElements: bigint[];
  pathIndices: number[];
  commitmentBigInt: bigint;
};

export function toFixedHex(number: any, length = 32): string {
  return (
    '0x' +
    BigInt(number)
      .toString(16)
      .padStart(length * 2, '0')
  );
}

export async function generateTornadoDepositNote(): Promise<TornadoDeposit> {
  const secret = rbigint(31);
  const nullifier = rbigint(31);

  const preimage = Buffer.concat([utils.leInt2Buff(nullifier, 31), utils.leInt2Buff(secret, 31)]);
  const babyJub = await buildBabyjub();
  const pedersen = await buildPedersenHash();

  const pedersenHash = (data: any) => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0]);
  const commitment = pedersenHash(preimage);

  return {
    secret,
    nullifier,
    commitment,
  };
}

function rbigint(nbytes: number): bigint {
  return utils.leBuff2int(crypto.randomBytes(nbytes));
}

async function getTornadoEvents(providerUrl: string, tornadoCashContractAddress: string): Promise<Leaf[]> {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const tornadoContract = new ethers.Contract(tornadoCashContractAddress, ethTornadoABI, provider);
  const logs = await tornadoContract.queryFilter('Deposit');
  const leaves: Leaf[] = [];
  logs.forEach((log) => {
    const leaf = {
      // @ts-ignore
      commitment: log.args[0],
      // @ts-ignore
      leafIndex: log.args[1],
    };
    leaves.push(leaf);
  });
  return leaves;
}

export async function generateTornadoMerkleProof(
  cachedLeaves: Leaf[],
  commitmentHex: string,
): Promise<TornadoMerkleProof> {
  let leafIndex = -1;
  let commitmentBigInt = BigInt(0);
  const leaves = cachedLeaves
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
  const tree = new merkleTree(20, leaves);
  const root: bigint = tree.root();
  const { pathElements, pathIndices } = tree.path(leafIndex);
  return { root, pathElements, pathIndices, commitmentBigInt };
}
