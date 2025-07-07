"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, ChevronDown, Wallet, Info } from "lucide-react"
import { ethers } from "ethers"
import { useAccount } from 'wagmi'
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { contracts } from "@/lib/contracts"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Officer addresses (lowercase)
const OFFICER_ADDRESSES: string[] = [
  '0xDA30c053156E690176574dAEe79CEB94e3C8F0cC',
];

// Token type configurations
const tokenTypeConfigs = {
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
  SUPPORTER: {
    roleGranted: "None",
    expires: "Never",
    maxSupply: "Unlimited",
    mintAccess: "PUBLIC",
    cost: "Optional",
    soulbound: false,
    category: "culture"
  },
  POAP: {
    roleGranted: "None",
    expires: "N/A",
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
  AWARD: {
    roleGranted: "None",
    expires: "N/A", 
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
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

function getTokenConfig(tokenType: string) {
  return tokenTypeConfigs[tokenType as keyof typeof tokenTypeConfigs] || tokenTypeConfigs.MEMBER;
}

function getContractRole(token: any): string {
  const tokenType = token?.tokenType || 'MEMBER';
  const config = getTokenConfig(tokenType);
  
  switch (config.roleGranted) {
    case 'MEMBER_ROLE': return 'Member';
    case 'OFFICER_ROLE': return 'Officer';
    case 'None': 
    default: 
      return tokenType;
  }
}

interface NFTDetailModalProps {
  isOpen: boolean
  onClose: () => void
  token: any
  category?: any
}

export default function NFTDetailModal({ isOpen, onClose, token }: NFTDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<any>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [step, setStep] = useState<string>("")
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null)
  const [alreadyMinted, setAlreadyMinted] = useState<boolean | null>(null)
  const [isOfficer, setIsOfficer] = useState<boolean>(false)
  const [eligibilityReason, setEligibilityReason] = useState<string>("")

  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const CONTRACT_ADDRESS = contracts.membership.address
  const CONTRACT_ABI = contracts.membership.abi

  // Helper: Check whitelist
  async function checkWhitelist(address: string): Promise<boolean> {
    try {
      if (!address) return false;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      return await contract.whitelist(address);
    } catch (error) {
      console.error("Failed to check whitelist:", error);
      return false;
    }
  }

  // Mint handler
  const handleMint = async () => {
    setError(null);
    setIsSuccess(false);
    setTxHash(null);
    setStep("Preparing transaction...");
    setIsLoading(true);
    
    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }
      
      const tokenType = token?.tokenType || 'MEMBER';
      const config = getTokenConfig(tokenType);
      const contractRole = getContractRole(token);
      
      // Check restrictions
      if (config.mintAccess === 'OFFICER_ONLY' && !OFFICER_ADDRESSES.includes(address.toLowerCase())) {
        throw new Error("This token requires officer privileges.");
      }
      
      if (config.mintAccess === 'WHITELIST_ONLY') {
        const whitelisted = await checkWhitelist(address);
        if (!whitelisted) {
          throw new Error("You need to be whitelisted for this token.");
        }
      }
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      let mintValue = ethers.parseEther("0");
      let tx;
      
      setStep("Confirming transaction...");
      
      if (config.mintAccess === 'PUBLIC') {
        // Public mint
        if (config.cost && config.cost !== 'Free' && config.cost !== 'Optional') {
          const costMatch = config.cost.match(/([\d.]+)/);
          if (costMatch) {
            mintValue = ethers.parseEther(costMatch[1]);
          }
        }
        
        const isSoulbound = config.soulbound || false;
        if (mintValue.toString() === '0') {
          tx = await contract.publicMint(tokenType, isSoulbound);
        } else {
          tx = await contract.publicMint(tokenType, isSoulbound, { value: mintValue });
        }
      } else {
        // Restricted mint
        if (config.roleGranted === 'MEMBER_ROLE') {
          mintValue = ethers.parseEther("0.01");
        }
        
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
      
      setStep("Success! Token minted successfully.");
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while minting.");
      setStep("");
    } finally {
      setIsLoading(false);
    }
  };

  // Check eligibility
  useEffect(() => {
    async function checkEligibility() {
      if (!isConnected || !address || !token) return;
      
      try {
        const config = getTokenConfig(token.tokenType || 'MEMBER');
        
        // Check whitelist
        const whitelisted = await checkWhitelist(address);
        setIsWhitelisted(whitelisted);
        
        // Check officer status
        const officer = OFFICER_ADDRESSES.includes(address.toLowerCase());
        setIsOfficer(officer);
        
        // Check if already minted (for governance tokens)
        if (config.roleGranted === 'MEMBER_ROLE' || config.roleGranted === 'OFFICER_ROLE') {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          const hasMinted = await contract.hasMintedRole(address, getContractRole(token));
          setAlreadyMinted(hasMinted);
          
          if (hasMinted) {
            setEligibilityReason("You already own this type of token.");
            return;
          }
        } else {
          setAlreadyMinted(false);
        }
        
        // Set eligibility reason
        if (config.mintAccess === 'WHITELIST_ONLY' && !whitelisted) {
          setEligibilityReason("You need to be whitelisted for this token.");
        } else if (config.mintAccess === 'OFFICER_ONLY' && !officer) {
          setEligibilityReason("This token requires officer privileges.");
        } else {
          setEligibilityReason("");
        }
      } catch (e) {
        console.error("Error checking eligibility:", e);
      }
    }
    
    checkEligibility();
  }, [isConnected, address, token, isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSuccess(false);
      setStep("");
      setTxHash(null);
    }
  }, [isOpen]);

  const getCostText = () => {
    const config = getTokenConfig(token?.tokenType || 'MEMBER');
    return config.cost || "Free";
  };

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

  if (!token) return null;

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
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white shadow-xl border-0">
              {/* Header */}
              <div className={`p-6 bg-gradient-to-r ${getRoleColor()} text-white relative`}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <div className="w-5 h-5 bg-white rounded-full"></div>
                    </div>
                    {token.name}
                  </DialogTitle>
                  <DialogDescription className="text-white/90 text-base">
                    {token.description}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Alert */}
                {isConnected && eligibilityReason && (
                  <Alert className="border-l-4 border-yellow-500 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 font-medium">
                      {eligibilityReason}
                    </AlertDescription>
                  </Alert>
                )}

                {step && (
                  <Alert className="border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <AlertDescription className="text-blue-800 font-medium">{step}</AlertDescription>
                    </div>
                  </Alert>
                )}
                
                {isSuccess && (
                  <Alert className="border-l-4 border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium">
                      Token minted successfully!
                      {txHash && (
                        <a 
                          href={`https://amoy.polygonscan.com/tx/${txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="ml-2 underline hover:text-green-900"
                        >
                          View transaction
                        </a>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert className="border-l-4 border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Main content */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Image */}
                  <div className="lg:col-span-2 rounded-xl bg-gray-50 border border-gray-200 p-6 flex items-center justify-center">
                    <img 
                      src={token.imageUri || "/placeholder.svg"} 
                      alt={token.name} 
                      className="max-h-80 max-w-full object-contain rounded-lg"
                    />
                  </div>

                  {/* Info and actions */}
                  <div className="space-y-4">
                    {/* Token info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Token Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Type</span>
                          <Badge className={`${getRoleBgColor()} ${getRoleTextColor()} text-xs`}>
                            {token.tokenType}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Cost</span>
                          <span className="font-medium text-gray-900">{getCostText()}</span>
                        </div>
                        {getTokenConfig(token?.tokenType || 'MEMBER').soulbound && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Transferable</span>
                            <Badge className="bg-red-100 text-red-800 text-xs">Soulbound</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mint action */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      {!isConnected ? (
                        <Button
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              if (openConnectModal) openConnectModal();
                            }, 300);
                          }}
                          className={`w-full bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white rounded-lg font-medium`}
                        >
                          <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                        </Button>
                      ) : (
                        <Button
                          onClick={handleMint}
                          disabled={isLoading || isSuccess || (alreadyMinted && getTokenConfig(token?.tokenType || 'MEMBER').roleGranted !== 'None') || !!eligibilityReason}
                          className={cn(
                            "w-full rounded-lg font-medium transition-all duration-200",
                            isSuccess
                              ? "bg-green-500 hover:bg-green-600"
                              : `bg-gradient-to-r ${getRoleColor()} hover:opacity-90`,
                            "text-white"
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
                            `Mint ${token.name}`
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical details - collapsed by default */}
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
