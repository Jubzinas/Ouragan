import {processTornadoContract} from './getLeaves';
import { EcdhSharedKey } from 'maci-crypto';
import { encrypt } from "maci-crypto";
import fs from "fs";
import { ethTornadoABI } from '../wagmi-src/generated';

export const getCircuitInput = async (providerUrl: string, contractAddress: string, ABI: any, leafIndex: string, sharedKey: EcdhSharedKey) => {

    const merkleTreeProof = await processTornadoContract(providerUrl, contractAddress, ABI, leafIndex);

    const poseidonNonce = BigInt(Date.now().toString());

    const encryptedCommitment = encrypt(
        [merkleTreeProof.commitmentBigInt],
        sharedKey,
        poseidonNonce
    );

    let input = {
        "pathIndices": merkleTreeProof.pathIndices,
        "siblings": merkleTreeProof.pathElements,
        "root": merkleTreeProof.root,
        "commitment": merkleTreeProof.commitmentBigInt,
        "sharedKey": sharedKey,
        "encryptedCommitment": encryptedCommitment,
        "poseidonNonce": poseidonNonce
    };

    fs.writeFileSync('ts-scripts/out/input.json', JSON.stringify(input));

    return input;
}

const sharedKey = [
    9790190188945995644279630737498733485819393931088880349981265098400668772581n,
    18286988618379781817798860529117663146650780427860094004481797739234017553254n
  ];

getCircuitInput('http://0.0.0.0:8545', '0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD', ethTornadoABI, '0x0137631a3d9cbfac8f5f7492fcfd4f45af982f6f0c8d1edd783c14d81ffffffe', sharedKey)
    .then(() => {
        console.log("input written to ts-scripts/out/input.json");
    })
    .catch(console.error)
    .finally(() => process.exit(0))