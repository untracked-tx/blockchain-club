import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { contracts } from "../lib/contracts";
import { Address } from "viem";
import { useConfig } from "wagmi";

export interface Token {
  tokenId: string;
  name?: string;
  description?: string;
  imageUri?: string;
  votingPower?: number;
}

export function useMyTokens(address?: Address) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const config = useConfig();

  useEffect(() => {
    if (!address) return;
    let active = true;

    async function loadTokens() {
      setIsLoading(true);
      setError(null);

      try {        // 1. Get the user's balance
        const balance = await readContract(config, {
          address: contracts.membership.address as `0x${string}`,
          abi: contracts.membership.abi,
          functionName: "balanceOf",
          args: [address]
        }) as bigint;

        const found: Token[] = [];
        for (let i = 0; i < Number(balance); i++) {
          // 2. Get tokenId at user's index i
          const tokenId = await readContract(config, {
            address: contracts.membership.address as `0x${string}`,
            abi: contracts.membership.abi,
            functionName: "tokenOfOwnerByIndex",
            args: [address, BigInt(i)]
          }) as bigint;

          // 3. Get tokenURI for tokenId
          const tokenUri = await readContract(config, {
            address: contracts.membership.address as `0x${string}`,
            abi: contracts.membership.abi,
            functionName: "tokenURI",
            args: [tokenId]
          });          // 4. Resolve IPFS if needed, fetch metadata
          let resolvedUri = tokenUri as string;
          if (resolvedUri.startsWith("ipfs://")) {
            resolvedUri = resolvedUri.replace("ipfs://", "https://ipfs.io/ipfs/");
          }

          let metadata: any = {};
          try {
            const res = await fetch(resolvedUri);
            metadata = await res.json();
          } catch (e) {
            metadata = { name: `Token #${String(tokenId)}` }; // fallback if fetch fails
          }

          found.push({
            tokenId: String(tokenId),
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
  }, [address, config]);

  return { tokens, isLoading, error };
}
