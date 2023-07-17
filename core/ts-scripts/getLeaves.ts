import { ethTornadoABI } from '../wagmi-src/generated';
import { EventLog, Log, ethers } from 'ethers';
import fs from "fs";

export const main = async () => {
    const provider = new ethers.JsonRpcProvider('http://0.0.0.0:8545');
    const contract = new ethers.Contract('0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD', ethTornadoABI, provider);
    const logs = await contract.queryFilter("Deposit")
    const commitments: any[] = [];
    logs.forEach((log) => {
        // @ts-ignore
        const commitment = log.args.commitment;
        commitments.push(commitment);
    })
    fs.writeFileSync('ts-scripts/out/commitments.json', JSON.stringify(commitments));
}

main()
    .then(() => console.log('Done'))
    .catch(console.error)
    .finally(() => process.exit(0))