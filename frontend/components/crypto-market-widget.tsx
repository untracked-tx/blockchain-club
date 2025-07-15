"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Eye,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Activity,
  DollarSign,
  Search
} from "lucide-react"

interface TrendingCoin {
  id: string
  coin_id: number
  name: string
  symbol: string
  market_cap_rank: number
  thumb: string
  small: string
  large: string
  slug: string
  price_btc: number
  score: number
}

interface GlobalData {
  active_cryptocurrencies: number
  upcoming_icos: number
  ongoing_icos: number
  ended_icos: number
  markets: number
  total_market_cap: { usd: number }
  total_volume: { usd: number }
  market_cap_percentage: { btc: number }
  market_cap_change_percentage_24h_usd: number
  updated_at: number
}

interface CoinPrice {
  usd: number
  usd_24h_change: number
}

interface DerivativeTicker {
  market: string
  symbol: string
  index_id: string
  price: string
  price_percentage_change_24h: number
  contract_type: string
  index: number
  basis: number
  spread: number
  funding_rate: number
  open_interest_usd: number
  volume_24h: number
  last_traded_at: number
  expired_at: string
}

interface CorporateHolding {
  name: string
  symbol: string
  country: string
  total_holdings: number
  total_entry_value_usd: number
  total_current_value_usd: number
  percentage_of_treasury: number
}

interface InstitutionalData {
  derivatives: DerivativeTicker[]
  corporateHoldings: {
    bitcoin: CorporateHolding[]
    ethereum: CorporateHolding[]
  }
  loadingStates: {
    derivatives: boolean
    corporate: boolean
    analysis: boolean
  }
}

