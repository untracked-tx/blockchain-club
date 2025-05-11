"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface Asset {
  id: string
  name: string
  symbol: string
  value: number
  color: string
}

interface PortfolioDistributionProps {
  assets: Asset[]
}

export function PortfolioDistribution({ assets }: PortfolioDistributionProps) {
  const data = assets.map((asset) => ({
    name: asset.name,
    symbol: asset.symbol,
    value: asset.value,
    color: asset.color,
  }))

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalValue) * 100).toFixed(1)

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-sm font-medium text-gray-900">
            {data.name} ({data.symbol})
          </p>
          <p className="text-sm font-bold" style={{ color: data.color }}>
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
