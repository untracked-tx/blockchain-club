"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  ExternalLink,
  DollarSign,
  Bitcoin,
  Info,
  Shield,
  BarChart3,
  AlertTriangle,
  Zap,
  Coins,
  Gem,
  Hexagon,
  CircleDot,
} from "lucide-react"
import { PortfolioDistribution } from "@/components/portfolio-distribution"
import CryptoTicker from "@/components/optimized-crypto-ticker"
import LightCryptoTicker from "@/components/light-crypto-ticker"
import { useWalletPortfolio } from "@/hooks/use-wallet-portfolio"
import { MULTISIG_WALLET, getExplorerAddressUrl, getExplorerTokenUrl } from "@/lib/multichain-wallet-service"
import { EducationalInsights } from "@/components/educational-insights"
import { TransactionHistory } from "@/components/transaction-history"
import { PageLoadingSkeleton, PortfolioSummarySkeleton } from "@/components/ui/loading-skeleton"
import CryptoMarketWidget from "@/components/crypto-market-widget-new"

// Helper function to get appropriate icon for each asset
const getAssetIcon = (symbol: string) => {
  switch (symbol.toUpperCase()) {
    case 'BTC':
    case 'WBTC':
      return Bitcoin
    case 'ETH':
      return Gem // Diamond/gem icon for Ethereum
    case 'MATIC':
    case 'POL':
      return Hexagon // Polygon-like shape for MATIC/POL
    case 'USDC':
    case 'USDT':
    case 'DAI':
      return DollarSign // Dollar sign for stablecoins
    default:
      return Coins // Generic crypto icon
  }
}

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export default function PortfolioPage() {
  const { portfolio, isLoading, error, refetch, lastUpdated } = useWalletPortfolio()

  const handleRefresh = async () => {
    console.log('🔄 User requested portfolio refresh')
    await refetch()
  }

  // Show loading state
  if (isLoading) {
    return (
      <PageLoadingSkeleton 
        title="Treasury Dashboard" 
        showStats={true}
        showContent={true}
        showBanner={true}
        bannerGradient="from-green-600 via-emerald-600 to-teal-600"
        bannerIcon={TrendingUp}
        bannerBadgeText="Investment Portfolio"
        className="bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50"
      />
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Error Loading Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show empty state if no portfolio data
  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Portfolio Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Unable to load portfolio data. The wallet may be empty or there may be a connection issue.
              </p>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col">
      {/* Enhanced Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-emerald-100 backdrop-blur-sm border border-white/30">
              <TrendingUp className="mr-2 h-4 w-4" />
              Investment Portfolio
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              💰 Treasury Dashboard
            </h1>
            
            <p className="mb-8 text-xl text-emerald-100 leading-relaxed">
              Professional treasury management for the Blockchain Club. Real-time portfolio tracking, transparent reporting, and strategic investment oversight.
            </p>
            
            {/* Treasurer Credit */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-emerald-100 backdrop-blur-sm border border-white/30">
              <Shield className="mr-2 h-4 w-4" />
              Managed by Club Treasurer
            </div>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
        <div className="container mx-auto px-4 py-12">

      {/* Live Crypto Ticker */}
      <div className="mb-8">
        <LightCryptoTicker />
      </div>

      {/* Portfolio Summary */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Total Treasury Value</CardTitle>
                <CardDescription className="text-gray-600">All assets combined</CardDescription>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">{formatCurrency(portfolio.totalValue)}</span>
                  <div
                    className={`flex items-center ${portfolio.dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {portfolio.dailyChange >= 0 ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {formatPercentage(portfolio.dailyChangePercentage)} (24h)
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {portfolio.dailyChange >= 0 ? "+" : ""}
                  {formatCurrency(portfolio.dailyChange)} today
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900">Weekly Change</CardTitle>
            <CardDescription className="text-gray-600">Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="space-y-1">
                <div
                  className={`flex items-center text-xl font-bold ${
                    portfolio.weeklyChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {portfolio.weeklyChange >= 0 ? (
                    <TrendingUp className="mr-1 h-5 w-5" />
                  ) : (
                    <TrendingDown className="mr-1 h-5 w-5" />
                  )}
                  <span>{formatPercentage(portfolio.weeklyChangePercentage)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {portfolio.weeklyChange >= 0 ? "+" : ""}
                  {formatCurrency(portfolio.weeklyChange)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900">Monthly Change</CardTitle>
            <CardDescription className="text-gray-600">Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="space-y-1">
                <div
                  className={`flex items-center text-xl font-bold ${
                    portfolio.monthlyChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {portfolio.monthlyChange >= 0 ? (
                    <TrendingUp className="mr-1 h-5 w-5" />
                  ) : (
                    <TrendingDown className="mr-1 h-5 w-5" />
                  )}
                  <span>{formatPercentage(portfolio.monthlyChangePercentage)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {portfolio.monthlyChange >= 0 ? "+" : ""}
                  {formatCurrency(portfolio.monthlyChange)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="mb-8">
        <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <TabsTrigger 
            value="assets" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <Coins className="h-4 w-4" />
            All Assets
          </TabsTrigger>
          <TabsTrigger 
            value="tokens" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <CircleDot className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger 
            value="chains" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <Zap className="h-4 w-4" />
            By Chain
          </TabsTrigger>
          <TabsTrigger 
            value="distribution" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4" />
            Allocation
          </TabsTrigger>
          <TabsTrigger 
            value="nfts" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <Gem className="h-4 w-4" />
            Digital Assets
          </TabsTrigger>
          <TabsTrigger 
            value="wallet" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <Shield className="h-4 w-4" />
            Wallet Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CircleDot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-xl">Token Holdings</CardTitle>
                    <CardDescription className="text-gray-600">
                      {portfolio.assets.filter(asset => asset.contractAddress).length} ERC-20 and fungible tokens across all chains
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-3 py-1 text-sm bg-purple-50 text-purple-700 border-purple-200">
                    {portfolio.assets.filter(asset => asset.contractAddress).length} Tokens
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // CSV Export functionality for tokens only
                      const tokenAssets = portfolio.assets.filter(asset => asset.contractAddress);
                      const csvData = tokenAssets.map(token => ({
                        'Token Name': token.name,
                        'Symbol': token.symbol,
                        'Chain': token.chain,
                        'Contract Address': token.contractAddress,
                        'Balance': token.amount.toString(),
                        'Price (USD)': token.price.toFixed(2),
                        '24h Change (%)': token.change24h.toFixed(2),
                        'Value (USD)': token.value.toFixed(2),
                        'Portfolio %': ((token.value / portfolio.totalValue) * 100).toFixed(2)
                      }));
                      
                      const headers = Object.keys(csvData[0]).join(',');
                      const rows = csvData.map(row => Object.values(row).join(','));
                      const csvContent = [headers, ...rows].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `blockchain-club-token-holdings-${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Download className="mr-2 h-4 w-4" /> 
                    Export Tokens CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Chain
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contract Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Value & Share
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {portfolio.assets.filter(asset => asset.contractAddress).map((token, index) => (
                      <tr key={token.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: `${token.color}20`, border: `2px solid ${token.color}30` }}
                            >
                              {(() => {
                                const IconComponent = getAssetIcon(token.symbol)
                                return <IconComponent className="h-5 w-5" style={{ color: token.color }} />
                              })()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{token.name}</div>
                              <div className="text-sm text-gray-500 font-medium">{token.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                            {token.chain}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-w-[120px] truncate">
                              {token.contractAddress!.slice(0, 8)}...{token.contractAddress!.slice(-6)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-purple-50"
                              asChild
                            >
                              <a
                                href={getExplorerTokenUrl(token.contractAddress!, token.chain.toLowerCase())}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View token contract"
                              >
                                <ExternalLink className="h-3 w-3 text-purple-600" />
                              </a>
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {token.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </div>
                          <div className="text-xs text-gray-500">{token.symbol}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(token.price)}</div>
                          <div className={`text-xs font-medium ${token.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}% (24h)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(token.value)}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-gray-500">
                              {token.percentageOfPortfolio?.toFixed(1) || ((token.value / portfolio.totalValue) * 100).toFixed(1)}% of portfolio
                            </div>
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: token.color }}
                              title={`${token.name} allocation`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-sm text-gray-600">
                  <CircleDot className="mr-2 h-4 w-4 text-purple-600" />
                  <span>ERC-20 and fungible token contracts only</span>
                </div>
                <div className="text-sm text-gray-600">
                  Token Value: <span className="font-semibold text-gray-900">
                    {formatCurrency(portfolio.assets.filter(asset => asset.contractAddress).reduce((sum, token) => sum + token.value, 0))}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Coins className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-xl">Treasury Assets</CardTitle>
                    <CardDescription className="text-gray-600">
                      {portfolio.assets.length} cryptocurrencies • {formatCurrency(portfolio.totalValue)} total value
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-3 py-1 text-sm bg-green-50 text-green-700 border-green-200">
                    {portfolio.assets.length} Assets
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // CSV Export functionality
                      const csvData = portfolio.assets.map(asset => ({
                        'Asset Name': asset.name,
                        'Symbol': asset.symbol,
                        'Chain': asset.chain,
                        'Contract Address': asset.contractAddress || 'Native Token',
                        'Price (USD)': asset.price.toFixed(2),
                        '24h Change (%)': asset.change24h.toFixed(2),
                        'Holdings': asset.amount.toString(),
                        'Value (USD)': asset.value.toFixed(2),
                        'Portfolio %': ((asset.value / portfolio.totalValue) * 100).toFixed(2)
                      }));
                      
                      const headers = Object.keys(csvData[0]).join(',');
                      const rows = csvData.map(row => Object.values(row).join(','));
                      const csvContent = [headers, ...rows].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `blockchain-club-treasury-assets-${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="mr-2 h-4 w-4" /> 
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="rounded-md border border-gray-200 p-4">
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Asset
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Chain
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contract / Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          24h Change
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Holdings
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Value & Allocation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {portfolio.assets.map((asset, index) => (
                        <tr key={asset.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: `${asset.color}20`, border: `2px solid ${asset.color}30` }}
                              >
                                {(() => {
                                  const IconComponent = getAssetIcon(asset.symbol)
                                  return <IconComponent className="h-5 w-5" style={{ color: asset.color }} />
                                })()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{asset.name}</div>
                                <div className="text-sm text-gray-500 font-medium">{asset.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                              {asset.chain}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {asset.contractAddress ? (
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-blue-50"
                                    asChild
                                  >
                                    <a
                                      href={getExplorerTokenUrl(asset.contractAddress!, asset.chain.toLowerCase())}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="View contract on explorer"
                                    >
                                      <ExternalLink className="h-3 w-3 text-blue-600" />
                                    </a>
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-green-700 text-xs font-medium bg-green-100 px-2 py-1 rounded">Native Token</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(asset.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center text-sm font-semibold ${
                              asset.change24h >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {asset.change24h >= 0 ? (
                                <ArrowUpRight className="mr-1 h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="mr-1 h-4 w-4" />
                              )}
                              {formatPercentage(asset.change24h)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {asset.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {asset.symbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(asset.value)}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-xs text-gray-500">
                                {((asset.value / portfolio.totalValue) * 100).toFixed(1)}% of treasury
                              </div>
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: asset.color }}
                                title={`${asset.name} allocation`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Real-time portfolio tracking and professional treasury management</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold text-gray-900">{formatCurrency(portfolio.totalValue)}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <a
                      href={getExplorerAddressUrl(MULTISIG_WALLET, 'ethereum')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" /> 
                      View Wallet
                    </a>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="chains">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-xl">Chain Breakdown</CardTitle>
                    <CardDescription className="text-gray-600">
                      Assets distributed across different blockchain networks
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                  // CSV Export functionality for chain breakdown
                  const csvData = portfolio.chainBreakdown?.flatMap(chain => {
                    const chainAssets = [];
                    if (chain.nativeAsset) {
                      chainAssets.push({
                        'Chain': chain.chainName,
                        'Asset Name': chain.nativeAsset.name,
                        'Symbol': chain.nativeAsset.symbol,
                        'Type': 'Native Token',
                        'Contract Address': 'N/A',
                        'Balance': chain.nativeAsset.amount.toString(),
                        'Value (USD)': chain.nativeAsset.value.toFixed(2),
                        'Chain Total (USD)': chain.totalValue.toFixed(2),
                        'Chain %': ((chain.totalValue / portfolio.totalValue) * 100).toFixed(2)
                      });
                    }
                    chain.tokens.forEach(token => {
                      chainAssets.push({
                        'Chain': chain.chainName,
                        'Asset Name': token.name,
                        'Symbol': token.symbol,
                        'Type': 'Token Contract',
                        'Contract Address': token.contractAddress || 'N/A',
                        'Balance': token.amount.toString(),
                        'Value (USD)': token.value.toFixed(2),
                        'Chain Total (USD)': chain.totalValue.toFixed(2),
                        'Chain %': ((chain.totalValue / portfolio.totalValue) * 100).toFixed(2)
                      });
                    });
                    return chainAssets;
                  }) || [];
                  
                  const headers = Object.keys(csvData[0] || {}).join(',');
                  const rows = csvData.map(row => Object.values(row).join(','));
                  const csvContent = [headers, ...rows].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `blockchain-club-chain-breakdown-${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >                  <Download className="mr-2 h-4 w-4" /> 
                  Export Chain Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {portfolio.chainBreakdown && portfolio.chainBreakdown.length > 0 ? (
              portfolio.chainBreakdown.map((chain, index) => (
                <Card key={chain.chainName} className="border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                          style={{ 
                            backgroundColor: (chain.nativeAsset?.color || chain.tokens[0]?.color || '#6B7280') + '20',
                            border: `2px solid ${chain.nativeAsset?.color || chain.tokens[0]?.color || '#6B7280'}30`
                          }}
                        >
                          <Zap className="h-5 w-5" style={{ color: chain.nativeAsset?.color || chain.tokens[0]?.color || '#6B7280' }} />
                        </div>
                        <div>
                          <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                            {chain.chainName}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {chain.tokens.length + (chain.nativeAsset ? 1 : 0)} assets • {formatCurrency(chain.totalValue)} total value
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1 text-sm bg-yellow-50 text-yellow-700 border-yellow-200">
                          {((chain.totalValue / portfolio.totalValue) * 100).toFixed(1)}% of portfolio
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(chain.totalValue)}</div>
                          <div className="text-xs text-gray-500">Chain Total</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {chain.nativeAsset && (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: `${chain.nativeAsset.color}20`, border: `2px solid ${chain.nativeAsset.color}30` }}
                            >
                              {(() => {
                                const IconComponent = getAssetIcon(chain.nativeAsset.symbol)
                                return <IconComponent className="h-5 w-5" style={{ color: chain.nativeAsset.color }} />
                              })()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{chain.nativeAsset.name}</div>
                              <div className="text-xs text-green-700 font-medium bg-green-100 px-2 py-1 rounded">Native Token</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-gray-900">{formatCurrency(chain.nativeAsset.value)}</div>
                            <div className="text-xs text-gray-500">
                              {chain.nativeAsset.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {chain.nativeAsset.symbol}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {chain.tokens.map((token, tokenIndex) => (
                        <div key={token.id} className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 ${tokenIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: `${token.color}20`, border: `2px solid ${token.color}30` }}
                            >
                              {(() => {
                                const IconComponent = getAssetIcon(token.symbol)
                                return <IconComponent className="h-5 w-5" style={{ color: token.color }} />
                              })()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{token.name}</div>
                              <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                {token.contractAddress ? 
                                  `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : 
                                  'Native Token'
                                }
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-gray-900">{formatCurrency(token.value)}</div>
                            <div className="text-xs text-gray-500">
                              {token.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {token.symbol}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center text-sm text-gray-600">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: chain.nativeAsset?.color || chain.tokens[0]?.color || '#6B7280' }}
                        />
                        <span>{chain.tokens.length + (chain.nativeAsset ? 1 : 0)} assets on {chain.chainName}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Chain Value: <span className="font-semibold text-gray-900">{formatCurrency(chain.totalValue)}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardContent className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Chain Data Available</h3>
                  <p className="text-gray-600">Multichain data is being loaded or there are no assets to display.</p>
                </CardContent>
              </Card>
            )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-xl">Asset Allocation</CardTitle>
                    <CardDescription className="text-gray-600">
                      Distribution and allocation strategy across {portfolio.assets.length} treasury assets
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // CSV Export functionality for asset allocation
                    const csvData = portfolio.assets.map(asset => ({
                      'Asset Name': asset.name,
                      'Symbol': asset.symbol,
                      'Chain': asset.chain,
                      'Asset Type': asset.contractAddress ? 'Token Contract' : 'Native Token',
                      'Value (USD)': asset.value.toFixed(2),
                      'Portfolio Allocation (%)': ((asset.value / portfolio.totalValue) * 100).toFixed(2),
                      'Holdings': asset.amount.toString(),
                      'Current Price (USD)': asset.price.toFixed(2),
                      '24h Change (%)': asset.change24h.toFixed(2)
                    }));
                    
                    const headers = Object.keys(csvData[0]).join(',');
                    const rows = csvData.map(row => Object.values(row).join(','));
                    const csvContent = [headers, ...rows].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `blockchain-club-allocation-analysis-${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Download className="mr-2 h-4 w-4" /> 
                  Export Allocation
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="h-[400px] w-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Chart Section */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-[320px] w-[320px] mb-4">
                      <PortfolioDistribution assets={portfolio.assets} />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Total Treasury Value</div>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio.totalValue)}</div>
                    </div>
                  </div>
                  
                  {/* Asset Breakdown Section */}
                  <div className="flex flex-col justify-center">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Breakdown</h4>
                      <div className="space-y-3 max-h-[280px] overflow-y-auto">
                        {portfolio.assets
                          .sort((a, b) => b.value - a.value) // Sort by value descending
                          .map((asset, index) => (
                          <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: asset.color }}></div>
                                <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: `${asset.color}20` }}
                                >
                                  {(() => {
                                    const IconComponent = getAssetIcon(asset.symbol)
                                    return <IconComponent className="h-4 w-4" style={{ color: asset.color }} />
                                  })()}
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-gray-900">{asset.name}</span>
                                  <div className="text-xs text-gray-500">{asset.symbol} • {asset.chain}</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {((asset.value / portfolio.totalValue) * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">{formatCurrency(asset.value)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Treasury Policy Section */}
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-blue-800">Treasury Investment Policy</h4>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            Our treasury prioritizes investments in blockchain projects that advance environmental sustainability and social impact. We focus on proof-of-stake networks, carbon-neutral protocols, and projects that support financial inclusion and community empowerment. Investment decisions are guided by ESG principles and approved through member governance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="mr-2 h-4 w-4 text-green-600" />
                  <span>Allocation updated in real-time based on market prices</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Assets: <span className="font-semibold text-gray-900">{portfolio.assets.length}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Chains: <span className="font-semibold text-gray-900">{portfolio.chainBreakdown?.length || 0}</span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="nfts">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Gem className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-xl">Digital Assets & NFTs</CardTitle>
                    <CardDescription className="text-gray-600">
                      Non-fungible tokens and digital collectibles in the treasury
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-gray-50 text-gray-600 border-gray-200">
                  0 NFTs
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6">
                  <Gem className="h-12 w-12 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Digital Assets Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  The treasury currently focuses on fungible tokens and cryptocurrencies. 
                  NFTs and digital collectibles may be added in the future as part of our diversification strategy.
                </p>
                
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-200 max-w-lg mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Info className="h-4 w-4 text-pink-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-pink-800 mb-2">Future Digital Asset Strategy</h4>
                      <p className="text-sm text-pink-700 leading-relaxed">
                        Our club is exploring opportunities in the NFT space, including educational NFTs, 
                        blockchain art, and utility tokens that align with our mission. Any future NFT 
                        acquisitions will be subject to member governance and our ESG investment criteria.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center gap-4">
                  <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Learn About NFTs
                  </Button>
                  <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Token Holdings
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-sm text-gray-600">
                  <Gem className="mr-2 h-4 w-4 text-pink-600" />
                  <span>Digital assets section - currently empty</span>
                </div>
                <div className="text-sm text-gray-600">
                  Focus: <span className="font-semibold text-gray-900">Fungible Tokens & Crypto</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-xl">Treasury Wallet</CardTitle>
                    <CardDescription className="text-gray-600">
                      Multi-signature wallet securing {formatCurrency(portfolio.totalValue)} in digital assets
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-green-50 text-green-700 border-green-200">
                  ✓ Secured
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Simplified Wallet Info */}
                <div className="rounded-lg border border-gray-200 p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
                  <div className="grid gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Treasury Address</div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border flex-1">
                          {MULTISIG_WALLET}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <a 
                            href={getExplorerAddressUrl(MULTISIG_WALLET, 'ethereum')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="bg-white rounded border p-3">
                        <div className="text-xs text-gray-500 mb-1">Total Assets</div>
                        <div className="text-lg font-semibold text-gray-900">{portfolio.assets.length}</div>
                      </div>
                      <div className="bg-white rounded border p-3">
                        <div className="text-xs text-gray-500 mb-1">Active Chains</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {portfolio.chainBreakdown?.length || 1}
                        </div>
                      </div>
                      <div className="bg-white rounded border p-3">
                        <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                        <div className="text-sm font-medium text-gray-900">
                          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction History Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                      <p className="text-sm text-gray-600">Recent treasury activity across all chains</p>
                    </div>
                  </div>
                  <TransactionHistory walletAddress={MULTISIG_WALLET} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
                  Refresh Data
                </Button>
                <div className="text-sm text-gray-600">
                  Cache expires: <span className="font-semibold text-gray-900">3 minutes</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>      </Tabs>
      
      {/* Treasury Footnote */}
      <div className="mb-8 mt-4 px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">About Our Treasury</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our treasury prioritizes investments in blockchain projects that advance environmental sustainability and social impact. We focus on proof-of-stake networks, carbon-neutral protocols, and projects that support financial inclusion and community empowerment. Treasury decisions and investments are made through governance votes by members holding voting tokens, with all decisions guided by ESG principles.
            </p>
          </div>
        </div>
      </div>
      
      {/* Educational Insights Section */}
      <div className="mb-8">
        <EducationalInsights 
          assets={portfolio.assets} 
        />
      </div>

      {/* Crypto Market Analysis Widget */}
      <div className="mb-8">
        <CryptoMarketWidget />
      </div>

      {/* Additional info section */}
      <div className="mt-8 mb-12">
        <Card className="border-gray-200 shadow-sm overflow-hidden p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Treasury Security</h3>
              <p className="text-gray-600">
                Our treasury is secured with industry-standard security practices. All transactions require
                multi-signature verification from club officers, and we follow strict protocols for all investment activities.
              </p>
            </div>
          </div>
        </Card>
      </div>
      </div>
      </div>
    </div>
  );
}