const CryptoTrendingWidget: React.FC = () => {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [globalData, setGlobalData] = useState<GlobalData | null>(null)
  const [coinPrices, setCoinPrices] = useState<Record<string, CoinPrice>>({})
  const [institutionalData, setInstitutionalData] = useState<InstitutionalData>({
    derivatives: [],
    corporateHoldings: { bitcoin: [], ethereum: [] },
    loadingStates: { derivatives: true, corporate: true, analysis: true }
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Format helpers
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    if (price < 100) return `$${price.toFixed(2)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${(num / 1e3).toFixed(2)}K`
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  // Fetch institutional data - professional market intelligence
  const fetchInstitutionalData = async () => {
    try {
      // Set loading states
      setInstitutionalData(prev => ({
        ...prev,
        loadingStates: { derivatives: true, corporate: true, analysis: true }
      }))

      // 1. Fetch derivatives data
      const derivativesResponse = await fetch('/api/crypto/derivatives')
      if (derivativesResponse.ok) {
        const derivativesData = await derivativesResponse.json()
        setInstitutionalData(prev => ({
          ...prev,
          derivatives: derivativesData.slice(0, 10), // Top 10 derivatives
          loadingStates: { ...prev.loadingStates, derivatives: false }
        }))
      } else {
        setInstitutionalData(prev => ({
          ...prev,
          loadingStates: { ...prev.loadingStates, derivatives: false }
        }))
      }

      // 2. Fetch corporate treasury holdings
      const [btcTreasuryResponse, ethTreasuryResponse] = await Promise.all([
        fetch('/api/crypto/companies/bitcoin'),
        fetch('/api/crypto/companies/ethereum')
      ])

      const corporateHoldings = {
        bitcoin: btcTreasuryResponse.ok ? await btcTreasuryResponse.json() : [],
        ethereum: ethTreasuryResponse.ok ? await ethTreasuryResponse.json() : []
      }

      setInstitutionalData(prev => ({
        ...prev,
        corporateHoldings,
        loadingStates: { ...prev.loadingStates, corporate: false, analysis: false }
      }))

    } catch (error) {
      console.error('Error fetching institutional data:', error)
      setInstitutionalData(prev => ({
        ...prev,
        loadingStates: { derivatives: false, corporate: false, analysis: false }
      }))
    }
  }

  // Fetch trending data - this is our main dish!
  const fetchTrendingData = async () => {
    try {
      setLoading(true)
      
      // 1. Get trending coins (1 API call)
      const trendingResponse = await fetch('/api/crypto/trending')
      
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json()
        const coins = trendingData.coins || []
        setTrendingCoins(coins.slice(0, 7)) // Top 7 trending
        
        // 2. Get prices for trending coins (1 API call)
        const coinIds = coins.slice(0, 7).map((coin: any) => coin.id).join(',')
        if (coinIds) {
          const pricesResponse = await fetch(`/api/crypto/simple-price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`)
          if (pricesResponse.ok) {
            const pricesData = await pricesResponse.json()
            setCoinPrices(pricesData)
          }
        }
      }

      // 3. Get global market data (1 API call)
      const globalResponse = await fetch('/api/crypto/global')
      if (globalResponse.ok) {
        const globalResult = await globalResponse.json()
        setGlobalData(globalResult.data)
      }

      // 4. Fetch institutional data
      await fetchInstitutionalData()

      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trending data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrendingData()
    
    // Refresh every 5 minutes (conservative for rate limits)
    const interval = setInterval(fetchTrendingData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              <Flame className="absolute inset-0 m-auto h-6 w-6 text-orange-600 animate-pulse" />
            </div>
            <p className="text-gray-600 font-medium">🔥 Fetching what's HOT in crypto...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Global Market Pulse */}
      <Card className="bg-gradient-to-br from-orange-50 via-white to-red-50 border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  🔥 Crypto Trending Now
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  What's moving markets today • Live sentiment tracking
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <div className="text-xs text-gray-500">
                  Updated {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchTrendingData}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Global Market Stats */}
          {globalData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Market Cap</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatLargeNumber(globalData.total_market_cap.usd)}
                </div>
                <div className={`text-sm font-medium mt-1 ${
                  globalData.market_cap_change_percentage_24h_usd >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {formatPercentage(globalData.market_cap_change_percentage_24h_usd)} 24h
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-600">24h Volume</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatLargeNumber(globalData.total_volume.usd)}
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">BTC Dominance</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {globalData.market_cap_percentage.btc.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Active Coins</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {globalData.active_cryptocurrencies.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Professional Market Intelligence Dashboard */}
      <Card className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Professional Market Intelligence</h3>
                <p className="text-gray-600">Institutional derivatives, corporate holdings & market structure</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Institutional Grade
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Derivatives Market Overview */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Derivatives Market Overview</h4>
              {institutionalData.loadingStates.derivatives && (
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              )}
            </div>
            
            {institutionalData.loadingStates.derivatives ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white/70 rounded-xl p-4 border border-gray-100">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : institutionalData.derivatives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {institutionalData.derivatives.slice(0, 6).map((derivative, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-gray-900">{derivative.symbol}</div>
                        <div className="text-sm text-gray-500">{derivative.market}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${parseFloat(derivative.price).toLocaleString()}</div>
                        <div className={`text-sm font-medium ${
                          derivative.price_percentage_change_24h >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {formatPercentage(derivative.price_percentage_change_24h)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Open Interest:</span>
                        <div className="font-medium">${(derivative.open_interest_usd / 1e6).toFixed(1)}M</div>
                      </div>
                      <div>
                        <span className="text-gray-500">24h Volume:</span>
                        <div className="font-medium">${(derivative.volume_24h / 1e6).toFixed(1)}M</div>
                      </div>
                    </div>
                    
                    {derivative.funding_rate && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Funding Rate:</span>
                        <span className={`ml-2 text-xs font-medium ${
                          derivative.funding_rate >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {(derivative.funding_rate * 100).toFixed(4)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Derivatives data temporarily unavailable</p>
              </div>
            )}
          </div>

          {/* Corporate Treasury Holdings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-indigo-600" />
              <h4 className="text-lg font-semibold text-gray-900">Corporate Treasury Holdings</h4>
              {institutionalData.loadingStates.corporate && (
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              )}
            </div>
            
            {institutionalData.loadingStates.corporate ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Bitcoin', 'Ethereum'].map(asset => (
                  <div key={asset} className="bg-white/70 rounded-xl p-4 border border-gray-100">
                    <div className="animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                      {[1,2,3].map(i => (
                        <div key={i} className="mb-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bitcoin Holdings */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">₿</span>
                    </div>
                    <h5 className="font-bold text-gray-900">Bitcoin Corporate Holdings</h5>
                  </div>
                  
                  {institutionalData.corporateHoldings.bitcoin.length > 0 ? (
                    <div className="space-y-3">
                      {institutionalData.corporateHoldings.bitcoin.slice(0, 5).map((holding, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <div className="font-medium text-gray-900">{holding.name}</div>
                            <div className="text-xs text-gray-500">{holding.country}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{holding.total_holdings.toLocaleString()} BTC</div>
                            <div className="text-xs text-gray-500">{holding.percentage_of_treasury.toFixed(1)}% of treasury</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No corporate holdings data available</p>
                  )}
                </div>

                {/* Ethereum Holdings */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Ξ</span>
                    </div>
                    <h5 className="font-bold text-gray-900">Ethereum Corporate Holdings</h5>
                  </div>
                  
                  {institutionalData.corporateHoldings.ethereum.length > 0 ? (
                    <div className="space-y-3">
                      {institutionalData.corporateHoldings.ethereum.slice(0, 5).map((holding, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <div className="font-medium text-gray-900">{holding.name}</div>
                            <div className="text-xs text-gray-500">{holding.country}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{holding.total_holdings.toLocaleString()} ETH</div>
                            <div className="text-xs text-gray-500">{holding.percentage_of_treasury.toFixed(1)}% of treasury</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No corporate holdings data available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Market Structure Analysis */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Market Structure Analysis</h4>
              {institutionalData.loadingStates.analysis && (
                <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              )}
            </div>
            
            {institutionalData.loadingStates.analysis ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white/70 rounded-xl p-4 border border-gray-100">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : globalData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Institutional Volume</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {((globalData.total_volume.usd * 0.65) / 1e9).toFixed(1)}B
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Est. 65% of total volume
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Market Depth</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {globalData.markets.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Active trading pairs
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Liquidity Score</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(globalData.total_volume.usd / globalData.total_market_cap.usd * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Volume to market cap ratio
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Market structure analysis unavailable</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trending Coins Section - Now Simplified */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Market Sentiment Tracker</h3>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Live Trending
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid gap-3">
            {trendingCoins.map((coin, index) => {
              const price = coinPrices[coin.id]
              const rank = index + 1
              
              return (
                <div 
                  key={coin.id}
                  className="group relative p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Trending Rank */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        rank === 3 ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
                        'bg-gradient-to-r from-orange-400 to-red-500'
                      }`}>
                        {rank}
                      </div>
                      
                      {/* Coin Info */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={coin.small} 
                          alt={coin.name} 
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIj4/PC90ZXh0Pgo8L3N2Zz4K"
                          }}
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{coin.symbol.toUpperCase()}</div>
                          <div className="text-sm text-gray-500 truncate max-w-32">{coin.name}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price & Change */}
                    <div className="text-right">
                      {price ? (
                        <>
                          <div className="font-bold text-gray-900 text-lg">{formatPrice(price.usd)}</div>
                          <div className={`flex items-center gap-1 justify-end text-sm font-medium ${
                            price.usd_24h_change >= 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {price.usd_24h_change >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {formatPercentage(price.usd_24h_change)}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400">
                          <div className="h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Market Cap Rank */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-600">
                    <span>Market Cap Rank: #{coin.market_cap_rank || '?'}</span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-600 font-medium">Trending</span>
                    </div>
                  </div>
                  
                  {/* Trending indicator */}
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {trendingCoins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Flame className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No trending data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CryptoTrendingWidget
