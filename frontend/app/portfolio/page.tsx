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
} from "lucide-react"
import { PortfolioDistribution } from "@/components/portfolio-distribution"
import CryptoTicker from "@/components/optimized-crypto-ticker"
import { EnhancedPortfolioChart } from "@/components/fixed-enhanced-chart"

// Mock organizational portfolio data
const mockOrganizationalPortfolio = {  totalValue: 38750.65,
  dailyChange: 1842.18,
  dailyChangePercentage: 4.98,
  weeklyChange: 5256.92,
  weeklyChangePercentage: 15.7,
  monthlyChange: 15245.67,
  monthlyChangePercentage: 64.83,
  assets: [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      amount: 0.485,
      value: 19750.45,
      price: 40722.16,
      change24h: 5.8,
      color: "#F7931A",
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      amount: 5.75,
      value: 12325.87,
      price: 2143.63,
      change24h: 4.5,
      color: "#627EEA",
    },
    {
      id: "solana",
      name: "Solana",
      symbol: "SOL",
      amount: 62.8,
      value: 4850.12,
      price: 77.23,
      change24h: 8.2,
      color: "#00FFA3",
    },
    {
      id: "cardano",
      name: "Cardano",
      symbol: "ADA",
      amount: 3250,
      value: 1137.5,
      price: 0.35,
      change24h: -0.8,
      color: "#0033AD",
    },
    {
      id: "polkadot",
      name: "Polkadot",
      symbol: "DOT",
      amount: 242.5,
      value: 452.5,
      price: 1.87,
      change24h: 1.2,
      color: "#E6007A",
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      amount: 234.21,
      value: 234.21,
      price: 1.0,
      change24h: 0.0,
      color: "#2775CA",
    },
  ],
  // Last 5 transactions for transparency
  recentTransactions: [
    {
      id: "tx-001",
      type: "buy",
      asset: "Bitcoin",
      symbol: "BTC",
      amount: 0.05,
      price: 36420.75,
      value: 1821.04,
      timestamp: "2023-05-10T14:30:00Z",
      purpose: "Treasury diversification",
    },
    {
      id: "tx-002",
      type: "sell",
      asset: "Ethereum",
      symbol: "ETH",
      amount: 1.25,
      price: 1720.32,
      value: 2150.4,
      timestamp: "2023-05-08T09:15:00Z",
      purpose: "Event funding",
    },
    {
      id: "tx-003",
      type: "buy",
      asset: "Solana",
      symbol: "SOL",
      amount: 15.0,
      price: 62.18,
      value: 932.7,
      timestamp: "2023-05-05T16:45:00Z",
      purpose: "Treasury diversification",
    },
    {
      id: "tx-004",
      type: "buy",
      asset: "USD Coin",
      symbol: "USDC",
      amount: 150.0,
      price: 1.0,
      value: 150.0,
      timestamp: "2023-05-03T11:20:00Z",
      purpose: "Stablecoin reserve",
    },
    {
      id: "tx-005",
      type: "sell",
      asset: "Bitcoin",
      symbol: "BTC",
      amount: 0.02,
      price: 35250.5,
      value: 705.01,
      timestamp: "2023-04-28T13:10:00Z",
      purpose: "Workshop expenses",
    },
  ],
}

// Mock historical data for chart (30 days) with significant performance growth
const mockHistoricalData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))

  // Starting value around 18,000
  const startValue = 18000

  // Create an exponential growth curve
  // This will increase more dramatically towards the end
  const growthFactor = 1.04 + (i > 20 ? 0.02 : 0)
  const baseGrowth = startValue * Math.pow(growthFactor, i / 3.5)
  
  // Add some market volatility
  const dayVolatility = Math.sin(i * 0.7) * 600
  
  // Add a larger spike for days 15-20 to show a significant event
  const eventSpike = (i >= 15 && i <= 20) ? (i - 14) * 800 : 0
  
  // Some market dips in specific ranges
  const dip = (i >= 5 && i <= 7) ? -1200 : 0
  
  // Combine all factors
  const value = baseGrowth + dayVolatility + eventSpike + dip
  
  return {
    date: date.toISOString().split("T")[0],
    value: Math.round(value),
  }
})

