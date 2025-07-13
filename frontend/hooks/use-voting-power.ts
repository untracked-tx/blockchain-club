import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { useConfig } from "wagmi";
import { contracts } from "../lib/contracts";

export function useVotingPower(address?: string) {
  const [votingPower, setVotingPower] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const config = useConfig();

  useEffect(() => {
    // Don't load voting power if no address is provided
    if (!address) {
      setVotingPower(0);
      setIsLoading(false);
      return;
    }
    
    let active = true;

    async function loadVotingPower() {
      setIsLoading(true);
      setError(null);

      try {
        console.log("useVotingPower: Getting voting power for", address);
        
        // Get voting power from Roles contract
        const power = await readContract(config, {
          address: contracts.roles.address,
          abi: contracts.roles.abi,
          functionName: "getVotingPower",
          args: [address!],
        });
        
        console.log("useVotingPower: Voting power is", power);
        if (active) setVotingPower(Number(power));
      } catch (err: any) {
        console.error("Error loading voting power:", err);
        if (active) setError(err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadVotingPower();
    return () => { active = false; };
  }, [address, config]);

  return { votingPower, isLoading, error };
}
