import { ouraganABI } from '../core/wagmi-src/generated';
import { ethTornadoABI } from '../core/wagmi-src/generated';

export const OURAGAN_ADDRESS =
    '0xa01094a9397659fc396c35b0a1a7be3bdab98e00';
export const CHAIN_ID = 31337;
export const RPC_URL = 'http://localhost:8545';
export const tornadoContractConfig = {
    address: '0x23D8b4Dc62327Ee727d1E11feb43CaC656C500bD',
    abi: ethTornadoABI,
    chainId: CHAIN_ID,
};
export const ouraganContractConfig = {
    address: OURAGAN_ADDRESS as `0x${string}`,
    abi: ouraganABI,
    chainId: CHAIN_ID,
};