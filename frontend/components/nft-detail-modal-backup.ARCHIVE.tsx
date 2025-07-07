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

// Token type configurations based on the new structure
const tokenTypeConfigs = {
  // Governance Tokens
  MEMBER: {
    roleGranted: "MEMBER_ROLE",
    expires: "1 year",
    maxSupply: 10,
    mintAccess: "WHITELIST_ONLY",
    cost: "0.01 ETH",
    soulbound: false,
    category: "governance"
  },
  OFFICER: {
    roleGranted: "OFFICER_ROLE", 
    expires: "1 year",
    maxSupply: 2,
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: false,
    category: "governance"
  },
  // Supporter Tokens
  SUPPORTER: {
    roleGranted: "None",
    expires: "Never",
    maxSupply: "Unlimited",
    mintAccess: "PUBLIC",
    cost: "Optional",
    soulbound: false,
    category: "culture"
  },
  // POAP Tokens
  POAP: {
    roleGranted: "None",
    expires: "N/A",
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
  // Awards & Recognition
  AWARD: {
    roleGranted: "None",
    expires: "N/A", 
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
  // Replacement
  REPLACEMENT: {
    roleGranted: "None",
    expires: "N/A",
    maxSupply: "Limited", 
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: false,
    category: "utility"
  }
};

// Helper function to get token config based on token type
function getTokenConfig(tokenType: string) {
  return tokenTypeConfigs[tokenType as keyof typeof tokenTypeConfigs] || tokenTypeConfigs.MEMBER;
}

// Map token type to contract role string
function getContractRole(token: any): string {
  const tokenType = token?.tokenType || 'MEMBER';
  const config = getTokenConfig(tokenType);
  
  // Map roleGranted to contract role names
  switch (config.roleGranted) {
    case 'MEMBER_ROLE': return 'Member';
    case 'OFFICER_ROLE': return 'Officer';
    case 'None': 
    default: 
      // For non-governance tokens, return the tokenType itself for minting
      return tokenType;
  }
}

// Validate that only supported token types are used
function isValidTokenType(tokenType: string): boolean {
  return tokenType in tokenTypeConfigs;
}

interface NFTDetailModalProps {
  isOpen: boolean
  onClose: () => void
  token: any
  // category is no longer used, but kept for backward compatibility
  category?: any
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
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const clubEmail = "blockchainclub@university.edu"; // Set your club email here

  // Wagmi hooks for wallet state
  const { address, isConnected } = useAccount();
  const { connect, connectors, status: connectStatus, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // Always allow minting unless explicitly restricted
  const isMintable = true;

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

  // Helper: Fetch token metadata from tokenURI
  async function fetchTokenMetadata(tokenId: string): Promise<any> {
    try {
      if (!tokenId) return null;
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Get tokenURI from contract
      const tokenURI = await contract.tokenURI(tokenId);
      
      if (!tokenURI) return null;

      // Fetch metadata from URI
      let metadataUrl = tokenURI;
      if (tokenURI.startsWith('ipfs://')) {
        // Convert IPFS URI to HTTP gateway URL
        metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error("[ERROR] Failed to fetch token metadata:", error);
      return null;
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
      
      const tokenType = token?.tokenType || 'MEMBER';
      const config = getTokenConfig(tokenType);
      const contractRole = getContractRole(token);
      
      // Check if user has already minted this role (only for governance tokens)
      try {
        if (config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE') {
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
        // Note: We don't check for non-governance tokens since they can mint multiple
      } catch (checkError) {
        console.error("[ERROR] Failed to check if role already minted:", checkError);
        // Continue with minting attempt - if there's an issue, the contract will reject it
      }
      
      // Officer mint restriction
      if (config.mintAccess === 'OFFICER_ONLY' && !OFFICER_ADDRESSES.includes(address.toLowerCase())) {
        setError("Only officer wallets can mint this token. Not authorized for officer role.");
        setStep('Error');
        setIsLoading(false);
        return;
      }
      
      // Member role restriction - check whitelist
      if (config.mintAccess === 'WHITELIST_ONLY') {
        const isWhitelisted = await checkWhitelist(address);
        if (!isWhitelisted) {
          setError("You are not whitelisted for this token. Please contact a club officer.");
          setStep('Error');
          setIsLoading(false);
          return;
        }
      }
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Determine mint args for contract based on token type
      let mintValue = ethers.parseEther("0");
      let usePublicMint = false;
      
      if (config.mintAccess === 'PUBLIC') {
        usePublicMint = true;
        // For public mint, parse cost if available
        if (config.cost && config.cost !== 'Free' && config.cost !== 'Optional') {
          const costMatch = config.cost.match(/([\d.]+)/);
          if (costMatch) {
            mintValue = ethers.parseEther(costMatch[1]);
          }
        }
      } else {
        // For restricted mints, use specific values
        if (config.roleGranted === 'MEMBER_ROLE') {
          mintValue = ethers.parseEther("0.01");
        } else if (tokenType === 'SUPPORTER') {
          mintValue = ethers.parseEther("0.02");
        }
      }
      
      // Debug log
      console.log('[DEBUG][Mint] tokenType:', tokenType, '| contractRole:', contractRole, '| value:', mintValue.toString(), '| usePublicMint:', usePublicMint, '| address:', address);
      
      // Validate the token type before minting
      if (!isValidTokenType(tokenType)) {
        setError(`Invalid token type: ${tokenType}. Please contact support.`);
        setStep("Error");
        setIsLoading(false);
        return;
      }

      // Call mint with correct function and args
      let tx;
      
      if (usePublicMint) {
        // Use publicMint for public tokens
        const isSoulbound = config.soulbound || false;
        if (mintValue.toString() === '0') {
          tx = await contract.publicMint(tokenType, isSoulbound);
        } else {
          tx = await contract.publicMint(tokenType, isSoulbound, { value: mintValue });
        }
      } else {
        // Use mint for restricted tokens (governance tokens)
        const roleBytes32 = ethers.keccak256(ethers.toUtf8Bytes(contractRole));
        if (mintValue.toString() === '0') {
          tx = await contract.mint(roleBytes32, mintValue);
        } else {
          tx = await contract.mint(roleBytes32, mintValue, { value: mintValue });
        }
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
        const roleString = getContractRole(token);
        userError = `You have already minted a ${roleString} token. Each wallet can only mint one ${roleString} token.`;
      } else if (err?.reason?.includes("not whitelisted") || err?.message?.includes("not whitelisted")) {
        userError = "You are not on the approved whitelist for this token. Please contact a club officer to request access.";
      } else if (err?.reason?.includes("Insufficient payment") || err?.message?.includes("Insufficient payment")) {
        // Include the expected amount if possible
        const config = getTokenConfig(token?.tokenType || 'MEMBER');
        let reqAmount = config.cost || "the required amount";
        userError = `Insufficient payment for this token. This token requires ${reqAmount}.`;
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
        const currentContractRole = getContractRole(token);
        console.debug("[DEBUG] Role bytes32:", ethers.keccak256(ethers.toUtf8Bytes(currentContractRole)));
        console.debug("[DEBUG] Role string:", currentContractRole);
      } else if (err?.reason?.includes("Invalid role") || err?.message?.includes("Invalid role")) {
        userError = `Invalid token type selected. The token type '${token?.tokenType || 'Unknown'}' is not recognized.`;
        console.error("[ERROR] Invalid token type:", err);
      } else if (err?.reason?.includes("Not authorized for officer role") || err?.message?.includes("Not authorized for officer role")) {
        userError = "You are not authorized to mint this token. Only wallets with the appropriate role can mint this type of token.";
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
    setTokenMetadata(null);
    
    // Fetch token metadata if available
    if (token?.id && isOpen) {
      setIsLoadingMetadata(true);
      fetchTokenMetadata(token.id)
        .then(metadata => {
          setTokenMetadata(metadata);
        })
        .catch(err => {
          console.error("Failed to fetch token metadata:", err);
        })
        .finally(() => {
          setIsLoadingMetadata(false);
        });
    }
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
        
        const tokenType = token?.tokenType || 'MEMBER';
        const config = getTokenConfig(tokenType);
        const contractRole = getContractRole(token);
        
        // Check whitelist
        let whitelisted = false;
        try { 
          whitelisted = await contract.whitelist(address); 
        } catch (e) {
          console.error("Error checking whitelist:", e);
        }
        setIsWhitelisted(!!whitelisted);
        
        // Check if user already owns this role/token - but only restrict for governance tokens
        let hasRole = false;
        try { 
          // For governance tokens, check if already minted and restrict
          if (config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE') {
            hasRole = await contract.hasMintedRole(address, contractRole);
            setAlreadyMinted(!!hasRole);
          } else {
            // For non-governance tokens, allow unlimited mints
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
        if (hasRole && (config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE')) {
          setEligibilityReason(`You already have a ${contractRole} token. Only one ${contractRole} token is allowed per wallet.`);
        } else if (
          config.mintAccess === 'WHITELIST_ONLY' && !whitelisted
        ) {
          setEligibilityReason(`You are not on the whitelist for this token. Please contact a club officer.`);
        } else if (
          config.mintAccess === 'OFFICER_ONLY' && !officer
        ) {
          setEligibilityReason('Only wallets with the Officer role can mint this token.');
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
  }, [isOpen, isConnected, address, token]);

  // Helper: mailto for whitelist/officer request
  function openMailTo(subject: string) {
    window.open(`mailto:${clubEmail}?subject=${encodeURIComponent(subject)}`);
  }

  // Get the appropriate cost text based on token type
  const getCostText = () => {
    const tokenType = token?.tokenType || 'MEMBER';
    const config = getTokenConfig(tokenType);
    return config.cost || "Free";
  };

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

  // Get role color for styling based on token type
  const getRoleColor = () => {
    const tokenType = token?.tokenType || 'MEMBER';
    const config = getTokenConfig(tokenType);
    
    switch(config.category) {
      case 'governance':
        return tokenType === 'MEMBER' ? 'from-green-400 to-green-600' : 'from-purple-400 to-purple-600';
      case 'culture':
        return tokenType === 'SUPPORTER' ? 'from-amber-400 to-amber-600' : 'from-sky-400 to-sky-600';
      case 'utility':
        return 'from-gray-400 to-gray-600';
      default: 
        return 'from-blue-500 to-indigo-600';
    }
  };

  // Get role background color for styling
  const getRoleBgColor = () => {
    const tokenType = token?.tokenType || 'MEMBER';
    const config = getTokenConfig(tokenType);
    
    switch(config.category) {
      case 'governance':
        return tokenType === 'MEMBER' ? 'bg-green-100' : 'bg-purple-100';
      case 'culture':
        return tokenType === 'SUPPORTER' ? 'bg-amber-100' : 'bg-sky-100';
      case 'utility':
        return 'bg-gray-100';
      default: 
        return 'bg-blue-100';
    }
  };

  // Get role text color for styling
  const getRoleTextColor = () => {
    const tokenType = token?.tokenType || 'MEMBER';
    const config = getTokenConfig(tokenType);
    
    switch(config.category) {
      case 'governance':
        return tokenType === 'MEMBER' ? 'text-green-800' : 'text-purple-800';
      case 'culture':
        return tokenType === 'SUPPORTER' ? 'text-amber-800' : 'text-sky-800';
      case 'utility':
        return 'text-gray-800';
      default: 
        return 'text-blue-800';
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
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white shadow-2xl border-0">
              {/* Header with gradient background */}
              <div className={`p-8 bg-gradient-to-r ${getRoleColor()} text-white relative overflow-hidden`}>
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <DialogHeader className="relative z-10 space-y-3">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <div className="w-5 h-5 bg-white rounded-full"></div>
                    </div>
                    {token.name}
                  </DialogTitle>
                  <DialogDescription className="text-white/90 text-base leading-relaxed">
                    {token.description}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Status notifications - simplified */}
              <div className="p-6 space-y-4">
                {/* Single, clear status message */}
                {isConnected && eligibilityReason && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Alert className="border-l-4 border-yellow-500 bg-yellow-50 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 font-medium">
                        {eligibilityReason}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {step && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Alert className="border-l-4 border-blue-500 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <AlertDescription className="text-blue-800 font-medium">{step}</AlertDescription>
                      </div>
                    </Alert>
                  </motion.div>
                )}
                
                {isSuccess && txHash && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Alert className="border-l-4 border-green-500 bg-green-50 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 font-medium">
                        Token minted successfully!
                        <a 
                          href={`https://amoy.polygonscan.com/tx/${txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center ml-2 text-green-600 hover:text-green-800 underline"
                        >
                          View transaction
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
                  >
                    <Alert className="border-l-4 border-red-500 bg-red-50 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 font-medium">
                        {typeof error === 'object' ? 
                          (error?.message || 'An error occurred while minting.') : 
                          error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Main content area - simplified */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* NFT Image - larger focus */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 shadow-sm flex items-center justify-center p-6"
                  >
                    <img 
                      src={token.imageUri || "/placeholder.svg"} 
                      alt={token.name} 
                      className="max-h-96 max-w-full object-contain mx-auto rounded-xl"
                    />
                  </motion.div>

                  {/* Simplified details and actions */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Essential token info only */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Token Info</h3>
                      <div className="space-y-2">
                        {(() => {
                          const config = getTokenConfig(token?.tokenType || 'MEMBER');
                          return (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Type</span>
                                <Badge className={`${getRoleBgColor()} ${getRoleTextColor()} text-xs`}>
                                  {token.tokenType}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Cost</span>
                                <span className="text-sm font-medium text-gray-900">{getCostText()}</span>
                              </div>
                              {config.soulbound && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Transferable</span>
                                  <Badge className="bg-red-100 text-red-800 text-xs">Soulbound</Badge>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Simplified metadata */}
                    {tokenMetadata && tokenMetadata.attributes && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Attributes</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {tokenMetadata.attributes.slice(0, 3).map((attr: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600">{attr.trait_type}</span>
                              <span className="text-gray-900 font-medium">{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mint action - simplified */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      {!isConnected ? (
                        <Button
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              if (typeof openConnectModal === 'function') openConnectModal();
                            }, 300);
                          }}
                          className={`w-full h-11 bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white shadow-sm rounded-lg font-medium`}
                        >
                          <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            onClick={handleMint}
                            disabled={
                              isLoading ||
                              isSuccess ||
                              (() => {
                                const config = getTokenConfig(token?.tokenType || 'MEMBER');
                                const isGovernanceToken = config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE';
                                return (alreadyMinted && isGovernanceToken) || !!eligibilityReason;
                              })()
                            }
                            className={cn(
                              "w-full h-11 rounded-lg font-medium transition-all duration-200",
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
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Success!
                              </>
                            ) : (
                              <>
                                Mint {token.name}
                              </>
                            )}
                          </Button>
                          
                          {/* Helper buttons - only when needed */}
                          {isConnected && (() => {
                            const config = getTokenConfig(token?.tokenType || 'MEMBER');
                            if (config.mintAccess === 'WHITELIST_ONLY' && !isWhitelisted && !alreadyMinted) {
                              return (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => openMailTo("Whitelist Request for University Blockchain Club")}
                                >
                                  Request Access
                                </Button>
                              );
                            }
                            if (config.mintAccess === 'OFFICER_ONLY' && !isOfficer && !alreadyMinted) {
                              return (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => openMailTo("Officer Role Application for University Blockchain Club")}
                                >
                                  Apply for Officer Role
                                </Button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
                  {/* NFT Image with card styling */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 shadow-lg flex items-center justify-center p-8"
                    style={{ minHeight: 350 }}
                  >
                    <img 
                      src={token.imageUri || "/placeholder.svg"} 
                      alt={token.name} 
                      className="max-h-80 max-w-full object-contain mx-auto rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                      style={{ maxHeight: 320, width: "auto" }}
                    />
                  </motion.div>

                  {/* NFT Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Token Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 mb-4">
                        <span className={`h-3 w-3 rounded-full bg-gradient-to-r ${getRoleColor()}`}></span>
                        Token Details
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {token.tokenType && (
                            <Badge className={`${getRoleBgColor()} ${getRoleTextColor()} px-3 py-1 font-medium`}>
                              Type: {token.tokenType}
                            </Badge>
                          )}
                          {(() => {
                            const config = getTokenConfig(token?.tokenType || 'MEMBER');
                            return (
                              <>
                                {config.roleGranted && config.roleGranted !== 'None' && (
                                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1 font-medium">
                                    Role: {config.roleGranted}
                                  </Badge>
                                )}
                                {config.expires && (
                                  <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1 font-medium">
                                    Expires: {config.expires}
                                  </Badge>
                                )}
                                {config.soulbound && (
                                  <Badge className="bg-red-100 text-red-800 px-3 py-1 font-medium">
                                    Soulbound
                                  </Badge>
                                )}
                                <Badge className="bg-green-100 text-green-800 px-3 py-1 font-medium">
                                  Cost: {getCostText()}
                                </Badge>
                              </>
                            );
                          })()}
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {(() => {
                              const config = getTokenConfig(token?.tokenType || 'MEMBER');
                              switch(token.tokenType) {
                                case 'MEMBER':
                                  return "Requires whitelist verification. Grants voting rights and full access to club resources.";
                                case 'OFFICER':
                                  return "Officer-only token. Grants administrative privileges and enhanced voting power.";
                                case 'SUPPORTER':
                                  return "Public supporter token. Show your support for the club with optional donation.";
                                case 'POAP':
                                  return "Proof of Attendance Protocol token. Commemorates special events and is soulbound.";
                                case 'AWARD':
                                  return "Recognition token for achievements. Awarded by officers for outstanding contributions.";
                                case 'REPLACEMENT':
                                  return "Replacement token for special use cases. Managed by officers.";
                                default:
                                  return token.description || "Mint this token to add it to your collection.";
                              }
                            })()}
                          </p>
                        </div>
                        
                        {/* Metadata attributes section */}
                        {tokenMetadata && tokenMetadata.attributes && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                            <h5 className="text-sm font-semibold text-blue-900 mb-2">Token Attributes</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {tokenMetadata.attributes.map((attr: any, index: number) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-blue-700 font-medium">{attr.trait_type}:</span>
                                  <span className="text-blue-800">{attr.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {isLoadingMetadata && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              Loading token metadata...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mint Action Box */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Mint Token</h4>
                      {!isConnected ? (
                        <Button
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              if (typeof openConnectModal === 'function') openConnectModal();
                            }, 300);
                          }}
                          className={`w-full h-12 bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium`}
                        >
                          <Wallet className="mr-2 h-5 w-5" /> Connect Wallet to Mint
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button
                                    onClick={handleMint}
                                    disabled={
                                      isLoading ||
                                      isSuccess ||
                                      (() => {
                                        const config = getTokenConfig(token?.tokenType || 'MEMBER');
                                        const isGovernanceToken = config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE';
                                        return (alreadyMinted && isGovernanceToken) || !!eligibilityReason;
                                      })()
                                    }
                                    className={cn(
                                      "relative w-full h-12 group overflow-hidden rounded-xl font-medium transition-all duration-300",
                                      isSuccess
                                        ? "bg-green-500 hover:bg-green-600 shadow-lg"
                                        : `bg-gradient-to-r ${getRoleColor()} hover:opacity-90 shadow-lg hover:shadow-xl`,
                                      "text-white"
                                    )}
                                  >
                                    {isLoading ? (
                                      <div className="flex items-center">
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                        Minting...
                                      </div>
                                    ) : isSuccess ? (
                                      <>
                                        <CheckCircle2 className="mr-3 h-5 w-5" /> Minted Successfully!
                                      </>
                                    ) : (() => {
                                      const config = getTokenConfig(token?.tokenType || 'MEMBER');
                                      const isGovernanceToken = config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE';
                                      
                                      if (alreadyMinted && isGovernanceToken) {
                                        return (
                                          <>
                                            <CheckCircle2 className="mr-3 h-5 w-5" /> Already Minted (Limit 1)
                                          </>
                                        );
                                      } else if (eligibilityReason) {
                                        return (
                                          <>
                                            <AlertCircle className="mr-3 h-5 w-5" /> Not Eligible
                                          </>
                                        );
                                      } else {
                                        return (
                                          <>
                                            Mint {token.name}
                                          </>
                                        );
                                      }
                                    })()}
                                    <span className="absolute inset-0 rounded-xl overflow-hidden">
                                      <span className="absolute left-0 top-0 h-full w-0 bg-white/20 transition-all duration-500 group-hover:w-full"></span>
                                    </span>
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isSuccess
                                  ? 'Token successfully minted!'
                                  : (() => {
                                      const config = getTokenConfig(token?.tokenType || 'MEMBER');
                                      const isGovernanceToken = config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE';
                                      
                                      if (alreadyMinted && isGovernanceToken) {
                                        return 'You can only mint one of these tokens per wallet';
                                      } else if (eligibilityReason) {
                                        return eligibilityReason;
                                      } else {
                                        return `Click to mint the ${token.name} token`;
                                      }
                                    })()}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {/* Whitelist request button - only show for whitelist-only tokens when not whitelisted */}
                          {isConnected && (() => {
                            const config = getTokenConfig(token?.tokenType || 'MEMBER');
                            return config.mintAccess === 'WHITELIST_ONLY' && !isWhitelisted && !alreadyMinted;
                          })() && (
                            <Button 
                              variant="outline" 
                              className="w-full h-12 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                              onClick={() => openMailTo("Whitelist Request for University Blockchain Club")}
                            >
                              Request Whitelist Access <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Officer role request button - only show for officer-only tokens when not an officer */}
                          {isConnected && (() => {
                            const config = getTokenConfig(token?.tokenType || 'MEMBER');
                            return config.mintAccess === 'OFFICER_ONLY' && !isOfficer && !alreadyMinted;
                          })() && (
                            <Button 
                              variant="outline" 
                              className="w-full h-12 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 font-medium"
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
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                          <Info className="h-5 w-5 text-blue-500" /> Transaction Details
                        </h4>
                        <div className="flex items-center justify-between gap-3 text-sm bg-gray-50 rounded-xl p-4">
                          <span className="text-gray-600 font-medium">Transaction Hash:</span>
                          <div className="flex items-center gap-2">
                            <a 
                              href={`https://amoy.polygonscan.com/tx/${txHash}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-mono text-blue-600 hover:text-blue-800 transition-colors font-medium"
                            >
                              {txHash.slice(0, 8)}...{txHash.slice(-6)}
                            </a>
                            <button 
                              onClick={() => copyToClipboard(txHash)}
                              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Success view */}
                    {isSuccess && (
                      <div className="mt-6 flex flex-col items-center gap-4">
                        <div className="text-center">
                          <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Token Minted Successfully!</h3>
                          <p className="text-gray-600">Your NFT has been added to your collection and is now available on the blockchain.</p>
                        </div>
                        <Button
                          className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium"
                          onClick={() => {
                            onClose();
                            // Optionally: route to dashboard or gallery
                          }}
                        >
                          View All Tokens
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
              
              {/* Optional: Collapsible technical details - simplified */}
              <div className="bg-gray-50 border-t border-gray-200">
                <details className="group">
                  <summary className="p-4 cursor-pointer hover:bg-gray-100 flex items-center transition-colors">
                    <Code className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Technical Details</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-gray-500 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-xs">
                    <div className="bg-white rounded-lg p-3 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wallet:</span>
                        <span className="font-mono text-gray-800">
                          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                        </span>
                      </div>
                      {txHash && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction:</span>
                          <a
                            href={`https://amoy.polygonscan.com/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:text-blue-800"
                          >
                            {txHash.slice(0, 6)}...{txHash.slice(-4)}
                          </a>
                        </div>
                      )}
                    </div>
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