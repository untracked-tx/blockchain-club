"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Zap, Activity, Sparkles, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define TypeScript interfaces
interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_1h?: number;
  change_7d?: number;
  market_cap?: number;
  volume?: number;
  image?: string;
  rank?: number;
  high_24h?: number;
  low_24h?: number;
  ath?: number;
  ath_change_percentage?: number;
  description?: string;
  market_cap_rank?: number;
  homepage?: string;
  market_data?: any;
}

interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  image: string;
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_change_percentage: number;
}

const LightCryptoTicker: React.FC = () => {
  // Reference for the ticker container
  const tickerRef = useRef<HTMLDivElement>(null);
  
  // State for storing cryptocurrency data
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Animation state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Settings state
  const [currency] = useState<string>('usd');
  const [coinCount] = useState<number>(12);
  const [refreshInterval] = useState<number>(60000);
  
  // Fetch cryptocurrency data
  const fetchCryptoData = useCallback(async (forceRefresh: boolean = false) => {
    if (!forceRefresh && cryptos.length > 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${coinCount}&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CoinGeckoData[] = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No cryptocurrency data received');
      }
      
      const formattedData: CryptoData[] = data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_percentage_24h || 0,
        change_1h: coin.price_change_percentage_1h_in_currency,
        change_7d: coin.price_change_percentage_7d_in_currency,
        market_cap: coin.market_cap,
        volume: coin.total_volume,
        image: coin.image,
        rank: coin.market_cap_rank,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage
      }));
      
      setCryptos(formattedData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load cryptocurrency data. Using fallback data.');
      setLoading(false);
      
      // Fallback data with popular crypto
      if (cryptos.length === 0) {
        setCryptos([
          { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67842.31, change: 2.34, rank: 1, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
          { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3987.15, change: -0.82, rank: 2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
          { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 614.27, change: 1.56, rank: 3, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
          { id: 'solana', symbol: 'SOL', name: 'Solana', price: 143.89, change: 5.21, rank: 4, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
          { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.57, change: -1.25, rank: 5, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
          { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.89, change: 3.15, rank: 6, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
          { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.38, change: 8.94, rank: 7, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
          { id: 'polygon', symbol: 'MATIC', name: 'Polygon', price: 1.15, change: -2.41, rank: 8, image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' }
        ]);
      }
    }
  }, [currency, coinCount, cryptos.length]);

  // Initial fetch and set up interval for periodic updates
  useEffect(() => {
    fetchCryptoData();
    
    const interval = setInterval(() => fetchCryptoData(), refreshInterval);
    
    return () => clearInterval(interval);
  }, [currency, coinCount, refreshInterval, fetchCryptoData]);
  
  // Format price with proper currency formatting
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Format percentage change
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Get trend icon based on change
  const getTrendIcon = (change: number) => {
    if (Math.abs(change) > 10) {
      return change >= 0 ? Zap : Activity;
    }
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  // Get crypto rank badge color
  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'from-yellow-400 to-amber-500';
    if (rank <= 10) return 'from-emerald-400 to-green-500';
    return 'from-gray-400 to-gray-500';
  };

  // Get change color and intensity for light theme
  const getChangeStyle = (change: number) => {
    const intensity = Math.min(Math.abs(change) / 10, 1);
    if (change >= 0) {
      return {
        background: `linear-gradient(135deg, rgba(34, 197, 94, ${0.08 + intensity * 0.12}) 0%, rgba(22, 163, 74, ${0.05 + intensity * 0.1}) 100%)`,
        borderColor: `rgba(34, 197, 94, ${0.2 + intensity * 0.3})`,
        color: `rgb(22, 101, 52)`, // Darker green for better contrast
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
      };
    } else {
      return {
        background: `linear-gradient(135deg, rgba(239, 68, 68, ${0.08 + intensity * 0.12}) 0%, rgba(220, 38, 38, ${0.05 + intensity * 0.1}) 100%)`,
        borderColor: `rgba(239, 68, 68, ${0.2 + intensity * 0.3})`,
        color: `rgb(153, 27, 27)`, // Darker red for better contrast
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
      };
    }
  };

  if (loading && cryptos.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"
            />
            <span className="text-emerald-700 font-medium">Loading market data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-white via-green-50/30 to-emerald-50/30 rounded-xl border border-emerald-200/40 shadow-lg relative backdrop-blur-sm">
      {/* Header with subtle accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
      
      {/* Market Status Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-b border-emerald-200/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 10px rgba(34, 197, 94, 0.4)',
                  '0 0 20px rgba(34, 197, 94, 0.6)',
                  '0 0 10px rgba(34, 197, 94, 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-3 h-3 bg-emerald-500 rounded-full"
            />
          </div>
          <span className="text-gray-800 font-semibold">Live Crypto Market</span>
          <Sparkles className="w-4 h-4 text-emerald-600" />
        </div>
        
        {lastUpdated && (
          <div className="text-gray-600 text-sm">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Enhanced ticker content */}
      <div 
        className="relative overflow-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div 
          className="flex gap-4 px-4"
          animate={{ x: isPaused ? undefined : "-100%" }}
          transition={{ 
            duration: isPaused ? 0 : 60,
            ease: "linear",
            repeat: isPaused ? 0 : Infinity
          }}
        >
          {/* Render cryptos multiple times for seamless scroll */}
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-4 flex-shrink-0">
              {cryptos.map((crypto, index) => {
                const changeStyle = getChangeStyle(crypto.change);
                const TrendIcon = getTrendIcon(crypto.change);
                
                return (
                  <motion.div
                    key={`${crypto.symbol}-${setIndex}-${index}`}
                    className="relative group flex-shrink-0"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {/* Main card */}
                    <div 
                      className="relative flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm min-w-[220px] transition-all duration-300 group-hover:shadow-lg bg-white/60"
                      style={{
                        background: `linear-gradient(135deg, ${changeStyle.background}, rgba(255, 255, 255, 0.7))`,
                        borderColor: changeStyle.borderColor
                      }}
                    >
                      {/* Rank badge */}
                      {crypto.rank && crypto.rank <= 10 && (
                        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br ${getRankColor(crypto.rank)} flex items-center justify-center text-xs font-bold text-white shadow-md`}>
                          {crypto.rank}
                        </div>
                      )}
                      
                      {/* Crypto image with subtle glow */}
                      <div className="relative">
                        {crypto.image ? (
                          <motion.img 
                            src={crypto.image} 
                            alt={crypto.name} 
                            className="w-8 h-8 rounded-full shadow-sm"
                            whileHover={{ 
                              scale: 1.1,
                              filter: 'brightness(1.1)'
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Symbol and name */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 text-lg">{crypto.symbol}</span>
                          <span className="text-gray-600 text-sm truncate hidden sm:block">{crypto.name}</span>
                        </div>
                        
                        {/* Price */}
                        <div className="font-mono text-gray-800 text-lg font-semibold">
                          {formatPrice(crypto.price)}
                        </div>
                      </div>
                      
                      {/* Change with animated icon */}
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ 
                            rotate: crypto.change >= 0 ? [0, 10, 0] : [0, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <TrendIcon 
                            size={20} 
                            style={{ color: changeStyle.color }}
                          />
                        </motion.div>
                        <span 
                          className="font-semibold text-sm"
                          style={{ 
                            color: changeStyle.color,
                            textShadow: changeStyle.textShadow
                          }}
                        >
                          {formatChange(crypto.change)}
                        </span>
                      </div>
                      
                      {/* Hover highlight effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/0 via-green-400/0 to-emerald-400/0 group-hover:from-emerald-400/5 group-hover:via-green-400/3 group-hover:to-emerald-400/5 transition-all duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent"></div>
      
      {/* Data source footer */}
      <div className="px-6 py-2 bg-emerald-50/30 border-t border-emerald-200/30">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Powered by CoinGecko • Real-time data</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Market Data
          </span>
        </div>
      </div>
    </div>
  );
};

export default LightCryptoTicker;
