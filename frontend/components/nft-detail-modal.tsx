"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/constants";
import { ethers } from "ethers";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface NFTDetailModalProps {
  isOpen: boolean
  onClose: () => void
  token: any
  category: any
}

export default function NFTDetailModal({ isOpen, onClose, token, category }: NFTDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<any>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [step, setStep] = useState<string>("")
  const [gasEstimate, setGasEstimate] = useState<string | null>(null)
  const [gasFeeMatic, setGasFeeMatic] = useState<string | null>(null)
  const [gasFeeUsd, setGasFeeUsd] = useState<string | null>(null)
  const [isPolyscanConfirmed, setIsPolyscanConfirmed] = useState(false)

  // Wagmi hooks for wallet state
  const { address, isConnected } = useAccount();
  const { connect, connectors, status: connectStatus, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // Always allow minting unless explicitly restricted (future logic)
  const isMintable = true;

  // Determine mint args and price
  const role = category?.role || token?.name || "";
  const requireWhitelist = false; // You may want to set this based on category
  let price = "0";
  if (category?.cost && typeof category.cost === "string" && category.cost.match(/\d/)) {
    // Parse cost string like "0.01" or "0.005+"
    const match = category.cost.match(/([\d.]+)/);
    if (match) price = match[1]; // always keep as string for parseEther
  }

  // Helper: Check if user is whitelisted (on-chain)
  async function checkWhitelist(address: string): Promise<boolean> {
    try {
      if (!address) return false;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      console.log("[DEBUG] Contract Address:", CONTRACT_ADDRESS);
      console.log("[DEBUG] ABI:", CONTRACT_ABI);
      console.log("[DEBUG] Network:", await provider.getNetwork());

      return await contract.whitelist(address);
    } catch (error) {
      console.error("[ERROR] Failed to fetch 'whitelist' status:", error);
      return false;
    }
  }

  // Estimate gas using ethers.js if wallet is available, with whitelist check
  async function estimateGas() {
    try {
      setStep("Estimating gas...");
      setGasEstimate(null);
      setGasFeeMatic(null);
      setGasFeeUsd(null);
      if (typeof window !== "undefined" && (window as any).ethereum && address) {
        // Pre-mint whitelist check
        if (requireWhitelist) {
          const isWhitelisted = await checkWhitelist(address);
          if (!isWhitelisted) {
            setError({
              code: 'NOT_WHITELISTED',
              message: 'You are not on the whitelist for this role. Please contact a club officer to be added.'
            });
            setStep("");
            return;
          }
        }
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const gas = await contract.mintToken.estimateGas(role, ethers.parseEther(price), requireWhitelist, { value: ethers.parseEther(price) });
        setGasEstimate(gas.toString());
        // Get current gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        if (gasPrice) {
          // Calculate total fee in wei
          const totalFeeWei = gas * gasPrice;
          // Convert to MATIC (POL)
          const totalFeeMatic = ethers.formatUnits(totalFeeWei, 18);
          setGasFeeMatic(totalFeeMatic);
          // Fetch MATIC price in USD from CoinGecko
          fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd')
            .then(res => res.json())
            .then(data => {
              const maticUsd = data["matic-network"]?.usd;
              if (maticUsd && !isNaN(Number(totalFeeMatic))) {
                setGasFeeUsd((Number(totalFeeMatic) * maticUsd).toFixed(4));
              }
            });
        }
        setStep("");
      }
    } catch (err: any) {
      // Human-friendly error for missing revert data
      if (err?.code === 'CALL_EXCEPTION' && err?.message?.includes('missing revert data')) {
        setError({
          code: 'NOT_ELIGIBLE',
          message: 'You are not eligible to mint this token. Please check your role, whitelist status, or contact a club officer.'
        });
      } else {
        setError(err);
      }
      setGasEstimate(null);
      setGasFeeMatic(null);
      setGasFeeUsd(null);
      setStep("");
    }
  }

  // Mint handler using ethers.js
  const handleMint = async () => {
    setError(null);
    setIsSuccess(false);
    setIsPolyscanConfirmed(false);
    setTxHash(null);
    setStep("Awaiting wallet confirmation...");
    setIsLoading(true);
    try {
      if (!isConnected || !address) {
        setError("Wallet not connected. Please connect your wallet.");
        setStep("Wallet not connected");
        setIsLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const value = ethers.parseEther(price);
      console.log('Minting debug:', { CONTRACT_ADDRESS, role, value: value.toString(), requireWhitelist, address, network: await provider.getNetwork() });
      const tx = await contract.mintToken(role, value, requireWhitelist, { value });
      console.log('Transaction sent:', tx);
      setStep("Transaction submitted. Waiting for confirmation...");
      setTxHash(tx.hash);
      await tx.wait();
      setStep("Minting complete! Waiting for Polygonscan confirmation...");
      setTimeout(() => {
        setIsPolyscanConfirmed(true);
        setStep("Mint successful!");
        setIsSuccess(true);
      }, 7000);
    } catch (err: any) {
      if (err?.code === 4001) {
        setError("Transaction rejected by user.");
        setStep("Transaction rejected");
      } else {
        setError(err?.message || "Minting failed. Please try again.");
        setStep("Error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Estimate gas when modal opens
  useEffect(() => {
    if (isOpen && token) estimateGas();
    // eslint-disable-next-line
  }, [isOpen, token, role, price, requireWhitelist]);

  useEffect(() => {
    // Reset error and UI state when token changes or modal opens
    setError(null);
    setIsSuccess(false);
    // If you use setTechnicalError elsewhere, reset it here too
    // setTechnicalError && setTechnicalError(null);
  }, [token, isOpen]);

  // Get the appropriate cost text
  const getCostText = () => {
    if (category?.role) {
      if (category.role.toLowerCase() === "observer") return "Free"
      if (category.role.toLowerCase() === "member") return "Free (requires university email)"
      if (category.role.toLowerCase() === "supporter") return "0.05 ETH"
      return "Free"
    }
    return category?.cost || "Free"
  }

  // Always render the modal, show loading/empty state if !token
  if (!token) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
            <DialogDescription>Loading token details...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">{token.name}</DialogTitle>
          <DialogDescription className="text-gray-600">{token.description}</DialogDescription>
        </DialogHeader>

        {step && (
          <Alert className="mb-4">
            <AlertTitle>Minting Status</AlertTitle>
            <AlertDescription>{step}</AlertDescription>
          </Alert>
        )}
        {txHash && !isPolyscanConfirmed && (
          <Alert className="mb-6 border-blue-500 bg-blue-500/10">
            <AlertTitle>Waiting for Polygonscan</AlertTitle>
            <AlertDescription>
              Your transaction was submitted and confirmed on-chain.<br />
              It may take a few seconds to appear on Polygonscan.<br />
              <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">View on Polygonscan</a>
            </AlertDescription>
          </Alert>
        )}
        {isSuccess && txHash && isPolyscanConfirmed && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your token has been minted.<br />
              <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">View on Polygonscan</a>
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <div className="col-span-2 flex justify-center">
            <Alert className="mb-6 border-destructive bg-destructive/10 rounded-lg shadow w-full max-w-xl flex flex-col max-h-40 min-h-16 overflow-y-auto">
              <div className="flex items-start gap-2 w-full">
                <AlertCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="w-full">
                    {/* Human-friendly error for whitelist/eligibility */}
                    {typeof error === 'object' && (error.code === 'NOT_WHITELISTED' || error.code === 'NOT_ELIGIBLE') ? (
                      <span className="font-semibold block text-destructive">
                        {error.message}
                      </span>
                    ) : (
                      <span className="font-semibold block truncate w-full" title={typeof error === 'string' ? error : error?.message || 'An unknown error occurred.'}
                        style={{maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {typeof error === 'object' && error?.code === 'CALL_EXCEPTION' && error?.message?.includes('already minted')
                          ? 'You have already minted this token. Each wallet can only mint one.'
                          : typeof error === 'object' && error?.code === 'CALL_EXCEPTION' && error?.message?.includes('missing revert data')
                            ? 'Minting is not possible for this token or address. You may not be eligible, or the contract rejected the transaction.'
                            : typeof error === 'object' && error?.code === 'CALL_EXCEPTION' && error?.message?.toLowerCase().includes('not eligible')
                              ? 'You are not eligible to mint this token. Please check your role, whitelist status, or contact a club officer.'
                              : (typeof error === 'string' ? error : error?.message || 'An unknown error occurred.')}
                      </span>
                    )}
                    {/* Collapsible error details, strictly contained */}
                    {((typeof error === 'string' && error.length > 120) ||
                      (typeof error === 'object' && error?.message && error.message.length > 120) ||
                      (typeof error === 'object' && error?.code === 'CALL_EXCEPTION') ||
                      (typeof error === 'object' && (error.code === 'NOT_WHITELISTED' || error.code === 'NOT_ELIGIBLE'))) && (
                      <details className="mt-1 text-xs bg-muted/30 rounded p-2 border max-h-20 overflow-y-auto w-full">
                        <summary className="cursor-pointer text-muted-foreground select-none">Show full error details</summary>
                        <pre className="whitespace-pre-wrap break-all max-h-16 overflow-y-auto bg-transparent p-0 m-0">{typeof error === 'string' ? error : JSON.stringify(error, null, 2)}</pre>
                        {/* Show error code if available */}
                        {typeof error === 'object' && 'code' in error && error.code && (
                          <div className="mt-1 text-xs text-muted-foreground">Error code: <span className="font-mono">{error.code}</span></div>
                        )}
                        {/* Show transaction hash if available */}
                        {typeof error === 'object' && 'txHash' in error && error.txHash && (
                          <div className="mt-1 text-xs text-blue-600">Tx Hash: <a href={`https://amoy.polygonscan.com/tx/${error.txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{error.txHash.slice(0, 10)}...{error.txHash.slice(-6)}</a></div>
                        )}
                        {/* Collapsible technical details for advanced users */}
                        {typeof error === 'object' && (("data" in error && error.data) || ("stack" in error && error.stack)) && (
                          <details className="mt-2 text-xs bg-muted/40 rounded p-2 border max-h-12 overflow-y-auto">
                            <summary className="cursor-pointer text-muted-foreground select-none">Show technical details</summary>
                            <pre className="whitespace-pre-wrap break-all max-h-10 overflow-y-auto bg-transparent p-0 m-0">{error.data || error.stack}</pre>
                          </details>
                        )}
                      </details>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      <ul className="list-disc ml-4">
                        <li>If you need help, copy the error details above and contact support.</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-md flex items-center justify-center" style={{ minHeight: 200 }}>
            <img 
              src={token.imageUri || "/placeholder.svg"} 
              alt={token.name} 
              className="max-h-64 max-w-full object-contain mx-auto"
              style={{ maxHeight: 256, width: "auto" }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Token Details</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {category.role && <Badge className="bg-blue-100 text-blue-800">Role: {category.role}</Badge>}
                  {category.type && <Badge className="bg-purple-100 text-purple-800">Type: {category.type}</Badge>}
                  {category.votingPower && (
                    <Badge className="bg-green-100 text-green-800">Voting Power: {category.votingPower}</Badge>
                  )}
                  {category.mintedBy && (
                    <Badge className="bg-amber-100 text-amber-800">Minted By: {category.mintedBy}</Badge>
                  )}
                  <Badge className="bg-red-100 text-red-800">Cost: {getCostText()}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">About Token</h3>
              <p className="text-gray-600">Additional information about this token will be available soon.</p>
            </div>

            {isMintable && (
              <div className="pt-2">
                {/* Only use RainbowKit's openConnectModal for wallet connection, and close NFT modal first to avoid modal stacking issues */}
                {!isConnected ? (
                  <Button
                    onClick={() => {
                      // Close NFT modal first to prevent modal stacking/focus trap issues
                      onClose();
                      setTimeout(() => {
                        if (typeof openConnectModal === 'function') openConnectModal();
                      }, 300); // Wait for modal close animation
                    }}
                    className="w-full"
                  >
                    Connect Wallet
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleMint} disabled={isLoading || isSuccess} className="w-full">
                          {isLoading
                            ? "Minting..."
                            : isSuccess
                              ? "Minted!"
                              : token.name === "Digital Art"
                                ? "Mint NFT"
                                : `Mint ${token.name}`}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isLoading ? 'Minting in progress...' : 'Mint this token to your wallet.'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {gasEstimate && (
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Gas: {gasEstimate} units
                    {gasFeeMatic && (
                      <span> &middot; ~{gasFeeMatic} MATIC/POL</span>
                    )}
                    {gasFeeUsd && (
                      <span> &middot; ~${gasFeeUsd} USD</span>
                    )}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 text-center">
                  {category.role === "Observer"
                    ? "Free to mint. Grants access to public events and basic resources."
                    : category.role === "Member"
                      ? "Requires university email verification. Grants voting rights and full access."
                      : category.role === "Supporter"
                        ? "Requires a donation of 0.05 ETH. Grants enhanced voting power and exclusive perks."
                        : category.cost
                          ? `Cost: ${category.cost}. ${token.description}`
                          : `Mint this token to add it to your collection.`}
                </p>
                {txHash && (
                  <p className="mt-2 text-xs text-blue-600 text-center">
                    Tx Hash: <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash.slice(0, 10)}...{txHash.slice(-6)}</a>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
