"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Copy, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw } from "lucide-react"

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
  const { toast } = useToast()

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/pol-requests")
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
        headers: { "Content-Type": "application/json" },
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Manage testnet POL requests from new users
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                          className="bg-green-600 hover:bg-green-700 text-xs h-7"
                          onClick={() => updateRequestStatus(request.id, "funded")}
                          disabled={processing === request.id}
                        >
                          {processing === request.id ? "..." : "Funded"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 text-xs h-7"
                          onClick={() => updateRequestStatus(request.id, "rejected")}
                          disabled={processing === request.id}
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
