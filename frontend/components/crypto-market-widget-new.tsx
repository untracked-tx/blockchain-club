"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  BarChart3, 
  Activity, 
  Eye, 
  Target,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  DollarSign,
  Bitcoin,
  Coins,
  RefreshCw,
  Zap,
  Search
} from "lucide-react"

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
  market_cap: number
  market_cap_rank: number
  image?: string
}

interface GlobalData {
  total_market_cap: { usd: number }
  total_volume: { usd: number }
  market_cap_percentage: { btc: number }
}

interface HistoricalPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
  marketCap?: number
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
  open_interest?: number  // Some APIs use this field instead
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

interface CryptoMarketWidgetProps {
  onDataLoaded?: (loaded: boolean) => void
}

const CryptoMarketWidget: React.FC<CryptoMarketWidgetProps> = ({ onDataLoaded }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [globalData, setGlobalData] = useState<GlobalData | null>(null)
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalPoint[]>([])
  const [timeframe, setTimeframe] = useState('7')
  const [activeTab, setActiveTab] = useState('market')
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Initializing blockchain connection...')
  const [fearGreedIndex, setFearGreedIndex] = useState<{ value: number; label: string } | null>(null)
  const [fearGreedLoading, setFearGreedLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [institutionalData, setInstitutionalData] = useState<InstitutionalData>({
    derivatives: [],
    corporateHoldings: { bitcoin: [], ethereum: [] },
    loadingStates: { derivatives: true, corporate: true, analysis: true }
  })

  // Utility functions
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${price.toFixed(4)}`
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e12) return `$${(volume / 1e12).toFixed(2)}T`
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    return `$${volume.toLocaleString()}`
  }

  // Fetch Fear & Greed Index
  const fetchFearGreedIndex = async () => {
    try {
      setFearGreedLoading(true)
      console.log('🎯 Fetching Fear & Greed Index...')
      
      const response = await fetch('/api/fear-greed')
      
      if (!response.ok) {
        throw new Error('Failed to fetch Fear & Greed Index')
      }
      
      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        setFearGreedIndex({
          value: parseInt(data.data[0].value),
          label: data.data[0].value_classification
        })
        console.log('✅ Fear & Greed Index loaded:', data.data[0].value_classification)
      }
      
    } catch (error) {
      console.error('❌ Error fetching Fear & Greed Index:', error)
    } finally {
      setFearGreedLoading(false)
    }
  }

  // Fetch institutional data - professional market intelligence
  const fetchInstitutionalData = async () => {
    console.log('🏢 Starting institutional data fetch...')
    
    try {
      // Set loading states
      setInstitutionalData(prev => ({
        ...prev,
        loadingStates: { derivatives: true, corporate: true, analysis: true }
      }))

      // 1. Fetch derivatives data with fallback
      console.log('📊 Fetching derivatives data...')
      let derivativesData = []
      try {
        const derivativesResponse = await fetch('/api/crypto/derivatives')
        if (derivativesResponse.ok) {
          const derivativesResult = await derivativesResponse.json()
          // Check if the response has an error property (our custom error format)
          if (derivativesResult.error) {
            console.warn('⚠️ Derivatives API returned error:', derivativesResult.error)
            derivativesData = [] // Use empty array instead of error object
          } else {
            derivativesData = Array.isArray(derivativesResult) ? derivativesResult : []
            console.log('✅ Derivatives data loaded:', derivativesData.length, 'items')
          }
        } else {
          console.warn('⚠️ Derivatives API rate limited, using fallback data')
          derivativesData = [
            {
              market: "Binance Futures",
              symbol: "BTCUSDT",
              volume_24h: 2500000000,
              open_interest_usd: 1200000000,
              contract_type: "Perpetual"
            },
            {
              market: "OKX Futures", 
              symbol: "ETHUSDT",
              volume_24h: 1800000000,
              open_interest_usd: 950000000,
              contract_type: "Perpetual"
            },
            {
              market: "Bybit Futures",
              symbol: "SOLUSDT", 
              volume_24h: 450000000,
              open_interest_usd: 280000000,
              contract_type: "Perpetual"
            }
          ]
        }
      } catch (error) {
        console.error('❌ Derivatives fetch failed:', error)
        derivativesData = []
      }

      // 2. Fetch corporate treasury holdings with fallback
      console.log('🏛️ Fetching corporate holdings...')
      let bitcoinHoldings = []
      let ethereumHoldings = []
      
      try {
        const [btcTreasuryResponse, ethTreasuryResponse] = await Promise.all([
          fetch('/api/crypto/companies/bitcoin'),
          fetch('/api/crypto/companies/ethereum')
        ])

        if (btcTreasuryResponse.ok) {
          const btcData = await btcTreasuryResponse.json()
          // Check if the response has an error property (our custom error format)
          if (btcData.error) {
            console.warn('⚠️ Bitcoin holdings API returned error:', btcData.error)
            bitcoinHoldings = [] // Use empty array instead of error object
          } else {
            // Handle both direct array format and { companies: [...] } format
            const companiesArray = btcData.companies || btcData
            bitcoinHoldings = Array.isArray(companiesArray) ? companiesArray : []
            console.log('✅ Bitcoin corporate holdings loaded:', bitcoinHoldings.length, 'companies')
          }
        } else {
          console.warn('⚠️ Bitcoin holdings API rate limited, using fallback data')
          bitcoinHoldings = [
            {
              name: "MicroStrategy Inc.",
              total_holdings: 193000,
              total_current_value_usd: 8500000000,
              percentage_of_treasury: 75
            },
            {
              name: "Tesla Inc.",
              total_holdings: 48000,
              total_current_value_usd: 2100000000,
              percentage_of_treasury: 8
            },
            {
              name: "Block Inc.",
              total_holdings: 8027,
              total_current_value_usd: 350000000,
              percentage_of_treasury: 5
            }
          ]
        }

        if (ethTreasuryResponse.ok) {
          const ethData = await ethTreasuryResponse.json()
          // Check if the response has an error property (our custom error format)
          if (ethData.error) {
            console.warn('⚠️ Ethereum holdings API returned error:', ethData.error)
            ethereumHoldings = [] // Use empty array instead of error object
          } else {
            // Handle both direct array format and { companies: [...] } format
            const companiesArray = ethData.companies || ethData
            ethereumHoldings = Array.isArray(companiesArray) ? companiesArray : []
            console.log('✅ Ethereum corporate holdings loaded:', ethereumHoldings.length, 'companies')
          }
        } else {
          console.warn('⚠️ Ethereum holdings API rate limited, using fallback data')
          ethereumHoldings = [
            {
              name: "Ethereum Foundation",
              total_holdings: 350000,
              total_current_value_usd: 875000000,
              percentage_of_treasury: 85
            },
            {
              name: "ConsenSys",
              total_holdings: 28000,
              total_current_value_usd: 70000000,
              percentage_of_treasury: 15
            }
          ]
        }
      } catch (error) {
        console.error('❌ Corporate holdings fetch failed:', error)
        // Keep empty arrays as fallback
      }

      // Update state with all data (real or fallback)
      setInstitutionalData(prev => ({
        ...prev,
        derivatives: derivativesData.slice(0, 10),
        corporateHoldings: {
          bitcoin: bitcoinHoldings.slice(0, 10),
          ethereum: ethereumHoldings.slice(0, 10)
        },
        loadingStates: { derivatives: false, corporate: false, analysis: false }
      }))

      console.log('✅ Institutional data fetch completed')

    } catch (error) {
      console.error('❌ Error fetching institutional data:', error)
      setInstitutionalData(prev => ({
        ...prev,
        loadingStates: { derivatives: false, corporate: false, analysis: false }
      }))
    }
  }

  // Fetch market data
  const fetchMarketData = async () => {
    try {
      setLoading(true)
      setLoadingMessage('🚀 Sending API call to the moon...')

      const response = await fetch('/api/crypto/market')
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data')
      }

      const data = await response.json()
      setCryptoData(data.coins || [])
      setGlobalData(data.global || null)
      
    } catch (error) {
      console.error('Error fetching market data:', error)
      setLoadingMessage('🔥 API having a Gordon moment... Please try again!')
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const loadAllData = async () => {
      console.log('🚀 CryptoMarketWidget: Starting data fetch...')
      
      // Start with market data (most important)
      await fetchMarketData()
      
      // Then Fear & Greed (doesn't count against CoinGecko limits)
      await fetchFearGreedIndex()
      
      // Finally institutional data (with delay to avoid rate limits)
      setTimeout(async () => {
        await fetchInstitutionalData()
        
        // Notify parent that ALL data loading is complete
        if (onDataLoaded) {
          console.log('✅ CryptoMarketWidget: All data loaded, notifying parent')
          onDataLoaded(true)
        }
      }, 2000)
    }
    
    loadAllData()
  }, [onDataLoaded])

  // Utility to get coin icon component
  const getCoinIcon = (symbol: string) => {
    switch (symbol.toLowerCase()) {
      case 'btc': return Bitcoin
      case 'eth': return Activity
      default: return Coins
    }
  }

  // Utility to get gradient for a coin
  const getGradientForCoin = (symbol: string, index: number) => {
    const gradients = [
      'from-orange-400 to-orange-600', // Bitcoin
      'from-blue-400 to-purple-600',  // Ethereum
      'from-green-400 to-emerald-600', // Others
      'from-red-400 to-pink-600',
      'from-yellow-400 to-orange-600',
      'from-purple-400 to-indigo-600',
      'from-cyan-400 to-blue-600',
    ]
    
    if (symbol.toLowerCase() === 'btc') return gradients[0]
    if (symbol.toLowerCase() === 'eth') return gradients[1]
    return gradients[2 + (index % (gradients.length - 2))]
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Global Stats */}
      <Card className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Crypto Market Analysis
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Real-time market data, sentiment analysis, and historical insights
                </CardDescription>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMarketData}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {globalData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Market Cap</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatVolume(globalData.total_market_cap.usd)}
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">24h Volume</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatVolume(globalData.total_volume.usd)}
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">BTC Dominance</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {globalData.market_cap_percentage.btc.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main Market Widget */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-0 h-16 p-2">
              <TabsTrigger 
                value="market" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 text-gray-700 data-[state=active]:text-gray-900 font-medium"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Market Overview
              </TabsTrigger>
              <TabsTrigger 
                value="charts" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 text-gray-700 data-[state=active]:text-gray-900 font-medium"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Institutional Intelligence
              </TabsTrigger>
              <TabsTrigger 
                value="sentiment" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 text-gray-700 data-[state=active]:text-gray-900 font-medium"
              >
                <Target className="h-4 w-4 mr-2" />
                Market Sentiment
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="market" className="p-0 m-0">
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-lg font-medium text-gray-900 mb-2">{loadingMessage}</div>
                  <div className="text-gray-600">Getting the latest blockchain gossip...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cryptoData.slice(0, 10).map((coin, index) => (
                    <div key={coin.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getGradientForCoin(coin.symbol, index)} rounded-xl flex items-center justify-center shadow-lg`}>
                          {React.createElement(getCoinIcon(coin.symbol), { className: "h-6 w-6 text-white" })}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{coin.symbol.toUpperCase()}</div>
                          <div className="text-sm text-gray-600">{coin.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatPrice(coin.current_price)}</div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          coin.price_change_percentage_24h >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {coin.price_change_percentage_24h >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="charts" className="p-6">
            {institutionalData ? (
              <div className="space-y-6">
                {/* Institutional Intelligence Overview */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Market Intelligence</h2>
                  <p className="text-gray-600">Derivatives, Corporate Holdings & Market Structure Analysis</p>
                </div>

                {/* Professional Trading Activity */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Professional Trading Activity
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Futures and perpetual contracts show where big money is betting on crypto prices
                  </p>
                  
                  {institutionalData.derivatives.length > 0 ? (
                    <div className="space-y-4">
                      {/* Key Metrics Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 text-center border-l-4 border-purple-500">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatVolume(institutionalData.derivatives.reduce((sum, d) => sum + (d.volume_24h || 0), 0))}
                          </div>
                          <div className="text-sm text-gray-600">24h Trading Volume</div>
                          <div className="text-xs text-gray-500 mt-1">Professional derivatives</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-l-4 border-blue-500">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatVolume(institutionalData.derivatives.reduce((sum, d) => sum + (d.open_interest_usd || d.open_interest || 0), 0))}
                          </div>
                          <div className="text-sm text-gray-600">Open Interest</div>
                          <div className="text-xs text-gray-500 mt-1">Money currently at risk</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-l-4 border-green-500">
                          <div className="text-2xl font-bold text-green-600">
                            {institutionalData.derivatives.length}
                          </div>
                          <div className="text-sm text-gray-600">Active Markets</div>
                          <div className="text-xs text-gray-500 mt-1">Major exchanges tracking</div>
                        </div>
                      </div>

                      {/* Top Markets Table */}
                      <div className="bg-white rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b">
                          <h4 className="font-medium text-gray-900">Top Trading Markets</h4>
                          <p className="text-xs text-gray-600">Higher volume = more institutional interest</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Exchange & Pair</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-700">24h Volume</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-700">Open Interest</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-700">Contract Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {institutionalData.derivatives.slice(0, 6).map((ticker, index) => (
                                <tr key={index} className="border-b border-gray-50 hover:bg-gray-25">
                                  <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900">{ticker.market}</div>
                                    <div className="font-mono text-sm text-blue-600">{ticker.symbol}</div>
                                  </td>
                                  <td className="py-3 px-4 text-right font-medium">
                                    {ticker.volume_24h ? formatVolume(ticker.volume_24h) : 'N/A'}
                                  </td>
                                  <td className="py-3 px-4 text-right font-medium">
                                    {ticker.open_interest_usd ? formatVolume(ticker.open_interest_usd) : 
                                     ticker.open_interest ? formatVolume(ticker.open_interest) : 'N/A'}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                      {ticker.contract_type || 'Perpetual'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <div className="font-medium">No derivatives data available</div>
                      <div className="text-sm">Professional trading data will appear here</div>
                    </div>
                  )}
                </div>

                {/* Corporate Crypto Treasuries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bitcoin Corporate Holdings */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                      <Bitcoin className="w-5 h-5 mr-2 text-orange-600" />
                      Bitcoin Corporate Treasuries
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Public companies holding Bitcoin as a treasury asset
                    </p>
                    {institutionalData.corporateHoldings.bitcoin.length > 0 ? (
                      <div className="space-y-3">
                        {/* Total Holdings Summary */}
                        <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500 mb-4">
                          <div className="text-2xl font-bold text-orange-600">
                            {institutionalData.corporateHoldings.bitcoin.reduce((sum, company) => sum + company.total_holdings, 0).toLocaleString()} BTC
                          </div>
                          <div className="text-sm text-gray-600">Total Corporate Holdings</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatVolume(institutionalData.corporateHoldings.bitcoin.reduce((sum, company) => sum + company.total_current_value_usd, 0))} market value
                          </div>
                        </div>

                        {/* Top Companies */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 text-sm">Top Bitcoin Holders</h4>
                          {institutionalData.corporateHoldings.bitcoin.slice(0, 5).map((company: CorporateHolding, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-100">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{company.name}</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                  <span>{company.total_holdings.toLocaleString()} BTC</span>
                                  <span className="text-orange-600">•</span>
                                  <span>{company.symbol}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-orange-600">
                                  {formatVolume(company.total_current_value_usd)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  ${(company.total_current_value_usd / company.total_holdings).toLocaleString()} per BTC
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Bitcoin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <div className="font-medium">Loading corporate BTC holdings...</div>
                        <div className="text-sm">Corporate treasury data will appear here</div>
                      </div>
                    )}
                  </div>

                  {/* Ethereum Corporate Holdings */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Ethereum Corporate Treasuries
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Companies and foundations holding Ethereum as strategic reserves
                    </p>
                    {institutionalData.corporateHoldings.ethereum.length > 0 ? (
                      <div className="space-y-3">
                        {/* Total Holdings Summary */}
                        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 mb-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {institutionalData.corporateHoldings.ethereum.reduce((sum, company) => sum + company.total_holdings, 0).toLocaleString()} ETH
                          </div>
                          <div className="text-sm text-gray-600">Total Corporate Holdings</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatVolume(institutionalData.corporateHoldings.ethereum.reduce((sum, company) => sum + company.total_current_value_usd, 0))} market value
                          </div>
                        </div>

                        {/* Top Companies */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 text-sm">Top Ethereum Holders</h4>
                          {institutionalData.corporateHoldings.ethereum.slice(0, 5).map((company: CorporateHolding, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{company.name}</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                  <span>{company.total_holdings.toLocaleString()} ETH</span>
                                  <span className="text-blue-600">•</span>
                                  <span>{company.symbol}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-blue-600">
                                  {formatVolume(company.total_current_value_usd)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  ${(company.total_current_value_usd / company.total_holdings).toLocaleString()} per ETH
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <div className="font-medium">Loading corporate ETH holdings...</div>
                        <div className="text-sm">Corporate treasury data will appear here</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Intelligence Insights */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-gray-700" />
                    What This Data Tells Us
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Key insights from professional trading activity and corporate adoption
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Trading Volume Insight */}
                    <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Trading Activity</span>
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        {formatVolume(institutionalData.derivatives.reduce((sum, d) => sum + (d.volume_24h || 0), 0))}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Professional derivatives volume shows institutional interest levels
                      </div>
                    </div>

                    {/* Corporate Adoption */}
                    <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Bitcoin className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">BTC Adoption</span>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {institutionalData.corporateHoldings.bitcoin.length} Companies
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {institutionalData.corporateHoldings.bitcoin.reduce((sum, company) => sum + company.total_holdings, 0).toLocaleString()} BTC in corporate treasuries
                      </div>
                    </div>

                    {/* ETH Ecosystem */}
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">ETH Ecosystem</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {institutionalData.corporateHoldings.ethereum.length} Entities
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {institutionalData.corporateHoldings.ethereum.reduce((sum, company) => sum + company.total_holdings, 0).toLocaleString()} ETH held institutionally
                      </div>
                    </div>

                    {/* Market Maturity */}
                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Market Maturity</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {institutionalData.derivatives.length} Markets
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Active professional trading venues indicate market sophistication
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-lg font-medium text-gray-900 mb-2">Loading Institutional Intelligence</div>
                <div className="text-gray-600">Fetching derivatives and corporate holdings data...</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sentiment" className="p-6">
            <div className="space-y-6">
              {fearGreedLoading ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <div className="text-gray-600">Loading sentiment data...</div>
                </div>
              ) : fearGreedIndex ? (
                <div className="space-y-8">
                  {/* Main Fear & Greed Display */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg relative overflow-hidden">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-green-600 bg-clip-text text-transparent">
                        Crypto Fear & Greed Index
                      </h3>
                      <p className="text-gray-600 text-lg">Market Psychology Indicator</p>
                    </div>

                    {/* Enhanced Circular Progress Indicator */}
                    <div className="flex justify-center mb-8">
                      <div className="relative w-80 h-80">
                        {/* Animated Background Glow */}
                        <div className={`absolute inset-8 rounded-full blur-2xl opacity-30 animate-pulse ${
                          fearGreedIndex.value >= 75 ? 'bg-green-400' :
                          fearGreedIndex.value >= 55 ? 'bg-yellow-400' :
                          fearGreedIndex.value >= 45 ? 'bg-orange-400' :
                          fearGreedIndex.value >= 25 ? 'bg-orange-500' :
                          'bg-red-400'
                        }`}></div>
                        
                        {/* Main SVG */}
                        <svg className="w-80 h-80 transform -rotate-90 drop-shadow-2xl" viewBox="0 0 120 120">
                          {/* Gradient and Filter Definitions */}
                          <defs>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                              <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                            <linearGradient id={`fearGreedGradient-${fearGreedIndex.value}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={fearGreedIndex.value >= 75 ? '#10b981' : fearGreedIndex.value >= 55 ? '#eab308' : fearGreedIndex.value >= 45 ? '#f97316' : fearGreedIndex.value >= 25 ? '#f97316' : '#ef4444'} />
                              <stop offset="50%" stopColor={fearGreedIndex.value >= 75 ? '#34d399' : fearGreedIndex.value >= 55 ? '#facc15' : fearGreedIndex.value >= 45 ? '#fb923c' : fearGreedIndex.value >= 25 ? '#fb923c' : '#f87171'} />
                              <stop offset="100%" stopColor={fearGreedIndex.value >= 75 ? '#059669' : fearGreedIndex.value >= 55 ? '#ca8a04' : fearGreedIndex.value >= 45 ? '#ea580c' : fearGreedIndex.value >= 25 ? '#ea580c' : '#dc2626'} />
                            </linearGradient>
                            <radialGradient id="glowGradient">
                              <stop offset="70%" stopColor="transparent"/>
                              <stop offset="100%" stopColor={fearGreedIndex.value >= 75 ? '#10b981' : fearGreedIndex.value >= 55 ? '#eab308' : fearGreedIndex.value >= 45 ? '#f97316' : fearGreedIndex.value >= 25 ? '#f97316' : '#ef4444'} stopOpacity="0.4"/>
                            </radialGradient>
                          </defs>
                          
                          {/* Background Glow Circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="url(#glowGradient)"
                            className="animate-pulse"
                          />
                          
                          {/* Background Track */}
                          <circle
                            cx="60"
                            cy="60"
                            r="45"
                            stroke="rgba(0,0,0,0.1)"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                          />
                          
                          {/* Progress Circle with Enhanced Effects */}
                          <circle
                            cx="60"
                            cy="60"
                            r="45"
                            stroke={`url(#fearGreedGradient-${fearGreedIndex.value})`}
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${fearGreedIndex.value * 2.83} 282.7`}
                            className="transition-all duration-2000 ease-out"
                            filter="url(#glow)"
                            style={{
                              filter: `drop-shadow(0 0 10px ${
                                fearGreedIndex.value >= 75 ? '#10b981' :
                                fearGreedIndex.value >= 55 ? '#eab308' :
                                fearGreedIndex.value >= 45 ? '#f97316' :
                                fearGreedIndex.value >= 25 ? '#f97316' : 
                                '#ef4444'
                              }40)`
                            }}
                          />
                          
                          {/* Animated Progress Dots */}
                          {Array.from({length: Math.floor(fearGreedIndex.value / 5)}).map((_, i) => (
                            <circle
                              key={i}
                              cx={60 + 42 * Math.cos((i * 18 - 90) * Math.PI / 180)}
                              cy={60 + 42 * Math.sin((i * 18 - 90) * Math.PI / 180)}
                              r="2"
                              fill={fearGreedIndex.value >= 75 ? '#10b981' : fearGreedIndex.value >= 55 ? '#eab308' : fearGreedIndex.value >= 45 ? '#f97316' : fearGreedIndex.value >= 25 ? '#f97316' : '#ef4444'}
                              className="animate-ping"
                              style={{animationDelay: `${i * 100}ms`}}
                            />
                          ))}
                        </svg>
                        
                        {/* Enhanced Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className={`text-7xl font-black mb-3 drop-shadow-lg ${
                            fearGreedIndex.value >= 75 ? 'text-green-600' :
                            fearGreedIndex.value >= 55 ? 'text-yellow-600' :
                            fearGreedIndex.value >= 45 ? 'text-orange-600' :
                            fearGreedIndex.value >= 25 ? 'text-orange-600' :
                            'text-red-600'
                          }`} style={{
                            textShadow: `0 0 20px ${
                              fearGreedIndex.value >= 75 ? '#10b98140' :
                              fearGreedIndex.value >= 55 ? '#eab30840' :
                              fearGreedIndex.value >= 45 ? '#f9731640' :
                              fearGreedIndex.value >= 25 ? '#f9731640' : 
                              '#ef444440'
                            }`
                          }}>
                            {fearGreedIndex.value}
                          </div>
                          <div className={`text-2xl font-bold px-6 py-3 rounded-full border-3 shadow-xl backdrop-blur-sm ${
                            fearGreedIndex.value >= 75 ? 'text-green-700 border-green-500 bg-green-50/80 shadow-green-200' :
                            fearGreedIndex.value >= 55 ? 'text-yellow-700 border-yellow-500 bg-yellow-50/80 shadow-yellow-200' :
                            fearGreedIndex.value >= 45 ? 'text-orange-700 border-orange-500 bg-orange-50/80 shadow-orange-200' :
                            fearGreedIndex.value >= 25 ? 'text-orange-700 border-orange-500 bg-orange-50/80 shadow-orange-200' :
                            'text-red-700 border-red-500 bg-red-50/80 shadow-red-200'
                          }`}>
                            {fearGreedIndex.label}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Information Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        What is the Fear and Greed Index?
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        The Fear and Greed Index measures prevailing sentiment in the cryptocurrency market on a scale from 0 to 100. 
                        Lower values indicate extreme fear (potentially undervalued markets), while higher values indicate extreme greed (potentially overvalued markets).
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        How can I use this index?
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span><strong>Market Sentiment:</strong> High values suggest overheated markets; low values may indicate buying opportunities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span><strong>Contrarian Strategy:</strong> "Be fearful when others are greedy, greedy when others are fearful"</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        How is this calculated?
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li className="flex items-center">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                          <span>Price Momentum</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                          <span>Market Volatility</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                          <span>Derivatives Activity</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                          <span>Market Composition</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                          <span>Social Sentiment</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load sentiment data
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* CoinGecko Attribution */}
        <div className="flex justify-end items-center mt-4 pt-3 border-t border-gray-100">
          <a 
            href="https://www.coingecko.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <img 
              src="/logos/Variant=CG-Symbol-Color.svg" 
              alt="CoinGecko" 
              className="w-3 h-3 mr-1.5"
            />
            <span>Data by CoinGecko</span>
          </a>
        </div>
      </Card>
    </div>
  )
}

export default CryptoMarketWidget
