"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface OwnedNFTModalProps {
  isOpen: boolean
  onClose: () => void
  token: any & {
    metadata?: {
      attributes?: Array<{trait_type: string, value: string}>
    }
  }
}

export default function OwnedNFTModal({ isOpen, onClose, token }: OwnedNFTModalProps) {
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  if (!token) return null;

  // Fetch metadata when modal opens
  useEffect(() => {
    if (isOpen && token.imageUri) {
      setIsLoadingMetadata(true);
      
      // Construct metadata URL from imageUri
      let metadataUrl = '';
      if (token.imageUri.includes('ipfs://')) {
        const ipfsPath = token.imageUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        const basePath = ipfsPath.substring(0, ipfsPath.lastIndexOf('/'));
        const tokenName = token.name?.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        metadataUrl = `${basePath}/${tokenName}.json`;
      }
      
      if (metadataUrl) {
        fetch(metadataUrl)
          .then(res => res.json())
          .then(data => {
            setMetadata(data);
            setIsLoadingMetadata(false);
          })
          .catch(err => {
            console.error('Error fetching metadata:', err);
            setIsLoadingMetadata(false);
          });
      } else {
        setIsLoadingMetadata(false);
      }
    }
  }, [isOpen, token]);

  const getDisplayAttributes = () => {
    console.log("Modal Debug - token object:", token);
    console.log("Modal Debug - token.metadata:", token.metadata);
    console.log("Modal Debug - fetched metadata:", metadata);
    
    // First, try to use metadata from the token if it's already available
    if (token.metadata?.attributes) {
      console.log("Modal Debug - Using token.metadata.attributes:", token.metadata.attributes);
      return token.metadata.attributes
        .map((attr: any) => ({
          label: attr.trait_type,
          value: attr.value
        }));
    }
    
    // Fallback to fetched metadata
    if (metadata?.attributes) {
      console.log("Modal Debug - Using fetched metadata.attributes:", metadata.attributes);
      return metadata.attributes
        .map((attr: any) => ({
          label: attr.trait_type,
          value: attr.value
        }));
    }
    
    // If no attributes available, return some basic info
    console.log("Modal Debug - No attributes found, using fallback");
    const basicAttributes = [];
    if (token.type && token.type !== "Member Token") {
      basicAttributes.push({ label: "Type", value: token.type });
    }
    if (token.votingPower) {
      basicAttributes.push({ label: "Voting Power", value: token.votingPower.toString() });
    }
    
    return basicAttributes;
  };

  const handleImageLoad = (e: any) => {
    // Convert IPFS to gateway URL if needed
    if (e.target.src.startsWith('ipfs://')) {
      e.target.src = e.target.src.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-2xl bg-white shadow-2xl border-0">
              <div className="flex flex-col lg:flex-row">
                {/* Left side - Artwork */}
                <div className="lg:w-3/5 bg-gradient-to-br from-slate-50 to-gray-100 p-8 flex items-center justify-center min-h-[500px]">
                  <div className="relative max-w-md w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl overflow-hidden shadow-xl bg-white p-3"
                    >
                      <img
                        src={token.imageUri || "/placeholder.svg"}
                        alt={token.name}
                        className="w-full h-auto rounded-lg"
                        onLoad={handleImageLoad}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </motion.div>
                    

                  </div>
                </div>

                {/* Right side - Details */}
                <div className="lg:w-2/5 p-6 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      {token.name}
                    </h1>
                  </motion.div>

                  {/* Token Metadata */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 space-y-3">
                      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                        Details
                      </h3>
                      
                      {isLoadingMetadata ? (
                        <div className="text-sm text-gray-500">Loading details...</div>
                      ) : getDisplayAttributes().length > 0 ? (
                        <div className="space-y-3 text-sm">
                          {getDisplayAttributes().map((attr: {label: string, value: string}, index: number) => (
                            <div key={index} className="flex justify-between items-center py-1">
                              <span className="text-gray-600 font-medium">{attr.label}</span>
                              <span className="text-gray-900 font-semibold">{attr.value}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center py-1 border-t border-gray-200 pt-3 mt-3">
                            <span className="text-gray-600 font-medium">Acquired</span>
                            <span className="text-gray-900 font-semibold">{formatDate(token.acquired)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 font-medium">Acquired</span>
                            <span className="text-gray-900 font-semibold">{formatDate(token.acquired)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                        onClick={() => {
                          window.open(`https://amoy.polygonscan.com/token/0x562b2c7b8BDaD1241CAc7Baa82004dA2dFA5dBC0?a=${token.tokenId || token.id}`, '_blank');
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Polygonscan
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
