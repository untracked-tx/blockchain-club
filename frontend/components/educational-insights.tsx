"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Shield, Zap } from "lucide-react"
import { WalletAsset } from "@/lib/multichain-wallet-service"

interface EducationalInsightsProps {
  assets: WalletAsset[]
}

const assetInsights: Record<string, {
  purpose: string
  category: string
  insights: string[]
  icon: any
  color: string
}> = {
  ETH: {
    purpose: "Core Network Asset",
    category: "Base Layer",
    insights: [
      "Powers the Ethereum network and enables smart contracts",
      "Used for transaction fees (gas) across DeFi protocols", 
      "Can be staked for ~4-6% annual yield",
      "Essential for participating in Ethereum ecosystem"
    ],
    icon: Zap,
    color: "blue"
  },
  WETH: {
    purpose: "DeFi Liquidity",
    category: "Wrapped Asset",
    insights: [
      "ERC-20 version of ETH for use in DeFi protocols",
      "Enables participation in decentralized exchanges",
      "1:1 backing with ETH, fully redeemable",
      "Required for many automated market makers"
    ],
    icon: Zap,
    color: "blue"
  },
  USDC: {
    purpose: "Stable Value Storage",
    category: "Stablecoin",
    insights: [
      "USD-backed stablecoin for price stability",
      "Used for treasury management and payments",
      "Earns yield through lending protocols (~3-5%)",
      "Provides liquidity during market volatility"
    ],
    icon: Shield,
    color: "green"
  },
  WBTC: {
    purpose: "Bitcoin Exposure",
    category: "Wrapped Asset",
    insights: [
      "Brings Bitcoin to Ethereum ecosystem",
      "Backed 1:1 by actual Bitcoin reserves",
      "Enables Bitcoin yield through DeFi protocols",
      "Diversifies treasury beyond Ethereum assets"
    ],
    icon: TrendingUp,
    color: "orange"
  },
  LINK: {
    purpose: "Oracle Infrastructure",
    category: "DeFi Infrastructure",
    insights: [
      "Powers decentralized oracle networks",
      "Critical for bringing real-world data on-chain",
      "Required for many DeFi protocols to function",
      "Can be staked for network security rewards"
    ],
    icon: Zap,
    color: "blue"
  },
  UNI: {
    purpose: "DEX Governance",
    category: "Governance Token",
    insights: [
      "Governance token for Uniswap protocol",
      "Grants voting rights on protocol upgrades",
      "Can be used to provide liquidity and earn fees",
      "Represents ownership in leading DEX protocol"
    ],
    icon: TrendingUp,
    color: "purple"
  },
  POL: {
    purpose: "Native Network Token",
    category: "Layer 2 Infrastructure", 
    insights: [
      "Native token of the Polygon network where our smart contracts are deployed",
      "Used for transaction fees and network security on Polygon",
      "Enables fast, low-cost transactions for our membership system",
      "We're grateful to the Polygon team for supporting this project's development"
    ],
    icon: Zap,
    color: "purple"
  },
  MATIC: {
    purpose: "Network Operations",
    category: "Layer 2 Infrastructure",
    insights: [
      "Powers the Polygon network infrastructure",
      "Provides scaling solutions for Ethereum applications", 
      "Enables our club to operate with minimal transaction costs",
      "Critical for making blockchain membership accessible to students"
    ],
    icon: Zap,
    color: "purple"
  }
}

export function EducationalInsights({ assets }: EducationalInsightsProps) {
  const relevantAssets = assets.filter(asset => 
    assetInsights[asset.symbol] && asset.value > 0
  )

  if (relevantAssets.length === 0) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Educational Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <div className="text-sm">Asset insights will appear here once tokens are detected</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
          <BookOpen className="h-4 w-4" />
          Why We Hold These Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {relevantAssets.slice(0, 4).map((asset) => {
            const insight = assetInsights[asset.symbol]
            const IconComponent = insight.icon
            
            return (
              <div key={asset.id} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start space-x-4 mb-3">
                  <div className={`rounded-full p-2 flex-shrink-0 ${
                    insight.color === 'blue' ? 'bg-blue-100' :
                    insight.color === 'green' ? 'bg-green-100' :
                    insight.color === 'orange' ? 'bg-orange-100' :
                    insight.color === 'purple' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      insight.color === 'blue' ? 'text-blue-600' :
                      insight.color === 'green' ? 'text-green-600' :
                      insight.color === 'orange' ? 'text-orange-600' :
                      insight.color === 'purple' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-base">{asset.symbol}</span>
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {insight.category}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">{insight.purpose}</div>
                    
                    <div className="space-y-2">
                      {insight.insights.map((tip, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-start space-x-3">
                          <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                            insight.color === 'blue' ? 'bg-blue-400' :
                            insight.color === 'green' ? 'bg-green-400' :
                            insight.color === 'orange' ? 'bg-orange-400' :
                            insight.color === 'purple' ? 'bg-purple-400' :
                            'bg-gray-400'
                          }`} />
                          <span className="leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {relevantAssets.length > 4 && (
            <div className="text-sm text-gray-500 text-center pt-2 border-t border-gray-100">
              +{relevantAssets.length - 4} more assets with educational insights
            </div>
          )}
          
          {/* Special note about Polygon */}
          {relevantAssets.some(asset => ['POL', 'MATIC'].includes(asset.symbol)) && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="text-sm text-purple-800 leading-relaxed">
                <strong>About Our Polygon Deployment:</strong> Our Blockchain Club smart contracts are natively deployed on the Polygon network, 
                enabling fast and affordable club operations. We're grateful to the Polygon development team for their support 
                in making blockchain technology accessible to students.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
