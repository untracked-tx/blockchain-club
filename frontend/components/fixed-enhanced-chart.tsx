"use client"

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PortfolioChartProps {
  data: {
    date: string;
    value: number;
  }[];
}

export function EnhancedPortfolioChart({ data }: PortfolioChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  // Add green/red color based on value change
  const getChartData = () => {
    if (!data || data.length < 2) return data;

    return data.map((item, index) => {
      if (index === 0) {
        return { ...item, color: "#10B981" };
      }
      const prevValue = data[index - 1].value;
      const currentValue = item.value;
      const color = currentValue >= prevValue ? "#10B981" : "#EF4444";
      
      // Add daily growth rate
      const dailyChange = currentValue - prevValue;
      const dailyChangePercentage = prevValue ? (dailyChange / prevValue) * 100 : 0;
      
      return { 
        ...item, 
        color,
        dailyChange,
        dailyChangePercentage: parseFloat(dailyChangePercentage.toFixed(2))
      };
    });
  };

  // Calculate growth percentage if possible
  const calculateGrowth = (currentValue: number) => {
    if (data.length > 1) {
      const firstValue = data[0].value;
      const growthPercentage = ((currentValue - firstValue) / firstValue) * 100;
      return `${growthPercentage > 0 ? "+" : ""}${growthPercentage.toFixed(2)}% since start`;
    }
    return "";
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const growthText = calculateGrowth(payload[0].value);
      const isPositive = payload[0].value >= data[0].value;
      const isPositiveDaily = dataPoint.dailyChangePercentage >= 0;

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md">
          <p className="text-sm font-medium text-gray-900 mb-1">{formatDate(label)}</p>
          <p className="text-lg font-bold text-blue-600 mb-2">
            {formatCurrency(payload[0].value)}
          </p>
          
          {dataPoint.dailyChangePercentage !== undefined && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-600">Daily:</span>
              <span className={`text-xs font-medium ${isPositiveDaily ? "text-green-600" : "text-red-600"}`}>
                {isPositiveDaily ? "+" : ""}{dataPoint.dailyChangePercentage}%
              </span>
              <span className={`text-xs font-medium ${isPositiveDaily ? "text-green-600" : "text-red-600"}`}>
                ({isPositiveDaily ? "+" : ""}{formatCurrency(dataPoint.dailyChange)})
              </span>
            </div>
          )}
          
          {growthText && (
            <div className="pt-1 mt-1 border-t border-gray-100">
              <p className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {growthText}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const chartData = getChartData();
    return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white p-4 rounded-lg shadow-inner">
      <div className="text-xs text-gray-500 mb-2 flex justify-between items-center">
        <span>Treasury Performance (USD)</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Initial Goal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span>Growth Target</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="94%">
        <AreaChart
          data={chartData}
          margin={{
            top: 25,
            right: 50,
            left: 25,
            bottom: 15,
          }}
        >          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#2563EB" />
              <stop offset="95%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter id="shadow" x="-2" y="-2" width="104%" height="104%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3B82F6" floodOpacity="0.3" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            dx={-10}
            domain={['dataMin - 2000', 'dataMax + 1000']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={25000}
            stroke="#10B981"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            label={{
              position: "right",
              value: "Initial Goal",
              fill: "#10B981",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={37500}
            stroke="#6366F1" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
            label={{
              position: "right",
              value: "Growth Target",
              fill: "#6366F1",
              fontSize: 12,
            }}
          />          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#colorStroke)"
            strokeWidth={3}
            fill="url(#colorValue)"
            fillOpacity={1}
            activeDot={{ 
              r: 8, 
              fill: "#2563EB", 
              stroke: "#fff", 
              strokeWidth: 2,
              filter: "url(#shadow)"
            }}
            dot={false}
            isAnimationActive={true}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
