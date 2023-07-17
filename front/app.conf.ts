import { ouraganABI } from '../core/wagmi-src/generated';
import { ethTornadoABI } from '../core/wagmi-src/generated';
import { transactions as localDeploy } from "../core/broadcast/DeployOuragan.s.sol/11155111/run-latest.json";

export const OURAGAN_ADDRESS = localDeploy[0].contractAddress;

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