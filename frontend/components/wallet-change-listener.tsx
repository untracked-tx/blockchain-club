"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { toast } from "@/hooks/use-toast";

export function WalletChangeListener() {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("🔄 Wallet accounts changed:", accounts);
      
      if (accounts.length === 0) {
        // Wallet disconnected
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected. Please reconnect to continue.",
          variant: "destructive",
        });
      } else if (isConnected && address && accounts[0] !== address) {
        // Account switched
        toast({
          title: "Wallet Account Changed",
          description: "Your wallet account has changed. The page will refresh to update your data.",
        });
        
        // Small delay to let the toast show, then refresh
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log("🔄 Chain changed:", chainId);
      toast({
        title: "Network Changed",
        description: "Your network has changed. The page will refresh to update your data.",
      });
      
      // Small delay to let the toast show, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    };

    // Add listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [isConnected, address]);

  return null; // This component doesn't render anything
}
