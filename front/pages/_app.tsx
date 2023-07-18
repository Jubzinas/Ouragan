import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, configureChains, createConfig, sepolia } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { RPC_URL, CHAIN_ID } from '@/app.conf';
import { foundry } from 'wagmi/chains';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia, sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: RPC_URL,
      }),
    }),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: "https://sepolia.infura.io/v3/43f0351332fb4475a9cfed0886a71bc2",
      }),
    }),
  ]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});


export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <Component {...pageProps} />
    </WagmiConfig>
  )
}
