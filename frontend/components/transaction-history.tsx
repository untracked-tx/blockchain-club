"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Clock, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react"
import { Transaction, TransactionResponse, transactionService } from "@/lib/transaction-service"

interface TransactionHistoryProps {
  walletAddress: string
}

export function TransactionHistory({ walletAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  
  // Filter states
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [chainFilter, setChainFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  const limit = 10
  
  useEffect(() => {
    fetchTransactions()
  }, [walletAddress, page])

  useEffect(() => {
    applyFilters()
  }, [transactions, directionFilter, chainFilter, typeFilter])

  const fetchTransactions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const offset = (page - 1) * limit
      const response = await transactionService.getTransactionsForAddress(walletAddress, limit, offset)
      
      setTransactions(response.transactions)
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (err) {
      setError('Failed to fetch transaction history')
      console.error('Transaction fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Direction filter
    if (directionFilter === 'incoming') {
      filtered = filtered.filter(tx => tx.to.toLowerCase() === walletAddress.toLowerCase())
    } else if (directionFilter === 'outgoing') {
      filtered = filtered.filter(tx => tx.from.toLowerCase() === walletAddress.toLowerCase())
    }

    // Chain filter
    if (chainFilter !== 'all') {
      filtered = filtered.filter(tx => tx.chainName.toLowerCase() === chainFilter.toLowerCase())
    }

    // Type filter
    if (typeFilter === 'native') {
      filtered = filtered.filter(tx => 
        tx.action === 'Transfer' && 
        ['ETH', 'MATIC', 'POL', 'BNB'].includes(tx.token)
      )
    } else if (typeFilter === 'token') {
      filtered = filtered.filter(tx => 
        tx.action === 'Token Transfer' || 
        (tx.token !== 'ETH' && tx.token !== 'MATIC' && tx.token !== 'POL' && tx.token !== 'BNB' && tx.token !== 'Contract')
      )
    } else if (typeFilter === 'contract') {
      filtered = filtered.filter(tx => 
        tx.action === 'Contract Call' || 
        tx.token === 'Contract' ||
        (tx.action !== 'Transfer' && tx.action !== 'Token Transfer')
      )
    }

    setFilteredTransactions(filtered)
  }

  const handleDownloadCSV = () => {
    if (filteredTransactions.length > 0) {
      const filename = `treasury-transactions-${walletAddress.slice(0, 8)}.csv`
      transactionService.downloadCSV(filteredTransactions, filename)
    }
  }

  const formatValue = (value: string, decimals: number = 18): string => {
    if (!value || value === '0') return '0'
    const num = parseFloat(value) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainColor = (chainName: string): string => {
    switch (chainName.toLowerCase()) {
      case 'ethereum': return 'bg-blue-100 text-blue-800'
      case 'polygon': return 'bg-purple-100 text-purple-800'
      case 'bsc': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionUrl = (hash: string, chainName: string): string => {
    switch (chainName.toLowerCase()) {
      case 'ethereum': return `https://etherscan.io/tx/${hash}`
      case 'polygon': return `https://polygonscan.com/tx/${hash}`
      case 'bsc': return `https://bscscan.com/tx/${hash}`
      case 'arbitrum': return `https://arbiscan.io/tx/${hash}`
      case 'optimism': return `https://optimistic.etherscan.io/tx/${hash}`
      default: return `https://etherscan.io/tx/${hash}`
    }
  }

  if (isLoading) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" onClick={fetchTransactions} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Transaction History
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {total} transactions
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadCSV}
              disabled={transactions.length === 0}
            >
              <Download className="mr-1 h-3 w-3" /> 
              Download CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={chainFilter} onValueChange={setChainFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chains</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="bsc">BSC</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                  <SelectItem value="token">Tokens</SelectItem>
                  <SelectItem value="contract">Contracts</SelectItem>
                </SelectContent>
              </Select>

              {(directionFilter !== 'all' || chainFilter !== 'all' || typeFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setDirectionFilter('all')
                    setChainFilter('all')
                    setTypeFilter('all')
                  }}
                  className="h-8 px-2 text-xs"
                >
                  Clear Filters
                </Button>
              )}
              
              <div className="ml-auto text-xs text-gray-500">
                Showing {filteredTransactions.length} of {transactions.length}
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Chain</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={`${tx.chainName}-${tx.hash}`}>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getChainColor(tx.chainName)}`}
                        >
                          {tx.chainName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.to.toLowerCase() === walletAddress.toLowerCase() ? (
                            <ArrowDownRight className="h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 text-red-600" />
                          )}
                          <span className="text-sm">{tx.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{tx.token}</div>
                          {tx.value !== '0' && (
                            <div className="text-xs text-gray-500">
                              {formatValue(tx.value)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-mono text-xs text-gray-600">
                            {formatAddress(tx.from)}
                          </div>
                          <div className="text-xs text-gray-500">{tx.fromInfo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-mono text-xs text-gray-600">
                            {formatAddress(tx.to)}
                          </div>
                          <div className="text-xs text-gray-500">{tx.toInfo}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center gap-1">
                            {tx.status === 'Success' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span className={`text-xs ${
                              tx.status === 'Success' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            asChild
                          >
                            <a
                              href={getTransactionUrl(tx.hash, tx.chainName)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {page} • Showing {filteredTransactions.length} of {total} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
