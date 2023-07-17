import { tornadoContractConfig } from "@/app.conf";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export const useTornadoLeaves = () => {
    const provider = new ethers.JsonRpcProvider('http://0.0.0.0:8545');
    const tornadoContract = new ethers.Contract(tornadoContractConfig.address, tornadoContractConfig.abi, provider);
    const [leaves, setleaves] = useState<undefined | any[]>();
    useEffect(() => {
        (async () => {
            const logs = await tornadoContract.queryFilter("Deposit")
            const commitments: any[] = [];
            logs.forEach((log) => {
                // @ts-ignore
                const commitment = log.args.commitment;
                commitments.push(commitment);
            })
            setleaves(commitments);
        })()
    }, [])
    return leaves;
}