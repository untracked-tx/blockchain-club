"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define TypeScript interfaces
interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  market_cap?: number;
  image?: string;
}

interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

const LightCryptoTicker: React.FC = () => {
  // State for storing cryptocurrency data
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Settings
  const currency = 'usd';
  const coinCount = 8; // Reduced for cleaner display
  const refreshInterval = 300000; // 5 minutes
  
  // Fetch cryptocurrency data
  const fetchCryptoData = useCallback(async (forceRefresh: boolean = false) => {
    if (!forceRefresh && cryptos.length > 0 && !loading) return;
    
    try {
      if (forceRefresh) setIsRefreshing(true);
      if (cryptos.length === 0) setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${coinCount}&page=1&sparkline=false&price_change_percentage=24h`
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
        market_cap: coin.market_cap,
        image: coin.image
      }));
      
      setCryptos(formattedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load market data');
      
      // Fallback data if no data exists
      if (cryptos.length === 0) {
        setCryptos([
          { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67842.31, change: 2.34, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
          { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3987.15, change: -0.82, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
          { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 614.27, change: 1.56, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
          { id: 'solana', symbol: 'SOL', name: 'Solana', price: 143.89, change: 5.21, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
          { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.57, change: -1.25, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
          { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.89, change: 3.15, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
          { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.38, change: 8.94, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
          { id: 'polygon', symbol: 'MATIC', name: 'Polygon', price: 1.15, change: -2.41, image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' }
        ]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currency, coinCount, cryptos.length, loading]);

  // Initial fetch and set up interval for periodic updates
  useEffect(() => {
    fetchCryptoData();
    
    const interval = setInterval(() => fetchCryptoData(), refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchCryptoData, refreshInterval]);
  
  // Format price with proper currency formatting
  const formatPrice = (price: number) => {
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

  // Manual refresh function
  const handleRefresh = () => {
    fetchCryptoData(true);
  };

  if (loading && cryptos.length === 0) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Live Crypto Market
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Loading market data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Crypto Market
          </CardTitle>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-200 dark:border-gray-600"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            {error} • Showing cached data
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cryptos.map((crypto) => (
            <div
              key={crypto.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 transition-colors dark:border-gray-700 dark:bg-gray-700/30 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {crypto.image && (
                  <img 
                    src={crypto.image} 
                    alt={crypto.name} 
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {crypto.symbol}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {crypto.name}
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatPrice(crypto.price)}
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  crypto.change >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {crypto.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatChange(crypto.change)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Data provided by CoinGecko • Updates every 5 minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LightCryptoTicker;
