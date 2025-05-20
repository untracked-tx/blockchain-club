"use client"

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PortfolioChartProps {
  data: {
    date: string;
    value: number;
  }[];
}

export function NewPortfolioChart({ data }: PortfolioChartProps) {
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
      const growthText = calculateGrowth(payload[0].value);

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-sm font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-sm font-bold text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
          {growthText && (
            <p className={`text-xs mt-1 ${payload[0].value >= data[0].value ? "text-green-600" : "text-red-600"}`}>
              {growthText}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
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
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#colorValue)"
            activeDot={{ r: 8, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
