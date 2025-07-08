import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contracts } from "@/lib/contracts"

export function useRolesContract(provider: ethers.BrowserProvider | null) {
  const [rolesContract, setRolesContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (!provider) {
        console.log("[DEBUG] Provider is null. Roles contract instance cannot be initialized.");
        setRolesContract(null);
        return;
      }
      const signer = await provider.getSigner();
      const CONTRACT = contracts.roles;
      const CONTRACT_ADDRESS = CONTRACT.address;
      const CONTRACT_ABI = CONTRACT.abi;
      console.log("[DEBUG] Initializing roles contract with address:", CONTRACT_ADDRESS);
      setRolesContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
    };

    initializeContract();
  }, [provider]);

  return rolesContract;
}
