"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Shield,
  Award,
  UserPlus,
  Lock,
  Search,
  Users,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wallet,
  FileText,
  BarChart3,
  Clock,
} from "lucide-react"

// Mock whitelist data
const mockWhitelistRequests = [
  {
    id: "WL-001",
    address: "0x1234...5678",
    email: "student1@university.edu",
    requestDate: "2023-05-01T10:30:00Z",
    status: "pending",
    requestedRole: "Member",
  },
  {
    id: "WL-002",
    address: "0x8765...4321",
    email: "student2@university.edu",
    requestDate: "2023-05-03T14:45:00Z",
    status: "approved",
    requestedRole: "Member",
    approvedBy: "Alex Johnson",
    approvedDate: "2023-05-04T09:15:00Z",
  },
  {
    id: "WL-003",
    address: "0xabcd...efgh",
    email: "professor@university.edu",
    requestDate: "2023-05-05T11:20:00Z",
    status: "pending",
    requestedRole: "Supporter",
  },
]

// Mock token supply data
const mockTokenSupply = [
  { role: "Observer", supply: 45, maxSupply: 0, active: 42 },
  { role: "Member", supply: 28, maxSupply: 100, active: 25 },
  { role: "Supporter", supply: 12, maxSupply: 50, active: 12 },
  { role: "Officer", supply: 5, maxSupply: 10, active: 5 },
]

// Mock user lookup data
const mockUsers = [
  {
    address: "0x1234...5678",
    email: "student1@university.edu",
    role: "Observer",
    tokens: 1,
    joinDate: "2023-04-15T10:30:00Z",
    lastActive: "2023-05-10T14:20:00Z",
  },
  {
    address: "0x8765...4321",
    email: "student2@university.edu",
    role: "Member",
    tokens: 2,
    joinDate: "2023-03-22T09:15:00Z",
    lastActive: "2023-05-11T16:45:00Z",
  },
  {
    address: "0xabcd...efgh",
    email: "professor@university.edu",
    role: "Supporter",
    tokens: 3,
    joinDate: "2023-02-10T11:30:00Z",
    lastActive: "2023-05-09T10:20:00Z",
  },
]

// TODO: Replace all mock data (whitelist, token supply, users) with real backend or smart contract data
// TODO: Replace simulated wallet connection and officer check with real wallet integration and officer role check
// TODO: Implement approve/reject actions for whitelist with real contract or backend calls
// TODO: Implement minting and token management actions with real contract calls
// TODO: Add tooltips for each action and badge for officer-only controls
// TODO: Add transaction status, error handling, and Etherscan links for actions
// TODO: Replace all placeholder text with real club info as provided

