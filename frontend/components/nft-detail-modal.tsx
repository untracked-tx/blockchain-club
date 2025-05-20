"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Info, ExternalLink, ChevronRight, Code, Copy, Wallet } from "lucide-react"
import { ethers } from "ethers";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { contracts } from "@/lib/contracts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Officer addresses (lowercase)
const OFFICER_ADDRESSES: string[] = [
  // Add officer wallet addresses here, all lowercase
  '0xDA30c053156E690176574dAEe79CEB94e3C8F0cC', // Contract owner/deployer address
  // Add other officer wallet addresses as needed
];

// Map UI/category role to contract role string
function getContractRole(category: any, token: any): string {
  // Prefer category.role, fallback to token.name
  const role = (category?.role || token?.name || '').toLowerCase();
  switch (role) {
    case 'observer': return 'Observer';
    case 'member': return 'Member';
    case 'officer': return 'Officer';
    case 'supporter': return 'Supporter';
    default: 
      console.warn(`[WARNING] Unsupported role: ${role}. Only Observer, Member, Officer, and Supporter are supported.`);
      // Default to Observer for invalid roles as the safest option
      return 'Observer';
  }
}

// Validate that only supported roles are used
function isValidRole(role: string): boolean {
  const validRoles = ['Observer', 'Member', 'Officer', 'Supporter'];
  return validRoles.includes(role);
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
      
      // Check if user has already minted this role (only for Member and Officer roles)
      try {
        if (contractRole === 'Member' || contractRole === 'Officer') {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          const hasMinted = await contract.hasMintedRole(address, contractRole);
          
          if (hasMinted) {
            setError(`You have already minted a ${contractRole} token. Each wallet can only mint one ${contractRole} token.`);
            setStep("Error");
            setIsLoading(false);
            return;
          }
        }
        // Note: We don't check for Observer and Supporter tokens since they can mint multiple
      } catch (checkError) {
        console.error("[ERROR] Failed to check if role already minted:", checkError);
        // Continue with minting attempt - if there's an issue, the contract will reject it
      }
      
      // Officer mint restriction
      if (contractRole === 'Officer' && !OFFICER_ADDRESSES.includes(address.toLowerCase())) {
        setError("Only officer wallets can mint this token. Not authorized for officer role.");
        setStep('Error');
        setIsLoading(false);
        return;
      }
      
      // Member role restriction - check whitelist
      if (contractRole === 'Member') {
        const isWhitelisted = await checkWhitelist(address);
        if (!isWhitelisted) {
          setError("You are not whitelisted for the Member role. Please contact a club officer.");
          setStep('Error');
          setIsLoading(false);
          return;
        }
      }
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Determine mint args for contract
      let mintValue = ethers.parseEther("0");
      if (contractRole === 'Observer') {
        mintValue = ethers.parseEther("0");
      } else if (contractRole === 'Member') {
        mintValue = ethers.parseEther("0.01");
      } else if (contractRole === 'Supporter') {
        mintValue = ethers.parseEther("0.02");
      } else if (contractRole === 'Officer') {
        mintValue = ethers.parseEther("0");
      } else {
        // fallback: use category cost if present
        if (category?.cost && typeof category.cost === "string" && category.cost.match(/\d/)) {
          const match = category.cost.match(/([\d.]+)/);
          if (match) mintValue = ethers.parseEther(match[1]);
        }
      }
      
      // Debug log
      console.log('[DEBUG][Mint] contractRole:', contractRole, '| value:', mintValue.toString(), '| address:', address);
      
      // Validate the role before minting
      if (!isValidRole(contractRole)) {
        setError(`Invalid role: ${contractRole}. Only Observer, Member, Officer, and Supporter are supported.`);
        setStep("Error");
        setIsLoading(false);
        return;
      }

      // Call mint with correct args and value
      let tx;
      // Convert the role string to bytes32 as required by the contract
      const roleBytes32 = ethers.keccak256(ethers.toUtf8Bytes(contractRole));
      
      // ethers.parseEther returns a bigint, but to avoid ES2020 issues, use .toString() for comparison
      if (mintValue.toString() === '0') {
        tx = await contract.mintToken(roleBytes32, mintValue);
      } else {
        tx = await contract.mintToken(roleBytes32, mintValue, { value: mintValue });
      }
      
      setStep("Transaction submitted. Waiting for confirmation...");
      setTxHash(tx.hash);
      await tx.wait();
      
      setStep("Minting complete! Waiting for Polygonscan confirmation...");
      setTimeout(() => {
        setIsPolyscanConfirmed(true);
        setStep("Mint successful!");
        setIsSuccess(true);
      }, 3000);
    } catch (err: any) {
      // Improved error message handling with more specific messages
      let userError = err;
      
      if (err?.reason?.includes("already minted") || err?.message?.includes("already minted")) {
        // More specific error message based on the role
        const roleString = getContractRole(category, token);
        userError = `You have already minted a ${roleString} token. Each wallet can only mint one ${roleString} token.`;
      } else if (err?.reason?.includes("not whitelisted") || err?.message?.includes("not whitelisted")) {
        userError = "You are not on the approved whitelist for this role. Please contact a club officer to request access.";
      } else if (err?.reason?.includes("Insufficient payment") || err?.message?.includes("Insufficient payment")) {
        // Include the expected amount if possible
        let reqAmount = category?.cost || "the required amount";
        userError = `Insufficient payment for this token. This membership token requires ${reqAmount}.`;
      } else if (err?.reason?.includes("paused") || err?.message?.includes("paused")) {
        userError = "Minting is currently paused by club administrators. Please try again later or contact an officer for assistance.";
      } else if (err?.reason?.includes("You are not the owner of this token") || err?.message?.includes("You are not the owner of this token")) {
        userError = "You are not the owner of this token. Only the token owner can perform this operation.";
      } else if (err?.reason?.includes("Token does not exist") || err?.message?.includes("Token does not exist")) {
        userError = "This token does not exist. Please check the token ID and try again.";
      } else if (err?.code === "UNSUPPORTED_OPERATION" && err?.message?.includes("no matching fragment")) {
        userError = "There was a technical error with the contract interaction. This might be due to a recent contract update or parameter mismatch. Please try again or contact support.";
        console.error("[ERROR] Function signature mismatch:", err);
        // Log additional debug info to help developers troubleshoot
        console.debug("[DEBUG] Contract address:", CONTRACT_ADDRESS);
        const currentContractRole = getContractRole(category, token);
        console.debug("[DEBUG] Role bytes32:", ethers.keccak256(ethers.toUtf8Bytes(currentContractRole)));
        console.debug("[DEBUG] Role string:", currentContractRole);
      } else if (err?.reason?.includes("Invalid role") || err?.message?.includes("Invalid role")) {
        userError = `Invalid role selected. Only Observer, Member, Officer, and Supporter roles are supported. The role '${getContractRole(category, token)}' is not recognized.`;
        console.error("[ERROR] Invalid role:", err);
      } else if (err?.reason?.includes("Not authorized for officer role") || err?.message?.includes("Not authorized for officer role")) {
        userError = "You are not authorized to mint an Officer token. Only wallets with the Officer role can mint this type of token.";
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
        try { 
          whitelisted = await contract.whitelist(address); 
        } catch (e) {
          console.error("Error checking whitelist:", e);
        }
        setIsWhitelisted(!!whitelisted);
        
        // Check if user already owns this role/token - but only restrict for Member and Officer
        let hasRole = false;
        try { 
          // For Member and Officer roles, check if already minted and restrict
          if (contractRole === 'Member' || contractRole === 'Officer') {
            hasRole = await contract.hasMintedRole(address, contractRole);
            setAlreadyMinted(!!hasRole);
          } else {
            // For Observer and Supporter, allow unlimited mints
            hasRole = false;
            setAlreadyMinted(false);
          }
        } catch (e) {
          console.error("Error checking role:", e);
        }
        setUserRole(contractRole);
        
        // Officer check
        let officer = false;
        try { 
          officer = OFFICER_ADDRESSES.includes(address.toLowerCase()) || 
                   (await contract.hasRole && await contract.hasRole(ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE")), address)); 
        } catch (e) {
          console.error("Error checking officer status:", e);
        }
        setIsOfficer(!!officer);
        
        // Eligibility logic per requirements
        if (hasRole && (contractRole === 'Member' || contractRole === 'Officer')) {
          setEligibilityReason(`You already have a ${contractRole} token. Only one ${contractRole} token is allowed per wallet.`);
        } else if (
          (contractRole === 'Member') && !whitelisted
        ) {
          setEligibilityReason('You are not on the whitelist for the Member role. Please contact a club officer.');
        } else if (
          contractRole === 'Officer' && !officer
        ) {
          setEligibilityReason('Only wallets with the Officer role can mint an Officer token.');
        } else {
          setEligibilityReason("");
        }
      } catch (e) {
        console.error("Error determining eligibility:", e);
        setEligibilityReason('Could not determine eligibility. Please try again.');
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
      if (category.role.toLowerCase() === "member") return "0.01 ETH (requires whitelist)"
      if (category.role.toLowerCase() === "supporter") return "0.02 ETH"
      if (category.role.toLowerCase() === "officer") return "Free (requires officer role)"
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
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse"></div>
              <DialogTitle>Loading NFT Details</DialogTitle>
            </div>
            <DialogDescription>Please wait while we fetch the token information...</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-10">
            <div className="h-20 w-20 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Helper: Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Get role color for styling
  const getRoleColor = () => {
    const role = (category?.role || '').toLowerCase();
    switch(role) {
      case 'observer': return 'from-sky-400 to-sky-600';
      case 'member': return 'from-green-400 to-green-600';
      case 'officer': return 'from-purple-400 to-purple-600';
      case 'supporter': return 'from-amber-400 to-amber-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  // Get role background color for styling
  const getRoleBgColor = () => {
    const role = (category?.role || '').toLowerCase();
    switch(role) {
      case 'observer': return 'bg-sky-100';
      case 'member': return 'bg-green-100';
      case 'officer': return 'bg-purple-100';
      case 'supporter': return 'bg-amber-100';
      default: return 'bg-blue-100';
    }
  };

  // Get role text color for styling
  const getRoleTextColor = () => {
    const role = (category?.role || '').toLowerCase();
    switch(role) {
      case 'observer': return 'text-sky-800';
      case 'member': return 'text-green-800';
      case 'officer': return 'text-purple-800';
      case 'supporter': return 'text-amber-800';
      default: return 'text-blue-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.16, 1, 0.3, 1] 
            }}
          >
            <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl bg-white shadow-xl">
              {/* Header with gradient background */}
              <div className={`p-6 bg-gradient-to-r ${getRoleColor()} text-white`}>
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {token.name}
                    {category.role && (
                      <Badge className="bg-white/20 text-white backdrop-blur-sm ml-2 text-xs">
                        {category.role}
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-white/90">{token.description}</DialogDescription>
                </DialogHeader>
              </div>

              {/* Status notifications */}
              <div className="p-6 space-y-4">
                {/* Eligibility and status section (always at top) */}
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-2"
                  >
                    {/* Eligibility summary badge */}
                    <div className="flex items-center flex-wrap gap-2">
                      {alreadyMinted && (userRole === 'Member' || userRole === 'Officer') ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1 px-3 py-1.5 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> 
                          Already Minted
                        </Badge>
                      ) : eligibilityReason ? (
                        <Badge className={
                          eligibilityReason.toLowerCase().includes('not whitelist') || 
                          eligibilityReason.toLowerCase().includes('officer') 
                            ? "bg-yellow-100 text-yellow-800 flex items-center gap-1 px-3 py-1.5 text-sm font-medium" 
                            : "bg-red-100 text-red-800 flex items-center gap-1 px-3 py-1.5 text-sm font-medium"
                        }>
                          <AlertCircle className="h-4 w-4 mr-1" /> {eligibilityReason}
                        </Badge>
                      ) : null}
                    </div>
                  </motion.div>
                )}

                {step && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Alert className="mb-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <AlertTitle className="text-blue-800 font-medium">Minting Status</AlertTitle>
                      </div>
                      <AlertDescription className="text-blue-700">{step}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                
                {txHash && !isPolyscanConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Alert className="mb-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <AlertTitle className="text-blue-800 font-medium">Waiting for Polygonscan</AlertTitle>
                      </div>
                      <AlertDescription className="text-blue-700">
                        Your transaction was submitted and confirmed on-chain.<br />
                        <a 
                          href={`https://amoy.polygonscan.com/tx/${txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View on Polygonscan <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                
                {isSuccess && txHash && isPolyscanConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Alert className="mb-4 border-l-4 border-green-500 bg-green-50 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <AlertTitle className="text-green-800 font-medium">Success!</AlertTitle>
                      </div>
                      <AlertDescription className="text-green-700">
                        Your token has been minted successfully and is now part of your collection.
                        <a 
                          href={`https://amoy.polygonscan.com/tx/${txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center mt-2 text-green-600 hover:text-green-800 transition-colors"
                        >
                          View on Polygonscan <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-2 flex justify-center"
                  >
                    <Alert className="mb-4 border-l-4 border-red-500 bg-red-50 rounded-lg shadow-sm w-full">
                      <div className="flex items-start gap-2 w-full">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <AlertTitle className="text-red-800 font-medium">Error</AlertTitle>
                          <AlertDescription className="text-red-700 max-h-40 overflow-y-auto">
                            {typeof error === 'object' ? 
                              (error?.message || 'An unknown error occurred.') : 
                              error}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  </motion.div>
                )}

                {/* Main content area */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* NFT Image with card styling */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 shadow-sm flex items-center justify-center p-4"
                    style={{ minHeight: 280 }}
                  >
                    <img 
                      src={token.imageUri || "/placeholder.svg"} 
                      alt={token.name} 
                      className="max-h-64 max-w-full object-contain mx-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                      style={{ maxHeight: 256, width: "auto" }}
                    />
                  </motion.div>

                  {/* NFT Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Token Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-3">
                        <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${getRoleColor()}`}></span>
                        Token Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {category.role && (
                            <Badge className={`${getRoleBgColor()} ${getRoleTextColor()}`}>
                              Role: {category.role}
                            </Badge>
                          )}
                          {category.type && (
                            <Badge className="bg-purple-100 text-purple-800 font-medium">
                              Type: {category.type}
                            </Badge>
                          )}
                          {category.votingPower !== undefined && (
                            <Badge className="bg-green-100 text-green-800 font-medium">
                              Voting Power: {category.votingPower}x
                            </Badge>
                          )}
                          <Badge className="bg-red-100 text-red-800 font-medium">
                            Cost: {getCostText()}
                          </Badge>
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          {category.role === "Observer"
                            ? "Free to mint. Grants access to public events and basic resources."
                            : category.role === "Member"
                              ? "Requires university email verification. Grants voting rights and full access."
                              : category.role === "Supporter"
                                ? "Requires a donation of 0.02 ETH. Grants enhanced voting power and exclusive perks."
                                : token.description || "Mint this token to add it to your collection."}
                        </div>
                      </div>
                    </div>

                    {/* Mint Action Box */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      {!isConnected ? (
                        <Button
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              if (typeof openConnectModal === 'function') openConnectModal();
                            }, 300);
                          }}
                          className={`w-full bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white shadow-sm`}
                        >
                          <Wallet className="mr-2 h-4 w-4" /> Connect Wallet to Mint
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button
                                    onClick={handleMint}
                                    disabled={
                                      isLoading ||
                                      isSuccess ||
                                      (alreadyMinted && (userRole === 'Member' || userRole === 'Officer')) ||
                                      !!eligibilityReason
                                    }
                                    className={cn(
                                      "relative w-full group overflow-hidden",
                                      isSuccess
                                        ? "bg-green-500 hover:bg-green-600"
                                        : `bg-gradient-to-r ${getRoleColor()} hover:opacity-90`,
                                      "text-white shadow-sm"
                                    )}
                                  >
                                    {isLoading ? (
                                      <div className="flex items-center">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Minting...
                                      </div>
                                    ) : isSuccess ? (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Minted Successfully!
                                      </>
                                    ) : alreadyMinted && (userRole === 'Member' || userRole === 'Officer') ? (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Already Minted (Limit 1)
                                      </>
                                    ) : eligibilityReason ? (
                                      <>
                                        <AlertCircle className="mr-2 h-4 w-4" /> Not Eligible
                                      </>
                                    ) : (
                                      <>
                                        Mint {token.name}
                                      </>
                                    )}
                                    <span className="absolute inset-0 rounded-md overflow-hidden">
                                      <span className="absolute left-0 top-0 h-full w-0 bg-white/20 transition-all duration-500 group-hover:w-full"></span>
                                    </span>
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isSuccess
                                  ? 'Token successfully minted!'
                                  : alreadyMinted && (userRole === 'Member' || userRole === 'Officer')
                                  ? 'You can only mint one of these tokens per wallet'
                                  : eligibilityReason
                                  ? eligibilityReason
                                  : `Click to mint the ${token.name} token`}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {/* Whitelist request button - only show for Member role when not whitelisted */}
                          {isConnected && 
                           userRole === 'Member' && 
                           !isWhitelisted && 
                           !alreadyMinted && (
                            <Button 
                              variant="outline" 
                              className="w-full border-yellow-500 text-yellow-700 hover:bg-yellow-50 shadow-sm"
                              onClick={() => openMailTo("Whitelist Request for University Blockchain Club")}
                            >
                              Request Whitelist Access <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Officer role request button - only show for Officer role when not an officer */}
                          {isConnected && 
                           userRole === 'Officer' && 
                           !isOfficer && 
                           !alreadyMinted && (
                            <Button 
                              variant="outline" 
                              className="w-full border-blue-500 text-blue-700 hover:bg-blue-50 shadow-sm"
                              onClick={() => openMailTo("Officer Role Application for University Blockchain Club")}
                            >
                              Apply for Officer Role <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Transaction details (only show when there's a transaction) */}
                    {txHash && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-blue-500" /> Transaction Details
                        </h4>
                        <div className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded-md p-2">
                          <span className="text-gray-600">Tx Hash:</span>
                          <div className="flex items-center gap-1">
                            <a 
                              href={`https://amoy.polygonscan.com/tx/${txHash}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-mono text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {txHash.slice(0, 6)}...{txHash.slice(-4)}
                            </a>
                            <button 
                              onClick={() => copyToClipboard(txHash)}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Success view */}
                    {isSuccess && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-sm"
                          onClick={() => {
                            onClose();
                            // Optionally: route to dashboard or gallery
                          }}
                        >
                          See All Tokens
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
              
              {/* Debug/Technical Info (collapsible, with improved styling) */}
              <div className="bg-gray-50 border-t border-gray-200">
                <details className="group">
                  <summary className="p-4 cursor-pointer hover:bg-gray-100 flex items-center">
                    <Code className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Technical Details</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-gray-500 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-sm grid grid-cols-2 gap-2">
                    <div>Contract: <span className="font-mono bg-gray-100 px-1 rounded text-gray-800">{CONTRACT_ADDRESS.slice(0, 10)}...</span></div>
                    <div className="flex items-center gap-1">
                      Hash: {txHash && (
                        <div className="flex items-center gap-1">
                          <a
                            href={`https://amoy.polygonscan.com/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono bg-gray-100 px-1 rounded text-blue-600 hover:text-blue-800"
                          >
                            {txHash.slice(0, 6)}...{txHash.slice(-4)}
                          </a>
                          <button 
                            onClick={() => copyToClipboard(txHash)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>Wallet: <span className="font-mono bg-gray-100 px-1 rounded text-gray-800">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span></div>
                    <div>Whitelisted: <span className={`font-mono px-1 rounded ${isWhitelisted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{String(isWhitelisted)}</span></div>
                    <div>Officer: <span className={`font-mono px-1 rounded ${isOfficer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{String(isOfficer)}</span></div>
                    <div className="col-span-2">Eligibility Reason: <span className="font-mono bg-gray-100 px-1 rounded text-gray-800">{eligibilityReason || 'Eligible'}</span></div>
                    {isConnected && (
                      <div className="col-span-2 pt-2 border-t border-gray-200 mt-2">
                        <div>Role as bytes32: <span className="font-mono bg-gray-100 px-1 rounded text-gray-800">{ethers.keccak256(ethers.toUtf8Bytes(getContractRole(category, token))).slice(0, 10)}...</span></div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}