export default function PortfolioPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [portfolio, setPortfolio] = useState(mockOrganizationalPortfolio)
  const [timeframe, setTimeframe] = useState("1m")

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
    <div className="container mx-auto px-4 py-16">
      {/* TODO: Add ETH/USD toggle on charts (see audit checklist) */}
      {/* TODO: Annotate revenue source breakdown (dues vs. donations) */}
      {/* TODO: Add tooltip or hover for bar/line details */}
      {/* TODO: Gate visibility to officers only for sensitive data (future) */}
      {/* TODO: Replace mockOrganizationalPortfolio and mockHistoricalData with real data sources */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Club Portfolio</h1>
        <p className="max-w-3xl text-lg text-gray-600">
          The Blockchain & Crypto Investing Club actively manages a real cryptocurrency portfolio as part of our mission to provide hands-on investment experience. All data below is for demonstration and educational purposes, but our club is committed to transparency, financial literacy, and real-world investing. As we grow, this page will reflect the club's actual crypto investments, managed and governed by our members.
        </p>
        <p className="max-w-3xl mt-2 text-lg text-blue-600 font-medium">
          Our treasury has grown from {formatCurrency(18000)} to {formatCurrency(portfolio.totalValue)} in the past 30 days!
        </p>
        {/* TODO: Add officer-only badge or warning if user is not an officer */}
      </div>

      {/* Organization Info Banner */}
      <div className="mb-8 rounded-xl bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">About Our Treasury</h3>
            <p className="text-gray-600">
              The club maintains a diversified cryptocurrency treasury to fund events, workshops, and club activities. Treasury decisions and investments are made through governance votes by members holding voting tokens. All transactions require multi-signature approval from at least 3 officers, ensuring security and transparency for our crypto investing activities.
            </p>
          </div>
        </div>      </div>

      {/* Live Crypto Ticker */}
      <div className="mb-8">
        <CryptoTicker />
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

      {/* Portfolio Chart */}
      <Card className="mb-8 border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">            <div>
              <CardTitle className="text-gray-900">Treasury Performance</CardTitle>
              <CardDescription className="text-gray-600">Historical growth from {formatCurrency(18000)} to {formatCurrency(portfolio.totalValue)}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* TODO: Add ETH/USD toggle here */}
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px] border-gray-200">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] w-full">
              <Skeleton className="h-full w-full" />
            </div>          ) : (            <div className="h-[350px] w-full">
              <EnhancedPortfolioChart data={mockHistoricalData} />
              {/* Chart with enhanced visualization */}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="assets" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="assets" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Treasury Assets
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Asset Allocation
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Recent Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Treasury Assets</CardTitle>
                  <CardDescription className="text-gray-600">
                    Cryptocurrencies held in the club's multi-signature wallet
                  </CardDescription>
                </div>
                <a
                  href="https://etherscan.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" /> View on Etherscan
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
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
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Asset
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          24h
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Holdings
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {portfolio.assets.map((asset) => (
                        <tr key={asset.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${asset.color}20` }}
                              >
                                {asset.symbol === "BTC" ? (
                                  <Bitcoin className="h-4 w-4" style={{ color: asset.color }} />
                                ) : (
                                  <DollarSign className="h-4 w-4" style={{ color: asset.color }} />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                <div className="text-sm text-gray-500">{asset.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(asset.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm font-medium ${
                                asset.change24h >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatPercentage(asset.change24h)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {asset.amount} {asset.symbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(asset.value)}</div>
                            <div className="text-xs text-gray-500">
                              {((asset.value / portfolio.totalValue) * 100).toFixed(1)}% of treasury
                            </div>
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
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                <span>Secured by multi-signature wallet (3/5 officers required)</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Asset Allocation</CardTitle>
              <CardDescription className="text-gray-600">Distribution of treasury assets by percentage</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] w-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="flex items-center justify-center">
                    <div className="h-[300px] w-[300px]">
                      <PortfolioDistribution assets={portfolio.assets} />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="space-y-4">
                      {portfolio.assets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
                            <span className="text-sm font-medium text-gray-900">
                              {asset.name} ({asset.symbol})
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {((asset.value / portfolio.totalValue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-md bg-blue-50 p-4">
                      <h4 className="mb-2 text-sm font-medium text-blue-800">Treasury Policy</h4>
                      <p className="text-sm text-blue-700">
                        Our treasury maintains a diversified portfolio with a target allocation of 40% BTC, 30% ETH, 20%
                        altcoins, and 10% stablecoins. Rebalancing occurs quarterly through governance votes.
                      </p>
                      {/* TODO: Annotate revenue source breakdown here */}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
                  <CardDescription className="text-gray-600">
                    Latest treasury transactions for complete transparency
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
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
                <div className="space-y-4">
                  {portfolio.recentTransactions.map((tx) => (
                    <div key={tx.id} className="rounded-md border border-gray-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={tx.type === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {tx.type === "buy" ? "Buy" : "Sell"}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {tx.amount} {tx.symbol}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(tx.timestamp)} at {formatTime(tx.timestamp)}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Asset</p>
                          <p className="text-sm text-gray-900">{tx.asset}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Price</p>
                          <p className="text-sm text-gray-900">{formatCurrency(tx.price)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Value</p>
                          <p className="text-sm text-gray-900">{formatCurrency(tx.value)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Purpose</p>
                          <p className="text-sm text-gray-900">{tx.purpose}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button variant="outline" size="sm" className="h-8 border-gray-200 text-gray-700">
                          <ExternalLink className="mr-1 h-3 w-3" /> View on Etherscan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3 flex justify-between">
              <Button variant="outline" className="border-gray-200 text-gray-700">
                <Download className="mr-2 h-4 w-4" /> Export Transaction History
              </Button>
              <div className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Last updated: {formatDate(new Date().toISOString())}</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>      </Tabs>      {/* Additional info section */}
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
  )
}
