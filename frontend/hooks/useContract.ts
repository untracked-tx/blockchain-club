import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contracts } from "@/lib/contracts"

export function useContract(provider: ethers.BrowserProvider | null) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (!provider) {
        // Provider not ready yet - this is normal during initial load
        setContract(null);
        return;
      }
      const signer = await provider.getSigner();
      const CONTRACT = contracts.membership;
      const CONTRACT_ADDRESS = CONTRACT.address;
      const CONTRACT_ABI = CONTRACT.abi;
      console.log("[DEBUG] Initializing contract with address:", CONTRACT_ADDRESS);
      console.log("[DEBUG] Using ABI:", CONTRACT_ABI);
      setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
    };

    initializeContract();
  }, [provider]);

  return contract;
}
