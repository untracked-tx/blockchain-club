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

const CryptoMarketWidget: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [globalData, setGlobalData] = useState<GlobalData | null>(null)
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalPoint[]>([])
  const [timeframe, setTimeframe] = useState('7')
  const [activeTab, setActiveTab] = useState('market')
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Initializing blockchain connection...')
  const [fearGreedIndex, setFearGreedIndex] = useState<{ value: number; label: string } | null>(null)
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
    fetchMarketData()
    fetchInstitutionalData()
  }, [])

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

                {/* Derivatives Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Derivatives Overview
                  </h3>
                  {institutionalData.derivatives.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-700">Market</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-700">24h Volume</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-700">Open Interest</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-700">Contract Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {institutionalData.derivatives.slice(0, 5).map((ticker, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium">{ticker.market}</td>
                              <td className="py-2 px-3 text-right">${ticker.volume_24h?.toLocaleString() || 'N/A'}</td>
                              <td className="py-2 px-3 text-right">${ticker.open_interest_usd?.toLocaleString() || 'N/A'}</td>
                              <td className="py-2 px-3 text-right">{ticker.contract_type || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No derivatives data available
                    </div>
                  )}
                </div>

                {/* Corporate Holdings Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bitcoin Corporate Holdings */}
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Bitcoin Corporate Holdings
                    </h3>
                    {institutionalData.corporateHoldings.bitcoin.length > 0 ? (
                      <div className="space-y-3">
                        {institutionalData.corporateHoldings.bitcoin.slice(0, 5).map((company: CorporateHolding, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-600">{company.total_holdings.toLocaleString()} BTC</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-orange-600">
                                ${(company.total_current_value_usd / company.total_holdings).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">per BTC</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Loading corporate BTC holdings...
                      </div>
                    )}
                  </div>

                  {/* Ethereum Corporate Holdings */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Ethereum Corporate Holdings
                    </h3>
                    {institutionalData.corporateHoldings.ethereum.length > 0 ? (
                      <div className="space-y-3">
                        {institutionalData.corporateHoldings.ethereum.slice(0, 5).map((company: CorporateHolding, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-600">{company.total_holdings.toLocaleString()} ETH</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-blue-600">
                                ${(company.total_current_value_usd / company.total_holdings).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">per ETH</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Loading corporate ETH holdings...
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Structure Analysis */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Market Structure Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {institutionalData.derivatives.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Derivatives</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {institutionalData.corporateHoldings.bitcoin.length}
                      </div>
                      <div className="text-sm text-gray-600">BTC Institutions</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {institutionalData.corporateHoldings.ethereum.length}
                      </div>
                      <div className="text-sm text-gray-600">ETH Institutions</div>
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
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Sentiment Analysis</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default CryptoMarketWidget
