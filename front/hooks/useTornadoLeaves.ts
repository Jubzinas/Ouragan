import { tornadoContractConfig } from "@/app.conf";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Leaf } from "../../core/ts-scripts/utils";

export const useTornadoLeaves = () => {
    const provider = new ethers.JsonRpcProvider('http://0.0.0.0:8545');
    const tornadoContract = new ethers.Contract(tornadoContractConfig.address, tornadoContractConfig.abi, provider);
    const [leaves, setleaves] = useState<undefined | Leaf[]>();
    useEffect(() => {
        (async () => {
            const logs = await tornadoContract.queryFilter("Deposit")
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
            setleaves(leaves);
        })()
    }, [])
    return leaves;
}