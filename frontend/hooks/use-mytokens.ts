import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { contracts } from "../lib/contracts";

export interface Token {
  tokenId: string;
  name?: string;
  description?: string;
  imageUri?: string;
  votingPower?: number;
}

export function useMyTokens(address?: string) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) return;
    let active = true;

    async function loadTokens() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Get the user's balance
        const balance = await readContract<bigint>({
          address: contracts.membership.address,
          abi: contracts.membership.abi,
          functionName: "balanceOf",
          args: [address!],
        });

        const found: Token[] = [];
        for (let i = 0; i < Number(balance); i++) {
          // 2. Get tokenId at user's index i
          const tokenId = await readContract<bigint>({
            address: contracts.membership.address,
            abi: contracts.membership.abi,
            functionName: "tokenOfOwnerByIndex",
            args: [address!, BigInt(i)],
          });

          // 3. Get tokenURI for tokenId
          const tokenUri = await readContract<string>({
            address: contracts.membership.address,
            abi: contracts.membership.abi,
            functionName: "tokenURI",
            args: [tokenId],
          });

          // 4. Resolve IPFS if needed, fetch metadata
          let resolvedUri = tokenUri;
          if (typeof resolvedUri === "string" && resolvedUri.startsWith("ipfs://")) {
            resolvedUri = resolvedUri.replace("ipfs://", "https://ipfs.io/ipfs/");
          }

          let metadata: any = {};
          try {
            const res = await fetch(resolvedUri);
            metadata = await res.json();
          } catch (e) {
            metadata = { name: `Token #${tokenId}` }; // fallback if fetch fails
          }

          found.push({
            tokenId: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            imageUri: metadata.image,
            votingPower: metadata.votingPower ?? 0,
          });
        }
        if (active) setTokens(found);
      } catch (err: any) {
        if (active) setError(err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTokens();
    return () => { active = false; };
  }, [address]);

  return { tokens, isLoading, error };
}
