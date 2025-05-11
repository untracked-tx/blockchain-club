import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/constants";

export function useContract(provider: ethers.BrowserProvider | null) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (!provider) {
        console.log("[DEBUG] Provider is null. Contract instance cannot be initialized.");
        setContract(null);
        return;
      }
      const signer = await provider.getSigner();
      console.log("[DEBUG] Initializing contract with address:", CONTRACT_ADDRESS);
      console.log("[DEBUG] Using ABI:", CONTRACT_ABI);
      setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
    };

    initializeContract();
  }, [provider]);

  return contract;
}
