import {
    useContractRead
} from 'wagmi';
import { ouraganContractConfig, CHAIN_ID } from '../app.conf';

export const useOuragan = () => {
    
    const { data: depositAmount, error } = useContractRead({
        address: ouraganContractConfig.address,
        abi: ouraganContractConfig.abi,
        functionName: 'depositAmount',
        chainId: CHAIN_ID,
        cacheTime: 2_000,
    });

    const { data: root, error: rootError } = useContractRead({
        address: ouraganContractConfig.address,
        abi: ouraganContractConfig.abi,
        functionName: 'currentRoot',
        chainId: CHAIN_ID,
    });
    
    console.log("Amount: ", depositAmount);

    return {
        depositAmount,
        root
    }

 }