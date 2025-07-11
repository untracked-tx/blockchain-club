"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Code, ChevronRight, Wallet, Mail, X } from "lucide-react"
import { ethers } from "ethers"
import { useAccount } from 'wagmi'
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { contracts } from "@/lib/contracts"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Token type configurations (fallback for UI display)
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
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [contractConfig, setContractConfig] = useState<any>(null)
  const [zoomOpen, setZoomOpen] = useState(false);
  const clubEmail = "liam.murphy@ucdenver.edu"; // Set your club email here

  // Token name mapping from display name to contract token type name
  const tokenNameMapping: { [key: string]: string } = {
    // Member tokens
    "Trader": "Trader",
    "Trader Chill": "Trader Chill",
    "Let's Get This Party Started": "Let's Get This Party Started",
    "Custom membership": "Custom Membership",
    
    // Officer tokens
    "President": "President",
    "Vice President": "Vice President",
    "CFO": "CFO",
    "Treasurer": "Treasurer",
    "Major Key Alert": "Major Key Alert",
    "Officer": "Officer",
    
    // Supporter tokens
    "The Graduate": "The Graduate",
    "Rhodes Scholar": "Rhodes Scholar",
    "Digital Art": "Digital Art",
    
    // POAP tokens
    "Mint & Slurp": "Mint & Slurp",
    "Quad": "Quad",
    "Secret Sauce": "Secret Sauce",
    
    // Awards
    "Founders Series": "Founders Series",
    "Gold Star": "Gold Star",
    "Long Run": "Long Run"
  }

  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const CONTRACT_ADDRESS = contracts.membership.address
  const CONTRACT_ABI = contracts.membership.abi

  // Helper: mailto for whitelist/officer request
  function openMailTo(subject: string) {
    window.open(`mailto:${clubEmail}?subject=${encodeURIComponent(subject)}`);
  }

  // Simple mint handler that handles errors gracefully
  const handleMint = async () => {
    setError(null);
    setPermissionError(null);
    setIsSuccess(false);
    setTxHash(null);
    setStep("Preparing transaction...");
    setIsLoading(true);
    
    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }
      
      // Use the actual token name instead of generic type
      const tokenName = tokenNameMapping[token.name] || token.name || token?.tokenType || 'MEMBER';
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tokenNameBytes32 = ethers.keccak256(ethers.toUtf8Bytes(tokenName));
      const isSoulbound = getTokenConfig(token?.tokenType || 'MEMBER').soulbound || false;
      
      setStep("Confirming transaction...");
      
      // Use publicMint for all cases - the contract handles access control
      const tx = await contract.publicMint(tokenNameBytes32, isSoulbound);
      
      setStep("Transaction submitted. Waiting for confirmation...");
      setTxHash(tx.hash);
      await tx.wait();
      
      setStep("Success! Token minted successfully.");
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Minting error:", err);
      
      // Check if it's a permission-related error
      if (err.message?.includes("execution reverted")) {
        if (err.message?.includes("Officers only") || err.reason?.includes("Officers only")) {
          setPermissionError("OFFICER_REQUIRED");
          return;
        } else if (err.message?.includes("Not whitelisted") || err.reason?.includes("Not whitelisted")) {
          setPermissionError("WHITELIST_REQUIRED");
          return;
        }
      }
      
      // Parse other types of errors for user-friendly messages
      let errorMessage = "An error occurred while minting.";
      
      if (err.code === 4001 || err.message?.includes("User denied")) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (err.message?.includes("Already minted") || err.reason?.includes("Already minted")) {
        errorMessage = "You have already minted this token type.";
      } else if (err.message?.includes("Max supply reached") || err.reason?.includes("Max supply reached")) {
        errorMessage = "Maximum supply for this token has been reached.";
      } else if (err.message?.includes("Token type not active") || err.reason?.includes("Token type not active")) {
        errorMessage = "This token type is not currently available for minting.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds to complete the transaction.";
      } else if (err.reason && !err.reason.includes("0x")) {
        errorMessage = err.reason;
      } else if (err.message && !err.message.includes("0x") && !err.message.includes("execution reverted")) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setStep("");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal opens/closes or token changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPermissionError(null);
      setIsSuccess(false);
      setStep("");
      setTxHash(null);
      setContractConfig(null);
    }
  }, [isOpen, token]);

  const getCostText = () => {
    // Use hardcoded config for now since we don't have cost info in contract
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
                {/* Status Alerts - Simplified */}
                {!isConnected && (
                  <Alert className="border-l-4 border-blue-500 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 font-medium">
                      Connect your wallet to mint tokens
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
                      className="max-h-80 max-w-full object-contain rounded-lg cursor-zoom-in"
                      onClick={() => setZoomOpen(true)}
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
                        {contractConfig && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Supply</span>
                              <span className="font-medium text-gray-900">
                                {contractConfig.currentSupply}/{contractConfig.maxSupply}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Access</span>
                              <span className="font-medium text-gray-900">
                                {contractConfig.mintAccess === 0 ? 'Officers Only' : 
                                 contractConfig.mintAccess === 1 ? 'Whitelist Only' : 'Public'}
                              </span>
                            </div>
                          </>
                        )}
                        {getTokenConfig(token?.tokenType || 'MEMBER').soulbound && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Transferable</span>
                            <Badge className="bg-red-100 text-red-800 text-xs">Soulbound</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mint action */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                      <Button
                        onClick={!isConnected ? () => {
                          onClose();
                          setTimeout(() => {
                            if (openConnectModal) openConnectModal();
                          }, 300);
                        } : handleMint}
                        disabled={isLoading || isSuccess || !!permissionError}
                        className={cn(
                          "w-full rounded-lg font-medium transition-all duration-200",
                          isSuccess
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : (isLoading || !!permissionError)
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                            : !isConnected
                            ? `bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white`
                            : `bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white`
                        )}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                            Minting...
                          </div>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Success!
                          </>
                        ) : !isConnected ? (
                          <>
                            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                          </>
                        ) : !!permissionError ? (
                          "Not Eligible to Mint"
                        ) : (
                          `Mint ${token.name}`
                        )}
                      </Button>
                      
                      {/* Email request buttons for permission errors */}
                      {permissionError === "WHITELIST_REQUIRED" && (
                        <Button 
                          variant="outline" 
                          className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-all duration-300 font-medium"
                          onClick={() => openMailTo("Whitelist Request for University Blockchain Club")}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Request Whitelist Access
                        </Button>
                      )}
                      
                      {permissionError === "OFFICER_REQUIRED" && (
                        <Button 
                          variant="outline" 
                          className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50 transition-all duration-300 font-medium"
                          onClick={() => openMailTo("Officer Role Application for University Blockchain Club")}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Apply for Officer Role
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
      {/* Zoom Modal with Magnifier */}
      <Dialog open={zoomOpen} onOpenChange={() => setZoomOpen(false)}>
        <DialogContent className="flex flex-col items-center justify-center bg-black/90 max-w-3xl p-0">
          <DialogTitle className="sr-only">Zoomed NFT Image</DialogTitle>
          <button
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
          >
            <X size={28} />
          </button>
          <MagnifierImage imageUrl={token.imageUri || "/placeholder.svg"} alt={token.name} />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// MagnifierImage component
function MagnifierImage({ imageUrl, alt }: { imageUrl: string, alt: string }) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const magnifierSize = 220; // px
  const zoom = 1.75;
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className="relative flex items-center justify-center w-full h-full p-6">
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt}
        className="max-h-[70vh] max-w-full rounded-lg bg-black select-none"
        style={{ cursor: showMagnifier ? 'none' : 'zoom-in' }}
        draggable={false}
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={e => {
          const { left, top } = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - left;
          const y = e.clientY - top;
          setMagnifierPos({ x, y });
        }}
      />
      {showMagnifier && imgRef.current && (
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: `${magnifierPos.y - magnifierSize / 2}px`,
            left: `${magnifierPos.x - magnifierSize / 2}px`,
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            border: '2px solid #fff',
            background: `url('${imageUrl}') no-repeat`,
            backgroundSize: `${imgRef.current.width * zoom}px ${imgRef.current.height * zoom}px`,
            backgroundPosition: `-${magnifierPos.x * zoom - magnifierSize / 2}px -${magnifierPos.y * zoom - magnifierSize / 2}px`,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
