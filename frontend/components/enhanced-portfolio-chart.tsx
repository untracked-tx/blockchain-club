"use client"

import { useEffect, useRef } from "react"
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, CartesianGrid, Label } from "recharts"

interface PortfolioChartProps {
  data: {
    date: string;
    value: number;
  }[];
}

export function EnhancedPortfolioChart({ data }: PortfolioChartProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up tooltip when component unmounts
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.innerHTML = "";
      }
    };
  }, []);

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
      
      return { ...item, color };
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Calculate growth percentage if possible
      let growthText = "";
      if (payload[0].payload.value && data.length > 1) {
        const firstValue = data[0].value;
        const currentValue = payload[0].payload.value;
        const growthPercentage = ((currentValue - firstValue) / firstValue) * 100;
        growthText = `${growthPercentage > 0 ? "+" : ""}${growthPercentage.toFixed(2)}% since start`;
      }

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-sm font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-sm font-bold text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
          {growthText && (
            <p className={`text-xs mt-1 ${payload[0].payload.value >= data[0].value ? "text-green-600" : "text-red-600"}`}>
              {growthText}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const chartData = getChartData();
  return (
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 25,
            right: 50,
            left: 25,
            bottom: 15,
          }}
        >          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#2563EB" />
              <stop offset="95%" stopColor="#0EA5E9" />
            </linearGradient>
            <pattern id="pattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 0 6 L 6 0" stroke="#f0f0f0" strokeWidth="0.5"></path>
            </pattern>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            dy={10}
          />
          
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            dx={-10}
            domain={["dataMin - 2000", "dataMax + 1000"]}
          />
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
          
          <Tooltip content={<CustomTooltip />} />
            <Area
            type="monotone"
            dataKey="value"
            stroke="url(#colorStroke)"
            strokeWidth={3}
            fill="url(#colorValue)"
            fillOpacity={1}
            activeDot={{ r: 8, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
