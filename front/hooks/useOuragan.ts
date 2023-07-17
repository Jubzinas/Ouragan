import {
    useContractRead
} from 'wagmi';
import { ouraganContractConfig, CHAIN_ID } from '../app.conf';

export const useOuragan = () => {
    
    const { data: depositAmount, error } = useContractRead({
        address: ouraganContractConfig.address,
        abi: ouraganContractConfig.abi,
        functionName: '',
        chainId: CHAIN_ID,
        cacheTime: 2_000,
    });
    console.log(error);
    
    return {
        depositAmount,
    }

 }