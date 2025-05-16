"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { ethers } from "ethers";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { contracts } from "@/lib/contracts";
import { motion, AnimatePresence } from "framer-motion";

// Officer addresses (lowercase)
const OFFICER_ADDRESSES: string[] = [
  // Add officer wallet addresses here, all lowercase
  // Example: '0x1234abcd...'
];

// Map UI/category role to contract role string
function getContractRole(category: any, token: any): string {
  // Prefer category.role, fallback to token.name
  const role = (category?.role || token?.name || '').toLowerCase();
  switch (role) {
    case 'observer': return 'OBSERVER';
    case 'member': return 'MEMBER';
    case 'officer': return 'OFFICER';
    case 'supporter': return 'SUPPORTER';
    case 'alumni': return 'ALUMNI';
    default: return role.toUpperCase();
  }
}

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
  const [isPolyscanConfirmed, setIsPolyscanConfirmed] = useState(false)
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [alreadyMinted, setAlreadyMinted] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isOfficer, setIsOfficer] = useState<boolean>(false);
  const [eligibilityReason, setEligibilityReason] = useState<string>("");
  const clubEmail = "blockchainclub@university.edu"; // Set your club email here

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

  // Replace deprecated constants with centralized config
  const CONTRACT_ADDRESS = contracts.membership.address;
  const CONTRACT_ABI = contracts.membership.abi;

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
      const contractRole = getContractRole(category, token);
      // Officer mint restriction
      if (contractRole === 'OFFICER' && !OFFICER_ADDRESSES.includes(address.toLowerCase())) {
        setError({ reason: 'Not authorized for role', message: 'Only officer wallets can mint this token.' });
        setStep('Error');
        setIsLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Determine mint args for contract
      let mintValue = ethers.parseEther("0");
      let requireWhitelist = false;
      if (contractRole === 'OBSERVER') {
        mintValue = ethers.parseEther("0");
        requireWhitelist = false;
      } else if (contractRole === 'MEMBER') {
        mintValue = ethers.parseEther("0.01");
        requireWhitelist = true;
      } else if (contractRole === 'SUPPORTER') {
        mintValue = ethers.parseEther("0.02");
        requireWhitelist = false;
      } else if (contractRole === 'OFFICER') {
        mintValue = ethers.parseEther("0");
        requireWhitelist = true;
      } else {
        // fallback: use category cost if present
        if (category?.cost && typeof category.cost === "string" && category.cost.match(/\d/)) {
          const match = category.cost.match(/([\d.]+)/);
          if (match) mintValue = ethers.parseEther(match[1]);
        }
      }
      // Debug log
      console.log('[DEBUG][Mint] contractRole:', contractRole, '| value:', mintValue.toString(), '| address:', address, '| requireWhitelist:', requireWhitelist, '| category:', category);
      // Call mint with correct args and value
      // Only pass overrides if mintValue is nonzero (ethers v6 will error if you pass { value: 0n })
      if (typeof contract.mintToken === 'function') {
        let tx;
        // ethers.parseEther returns a bigint, but to avoid ES2020 issues, use .toString() for comparison
        if (mintValue.toString() === '0') {
          tx = await contract.mintToken(contractRole, mintValue, requireWhitelist);
        } else {
          tx = await contract.mintToken(contractRole, mintValue, requireWhitelist, { value: mintValue });
        }
        setStep("Transaction submitted. Waiting for confirmation...");
        setTxHash(tx.hash);
        await tx.wait();
      } else {
        // fallback to mint(role, { value })
        const tx = await contract.mint(contractRole, { value: mintValue });
        setStep("Transaction submitted. Waiting for confirmation...");
        setTxHash(tx.hash);
        await tx.wait();
      }
      setStep("Minting complete! Waiting for Polygonscan confirmation...");
      setTimeout(() => {
        setIsPolyscanConfirmed(true);
        setStep("Mint successful!");
        setIsSuccess(true);
      }, 7000);
    } catch (err: any) {
      // Bespoke error messages for common contract reverts
      let userError = err;
      if (err?.reason?.includes("already minted") || err?.message?.includes("already minted")) {
        userError = "You have already minted this token. Each wallet can only mint one of each role.";
      } else if (err?.reason?.includes("not whitelisted") || err?.message?.includes("not whitelisted")) {
        userError = "You are not whitelisted for this role. Please contact a club officer.";
      } else if (err?.reason?.includes("Insufficient payment") || err?.message?.includes("Insufficient payment")) {
        userError = "Insufficient payment for this token. Please check the required amount.";
      } else if (err?.reason?.includes("paused") || err?.message?.includes("paused")) {
        userError = "Minting is currently paused. Please try again later.";
      } else if (err?.reason?.includes("You are not the owner of this token") || err?.message?.includes("You are not the owner of this token")) {
        userError = "You are not the owner of this token.";
      } else if (err?.reason?.includes("Token does not exist") || err?.message?.includes("Token does not exist")) {
        userError = "This token does not exist.";
      }
      setError(userError);
      setStep("Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset error and UI state when token changes or modal opens
    setError(null);
    setIsSuccess(false);
    // If you use setTechnicalError elsewhere, reset it here too
    // setTechnicalError && setTechnicalError(null);
  }, [token, isOpen]);

  // Eligibility check on modal open or wallet change
  useEffect(() => {
    async function fetchEligibility() {
      setIsWhitelisted(null);
      setAlreadyMinted(null);
      setUserRole("");
      setIsOfficer(false);
      setEligibilityReason("");
      if (!isConnected || !address) return;
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const contractRole = getContractRole(category, token);
        // Check whitelist
        let whitelisted = false;
        try { whitelisted = await contract.whitelist(address); } catch {}
        setIsWhitelisted(!!whitelisted);
        // Check if user already owns this role/token
        let hasRole = false;
        try { hasRole = await contract.hasRole && await contract.hasRole(contractRole + "_ROLE", address); } catch {}
        setAlreadyMinted(!!hasRole);
        setUserRole(contractRole);
        // Officer check
        let officer = false;
        try { officer = await contract.hasRole && await contract.hasRole("OFFICER_ROLE", address); } catch {}
        setIsOfficer(!!officer);
        // Eligibility logic per requirements
        if (hasRole) {
          setEligibilityReason(`You already own this token.`);
        } else if (
          (contractRole === 'MEMBER' || contractRole === 'OFFICER') && !whitelisted
        ) {
          setEligibilityReason('You are not whitelisted for this role.');
        } else if (
          contractRole === 'OFFICER' && !officer
        ) {
          setEligibilityReason('Only officers can mint this NFT.');
        } else {
          setEligibilityReason("");
        }
      } catch (e) {
        setEligibilityReason('Could not determine eligibility.');
      }
    }
    if (isOpen && isConnected && address) fetchEligibility();
    else {
      setIsWhitelisted(null);
      setAlreadyMinted(null);
      setUserRole("");
      setIsOfficer(false);
      setEligibilityReason("");
    }
  }, [isOpen, isConnected, address, token, category]);

  // Helper: mailto for whitelist/officer request
  function openMailTo(subject: string) {
    window.open(`mailto:${clubEmail}?subject=${encodeURIComponent(subject)}`);
  }

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
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">{token.name}</DialogTitle>
                <DialogDescription className="text-gray-600">{token.description}</DialogDescription>
              </DialogHeader>

              {/* Eligibility and status section (always at top) */}
              {isConnected && (
                <div className="mb-4">
                  {/* Eligibility summary badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {alreadyMinted ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Already Minted</Badge>
                    ) : (
                      (userRole === 'MEMBER' || userRole === 'OFFICER') && eligibilityReason ? (
                        <Badge className={eligibilityReason.toLowerCase().includes('not whitelisted') || eligibilityReason.toLowerCase().includes('officer') ? "bg-yellow-100 text-yellow-800 flex items-center gap-1" : "bg-red-100 text-red-800 flex items-center gap-1"}>
                          <AlertCircle className="h-4 w-4" /> {eligibilityReason}
                        </Badge>
                      ) : null
                    )}
                  </div>
                  {/* Detailed status alerts (optional, can be removed if redundant) */}
                  {/* ...existing code for Alert blocks can be left as-is or removed for brevity... */}
                </div>
              )}

              {/* Token Metadata Highlights */}
              <div className="flex flex-wrap gap-2 mb-4">
                {category.role && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-blue-100 text-blue-800 cursor-help">Role: {category.role}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Defines your club permissions and access.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {category.type && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-purple-100 text-purple-800 cursor-help">Type: {category.type}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Token category (e.g., governance, culture, award).</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {category.votingPower && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-green-100 text-green-800 cursor-help">Voting Power: {category.votingPower}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Determines your voting weight in club decisions.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {category.soulbound && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-gray-200 text-gray-800 cursor-help">Soulbound: Yes</Badge>
                      </TooltipTrigger>
                      <TooltipContent>This token cannot be transferred or sold.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {category.limited && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-yellow-200 text-yellow-800 cursor-help">Limited Edition</Badge>
                      </TooltipTrigger>
                      <TooltipContent>This is a special or limited edition token.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-red-100 text-red-800 cursor-help">Cost: {getCostText()}</Badge>
                    </TooltipTrigger>
                    <TooltipContent>Cost to mint this token (if any).</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

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
                          {/* User-friendly error for contract role reverts */}
                          {typeof error === 'object' && (error?.reason === 'Not authorized for role' || (error?.message && error.message.includes('Not authorized for role'))) ? (
                            <span className="font-semibold block text-destructive">
                              {getContractRole(category, token) === 'OBSERVER' ? (
                                <>
                                  This token should be open to all, but you received a role authorization error.<br/>
                                  If you believe this is a mistake, please contact a club officer or administrator.<br/>
                                  <span className="text-xs text-muted-foreground">(Error: Not authorized for role — Observer should be public)</span>
                                </>
                              ) : (
                                <>
                                  You are not authorized to mint this token.<br/>
                                  Only wallets with the required role (such as Officer or Admin) can mint this type of token.<br/>
                                  If you believe this is a mistake, please contact a club officer or administrator.<br/>
                                  <span className="text-xs text-muted-foreground">(Error: Not authorized for role)</span>
                                </>
                              )}
                            </span>
                          ) : typeof error === 'object' && (error.code === 'NOT_WHITELISTED' || error.code === 'NOT_ELIGIBLE') ? (
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
                              <Button
                                onClick={handleMint}
                                disabled={
                                  isLoading ||
                                  isSuccess ||
                                  alreadyMinted ||
                                  ((userRole === 'MEMBER' || userRole === 'OFFICER') && !isWhitelisted) ||
                                  (userRole === 'OFFICER' && !isOfficer)
                                }
                                className="w-full"
                              >
                                {isLoading
                                  ? "Minting..."
                                  : isSuccess
                                    ? "Minted!"
                                    : alreadyMinted
                                      ? "Already Minted"
                                      : eligibilityReason
                                        ? "Not Eligible"
                                        : `Mint ${token.name}`}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isLoading
                                ? 'Minting in progress...'
                                : alreadyMinted
                                  ? 'You already own this token.'
                                  : eligibilityReason
                                    ? eligibilityReason
                                    : 'Mint this token to your wallet.'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                      {isConnected && (
                        <div className="mt-2 text-xs text-muted-foreground text-center">
                          <span>Debug: Role sent to contract: <b>{getContractRole(category, token)}</b></span>
                        </div>
                      )}
                      {isSuccess && (
                        <div className="mt-4 flex flex-col items-center gap-2">
                          <Button
                            className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => {
                              onClose();
                              // Optionally: route to dashboard or gallery
                            }}
                          >
                            See All Tokens
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Debug/Technical Info (collapsible, demo only) */}
              <details className="mt-4 text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none">Show Details</summary>
                {/* This section is for demo/debug purposes only. Remove or restrict in production. */}
                <div className="mt-2">
                  <div>Role sent to contract: <b>{getContractRole(category, token)}</b></div>
                  <div>Wallet: <b>{address}</b></div>
                  <div>Whitelisted: <b>{String(isWhitelisted)}</b></div>
                  <div>Officer: <b>{String(isOfficer)}</b></div>
                  <div>Eligibility Reason: <b>{eligibilityReason}</b></div>
                  {/* Add more technical/debug info as needed */}
                </div>
              </details>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
