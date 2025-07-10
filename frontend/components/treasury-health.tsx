"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, TrendingUp, DollarSign, Zap } from "lucide-react"
import { WalletAsset } from "@/lib/multichain-wallet-service"

interface TreasuryHealthProps {
  assets: WalletAsset[]
  totalValue: number
}

export function TreasuryHealth({ assets, totalValue }: TreasuryHealthProps) {
  // Calculate diversification score (0-100)
  const calculateDiversification = () => {
    if (assets.length === 0) return 0
    
    // Calculate HHI (Herfindahl-Hirschman Index) for concentration
    const portfolioShares = assets.map(asset => (asset.value / totalValue) * 100)
    const hhi = portfolioShares.reduce((sum, share) => sum + (share * share), 0)
    
    // Convert HHI to diversification score (lower HHI = higher diversification)
    const maxHHI = 10000 // Maximum concentration (100% in one asset)
    const diversificationScore = Math.max(0, ((maxHHI - hhi) / maxHHI) * 100)
    
    return Math.round(diversificationScore)
  }

  // Calculate risk score based on asset types
  const calculateRiskScore = () => {
    let riskScore = 0
    let totalWeight = 0
    
    assets.forEach(asset => {
      const weight = asset.value / totalValue
      let assetRisk = 50 // Default medium risk
      
      // Risk scoring based on asset type
      if (asset.symbol === 'ETH') assetRisk = 40 // Lower risk for ETH
      else if (asset.symbol === 'BTC' || asset.symbol === 'WBTC') assetRisk = 35 // Lower risk for BTC
      else if (['USDC', 'USDT', 'DAI'].includes(asset.symbol)) assetRisk = 10 // Very low risk for stablecoins
      else if (['LINK', 'UNI', 'AAVE'].includes(asset.symbol)) assetRisk = 60 // Medium-high risk for DeFi tokens
      else assetRisk = 70 // Higher risk for unknown/newer tokens
      
      riskScore += assetRisk * weight
      totalWeight += weight
    })
    
    return Math.round(riskScore)
  }

  // Calculate yield opportunities
  const calculateYieldOpportunities = () => {
    let yieldScore = 0
    
    assets.forEach(asset => {
      const weight = asset.value / totalValue
      let yieldPotential = 0
      
      // Yield scoring based on asset type
      if (['USDC', 'USDT', 'DAI'].includes(asset.symbol)) yieldPotential = 80 // High yield potential for stablecoins
      else if (asset.symbol === 'ETH') yieldPotential = 70 // Good staking yield for ETH
      else if (['LINK', 'UNI', 'AAVE'].includes(asset.symbol)) yieldPotential = 60 // DeFi yield opportunities
      else yieldPotential = 30 // Lower yield potential for others
      
      yieldScore += yieldPotential * weight
    })
    
    return Math.round(yieldScore)
  }

  const diversification = calculateDiversification()
  const riskScore = calculateRiskScore()
  const yieldOpportunities = calculateYieldOpportunities()

  const getScoreColor = (score: number, inverse = false) => {
    if (inverse) {
      // For risk score (lower is better)
      if (score <= 30) return "text-green-600"
      if (score <= 60) return "text-yellow-600"
      return "text-red-600"
    } else {
      // For diversification and yield (higher is better)
      if (score >= 70) return "text-green-600"
      if (score >= 40) return "text-yellow-600"
      return "text-red-600"
    }
  }

  const getProgressColor = (score: number, inverse = false) => {
    if (inverse) {
      if (score <= 30) return "bg-green-500"
      if (score <= 60) return "bg-yellow-500"
      return "bg-red-500"
    } else {
      if (score >= 70) return "bg-green-500"
      if (score >= 40) return "bg-yellow-500"
      return "bg-red-500"
    }
  }

  const metrics = [
    {
      title: "Diversification",
      score: diversification,
      icon: Shield,
      description: "How well-distributed assets are across different types",
      inverse: false
    },
    {
      title: "Risk Level",
      score: riskScore,
      icon: TrendingUp,
      description: "Overall portfolio risk based on asset volatility",
      inverse: true
    },
    {
      title: "Yield Potential",
      score: yieldOpportunities,
      icon: DollarSign,
      description: "Opportunities for generating passive income",
      inverse: false
    }
  ]

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Treasury Health Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => {
            const IconComponent = metric.icon
            return (
              <div key={metric.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{metric.title}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getScoreColor(metric.score, metric.inverse)}
                  >
                    {metric.score}/100
                  </Badge>
                </div>
                
                <Progress 
                  value={metric.score} 
                  className="h-2"
                />
                
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            )
          })}
        </div>

        {/* Overall Health Summary */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Overall Treasury Health</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((diversification + (100 - riskScore) + yieldOpportunities) / 3)}/100
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on diversification, risk management, and yield potential
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
