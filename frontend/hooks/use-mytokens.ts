import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { useConfig } from "wagmi";
import { contracts } from "../lib/contracts";

export interface Token {
  id: number;
  tokenId: string;
  name: string;
  description: string;
  imageUri: string;
  votingPower: number;
  acquired: string;
  isDefault?: boolean;
  type?: string;
  category?: string;
  metadata?: {
    attributes?: Array<{trait_type: string, value: string}>
  };
}

export function useMyTokens(address?: string) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const config = useConfig();

  useEffect(() => {
    // Don't load tokens if no address is provided  
    if (!address) {
      setTokens([]);
      setIsLoading(false);
      return;
    }
    let active = true;

    async function loadTokens() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Get the user's balance
        console.log("useMyTokens: Getting balance for", address);
        const balance = await readContract(config, {
          address: contracts.membership.address,
          abi: contracts.membership.abi,
          functionName: "balanceOf",
          args: [address!],
        });
        console.log("useMyTokens: Balance is", balance);

        const found: Token[] = [];
        for (let i = 0; i < Number(balance); i++) {
          // 2. Get tokenId at user's index i
          const tokenId = await readContract(config, {
            address: contracts.membership.address,
            abi: contracts.membership.abi,
            functionName: "tokenOfOwnerByIndex",
            args: [address!, BigInt(i)],
          });

          // 3. Get tokenURI for tokenId
          const tokenUri = await readContract(config, {
            address: contracts.membership.address,
            abi: contracts.membership.abi,
            functionName: "tokenURI",
            args: [tokenId],
          });

          // 4. Resolve IPFS if needed, fetch metadata
          let resolvedUri = String(tokenUri);
          if (resolvedUri.startsWith("ipfs://")) {
            resolvedUri = resolvedUri.replace("ipfs://", "https://ipfs.io/ipfs/");
          }

          let metadata: any = {};
          try {
            const res = await fetch(resolvedUri);
            metadata = await res.json();
          } catch (e) {
            metadata = { name: `Token #${tokenId}` }; // fallback if fetch fails
          }

          // 5. Get actual voting power from Roles contract
          let votingPower = 1; // default fallback
          try {
            const votingPowerResult = await readContract(config, {
              address: contracts.roles.address,
              abi: contracts.roles.abi,
              functionName: "getVotingPower",
              args: [address!],
            });
            votingPower = Number(votingPowerResult);
          } catch (e) {
            console.warn("Could not fetch voting power from contract, using default of 1");
          }

          // 6. Extract token type and category from metadata attributes
          let tokenType = "Member Token"; // default fallback
          let category = "Governance"; // default fallback
          
          if (metadata.attributes && Array.isArray(metadata.attributes)) {
            const tokenTypeAttr = metadata.attributes.find((attr: any) => 
              attr.trait_type === "Token Type"
            );
            if (tokenTypeAttr) {
              tokenType = tokenTypeAttr.value;
            }
            
            const categoryAttr = metadata.attributes.find((attr: any) => 
              attr.trait_type === "Category"
            );
            if (categoryAttr) {
              category = categoryAttr.value;
            }
          }

          found.push({
            id: Number(tokenId),
            tokenId: tokenId.toString(),
            name: metadata.name || `Token #${tokenId}`,
            description: metadata.description || "",
            imageUri: metadata.image || "",
            votingPower: votingPower, // Use contract voting power
            acquired: new Date().toISOString(), // TODO: Get actual mint date
            type: tokenType, // Use actual token type from metadata
            category: category, // Add category from metadata
            metadata: metadata, // Store the full metadata for use in modal
          });
        }
        console.log("useMyTokens: Found tokens:", found);
        if (active) setTokens(found);
      } catch (err: any) {
        console.error("Error loading tokens:", err);
        if (active) setError(err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTokens();
    return () => { active = false; };
  }, [address, config]);

  return { tokens, isLoading, error };
}
