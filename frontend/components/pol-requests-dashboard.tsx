"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Copy, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, Send, Wallet } from "lucide-react"

interface PolRequest {
  id: string
  address: string
  timestamp: number
  status: "pending" | "funded" | "rejected"
  userAgent?: string
  ip?: string
  createdAt: string
}

export default function PolRequestsDashboard() {
  const [requests, setRequests] = useState<PolRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [fundingAddress, setFundingAddress] = useState("")
  const [fundingAmount, setFundingAmount] = useState("0.1")
  const [isFunding, setIsFunding] = useState(false)
  const [showFundWallet, setShowFundWallet] = useState(false)
  const { toast } = useToast()

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/pol-requests", {
        headers: {
          'Authorization': 'Bearer blockchain-club-admin-2025'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch POL requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: string, status: "funded" | "rejected") => {
    setProcessing(requestId)
    try {
      const response = await fetch("/api/admin/pol-requests", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': 'Bearer blockchain-club-admin-2025'
        },
        body: JSON.stringify({ requestId, status })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Request marked as ${status}`,
        })
        fetchRequests() // Refresh the list
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      })
    } finally {
      setProcessing(null)
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  const openPolygonScan = (address: string) => {
    window.open(`https://amoy.polygonscan.com/address/${address}`, "_blank")
  }

  const handleSendPOL = async (address: string, requestId?: string, customAmount?: string) => {
    if (isFunding) return
    
    const amount = customAmount || "0.1" // Default to 0.1 POL for requests
    const amountInWei = (parseFloat(amount) * 1e18).toString(16) // Convert to wei and then hex
    
    setIsFunding(true)
    try {
      // Check if user has MetaMask
      if (!window.ethereum) {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to send POL tokens.",
          variant: "destructive"
        })
        return
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // Switch to Polygon Amoy
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // 80002 in hex
      })

      // Create transaction
      const tx = {
        to: address,
        value: `0x${amountInWei}`, // Amount in wei (hex)
        data: '0x'
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      })

      toast({
        title: "🚀 Transaction Sent!",
        description: `${amount} POL sent to ${address.slice(0, 6)}...${address.slice(-4)}. TX: ${txHash.slice(0, 10)}...`,
        duration: 8000,
      })

      // If this was for a specific request, mark it as funded
      if (requestId) {
        await updateRequestStatus(requestId, "funded")
      }

    } catch (error: any) {
      console.error("Failed to send POL:", error)
      
      let errorMessage = "Failed to send transaction"
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user"
      } else if (error.code === -32002) {
        errorMessage = "MetaMask is already processing a request"
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient POL balance to send transaction"
      }

      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsFunding(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "funded": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "pending": return <Clock className="h-3 w-3" />
      case "funded": return <CheckCircle className="h-3 w-3" />
      case "rejected": return <XCircle className="h-3 w-3" />
      default: return null
    }
  }

  const pendingRequests = requests.filter(req => req.status === "pending")
  const recentRequests = requests.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-yellow-600" />
            POL Requests
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                {pendingRequests.length} pending
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFundWallet(!showFundWallet)}
              className="font-mono text-xs"
            >
              <Wallet className="h-4 w-4 mr-1" />
              Fund Wallet
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchRequests}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Manage testnet POL requests from new users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Fund Wallet Section */}
        {showFundWallet && (
          <div className="mb-6 p-4 border border-blue-400/30 bg-blue-500/5 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-700 mb-3 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send POL to Any Wallet
            </h4>
            <div className="space-y-3">
              {/* Address Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Wallet Address</label>
                <input
                  type="text"
                  placeholder="Enter wallet address (0x...)"
                  value={fundingAddress}
                  onChange={(e) => setFundingAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  disabled={isFunding}
                />
              </div>
              
              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (POL)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    placeholder="0.1"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    disabled={isFunding}
                  />
                  {/* Quick Amount Buttons */}
                  <div className="flex gap-1">
                    {["0.1", "0.5", "1.0", "2.0"].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setFundingAmount(amount)}
                        disabled={isFunding}
                        className="text-xs px-2 py-1 h-8"
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Send Button */}
              <Button
                onClick={() => {
                  if (!fundingAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                    toast({
                      title: "Invalid Address",
                      description: "Please enter a valid Ethereum address",
                      variant: "destructive"
                    })
                    return
                  }
                  
                  if (!fundingAmount || parseFloat(fundingAmount) <= 0) {
                    toast({
                      title: "Invalid Amount",
                      description: "Please enter a valid amount greater than 0",
                      variant: "destructive"
                    })
                    return
                  }
                  
                  handleSendPOL(fundingAddress, undefined, fundingAmount)
                  setFundingAddress("")
                  setFundingAmount("0.1")
                }}
                disabled={!fundingAddress || !fundingAmount || isFunding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isFunding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-2" />
                    Send {fundingAmount} POL
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-3 font-mono">
              💡 Sends the specified amount of POL via MetaMask transaction on Polygon Amoy testnet
            </p>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#CFB87C]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Pending Requests</h4>
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-3 bg-yellow-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={statusColor(request.status)}>
                          <StatusIcon status={request.status} />
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2 text-xs">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {request.address.slice(0, 8)}...{request.address.slice(-6)}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyAddress(request.address)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => openPolygonScan(request.address)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                          onClick={() => handleSendPOL(request.address, request.id)}
                          disabled={processing === request.id || isFunding}
                          title="Send 0.1 POL and mark as funded"
                        >
                          {isFunding ? (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Sending...</span>
                            </div>
                          ) : (
                            <>
                              <Send className="h-3 w-3 mr-1" />
                              Send POL
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs h-7"
                          onClick={() => updateRequestStatus(request.id, "funded")}
                          disabled={processing === request.id || isFunding}
                          title="Mark as funded (without sending)"
                        >
                          {processing === request.id ? "..." : "Mark Funded"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 text-xs h-7"
                          onClick={() => updateRequestStatus(request.id, "rejected")}
                          disabled={processing === request.id || isFunding}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentRequests.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Recent Activity</h4>
                <div className="space-y-1">
                  {recentRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusColor(request.status)} text-xs`}>
                          <StatusIcon status={request.status} />
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                        <span className="font-mono text-xs">
                          {request.address.slice(0, 6)}...{request.address.slice(-4)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="pt-2 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-yellow-600">{pendingRequests.length}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-600">
                    {requests.filter(r => r.status === "funded").length}
                  </p>
                  <p className="text-xs text-gray-600">Funded</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700">{requests.length}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>

            {requests.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No POL requests yet</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
