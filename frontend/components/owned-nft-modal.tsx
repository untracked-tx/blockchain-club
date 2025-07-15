"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Utility to convert ipfs:// to https://ipfs.io/ipfs/
function ipfsToHttp(url?: string) {
  if (!url) return "";
  return url.startsWith("ipfs://")
    ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
    : url;
}

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
  const [zoomOpen, setZoomOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!token) return null;

  // Fetch metadata when modal opens
  useEffect(() => {
    if (isOpen && token.imageUri) {
      setIsLoadingMetadata(true);

      // Construct metadata URL from imageUri
      let metadataUrl = '';
      if (token.imageUri.startsWith('ipfs://')) {
        const ipfsPath = ipfsToHttp(token.imageUri);
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
    if (token.metadata?.attributes) {
      return token.metadata.attributes
        .map((attr: any) => ({
          label: attr.trait_type,
          value: attr.value
        }));
    }
    if (metadata?.attributes) {
      return metadata.attributes
        .map((attr: any) => ({
          label: attr.trait_type,
          value: attr.value
        }));
    }
    const basicAttributes = [];
    if (token.type && token.type !== "Member Token") {
      basicAttributes.push({ label: "Type", value: token.type });
    }
    if (token.votingPower) {
      basicAttributes.push({ label: "Voting Power", value: token.votingPower.toString() });
    }
    return basicAttributes;
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
              <DialogTitle className="sr-only">{token.name} NFT Details</DialogTitle>
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
                      <div className="relative">
                        <img
                          ref={imgRef}
                          src={ipfsToHttp(token.imageUri) || "/placeholder.svg"}
                          alt={token.name}
                          className="w-full h-auto rounded-lg cursor-zoom-in"
                          onClick={() => setZoomOpen(true)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
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
                          {token.expires && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-600 font-medium">Expiration</span>
                              <span className="text-gray-900 font-semibold">{formatDate(token.expires)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm">
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

      {/* Zoom Modal with Magnifier */}
      <Dialog open={zoomOpen} onOpenChange={() => setZoomOpen(false)}>
        <DialogContent className="flex flex-col items-center justify-center bg-black/90 max-w-3xl p-0">
          <button
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
          >
            <X size={28} />
          </button>
          <MagnifierImage imageUrl={ipfsToHttp(token.imageUri) || "/placeholder.svg"} alt={token.name} />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// MagnifierImage component
function MagnifierImage({ imageUrl, alt }: { imageUrl: string, alt: string }) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const magnifierSize = 220; // px (slightly larger)
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
