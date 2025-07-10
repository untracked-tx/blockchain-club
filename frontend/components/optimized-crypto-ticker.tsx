"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Settings, RefreshCw } from 'lucide-react';

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

const CryptoTicker: React.FC = () => {
  // Reference for the ticker container
  const tickerRef = useRef<HTMLDivElement>(null);
  
  // State for storing cryptocurrency data
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [allCryptos, setAllCryptos] = useState<CryptoData[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // UI state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false);
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  
  // Settings state
  const [currency, setCurrency] = useState<string>('usd');
  const [coinCount, setCoinCount] = useState<number>(10);
  const [refreshInterval, setRefreshInterval] = useState<number>(60000);
  const [animationSpeed, setAnimationSpeed] = useState<number>(30);
  
  // Animation state
  const [position, setPosition] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tickerWidth, setTickerWidth] = useState<number>(0);
  
  // Initialize from local storage
  useEffect(() => {
    try {
      // Load settings from local storage
      const savedSettings = localStorage.getItem('cryptoTickerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.currency) setCurrency(settings.currency);
        if (settings.coinCount) setCoinCount(settings.coinCount);
        if (settings.refreshInterval) setRefreshInterval(settings.refreshInterval);
        if (settings.animationSpeed) setAnimationSpeed(settings.animationSpeed);
      }
      
      // Load favorites
      const savedFavorites = localStorage.getItem('cryptoTickerFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (err) {
      console.error("Error loading settings from local storage:", err);
    }
  }, []);
  
  // Save settings to local storage when changed
  useEffect(() => {
    try {
      localStorage.setItem('cryptoTickerSettings', JSON.stringify({
        currency,
        coinCount,
        refreshInterval,
        animationSpeed
      }));
    } catch (err) {
      console.error("Error saving settings to local storage:", err);
    }
  }, [currency, coinCount, refreshInterval, animationSpeed]);
  
  // Save favorites to local storage when changed
  useEffect(() => {
    try {
      localStorage.setItem('cryptoTickerFavorites', JSON.stringify(favorites));
    } catch (err) {
      console.error("Error saving favorites to local storage:", err);
    }
  }, [favorites]);
  
  // Calculate container width on mount and resize
  useEffect(() => {
    const updateTickerWidth = () => {
      if (tickerRef.current) {
        setTickerWidth(tickerRef.current.offsetWidth);
      }
    };
    
    updateTickerWidth();
    window.addEventListener('resize', updateTickerWidth);
    
    return () => window.removeEventListener('resize', updateTickerWidth);
  }, []);
  
  // Fetch data from our API route to avoid CORS issues
  const fetchCryptoData = useCallback(async (forceReload = false) => {
    if (forceReload) {
      setLoading(true);
    }
    
    try {
      // Use our API route to avoid CORS issues
      const response = await fetch(
        `/api/crypto?vs_currency=${currency}&per_page=${coinCount}&order=market_cap_desc&sparkline=false&price_change_percentage=1h,24h,7d`,
        {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json() as CoinGeckoData[];
      
      // Transform data to match our format
      const formattedData = data.map((coin: CoinGeckoData) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_percentage_24h || 0,
        change_1h: coin.price_change_percentage_1h_in_currency || 0,
        change_7d: coin.price_change_percentage_7d_in_currency || 0,
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
      setError(null);
      
      // For search functionality, fetch more coins (top 100) - disabled to reduce API calls
      /* 
      try {
        const allCoinsResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1`
        );
        
        if (allCoinsResponse.ok) {
          const allCoinsData = await allCoinsResponse.json() as CoinGeckoData[];
          setAllCryptos(allCoinsData.map((coin: CoinGeckoData) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            image: coin.image,
            rank: coin.market_cap_rank,
            price: 0,
            change: 0
          })));
        }
      } catch (searchErr) {
        console.error('Error fetching extended coin list:', searchErr);
      }
      */
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load cryptocurrency data. Using fallback data.');
      setLoading(false);
      
      // Only set fallback data if we don't already have data
      if (cryptos.length === 0) {
        setCryptos([
          { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67842.31, change: 2.34, rank: 1 },
          { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3987.15, change: -0.82, rank: 2 },
          { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', price: 614.27, change: 1.56, rank: 3 },
          { id: 'solana', symbol: 'SOL', name: 'Solana', price: 143.89, change: 5.21, rank: 4 },
          { id: 'ripple', symbol: 'XRP', name: 'Ripple', price: 0.57, change: -1.25, rank: 5 }
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
  
  // Ticker movement animation
  useEffect(() => {
    if (!isPaused && cryptos.length > 0) {
      const animation = setInterval(() => {
        setPosition(prev => prev - 1);
      }, animationSpeed);
      
      return () => clearInterval(animation);
    }
  }, [isPaused, animationSpeed, cryptos.length]);
  
  // Reset position when it's scrolled fully with a smoother transition
  useEffect(() => {
    if (cryptos.length === 0) return;
    
    const itemWidth = 220; // Approximate width of each ticker item
    const fullWidth = cryptos.length * itemWidth;
    
    // When the first set of items has completely scrolled out of view,
    // reset position to create a seamless infinite scroll effect
    if (Math.abs(position) > fullWidth && position < 0) {
      // Reset to the beginning with a small offset for smoother transition
      setPosition(0);
    }
  }, [position, cryptos.length]);
  
  // Format price with commas for thousands
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return 'N/A';
    return price < 1 ? price.toFixed(6) : price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format large numbers (like market cap)
  const formatLargeNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toString();
  };
  
  // Format timestamp to readable time
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchCryptoData(true);
  };
  
  const currencySymbol = {
    'usd': '$',
    'eur': '€',
    'gbp': '£',
    'jpy': '¥',
    'aud': 'A$'
  }[currency] || '$';

  return (
    <div className="flex flex-col w-full max-w-full overflow-hidden bg-white text-gray-900 p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-blue-600">Live Crypto Prices</h3>
          {lastUpdated && (
            <span className="text-xs text-gray-500 ml-2">
              Updated: {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <span className="text-sm text-gray-500">Updating...</span>
          ) : (
            <button 
              className="p-1 text-gray-500 hover:text-gray-700 rounded focus:outline-none" 
              onClick={handleRefresh}
              title="Refresh data"
            >
              <RefreshCw size={18} />
            </button>
          )}
          <button 
            className="p-1 text-gray-500 hover:text-gray-700 rounded focus:outline-none"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <button 
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="bg-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
          <h4 className="text-sm font-medium mb-2">Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white text-gray-800 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
                <option value="gbp">GBP (£)</option>
                <option value="jpy">JPY (¥)</option>
                <option value="aud">AUD (A$)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Number of coins</label>
              <select
                value={coinCount}
                onChange={(e) => setCoinCount(Number(e.target.value))}
                className="w-full bg-white text-gray-800 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Animation speed</label>
              <select
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-full bg-white text-gray-800 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="15">Fast</option>
                <option value="30">Medium</option>
                <option value="60">Slow</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-2 mb-3 rounded text-sm border border-red-200">
          {error}
        </div>
      )}
      
      {loading && cryptos.length === 0 ? (
        <div className="py-6 text-center text-gray-500">Loading cryptocurrency data...</div>
      ) : (
        <div 
          ref={tickerRef}
          className="relative overflow-hidden py-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex whitespace-nowrap"
            style={{ transform: `translateX(${position}px)` }}
          >
            {/* First set of crypto items */}
            {cryptos.map((crypto, index) => (
              <div 
                key={`${crypto.symbol}-${index}`}
                className="inline-flex items-center mx-3 py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {crypto.rank && (
                  <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full mr-2 text-xs text-gray-700">
                    {crypto.rank}
                  </div>
                )}
                {crypto.image && (
                  <img 
                    src={crypto.image} 
                    alt={crypto.name} 
                    className="w-6 h-6 mr-2" 
                  />
                )}
                <div className="font-bold mr-2">{crypto.symbol}</div>
                <div className="mr-3 text-gray-400 text-sm hidden sm:block">{crypto.name}</div>
                <div className="font-mono mr-3">{currencySymbol}{formatPrice(crypto.price)}</div>
                <div 
                  className={`flex items-center ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {crypto.change >= 0 ? (
                    <ArrowUpCircle size={16} className="mr-1" />
                  ) : (
                    <ArrowDownCircle size={16} className="mr-1" />
                  )}
                  <span>{Math.abs(crypto.change).toFixed(2)}%</span>
                </div>
                
                {crypto.market_cap && (
                  <div className="ml-4 text-gray-400 text-sm hidden lg:block">
                    <span className="text-gray-500">MCap:</span> {currencySymbol}{formatLargeNumber(crypto.market_cap)}
                  </div>
                )}
                
                {crypto.volume && (
                  <div className="ml-4 text-gray-400 text-sm hidden xl:block">
                    <span className="text-gray-500">Vol:</span> {currencySymbol}{formatLargeNumber(crypto.volume)}
                  </div>
                )}
              </div>
            ))}
            
            {/* Duplicate items to create a seamless loop - same styling as first set */}
            {cryptos.map((crypto, index) => (
              <div 
                key={`${crypto.symbol}-duplicate-${index}`}
                className="inline-flex items-center mx-3 py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {crypto.rank && (
                  <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full mr-2 text-xs text-gray-700">
                    {crypto.rank}
                  </div>
                )}
                {crypto.image && (
                  <img 
                    src={crypto.image} 
                    alt={crypto.name} 
                    className="w-6 h-6 mr-2" 
                  />
                )}
                <div className="font-bold mr-2">{crypto.symbol}</div>
                <div className="mr-3 text-gray-400 text-sm hidden sm:block">{crypto.name}</div>
                <div className="font-mono mr-3">{currencySymbol}{formatPrice(crypto.price)}</div>
                <div 
                  className={`flex items-center ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {crypto.change >= 0 ? (
                    <ArrowUpCircle size={16} className="mr-1" />
                  ) : (
                    <ArrowDownCircle size={16} className="mr-1" />
                  )}
                  <span>{Math.abs(crypto.change).toFixed(2)}%</span>
                </div>
                
                {crypto.market_cap && (
                  <div className="ml-4 text-gray-400 text-sm hidden lg:block">
                    <span className="text-gray-500">MCap:</span> {currencySymbol}{formatLargeNumber(crypto.market_cap)}
                  </div>
                )}
                
                {crypto.volume && (
                  <div className="ml-4 text-gray-400 text-sm hidden xl:block">
                    <span className="text-gray-500">Vol:</span> {currencySymbol}{formatLargeNumber(crypto.volume)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Data from CoinGecko API. Hover over crypto items to pause scrolling.
      </div>
    </div>
  );
};

export default CryptoTicker;
