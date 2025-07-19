"use client"

import { type ReactNode, useMemo } from "react"
import {
  RainbowKitProvider,
  lightTheme,
  connectorsForWallets,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit"
import { WagmiProvider, createConfig, http, fallback } from "wagmi"
import { polygon, mainnet, Chain } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { safeWallet } from "@rainbow-me/rainbowkit/wallets"

const amoy: Chain = {
  id: 80002,
  name: "Amoy",
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
  const config = useMemo(() => {
    const chains = [polygon, mainnet, amoy] as const
    
    // Create fallback transport for Amoy with multiple RPCs
    const amoyTransport = fallback(
      [
        http('https://rpc-amoy.polygon.technology'),
        http('https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa'),
      ],
      { 
        rank: true, // Try in order
        retryCount: 2, // Max 2 retries per RPC
        retryDelay: 1000 // 1 second base delay
      }
    );
    
    // Get default wallets from RainbowKit
    const { wallets } = getDefaultWallets({
      appName: "Blockchain & Crypto Investing Club",
      projectId: "c36cf795c5c39aee1fe031a681e3f23b",
    });

    // Add Safe wallet to the existing wallet groups
    const walletsWithSafe = [
      {
        groupName: 'Popular',
        wallets: [
          ...wallets[0]?.wallets || [],
          safeWallet, // Add Safe wallet here
        ],
      },
      // Include any other wallet groups that might exist
      ...wallets.slice(1),
    ];

    const connectors = connectorsForWallets(walletsWithSafe, {
      appName: "Blockchain & Crypto Investing Club",
      projectId: "c36cf795c5c39aee1fe031a681e3f23b",
    });

    // Create wagmi config with all connectors including Safe
    return createConfig({
      chains,
      connectors,
      transports: {
        [polygon.id]: http(),
        [mainnet.id]: http(),
        [amoy.id]: amoyTransport, // Use fallback transport for Amoy
      },
      ssr: false,
    });
  }, []);

  return (
    <WagmiProvider config={config}>
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
    </WagmiProvider>
  );
}
