"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletAsset } from "@/lib/multichain-wallet-service"

interface SimplePortfolioChartProps {
  assets: WalletAsset[]
  totalValue: number
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(2)}`
}

export function SimplePortfolioChart({ assets, totalValue }: SimplePortfolioChartProps) {
  // Get top 8 assets by value for visualization
  const topAssets = assets
    .filter(asset => asset.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const otherAssetsValue = assets
    .filter(asset => !topAssets.includes(asset) && asset.value > 0)
    .reduce((sum, asset) => sum + asset.value, 0)

  const displayAssets = [...topAssets]
  if (otherAssetsValue > 0) {
    displayAssets.push({
      id: 'others',
      name: 'Other Assets',
      symbol: 'OTHER',
      amount: 0,
      value: otherAssetsValue,
      price: 0,
      change24h: 0,
      color: '#94A3B8',
      chain: 'Multiple',
      percentageOfPortfolio: (otherAssetsValue / totalValue) * 100
    })
  }

  if (totalValue === 0 || displayAssets.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Assets Found</div>
          <div className="text-sm">Portfolio data will appear here once assets are detected</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      {/* Portfolio Composition Bars */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Portfolio Composition</h4>
          <span className="text-sm text-gray-500">{formatCurrency(totalValue)} total</span>
        </div>
        
        {/* Horizontal bar chart */}
        <div className="space-y-2">
          {displayAssets.map((asset, index) => {
            const percentage = (asset.value / totalValue) * 100
            
            return (
              <div key={asset.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">{asset.symbol}</span>
                    <span className="text-xs text-gray-500">{asset.chain}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(asset.value)}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300 group-hover:opacity-80"
                    style={{ 
                      backgroundColor: asset.color, 
                      width: `${Math.max(percentage, 2)}%` // Minimum 2% width for visibility
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-sm text-gray-500">Total Assets</div>
          <div className="text-lg font-semibold text-gray-900">{assets.filter(a => a.value > 0).length}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Chains</div>
          <div className="text-lg font-semibold text-gray-900">
            {new Set(assets.filter(a => a.value > 0).map(a => a.chain)).size}
          </div>
        </div>
      </div>
    </div>
  )
}
