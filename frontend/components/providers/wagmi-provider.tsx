"use client"

import { type ReactNode, useMemo } from "react"
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit"
import { WagmiConfig, createConfig, http } from "wagmi"
import { polygon, mainnet, Chain } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const amoy: Chain = {
  id: 80002,
  name: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc-amoy.polygon.technology/"] },
  },
  blockExplorers: {
    default: { name: "Amoy Polygonscan", url: "https://amoy.polygonscan.com/" },
  },
  testnet: true,
};

const queryClient = new QueryClient()

export function WagmiConfigProvider({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => getDefaultConfig({
    appName: "Blockchain & Crypto Investing Club",
    projectId: "c36cf795c5c39aee1fe031a681e3f23b",
    chains: [polygon, mainnet, amoy],
    transports: {
      [polygon.id]: http(),
      [mainnet.id]: http(),
      [amoy.id]: http(),
    },
    ssr: false,
  }), []);

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#CFB87C',
            accentColorForeground: '#000000',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
          coolMode
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
