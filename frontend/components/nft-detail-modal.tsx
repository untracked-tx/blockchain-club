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
import { getBlockchainErrorMessage, isPermissionError, retryWithBackoff, getSmartGasParams } from "@/lib/error-utils"

// Token type configurations (fallback for UI display)
const tokenTypeConfigs = {
  MEMBER: {
    roleGranted: "MEMBER_ROLE",
    expires: "1 year",
    maxSupply: 10,
    mintAccess: "WHITELIST_ONLY",
    cost: "0.01 ETH",
    soulbound: true,
    category: "governance"
  },
  OFFICER: {
    roleGranted: "OFFICER_ROLE", 
    expires: "1 year",
    maxSupply: 2,
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
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
  "HISTORICAL_GLITCH": {
    roleGranted: "None",
    expires: "Never",
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY", 
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
  "GOLD_STAR": {
    roleGranted: "None",
    expires: "Never",
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free", 
    soulbound: true,
    category: "culture"
  },
  "LONG_RUN": {
    roleGranted: "None",
    expires: "Never",
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
  "THE_FOOL": {
    roleGranted: "None",
    expires: "Never", 
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
  const config = tokenTypeConfigs[tokenType as keyof typeof tokenTypeConfigs] || tokenTypeConfigs.MEMBER;
  // Ensure we always return an object, not a string
  return typeof config === 'object' ? config : tokenTypeConfigs.MEMBER;
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
      
      // Use retry logic with smart gas estimation
      const tx = await retryWithBackoff(async () => {
        const gasParams = await getSmartGasParams(contract, 'publicMint', [tokenNameBytes32, isSoulbound]);
        return await contract.publicMint(tokenNameBytes32, isSoulbound, gasParams);
      }, 3);
      
      setStep("Transaction submitted. Waiting for confirmation...");
      setTxHash(tx.hash);
      await tx.wait();
      
      setStep("Success! Token minted successfully.");
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Minting error:", err);
      
      // Check if it's a permission-related error first
      const permissionError = isPermissionError(err);
      if (permissionError) {
        setPermissionError(permissionError);
        setStep("");
        return;
      }
      
      // Get user-friendly error message
      const errorMessage = getBlockchainErrorMessage(err);
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
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-0 overflow-y-auto rounded-2xl bg-white shadow-xl border-0">
              {/* Header */}
              <div className={`p-4 sm:p-6 bg-gradient-to-r ${getRoleColor()} text-white relative`}>
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                    <div className="p-1 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full"></div>
                    </div>
                    {token.name}
                  </DialogTitle>
                  <DialogDescription className="text-white/90 text-sm sm:text-base">
                    {token.description}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Status Alerts - Simplified */}
                {!isConnected && (
                  <Alert className="border-l-4 border-blue-500 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 font-medium text-sm">
                      Connect your wallet to mint tokens
                    </AlertDescription>
                  </Alert>
                )}

                {step && (
                  <Alert className="border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <AlertDescription className="text-blue-800 font-medium text-sm">{step}</AlertDescription>
                    </div>
                  </Alert>
                )}
                
                {isSuccess && (
                  <Alert className="border-l-4 border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium text-sm">
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
                    <AlertDescription className="text-red-800 font-medium text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Main content */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                  {/* Image */}
                  <div className="lg:col-span-2 rounded-xl bg-gray-50 border border-gray-200 p-3 sm:p-6 flex items-center justify-center">
                    <img 
                      src={token.imageUri || "/placeholder.svg"} 
                      alt={token.name} 
                      className="max-h-60 sm:max-h-80 max-w-full object-contain rounded-lg cursor-zoom-in"
                      onClick={() => setZoomOpen(true)}
                    />
                  </div>

                  {/* Info and actions */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">About This Token</h3>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {token.tokenType === 'MEMBER' && "Official membership token that grants voting rights, access to exclusive events, and represents your active participation in the Blockchain Club community."}
                        {token.tokenType === 'OFFICER' && "Officer governance token providing leadership privileges, administrative access, and enhanced voting weight in club decisions and proposals."}
                        {token.tokenType === 'SUPPORTER' && "Community supporter token recognizing your contribution to the club. Shows your commitment to advancing blockchain education and innovation."}
                        {token.tokenType === 'POAP' && "Proof of Attendance Protocol token commemorating your participation in a special blockchain club event or achievement milestone."}
                        {!['MEMBER', 'OFFICER', 'SUPPORTER', 'POAP'].includes(token.tokenType) && `${token.tokenType} token with unique benefits and access privileges within the Blockchain Club ecosystem.`}
                      </p>
                    </div>

                    {/* Comprehensive Token Details */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base uppercase tracking-wide">
                        Token Details
                      </h3>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">Type</span>
                          <Badge className={`${getRoleBgColor()} ${getRoleTextColor()} text-xs`}>
                            {token.tokenType}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">Mint Cost</span>
                          <span className="font-semibold text-gray-900">{getCostText()}</span>
                        </div>
                        
                        {contractConfig && (
                          <>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 font-medium">Supply</span>
                              <span className="font-semibold text-gray-900">
                                {contractConfig.currentSupply} / {contractConfig.maxSupply}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 font-medium">Access Level</span>
                              <span className="font-semibold text-gray-900">
                                {contractConfig.mintAccess === 0 ? 'Officers Only' : 
                                 contractConfig.mintAccess === 1 ? 'Whitelist Only' : 'Public Mint'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 font-medium">Status</span>
                              <Badge className={contractConfig.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} variant="secondary">
                                {contractConfig.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </>
                        )}
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">Role Granted</span>
                          <span className="font-semibold text-gray-900">
                            {getTokenConfig(token?.tokenType || 'MEMBER').roleGranted || 'None'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">Transferable</span>
                          {getTokenConfig(token?.tokenType || 'MEMBER').soulbound ? (
                            <Badge className="bg-red-100 text-red-800 text-xs">Soulbound</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 text-xs">Yes</Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">Category</span>
                          <span className="font-semibold text-gray-900 capitalize">
                            {getTokenConfig(token?.tokenType || 'MEMBER').category}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">Validity</span>
                          <span className="font-semibold text-gray-900">
                            {getTokenConfig(token?.tokenType || 'MEMBER').expires}
                          </span>
                        </div>
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
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Zoom Modal with Magnifier */}
      <Dialog open={zoomOpen} onOpenChange={() => setZoomOpen(false)}>
        <DialogContent className="flex flex-col items-center justify-center bg-black/90 w-[95vw] max-w-3xl max-h-[90vh] p-0">
          <DialogTitle className="sr-only">Zoomed NFT Image</DialogTitle>
          <button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-white hover:text-gray-300"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
          >
            <X size={24} className="sm:w-7 sm:h-7" />
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
