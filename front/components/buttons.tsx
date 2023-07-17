import { CHAIN_ID, ouraganContractConfig } from '@/app.conf';
import {
    useAccount,
    useConnect,
    useNetwork,
    useSwitchNetwork,
} from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useContractWrite } from "wagmi";

export const ConnectWallet: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connect, data, reset, variables, status } = useConnect({
        connector: new InjectedConnector(),
        chainId: CHAIN_ID,
    });

    const { chain } = useNetwork();

    const { switchNetwork } = useSwitchNetwork({
        chainId: CHAIN_ID,
    });

    const buttonText = isConnected
        ? chain?.id == CHAIN_ID
            ? address?.slice(0, 10) + '...'
            : 'Switch Network'
        : 'Connect Wallet';

    const clickFn = isConnected
        ? chain?.id == CHAIN_ID
            ? () => { }
            : () => switchNetwork?.()
        : () => connect({ chainId: CHAIN_ID });

    return (
        <button
            disabled={isConnected && data?.chain.id == CHAIN_ID}
            className="hover:bg-gray-200 border-2 border-[#9f9f9f] white-background py-1 px-4"
            onClick={clickFn}
        >
            {buttonText}
        </button>
    );
};


interface ActionButtonProps {
    actionText: string;
    args: any[];
    functionName: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ functionName, actionText, args }) => {
    const { address, isConnected } = useAccount();
    const { write } = useContractWrite({
        address: ouraganContractConfig.address,
        abi: ouraganContractConfig.abi,
        functionName: functionName,
    })
    return (
        <>
            {
                isConnected ?
                    <></>
                    :
                    <button
                        onClick={() => write({ args: args })}
                        className="hover:bg-gray-200 border-2 border-[#9f9f9f] white-background py-1 px-4"
                    >
                        {actionText}
                    </button>
            }
        </>
    );
}