export default function OfficersPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isOfficer, setIsOfficer] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("whitelist")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [targetAddress, setTargetAddress] = useState("")

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsConnected(true)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleConnect = () => {
    setIsConnected(true)
  }

  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }

    // Simulate search
    const results = mockUsers.filter(
      (user) =>
        user.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setSearchResults(results)
  }

  const handleAction = async () => {
    if (!targetAddress) {
      setError("Please enter a valid wallet address")
      return
    }

    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Simulate a delay for the action
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate success
      setSuccess("Action completed successfully!")
    } catch (err) {
      setError("Transaction failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Observer":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Users className="mr-1 h-3 w-3" /> Observer
          </Badge>
        )
      case "Member":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Shield className="mr-1 h-3 w-3" /> Member
          </Badge>
        )
      case "Supporter":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Wallet className="mr-1 h-3 w-3" /> Supporter
          </Badge>
        )
      case "Officer":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Award className="mr-1 h-3 w-3" /> Officer
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Officer Controls</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Administrative tools for club officers to manage membership and governance.
        </p>
        {/* TODO: Add officer-only badge and info about officer responsibilities */}
      </div>

      {!isConnected ? (
        <div className="mx-auto max-w-md text-center">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Connect Your Wallet</CardTitle>
              <CardDescription className="text-gray-600">
                You need to connect your wallet to access officer controls.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={handleConnect}>Connect Wallet</Button>
            </CardFooter>
          </Card>
        </div>
      ) : !isOfficer ? (
        <Card className="mx-auto max-w-md border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Access Denied</CardTitle>
            <CardDescription className="text-gray-600">This page is only accessible to club officers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You need an officer token to access this page. Please contact a current officer if you believe you should
              have access.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {error && (
            <Alert className="mb-6 border-destructive bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle className="text-gray-900">Total Members</CardTitle>
                <CardDescription className="text-gray-600">Active club membership</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {mockTokenSupply.reduce((acc, curr) => acc + curr.active, 0)}
                    </span>
                    <span className="text-sm text-gray-600">Active members</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-gray-900">Pending Requests</CardTitle>
                <CardDescription className="text-gray-600">Whitelist approvals needed</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {mockWhitelistRequests.filter((req) => req.status === "pending").length}
                    </span>
                    <span className="text-sm text-gray-600">Pending approvals</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-2">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <CardTitle className="text-gray-900">Token Supply</CardTitle>
                <CardDescription className="text-gray-600">Total tokens minted</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {mockTokenSupply.reduce((acc, curr) => acc + curr.supply, 0)}
                    </span>
                    <span className="text-sm text-gray-600">Tokens in circulation</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="whitelist" onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100">
              <TabsTrigger value="whitelist" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Whitelist Management
              </TabsTrigger>
              <TabsTrigger value="tokens" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Token Supply
              </TabsTrigger>
              <TabsTrigger value="lookup" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                User Lookup
              </TabsTrigger>
              <TabsTrigger value="recovery" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Recovery Token
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Admin Tools
              </TabsTrigger>
            </TabsList>
            {/* TODO: Add tooltips or info popovers for each officer action */}

            <TabsContent value="whitelist">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Whitelist Requests</CardTitle>
                      <CardDescription className="text-gray-600">
                        Review and approve membership requests
                      </CardDescription>
                      {/* TODO: Add eligibility check for whitelist approval (e.g., university email verification) */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="rounded-md border border-gray-200 p-4">
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-gray-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              ID
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Address
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Requested Role
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mockWhitelistRequests.map((request) => (
                            <tr key={request.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {request.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.address}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {request.requestedRole}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {request.status === "pending" ? (
                                  <div className="flex space-x-2">
                                    <Button size="sm" className="h-8 px-2 py-0">
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2 py-0 border-gray-200 text-gray-700"
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">
                                    {request.status === "approved"
                                      ? `Approved by ${request.approvedBy}`
                                      : "No actions available"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3 flex justify-between">
                  <Button variant="outline" className="border-gray-200 text-gray-700">
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
                  </Button>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Manual Entry
                  </Button>
                </CardFooter>
              </Card>

              <div className="flex justify-end mt-6">
                <Button
                  variant="destructive"
                  className="flex items-center"
                  onClick={() => {
                    window.alert(
                      'Warning: Emergency Pause will pause all minting and membership functions for the club.\n\nAre you sure you want to continue? This action is intended for emergencies only.'
                    );
                  }}
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Emergency Pause
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tokens">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Token Supply Management</CardTitle>
                      <CardDescription className="text-gray-600">
                        Monitor and manage the club's token supply
                      </CardDescription>
                      {/* TODO: Add eligibility check for minting (e.g., officer multi-sig) */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="rounded-md border border-gray-200 p-4">
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {mockTokenSupply.map((token) => (
                        <div key={token.role} className="rounded-md border border-gray-200 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{token.role} Tokens</h3>
                              {getRoleBadge(token.role)}
                            </div>
                            <Button size="sm" variant="outline" className="border-gray-200 text-gray-700">
                              Mint New
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-md bg-gray-50 p-3">
                              <p className="text-sm font-medium text-gray-700">Total Supply</p>
                              <p className="text-2xl font-bold text-gray-900">{token.supply}</p>
                              {token.maxSupply > 0 && <p className="text-xs text-gray-600">Max: {token.maxSupply}</p>}
                            </div>
                            <div className="rounded-md bg-gray-50 p-3">
                              <p className="text-sm font-medium text-gray-700">Active</p>
                              <p className="text-2xl font-bold text-gray-900">{token.active}</p>
                              <p className="text-xs text-gray-600">
                                {((token.active / token.supply) * 100).toFixed(1)}% of supply
                              </p>
                            </div>
                            <div className="rounded-md bg-gray-50 p-3">
                              <p className="text-sm font-medium text-gray-700">Inactive</p>
                              <p className="text-2xl font-bold text-gray-900">{token.supply - token.active}</p>
                              <p className="text-xs text-gray-600">
                                {((1 - token.active / token.supply) * 100).toFixed(1)}% of supply
                              </p>
                            </div>
                          </div>
                          {token.maxSupply > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Supply Cap</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {token.supply}/{token.maxSupply}
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{
                                    width: `${(token.supply / token.maxSupply) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3">
                  <Button variant="outline" className="w-full border-gray-200 text-gray-700">
                    <FileText className="mr-2 h-4 w-4" /> Export Token Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="lookup">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 mr-3">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">User Lookup</CardTitle>
                      <CardDescription className="text-gray-600">
                        Search for members by address or email
                      </CardDescription>
                      {/* TODO: Add eligibility check for editing roles (officer only) */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search by address or email..."
                        className="pl-9 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSearch} className="whitespace-nowrap">
                      Search
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(2)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="rounded-md border border-gray-200 p-4">
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((user, index) => (
                        <div key={index} className="rounded-md border border-gray-200 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{user.email}</h3>
                              {getRoleBadge(user.role)}
                            </div>
                            <div className="text-sm text-gray-600">Joined: {formatDate(user.joinDate)}</div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Wallet Address</p>
                              <p className="font-mono text-sm text-gray-600">{user.address}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Last Active</p>
                              <p className="text-sm text-gray-600">{formatDate(user.lastActive)}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge className="bg-blue-100 text-blue-800">Tokens: {user.tokens}</Badge>
                            <Badge className="bg-green-100 text-green-800">
                              <Clock className="mr-1 h-3 w-3" /> Active
                            </Badge>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="border-gray-200 text-gray-700">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="border-gray-200 text-gray-700">
                              Edit Role
                            </Button>
                            <Button size="sm" variant="outline" className="border-gray-200 text-gray-700">
                              Reset Password
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
                      <p className="text-gray-600">No users found matching your search criteria.</p>
                      <p className="text-sm text-gray-500 mt-1">Try a different search term.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
                      <p className="text-gray-600">Enter an address or email to search for a user.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        You can search by wallet address or university email.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3 flex justify-between">
                  <Button variant="outline" className="border-gray-200 text-gray-700">
                    <FileText className="mr-2 h-4 w-4" /> Export Member List
                  </Button>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Add New Member
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="recovery">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 mr-3">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Simulate Recovery Token</CardTitle>
                      <CardDescription className="text-gray-600">
                        Simulate minting a recovery token for a member who lost access. <br/>
                        <span className="text-xs text-muted-foreground">(In production, this would require the old token to be invalidated and a new one minted for the new address and role.)</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recovery-address">New Wallet Address</Label>
                      <Input id="recovery-address" placeholder="0x..." value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="replaced-token-id">Replaced Token ID</Label>
                      <Input id="replaced-token-id" placeholder="e.g. 123" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recovery-role">Role for Recovery Token</Label>
                      <Input id="recovery-role" placeholder="e.g. Member, Officer, etc." />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleAction} disabled={isLoading} className="w-full">
                    {isLoading ? "Processing..." : "Simulate Issue Recovery Token"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="admin">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Admin Tools (Simulated)</CardTitle>
                  <CardDescription className="text-gray-600">
                    Simulate contract admin actions: pause/unpause, set ops/scholarship wallets, set base URI, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="destructive" className="w-full" onClick={() => window.alert('Simulated: Emergency Pause triggered!')}>Emergency Pause</Button>
                    <Button className="w-full" onClick={() => window.alert('Simulated: Set Ops Wallet!')}>Set Ops Wallet</Button>
                    <Button className="w-full" onClick={() => window.alert('Simulated: Set Scholarship Wallet!')}>Set Scholarship Wallet</Button>
                    <Button className="w-full" onClick={() => window.alert('Simulated: Set Base Token URI!')}>Set Base Token URI</Button>
                  </div>
                </CardContent>
              </Card>

              {/* --- Safe Multisig Wallet Demo --- */}
              <Card className="border-gray-200 bg-white shadow-sm mt-8">
                <CardHeader>
                  <CardTitle className="text-gray-900">Safe Multisig Wallet Demo (Simulated)</CardTitle>
                  <CardDescription className="text-gray-600">
                    Demonstration of how club funds and admin actions could be managed with a Safe (formerly Gnosis Safe) multisig wallet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Safe Wallet Address</h3>
                      <div className="font-mono text-sm text-gray-700 mb-2">0xSAFE1234...ABCD</div>
                      <div className="text-xs text-gray-500 mb-2">(This is a simulated address. In production, this would be the club's Safe multisig wallet.)</div>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Signers</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        <li>Alex Johnson (President) - 0xA1...1111</li>
                        <li>Jamie Lee (Treasurer) - 0xB2...2222</li>
                        <li>Sam Patel (Secretary) - 0xC3...3333</li>
                      </ul>
                      <div className="text-xs text-gray-500 mt-2">(In production, these would be real officer wallet addresses.)</div>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Simulate Multisig Action</h3>
                      <Button className="w-full mb-2" onClick={() => window.alert('Simulated: Propose transaction to transfer funds from Safe!')}>Propose Fund Transfer</Button>
                      <Button className="w-full mb-2" onClick={() => window.alert('Simulated: Approve transaction as signer!')}>Approve Transaction</Button>
                      <Button className="w-full" onClick={() => window.alert('Simulated: Execute transaction (threshold met)!')}>Execute Transaction</Button>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Snapshot Demo (Simulated)</h3>
                      <div className="text-sm text-gray-700 mb-2">Demonstrate how proposals and votes could be managed via Snapshot for off-chain governance.</div>
                      <Button className="w-full mb-2" onClick={() => window.alert('Simulated: Create new proposal on Snapshot!')}>Create Proposal</Button>
                      <Button className="w-full" onClick={() => window.alert('Simulated: Vote on Proposal!')}>Vote on Proposal</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
