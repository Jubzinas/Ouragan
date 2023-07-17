import { ouraganABI } from '../core/wagmi-src/generated';

export const OURAGAN_ADDRESS =
    '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';
export const CHAIN_ID = 31337;
export const RPC_URL = 'http://localhost:8545';

export const ouraganContractConfig = {
    address: OURAGAN_ADDRESS as `0x${string}`,
    abi: ouraganABI,
    chainId: CHAIN_ID,
};