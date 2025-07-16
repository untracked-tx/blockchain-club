"use client";
import React, { useState, useRef, useEffect } from "react";
import { useWalletPortfolio } from "@/hooks/use-wallet-portfolio";
import { saveAs } from "file-saver";

// 🚀 UNIFIED DATA CACHE SYSTEM
class DataCache {
  async getCoinMeta(coinId: string): Promise<any | null> {
    const cacheKey = `coin-meta-${coinId}`;
    const cached = this.apiCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) return cached.data;
    try {
      const response = await this.rateLimitedFetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      if (response.status === 404) return null;
      if (!response.ok) {
        const errText = await response.text();
        console.error('Coin meta fetch failed:', errText);
        return null;
      }
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Coin meta fetch error:', error);
      return null;
    }
  }

  async getCoinCategories(): Promise<any[] | null> {
    const cacheKey = 'coin-categories';
    const cached = this.apiCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) return cached.data;
    try {
      const response = await this.rateLimitedFetch('https://api.coingecko.com/api/v3/coins/categories');
      if (!response.ok) throw new Error('Coin categories fetch failed');
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Coin categories fetch error:', error);
      return null;
    }
  }

  async getCoinChart(coinId: string, days: number = 7): Promise<any | null> {
    const cacheKey = `coin-chart-${coinId}-${days}`;
    const cached = this.apiCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) return cached.data;
    try {
      const response = await this.rateLimitedFetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
      if (!response.ok) throw new Error('Coin chart fetch failed');
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Coin chart fetch error:', error);
      return null;
    }
  }

  async getExchangeInfo(exchangeId: string): Promise<any | null> {
    const cacheKey = `exchange-info-${exchangeId}`;
    const cached = this.apiCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) return cached.data;
    try {
      const response = await this.rateLimitedFetch(`https://api.coingecko.com/api/v3/exchanges/${exchangeId}`);
      if (!response.ok) throw new Error('Exchange info fetch failed');
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Exchange info fetch error:', error);
      return null;
    }
  }

  async getDefiStats(): Promise<any | null> {
    const cacheKey = 'defi-stats';
    const cached = this.apiCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) return cached.data;
    try {
      const response = await this.rateLimitedFetch('https://api.coingecko.com/api/v3/global/decentralized_finance_defi');
      if (!response.ok) throw new Error('DeFi stats fetch failed');
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('DeFi stats fetch error:', error);
      return null;
    }
  }

  async getTrendingPools(): Promise<any | null> {
    const cacheKey = 'trending-pools';
    const cached = this.apiCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) return cached.data;
    try {
      const response = await this.rateLimitedFetch('https://api.geckoterminal.com/api/v2/networks/trending_pools');
      if (!response.ok) throw new Error('Trending pools fetch failed');
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Trending pools fetch error:', error);
      return null;
    }
  }
  private static instance: DataCache;
  private prices: Map<string, { value: number; timestamp: number }> = new Map();
  private apiCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between API calls
  private lastApiCall = 0;

  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  private async rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastCall));
    }
    
    this.lastApiCall = Date.now();
    return fetch(url);
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async getPrice(fromSymbol: string, toSymbol: string): Promise<number | null> {
    const cacheKey = `${fromSymbol}-${toSymbol}`;
    const cached = this.prices.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.value;
    }

    try {
      const coinMap: { [key: string]: string } = {
        'btc': 'bitcoin', 'eth': 'ethereum', 'sol': 'solana', 'matic': 'matic-network',
        'ada': 'cardano', 'dot': 'polkadot', 'avax': 'avalanche-2', 'link': 'chainlink',
        'usd': 'usd', 'eur': 'eur', 'gbp': 'gbp', 'jpy': 'jpy'
      };

      const fromCoin = coinMap[fromSymbol.toLowerCase()] || fromSymbol.toLowerCase();
      const toCoin = coinMap[toSymbol.toLowerCase()] || toSymbol.toLowerCase();

      const response = await this.rateLimitedFetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromCoin}&vs_currencies=${toCoin}`
      );

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      if (data[fromCoin] && data[fromCoin][toCoin]) {
        const price = data[fromCoin][toCoin];
        this.prices.set(cacheKey, { value: price, timestamp: Date.now() });
        return price;
      }

      return null;
    } catch (error) {
      console.error('Price fetch error:', error);
      return null;
    }
  }

  async getMarketData(): Promise<any[] | null> {
    const cacheKey = 'market-data';
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
      );
      
      if (!response.ok) throw new Error('Market data fetch failed');
      
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Market data fetch error:', error);
      return null;
    }
  }

  async getFearGreedIndex(): Promise<{ value: number; classification: string; timestamp: number } | null> {
    const cacheKey = 'fear-greed-index';
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch('/api/fear-greed');
      if (!response.ok) throw new Error('Fear & Greed API failed');
      
      const data = await response.json();
      const result = {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
        timestamp: parseInt(data.data[0].timestamp) * 1000
      };
      
      this.apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Fear & Greed fetch error:', error);
      return null;
    }
  }

  async getGasPrices(): Promise<any | null> {
    const cacheKey = 'gas-prices';
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        'https://api.etherscan.io/api?module=gastracker&action=gasoracle'
      );
      
      if (!response.ok) throw new Error('Gas tracker API failed');
      
      const data = await response.json();
      if (data.status === '1') {
        const result = {
          ethereum: {
            safe: data.result.SafeGasPrice,
            standard: data.result.ProposeGasPrice,
            fast: data.result.FastGasPrice
          }
        };
        
        this.apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Gas prices fetch error:', error);
      return null;
    }
  }

  clearCache(): void {
    this.prices.clear();
    this.apiCache.clear();
  }

  async getTrendingData(): Promise<any | null> {
    const cacheKey = 'trending-data';
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        'https://api.coingecko.com/api/v3/search/trending'
      );
      
      if (!response.ok) throw new Error('Trending data fetch failed');
      
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Trending data fetch error:', error);
      return null;
    }
  }

  async getGlobalData(): Promise<any | null> {
    const cacheKey = 'global-data';
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        'https://api.coingecko.com/api/v3/global'
      );
      
      if (!response.ok) throw new Error('Global data fetch failed');
      
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Global data fetch error:', error);
      return null;
    }
  }

  async getCompanyHoldings(coin: string): Promise<any | null> {
    const cacheKey = `company-holdings-${coin}`;
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        `https://api.coingecko.com/api/v3/companies/public_treasury/${coin}`
      );
      
      if (!response.ok) throw new Error('Company holdings fetch failed');
      
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Company holdings fetch error:', error);
      return null;
    }
  }

  async searchCoins(query: string): Promise<any | null> {
    const cacheKey = `search-${query}`;
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      this.apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Search error:', error);
      return null;
    }
  }

  async getNFTData(): Promise<any | null> {
    const cacheKey = 'nft-data';
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        'https://api.coingecko.com/api/v3/nfts/list'
      );
      
      if (!response.ok) throw new Error('NFT data fetch failed');
      
      const data = await response.json();
      // Get first 10 NFTs for display
      const limitedData = data.slice(0, 10);
      this.apiCache.set(cacheKey, { data: limitedData, timestamp: Date.now() });
      return limitedData;
    } catch (error) {
      console.error('NFT data fetch error:', error);
      return null;
    }
  }
}

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

const formatPercentage = (num: number): string => {
  const formatted = num.toFixed(2);
  return num >= 0 ? `+${formatted}%` : `${formatted}%`;
};

// Retro CRT screen effect with scan lines
const RetroBackground = () => {
  return (
    <>
      {/* CRT scan lines effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <div 
          className="w-full h-full"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )`
          }}
        />
      </div>
      
      {/* Subtle screen flicker */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5 z-0 animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animationDuration: '4s'
        }}
      />
    </>
  );
  
};

// Command definitions with enhanced portfolio integration
const commands = {
  coinmeta: {
    description: "Show detailed info about a coin. Usage: coinmeta <coin_id>",
    category: "market"
  },
  coincat: {
    description: "List all coin categories with market data",
    category: "market"
  },
  coinchart: {
    description: "Show ASCII price chart for a coin. Usage: coinchart <coin_id> [days]",
    category: "market"
  },
  exchange: {
    description: "Show details about a specific exchange. Usage: exchange <exchange_id>",
    category: "market"
  },
  defi: {
    description: "Show DeFi market cap and volume",
    category: "market"
  },
  trendingpools: {
    description: "Show trending DEX pools across all networks",
    category: "market"
  },
  help: {
    description: "Show commands",
    category: "system"
  },
  portfolio: {
    description: "View portfolio summary",
    category: "treasury"
  },
  assets: {
    description: "List treasury assets",
    category: "treasury"
  },
  chains: {
    description: "View chain breakdown",
    category: "treasury"
  },
  market: {
    description: "Top 20 cryptos by market cap",
    category: "market"
  },
  price: {
    description: "Get coin price. Usage: price <coin_id> <currency>",
    category: "market"
  },
  convert: {
    description: "Convert currencies. Usage: convert <amount> <from_coin> <to_currency>",
    category: "tools"
  },
  gas: {
    description: "Current gas prices",
    category: "market"
  },
  fear: {
    description: "Fear & Greed Index",
    category: "market"
  },
  scan: {
    description: "Refresh portfolio data",
    category: "treasury"
  },
  export: {
    description: "Export portfolio as CSV",
    category: "treasury"
  },
  trending: {
    description: "Trending coins, NFTs & categories (24h)",
    category: "market"
  },
  global: {
    description: "Global crypto market stats",
    category: "market"
  },
  companies: {
    description: "Public companies holding BTC/ETH. Usage: companies <coin_id>",
    category: "market"
  },
  search: {
    description: "Search coins & categories. Usage: search <query>",
    category: "tools"
  },
  nft: {
    description: "Trending NFT collections",
    category: "market"
  },
  clear: {
    description: "Clear terminal",
    category: "system"
  },
  about: {
    description: "About this terminal",
    category: "system"
  },
  theme: {
    description: "Cycle retro themes (MS-DOS/Amber/Green/Win95)",
    category: "system"
  },
  windows: {
    description: "🪟 Windows XP 'Bliss' wallpaper",
    category: "system"
  },
  reset: {
    description: "🔄 Reset to default background",
    category: "system"
  },
  exit: {
    description: "Exit current mode",
    category: "system"
  },
  back: {
    description: "Return to default",
    category: "system"
  },
  matrix: {
    description: "🔴 Enter/exit MATRIX MODE",
    category: "system"
  }
};

type CommandName = keyof typeof commands;

interface TerminalTheme {
  name: string;
  bg: string;
  terminal: string;
  text: string;
  accent: string;
  border: string;
  prompt: string;
}

const themes: { [key: string]: TerminalTheme } = {
  classic: {
    name: "MS-DOS",
    bg: "from-black via-gray-900/20 to-black",
    terminal: "bg-black/90",
    text: "text-white",
    prompt: "text-white",
    accent: "text-gray-300",
    border: "border-gray-600/50"
  },
  amber: {
    name: "Amber Monochrome", 
    bg: "from-black via-amber-950/20 to-black",
    terminal: "bg-black/90",
    text: "text-amber-400",
    prompt: "text-amber-300",
    accent: "text-amber-500",
    border: "border-amber-600/50"
  },
  green: {
    name: "Green Phosphor",
    bg: "from-black via-green-950/20 to-black", 
    terminal: "bg-black/90",
    text: "text-green-400",
    prompt: "text-green-300",
    accent: "text-green-500", 
    border: "border-green-600/50"
  },
  windows95: {
    name: "Windows 95",
    bg: "from-teal-600 via-teal-700/30 to-teal-800",
    terminal: "bg-black/90",
    text: "text-gray-100", 
    prompt: "text-white",
    accent: "text-gray-300",
    border: "border-gray-400/50"
  }
};

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<{ type: "input" | "output"; value: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<TerminalTheme>(themes.amber);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [isWindowsMode, setIsWindowsMode] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<any[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const welcomePrintedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Portfolio integration
  const { portfolio, isLoading, error, refetch, lastUpdated } = useWalletPortfolio();
  const dataCache = DataCache.getInstance();

  // Simple print function - no typewriter complexity
  const print = (msg: string) => {
    setHistory(h => [...h, { type: "output", value: msg }]);
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  const printTable = (headers: string[], rows: string[][]) => {
    const colWidths = headers.map((h, i) => 
      Math.max(h.length, ...rows.map(r => r[i]?.length || 0))
    );
    
    const separator = "├" + colWidths.map(w => "─".repeat(w + 2)).join("┼") + "┤";
    const topBorder = "┌" + colWidths.map(w => "─".repeat(w + 2)).join("┬") + "┐";
    const bottomBorder = "└" + colWidths.map(w => "─".repeat(w + 2)).join("┴") + "┘";
    
    print(topBorder);
    print("│ " + headers.map((h, i) => h.padEnd(colWidths[i])).join(" │ ") + " │");
    print(separator);
    rows.forEach(row => {
      print("│ " + row.map((cell, i) => cell.padEnd(colWidths[i])).join(" │ ") + " │");
    });
    print(bottomBorder);
  };

  const executeCommand = async (cmdLine: string) => {
    const [cmd, ...args] = cmdLine.trim().toLowerCase().split(/\s+/);
    
    if (!cmd) return;
    
    switch (cmd) {
      case 'coinmeta':
        if (args.length < 1) {
          print("Usage: coinmeta <coin_id>");
          print("Example: coinmeta bitcoin");
          return;
        }
        setLoading(true);
        print(`🔎 Fetching metadata for ${args[0]}...`);
        const meta = await dataCache.getCoinMeta(args[0]);
        setLoading(false);
        if (meta) {
          print(`\n🪙 ${meta.name} (${meta.symbol.toUpperCase()})`);
          print("─".repeat(60));
          print(meta.description?.en?.slice(0, 300)?.replace(/<[^>]+>/g, '') || 'No description.');
          print(`Website: ${meta.links?.homepage?.[0] || 'N/A'}`);
          print(`Genesis Date: ${meta.genesis_date || 'N/A'}`);
          print(`Market Cap Rank: ${meta.market_cap_rank || 'N/A'}`);
          print(`Current Price: $${meta.market_data?.current_price?.usd || 'N/A'}`);
        } else {
          print("❌ Failed to fetch coin metadata");
        }
        break;

      case 'coincat':
        setLoading(true);
        print("📚 Fetching coin categories...");
        const cats = await dataCache.getCoinCategories();
        setLoading(false);
        if (cats) {
          print("\n📚 COIN CATEGORIES");
          print("─".repeat(80));
          const headers = ["Name", "Market Cap", "24h Vol", "# Coins"];
          const rows = cats.slice(0, 15).map((cat: any) => [
            cat.name,
            `$${formatNumber(cat.market_cap)}`,
            `$${formatNumber(cat.volume_24h)}`,
            cat.coins_count?.toString() || 'N/A'
          ]);
          printTable(headers, rows);
        } else {
          print("❌ Failed to fetch categories");
        }
        break;

      case 'coinchart':
        if (args.length < 1) {
          print("Usage: coinchart <coin_id> [days]");
          print("Example: coinchart bitcoin 30");
          return;
        }
        const days = args[1] ? parseInt(args[1]) : 7;
        setLoading(true);
        print(`📈 Fetching price chart for ${args[0]} (${days}d)...`);
        const chart = await dataCache.getCoinChart(args[0], days);
        setLoading(false);
        if (chart && chart.prices) {
          print(`\n📈 ${args[0].toUpperCase()} Price Chart (${days}d)`);
          print("─".repeat(60));
          // ASCII sparkline
          const prices = chart.prices.map((p: any) => p[1]);
          const min = Math.min(...prices), max = Math.max(...prices);
          const spark = prices.map((v: number) => {
            const level = Math.round(((v - min) / (max - min || 1)) * 7);
            return '▁▂▃▄▅▆▇█'[level];
          }).join('');
          print(spark);
          print(`Min: $${min.toFixed(2)}  Max: $${max.toFixed(2)}`);
        } else {
          print("❌ Failed to fetch chart");
        }
        break;

      case 'exchange':
        if (args.length < 1) {
          print("Usage: exchange <exchange_id>");
          print("Example: exchange binance");
          return;
        }
        setLoading(true);
        print(`🏦 Fetching exchange info for ${args[0]}...`);
        const exch = await dataCache.getExchangeInfo(args[0]);
        setLoading(false);
        if (exch) {
          print(`\n🏦 ${exch.name} (${exch.country || 'N/A'})`);
          print("─".repeat(60));
          print(`Year: ${exch.year_established || 'N/A'}`);
          print(`Trust Score: ${exch.trust_score || 'N/A'}`);
          print(`24h Volume: $${formatNumber(exch.trade_volume_24h_btc || 0)} BTC`);
          print(`URL: ${exch.url || 'N/A'}`);
        } else {
          print("❌ Failed to fetch exchange info");
        }
        break;

      case 'defi':
        setLoading(true);
        print("🌐 Fetching DeFi stats...");
        const defi = await dataCache.getDefiStats();
        setLoading(false);
        if (defi && defi.data) {
          print("\n🌐 GLOBAL DEFI STATS");
          print("─".repeat(60));
          print(`Market Cap: $${formatNumber(defi.data.defi_market_cap)}`);
          print(`24h Volume: $${formatNumber(defi.data.defi_24h_vol)}`);
          print(`Dominance: ${defi.data.defi_dominance.toFixed(2)}%`);
        } else {
          print("❌ Failed to fetch DeFi stats");
        }
        break;

      case 'trendingpools':
        setLoading(true);
        print("🌊 Fetching trending DEX pools...");
        const pools = await dataCache.getTrendingPools();
        setLoading(false);
        if (pools && pools.data && pools.data.trending_pools) {
          print("\n🌊 TRENDING DEX POOLS");
          print("─".repeat(80));
          const headers = ["Name", "Network", "Volume 24h", "TVL"];
          const rows = pools.data.trending_pools.slice(0, 10).map((pool: any) => [
            pool.attributes.name,
            pool.attributes.network,
            `$${formatNumber(pool.attributes.volume_usd_24h)}`,
            `$${formatNumber(pool.attributes.reserve_in_usd)}`
          ]);
          printTable(headers, rows);
        } else {
          print("❌ Failed to fetch trending pools");
        }
        break;
      case 'help':
        print("╔════════════════════════════════════════════════════════════════════════════════════════════════╗");
        print("║                                    AVAILABLE COMMANDS                                        ║");
        print("╠════════════════════════════════════════════════════════════════════════════════════════════════╣");
        const categories = {
          system: "SYSTEM",
          market: "MARKET DATA",
          treasury: "TREASURY",
          tools: "TOOLS"
        };
        Object.entries(categories).forEach(([key, label]) => {
          print(`║ ${label.padEnd(94)} ║`);
          Object.entries(commands).forEach(([cmdName, cmdInfo]) => {
            if (cmdInfo.category === key) {
              print(`║   ${cmdName.padEnd(14)} - ${cmdInfo.description.padEnd(75)} ║`);
            }
          });
          print("║" + " ".repeat(96) + "║");
        });
        print("╚════════════════════════════════════════════════════════════════════════════════════════════════╝");
        break;
        
      case 'portfolio':
        if (!portfolio) {
          print("❌ No portfolio data loaded. Use 'scan' to refresh.");
          return;
        }
        
        print("\n💼 TREASURY PORTFOLIO SUMMARY");
        print("─".repeat(60));
        print(`Total Value: ${formatCurrency(portfolio.totalValue)}`);
        print(`Assets: ${portfolio.assets.length}`);
        print(`Chains: ${portfolio.chainBreakdown.length}`);
        
        if (lastUpdated) {
          print(`Last Updated: ${new Date(lastUpdated).toLocaleString()}`);
        }
        break;
        
      case 'assets':
        if (!portfolio) {
          print("❌ No portfolio data loaded. Use 'scan' to refresh.");
          return;
        }
        
        print("\n🏦 TREASURY ASSETS");
        print("─".repeat(80));
        
        const headers = ["Symbol", "Name", "Balance", "Value", "Price", "Chain"];
        const rows = portfolio.assets.map((asset: any) => [
          asset.symbol.toUpperCase(),
          asset.name.substring(0, 15),
          asset.balance.toFixed(4),
          formatCurrency(asset.value),
          formatCurrency(asset.price),
          asset.chainName
        ]);
        
        printTable(headers, rows);
        break;
        
      case 'chains':
        if (!portfolio) {
          print("❌ No portfolio data loaded. Use 'scan' to refresh.");
          return;
        }
        
        print("\n⛓️  CHAIN BREAKDOWN");
        print("─".repeat(60));
        
        portfolio.chainBreakdown.forEach((chain: any) => {
          const percentage = ((chain.value / portfolio.totalValue) * 100).toFixed(1);
          print(`${chain.chainName}: ${formatCurrency(chain.value)} (${percentage}%)`);
        });
        break;
        
      case 'market':
        setLoading(true);
        print("📊 Fetching market data...");
        const marketData = await dataCache.getMarketData();
        setLoading(false);
        
        if (marketData) {
          print("\n💹 TOP 20 CRYPTOCURRENCIES BY MARKET CAP");
          print("─".repeat(80));
          
          const headers = ["#", "Symbol", "Name", "Price", "24h %", "Market Cap"];
          const rows = marketData.map((coin: any, i: number) => [
            (i + 1).toString(),
            coin.symbol.toUpperCase(),
            coin.name.substring(0, 15),
            `$${coin.current_price.toFixed(2)}`,
            formatPercentage(coin.price_change_percentage_24h),
            `$${formatNumber(coin.market_cap)}`
          ]);
          
          printTable(headers, rows);
          print(`\n📅 Last updated: ${new Date().toLocaleString()}`);
        } else {
          print("❌ Failed to fetch market data");
        }
        break;
        
      case 'price':
        if (args.length < 2) {
          print("Usage: price <coin_id> <currency>");
          print("Example: price bitcoin usd");
          return;
        }
        
        setLoading(true);
        print(`💰 Fetching ${args[0]} price in ${args[1]}...`);
        const price = await dataCache.getPrice(args[0], args[1]);
        setLoading(false);
        
        if (price !== null) {
          print(`\n${args[0].toUpperCase()} = ${price} ${args[1].toUpperCase()}`);
        } else {
          print("❌ Failed to fetch price. Check coin ID and currency.");
        }
        break;
        
      case 'convert':
        if (args.length < 3) {
          print("Usage: convert <amount> <from_coin> <to_currency>");
          print("Example: convert 100 bitcoin usd");
          return;
        }
        
        const amount = parseFloat(args[0]);
        if (isNaN(amount)) {
          print("❌ Invalid amount");
          return;
        }
        
        setLoading(true);
        print(`💱 Converting ${amount} ${args[1]} to ${args[2]}...`);
        const rate = await dataCache.getPrice(args[1], args[2]);
        setLoading(false);
        
        if (rate !== null) {
          const result = amount * rate;
          print(`\n${amount} ${args[1].toUpperCase()} = ${result.toFixed(2)} ${args[2].toUpperCase()}`);
          print(`Rate: 1 ${args[1].toUpperCase()} = ${rate} ${args[2].toUpperCase()}`);
        } else {
          print("❌ Conversion failed");
        }
        break;
        
      case 'gas':
        setLoading(true);
        print("⛽ Fetching gas prices...");
        const gasData = await dataCache.getGasPrices();
        setLoading(false);
        
        if (gasData) {
          print("\n⛽ GAS TRACKER");
          print("─".repeat(40));
          print("Ethereum:");
          print(`  Safe: ${gasData.ethereum.safe} gwei`);
          print(`  Standard: ${gasData.ethereum.standard} gwei`);
          print(`  Fast: ${gasData.ethereum.fast} gwei`);
        } else {
          print("❌ Failed to fetch gas prices");
        }
        break;
        
      case 'fear':
        setLoading(true);
        print("😰 Fetching Fear & Greed Index...");
        const fearData = await dataCache.getFearGreedIndex();
        setLoading(false);
        
        if (fearData) {
          print("\n😰 FEAR & GREED INDEX");
          print("─".repeat(40));
          print(`Value: ${fearData.value}/100`);
          print(`Classification: ${fearData.classification}`);
          print(`Updated: ${new Date(fearData.timestamp).toLocaleString()}`);
        } else {
          print("❌ Failed to fetch Fear & Greed Index");
        }
        break;
        
      case 'scan':
        if (isLoading) {
          print("⏳ Portfolio scan already in progress...");
          return;
        }
        
        setLoading(true);
        print("🔍 Scanning treasury portfolio...");
        
        try {
          await refetch();
          print("✅ Portfolio data refreshed successfully!");
        } catch (error) {
          print("❌ Failed to refresh portfolio data");
        } finally {
          setLoading(false);
        }
        break;
        
      case 'export':
        if (!portfolio) {
          print("❌ No portfolio data to export. Use 'scan' first.");
          return;
        }
        
        print("📥 Exporting portfolio to CSV...");
        
        const csvHeaders = ["Symbol", "Name", "Balance", "Price", "Value", "Chain"];
        const csvRows = portfolio.assets.map((asset: any) => [
          asset.symbol,
          asset.name,
          asset.balance,
          asset.price,
          asset.value,
          asset.chainName
        ]);
        
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `treasury-portfolio-${new Date().toISOString().split('T')[0]}.csv`);
        
        print("✅ Portfolio exported successfully!");
        break;
        
      case 'trending':
        setLoading(true);
        print("🔥 Fetching trending data...");
        const trendingData = await dataCache.getTrendingData();
        setLoading(false);
        
        if (trendingData) {
          print("\n🔥 TRENDING IN CRYPTO (Last 24h)");
          print("─".repeat(80));
          
          print("\n💰 TRENDING COINS:");
          trendingData.coins.slice(0, 7).forEach((coin: any, i: number) => {
            print(`${i + 1}. ${coin.item.name} (${coin.item.symbol.toUpperCase()}) - Rank #${coin.item.market_cap_rank || 'N/A'}`);
          });
          
          if (trendingData.nfts && trendingData.nfts.length > 0) {
            print("\n🖼️  TRENDING NFTs:");
            trendingData.nfts.slice(0, 5).forEach((nft: any, i: number) => {
              print(`${i + 1}. ${nft.name} - Floor: ${nft.floor_price_in_usd || 'N/A'} USD`);
            });
          }
          
          if (trendingData.categories && trendingData.categories.length > 0) {
            print("\n📊 TRENDING CATEGORIES:");
            trendingData.categories.slice(0, 5).forEach((cat: any, i: number) => {
              print(`${i + 1}. ${cat.name}`);
            });
          }
        } else {
          print("❌ Failed to fetch trending data");
        }
        break;
        
      case 'global':
        setLoading(true);
        print("🌍 Fetching global crypto statistics...");
        const globalData = await dataCache.getGlobalData();
        setLoading(false);
        
        if (globalData) {
          const data = globalData.data;
          print("\n🌍 GLOBAL CRYPTO MARKET STATISTICS");
          print("─".repeat(60));
          print(`Total Market Cap: $${formatNumber(data.total_market_cap.usd)}`);
          print(`Total Volume (24h): $${formatNumber(data.total_volume.usd)}`);
          print(`Active Cryptocurrencies: ${data.active_cryptocurrencies.toLocaleString()}`);
          print(`Markets: ${data.markets.toLocaleString()}`);
          print(`Bitcoin Dominance: ${data.market_cap_percentage.btc.toFixed(1)}%`);
          print(`Ethereum Dominance: ${data.market_cap_percentage.eth.toFixed(1)}%`);
          
          if (data.market_cap_change_percentage_24h_usd) {
            const change = data.market_cap_change_percentage_24h_usd;
            const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
            print(`Market Cap Change (24h): ${changeStr}`);
          }
        } else {
          print("❌ Failed to fetch global data");
        }
        break;
        
      case 'companies':
        if (args.length < 1) {
          print("Usage: companies <coin>");
          print("Example: companies bitcoin");
          print("Supported: bitcoin, ethereum");
          return;
        }
        
        const coin = args[0].toLowerCase();
        if (!['bitcoin', 'ethereum'].includes(coin)) {
          print("❌ Only 'bitcoin' and 'ethereum' are supported");
          return;
        }
        
        setLoading(true);
        print(`🏢 Fetching public companies holding ${coin}...`);
        const companyData = await dataCache.getCompanyHoldings(coin);
        setLoading(false);
        
        if (companyData) {
          print(`\n🏢 PUBLIC COMPANIES HOLDING ${coin.toUpperCase()}`);
          print("─".repeat(80));
          print(`Total Holdings: ${companyData.total_holdings.toLocaleString()} ${coin.toUpperCase()}`);
          print(`Total Value: $${formatNumber(companyData.total_value_usd)}`);
          print(`Companies: ${companyData.companies.length}`);
          print("");
          
          const headers = ["Company", "Country", "Holdings", "Value (USD)"];
          const rows = companyData.companies.slice(0, 10).map((company: any) => [
            company.name.substring(0, 20),
            company.country || 'N/A',
            `${company.total_holdings.toLocaleString()} ${coin.toUpperCase()}`,
            `$${formatNumber(company.total_current_value_usd)}`
          ]);
          
          printTable(headers, rows);
          if (companyData.companies.length > 10) {
            print(`\n... and ${companyData.companies.length - 10} more companies`);
          }
        } else {
          print("❌ Failed to fetch company holdings data");
        }
        break;
        
      case 'search':
        if (args.length < 1) {
          print("Usage: search <query>");
          print("Example: search ethereum");
          return;
        }
        
        const query = args.join(' ');
        setLoading(true);
        print(`🔍 Searching for "${query}"...`);
        const searchData = await dataCache.searchCoins(query);
        setLoading(false);
        
        if (searchData) {
          if (searchData.coins && searchData.coins.length > 0) {
            print(`\n🔍 SEARCH RESULTS FOR "${query}"`);
            print("─".repeat(60));
            print("\n💰 COINS:");
            searchData.coins.slice(0, 10).forEach((coin: any, i: number) => {
              print(`${i + 1}. ${coin.name} (${coin.symbol.toUpperCase()}) - Rank #${coin.market_cap_rank || 'N/A'}`);
            });
          }
          
          if (searchData.categories && searchData.categories.length > 0) {
            print("\n📊 CATEGORIES:");
            searchData.categories.slice(0, 5).forEach((cat: any, i: number) => {
              print(`${i + 1}. ${cat.name}`);
            });
          }
          
          if (searchData.exchanges && searchData.exchanges.length > 0) {
            print("\n🏛️  EXCHANGES:");
            searchData.exchanges.slice(0, 5).forEach((exchange: any, i: number) => {
              print(`${i + 1}. ${exchange.name}`);
            });
          }
          
          if (!searchData.coins?.length && !searchData.categories?.length && !searchData.exchanges?.length) {
            print("No results found for your search query");
          }
        } else {
          print("❌ Search failed");
        }
        break;
        
      case 'nft':
        setLoading(true);
        print("🖼️  Fetching NFT collections...");
        const nftData = await dataCache.getNFTData();
        setLoading(false);
        
        if (nftData) {
          print("\n🖼️  TOP NFT COLLECTIONS");
          print("─".repeat(60));
          
          nftData.forEach((nft: any, i: number) => {
            print(`${i + 1}. ${nft.name} (${nft.symbol || 'N/A'})`);
            if (nft.asset_platform_id) {
              print(`   Platform: ${nft.asset_platform_id}`);
            }
          });
        } else {
          print("❌ Failed to fetch NFT data");
        }
        break;
        
      case 'clear':
        setHistory([]);
        setHasShownWelcome(false); // Allow welcome message to show again
        break;
        
      case 'theme':
        const themeKeys = Object.keys(themes);
        const currentIndex = themeKeys.findIndex(key => themes[key] === currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const newTheme = themes[themeKeys[nextIndex]];
        setCurrentTheme(newTheme);
        print(`🎨 Theme changed to: ${newTheme.name}`);
        break;
        
      case 'windows':
        if (isWindowsMode) {
          // Exit Windows mode
          setIsWindowsMode(false);
          setCustomBackground(null);
          setIsMatrixMode(false);
          print("🔙 Leaving the peaceful hills...");
          print("───────────────────────────────────────────────────────────");
          print("Windows.exe shutting down...");
          print("Returning to terminal themes...");
          print("───────────────────────────────────────────────────────────");
          print("🔄 Returned to normal terminal mode");
        } else {
          // Enter Windows mode
          setIsWindowsMode(true);
          setCustomBackground('/1536061.jpg');
          setIsMatrixMode(false);
          print("🪟 WINDOWS XP ACTIVATED");
          print("───────────────────────────────────────────────────────────");
          print("Loading peaceful green hills...");
          print("Welcome to the nostalgic desktop experience.");
          print("🌿 Bliss wallpaper loaded successfully");
          print("───────────────────────────────────────────────────────────");
          print("🪟 Windows XP mode active");
        }
        break;
        
      case 'reset':
      case 'exit':
      case 'back':
        setCustomBackground(null);
        setIsMatrixMode(false);
        setIsWindowsMode(false);
        print("🔄 All modes reset to default");
        print(`📱 Current theme: ${currentTheme.name}`);
        break;
        
      case 'about':
        if (isMatrixMode) {
          print("\n███████████████████████████████████████████████████████████");
          print("█                 THE MATRIX • CRYPTO EDITION             █");
          print("███████████████████████████████████████████████████████████");
          print("█                                                         █");
          print("█  'There is no spoon... but there are definitely        █");
          print("█   private keys that need safeguarding.'                █");
          print("█                                                         █");
          print("█  You are now operating in the Matrix. The green rain   █");
          print("█  represents live blockchain transactions flowing        █");
          print("█  through the networks. Each symbol is a piece of       █");
          print("█  Satoshi's original vision made manifest.              █");
          print("█                                                         █");
          print("█  🔴 Red Pill Commands:                                  █");
          print("█     'trending' - See what Neo is watching              █");
          print("█     'global' - The scope of the simulation             █");
          print("█     'companies' - Corporate agents in the system       █");
          print("█     'matrix' - Exit back to boring reality             █");
          print("█                                                         █");
          print("█  'Unfortunately, no one can be told what Bitcoin is... █");
          print("█   you have to hodl it for yourself.'                   █");
          print("█                                                         █");
          print("█  - Cryptopheus, Guardian of the Blockchain             █");
          print("███████████████████████████████████████████████████████████");
        } else {
          print("\n╔═══════════════════════════════════════════════════════════╗");
          print("║              BLOCKCHAIN TREASURY TERMINAL v3.0            ║");
          print("╠═══════════════════════════════════════════════════════════╣");
          print("║                                                           ║");
          print("║  Made with love for learning and caffeine for fuel.      ║");
          print("║  by liam for cu <3                                        ║");
          print("║                                                           ║");
          print("║  Features:                                                ║");
          print("║  • Live portfolio tracking & market data                 ║");
          print("║  • Gas tracker & Fear/Greed Index                        ║");
          print("║  • Currency conversion & CSV export                      ║");
          print("║  • Retro terminal themes                                  ║");
          print("║  • 🔴 MATRIX MODE for the brave                          ║");
          print("║  • 🪟 Windows XP nostalgia mode                          ║");
          print("║                                                           ║");
          print("║  Built with React, TypeScript & TailwindCSS              ║");
          print("╚═══════════════════════════════════════════════════════════╝");
        }
        break;
        
      case 'matrix':
        if (isMatrixMode) {
          // Exit Matrix mode
          setIsMatrixMode(false);
          setCurrentTheme(themes.amber);
          setMatrixData([]);
          print("🔵 BLUE PILL TAKEN");
          print("───────────────────────────────────────────────────────────");
          print("Disconnecting from the Matrix...");
          print("Reality.exe loading...");
          print("Welcome back to the desert of the real.");
          print("The crypto data was just numbers on a screen all along.");
          print("───────────────────────────────────────────────────────────");
          print("🔙 Returned to normal terminal mode");
        } else {
          // Enter Matrix mode
          setIsMatrixMode(true);
          
          // Load market data for the rain effect
          print("🔴 RED PILL TAKEN");
          print("███████████████████████████████████████████████████████████");
          print("█ ACCESSING SATOSHI'S MAINFRAME...                       █");
          print("█ BYPASSING NSA FIREWALLS...                             █");
          print("█ INJECTING CRYPTO PAYLOAD...                            █");
          print("█ HACKING THE BLOCKCHAIN...                              █");
          print("███████████████████████████████████████████████████████████");
          print("");
          print("🟢 MATRIX MODE ACTIVATED");
          print("───────────────────────────────────────────────────────────");
          print("You are now seeing the REAL crypto market...");
          print("The green rain shows live blockchain transactions");
          print("Watch as Satoshi's ghost moves through the data");
          print("───────────────────────────────────────────────────────────");
          print("💊 'matrix' again to take the blue pill and return");
          print("🔥 Try other commands to see the Matrix in action!");
          
          // Fetch market data for rain effect
          setLoading(true);
          const marketData = await dataCache.getMarketData();
          if (marketData) {
            setMatrixData(marketData);
          }
          setLoading(false);
        }
        break;
        
      default:
        print(`Command not found: ${cmd}`);
        print("Type 'help' for available commands");
    }
  };

  const handleCommand = async (cmdLine: string) => {
    setHistory(h => [...h, { type: "input", value: `❯ ${cmdLine}` }]);
    setCommandHistory(h => [...h, cmdLine]);
    setHistoryIndex(-1);
    await executeCommand(cmdLine);
  };

  const onInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      const val = input;
      setInput("");
      await handleCommand(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  useEffect(() => {
    if (!hasShownWelcome && history.length === 0 && !welcomePrintedRef.current) {
      welcomePrintedRef.current = true;
      setTimeout(() => {
        setHasShownWelcome(true);
        print(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗ ██╗      ██████╗  ██████╗██╗  ██╗ ██████╗██╗  ██╗ █████╗ ██╗███╗  ║
║   ██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██║  ██║██╔══██╗██║████╗ ║
║   ██████╔╝██║     ██║   ██║██║     █████╔╝ ██║     ███████║███████║██║██╔██╗║
║   ██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ██║     ██╔══██║██╔══██║██║██║╚██╗║
║   ██████╔╝███████╗╚██████╔╝╚██████╗██║  ██╗╚██████╗██║  ██║██║  ██║██║██║ ╚█║
║   ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚╝
║                                                                               ║
║                        TREASURY TERMINAL • LIVE PORTFOLIO                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
        print("Welcome to the Blockchain Treasury Terminal v3.0");
        print("❓ 'help' - show all commands");
        print("📊 'portfolio' - treasury summary");
        print("🔥 'trending' - hot crypto trends");
        print("🌍 'global' - market stats");
        print("🪟 'windows' - XP nostalgia mode");
        print("🔴 'matrix' - enter the MATRIX");
        print("");
      }, 400);
    }
  }, [hasShownWelcome, history.length]);

  // Matrix-style crypto data rain effect - Satoshi's ghost in the machine
  const DataRain = ({ data, isActive }: { data?: any[]; isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
  useEffect(() => {
    // Only start the rain when Matrix mode is active
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(1);
    // CIA mainframe crypto hacker rain - Satoshi's ghost in the machine
    const chars = [
      ...(data || []).map((d: any) => d.symbol),
      ...(data || []).map((d: any) => `$${d.value?.toFixed ? d.value.toFixed(0) : d.value}`),
      '0x', '1n', '0x', '1n', '0x', '1n', // Hex prefixes
      'SATOSHI', 'a9b3f7c2', '4e8d91ba', '7f2c5a18', 'c6e4b9d7',
      '0xdeadbeef', '0xcafebabe', '0x1337c0de', '0xfeedface',
      'b58a4c7e', '9d3f8e12', 'f7a2c4b9', '6e1d9f38', '8c5a7b2e',
      'ff8800cc', '33aa77bb', 'dd22ee99', '1100ff44', '77cc2288',
      'gAAAAABh', 'eJzNWV1v', 'MIIEvgIB', 'LS0tLS1C', 'RUdJTi0t',
      '0', '1', '0', '1', '0', '1', // Binary
      'カ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', // Japanese (Matrix classic)
      '₿', 'Ξ', '◎', '◊', '$', '€', '¥', '£',
      '░', '▒', '▓', '█', '▄', '▀', '■', '□'
    ];
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FF41';
      ctx.font = '14px "Courier New", monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Vary brightness for depth effect
        const brightness = Math.random() * 0.7 + 0.3;
        ctx.fillStyle = `rgba(0, 255, 65, ${brightness})`;
        ctx.fillText(text, i * 20, drops[i] * 20);
        
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

      const interval = setInterval(draw, 50);
      return () => clearInterval(interval);
    }, [data, isActive]);
    
    if (!isActive) return null;
    
    return (
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-10" 
        style={{ opacity: 0.8 }}
      />
    );
  };

  // Matrix background effects
  const MatrixBackground = ({ isActive }: { isActive: boolean }) => {
    if (!isActive) return null;
    
    return (
      <>
        {/* Matrix grid overlay */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-10 z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Pulsing red alert */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-5 z-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.3) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        />
        
        {/* Scan lines */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-20 z-0"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)',
            animation: 'scan 0.1s linear infinite'
          }}
        />
      </>
    );
  };

  return (
    <>
      <style jsx global>{`
        /* Retro Windows 95 Scrollbar */
        .retro-scrollbar::-webkit-scrollbar {
          width: 16px;
        }
        .retro-scrollbar::-webkit-scrollbar-track {
          background: #c0c0c0;
          border: 2px inset #c0c0c0;
        }
        .retro-scrollbar::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
        }
        .retro-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d0d0d0;
        }
        .retro-scrollbar::-webkit-scrollbar-button {
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
          height: 16px;
        }
        .retro-scrollbar::-webkit-scrollbar-button:hover {
          background: #d0d0d0;
        }
        
        /* Matrix mode scrollbar */
        .matrix-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .matrix-scrollbar::-webkit-scrollbar-track {
          background: #000;
          border: 1px solid #00ff00;
        }
        .matrix-scrollbar::-webkit-scrollbar-thumb {
          background: #00ff00;
          border: 1px solid #00ff00;
        }
        .matrix-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00cc00;
        }
        
        /* Retro text cursor blink */
        @keyframes retro-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .retro-cursor::after {
          content: '█';
          animation: retro-blink 1s infinite;
          margin-left: 2px;
        }
        
        /* Retro scanlines effect */
        @keyframes scanlines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .retro-scanlines::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(transparent, rgba(255,255,255,0.1), transparent);
          animation: scanlines 3s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
      <div className={`min-h-screen ${isWindowsMode ? '' : `bg-gradient-to-br ${currentTheme.bg}`} ${currentTheme.text} font-mono flex items-center justify-center relative overflow-hidden retro-scanlines`}
           style={isWindowsMode ? {
             backgroundImage: `url(/1536061.jpg)`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           } : {}}>
      {/* Background Effects */}
      {!isMatrixMode && !isWindowsMode && <RetroBackground />}
      {isMatrixMode && (
        <>
          <MatrixBackground isActive={isMatrixMode} />
          <DataRain data={matrixData} isActive={isMatrixMode} />
        </>
      )}
      
      <div className="relative z-10 w-full max-w-5xl mx-4">
        {/* Windows 95 / Matrix Window Frame */}
        <div className={`${isMatrixMode ? 'bg-black border-2 border-red-500' : 'bg-gray-200 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600'} rounded-sm shadow-2xl`}>
          {/* Title Bar */}
          <div className={`${isMatrixMode ? 'bg-gradient-to-r from-red-900 to-black text-green-400' : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'} px-2 py-1 flex items-center justify-between border-b border-gray-400`}>
            <div className="flex items-center gap-2">
              {/* System Menu Icon */}
              <div className={`w-4 h-4 ${isMatrixMode ? 'bg-red-500 border border-green-400 text-green-400' : 'bg-gray-300 border border-gray-600 text-black'} flex items-center justify-center text-xs font-bold`}>
                {isMatrixMode ? '◊' : 'C'}
              </div>
              <span className="text-sm font-bold">
                {isMatrixMode ? '🔴 MATRIX CRYPTO TERMINAL - ACCESSING MAINFRAME' : 'Command Prompt - Blockchain Treasury Terminal'}
              </span>
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-1">
              {/* Minimize */}
              <button className={`w-6 h-5 ${isMatrixMode ? 'bg-red-900 border border-red-400 hover:bg-red-800 active:border-inset' : 'bg-gray-200 border border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:bg-gray-300 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white'} flex items-center justify-center transition-all duration-75`}>
                <div className={`w-2 h-0.5 ${isMatrixMode ? 'bg-green-400' : 'bg-black'}`}></div>
              </button>
              {/* Maximize */}
              <button className={`w-6 h-5 ${isMatrixMode ? 'bg-red-900 border border-red-400 hover:bg-red-800 active:border-inset' : 'bg-gray-200 border border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:bg-gray-300 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white'} flex items-center justify-center transition-all duration-75`}>
                <div className={`w-2 h-2 border ${isMatrixMode ? 'border-green-400' : 'border-black'}`}></div>
              </button>
              {/* Close */}
              <button className={`w-6 h-5 ${isMatrixMode ? 'bg-red-900 border border-red-400 hover:bg-red-800 text-green-400 active:border-inset' : 'bg-gray-200 border border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:bg-gray-300 text-black active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white'} flex items-center justify-center transition-all duration-75 text-xs font-bold`}>
                ×
              </button>
            </div>
          </div>
          
          {/* Terminal Container */}
          <div className={`p-1 ${isMatrixMode ? 'bg-black' : 'bg-gray-200'}`}>
            <div className={`${currentTheme.terminal} ${isMatrixMode ? 'border-2 border-green-400' : 'border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white'} overflow-hidden`}>
              {/* Terminal Status Bar */}
              <div className={`flex items-center gap-2 h-8 px-3 ${isMatrixMode ? 'bg-black border-b border-red-500 text-green-400' : 'bg-gray-200 border-b border-gray-400 text-black'} text-xs`}>
                {isMatrixMode ? (
                  <>
                    <span className="font-bold">HACK</span>
                    <span className="font-bold">DECODE</span>
                    <span className="font-bold">BREACH</span>
                    <span className="font-bold">EXIT</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">File</span>
                    <span className="font-bold">Edit</span>
                    <span className="font-bold">View</span>
                    <span className="font-bold">Help</span>
                  </>
                )}
                <div className="ml-auto flex items-center gap-3">
                  {portfolio && (
                    <span className={isMatrixMode ? "text-green-400" : "text-green-700"}>
                      {isMatrixMode ? "💰 $" : "💰 $"}{formatNumber(portfolio.totalValue)}
                    </span>
                  )}
                  <span>{new Date().toLocaleTimeString()}</span>
                  {isMatrixMode && <span className="text-red-400 animate-pulse">🔴 LIVE</span>}
                </div>
              </div>              
              {/* Terminal Body */}
              <div className="relative" style={{ minHeight: '70vh' }}>
                <div
                  ref={outputRef}
                  className={`h-[65vh] overflow-y-auto p-4 ${isMatrixMode ? 'matrix-scrollbar' : 'retro-scrollbar'}`}
                >
                  {history.map((entry, i) => (
                    <div
                      key={i}
                      className={`${
                        entry.type === "input" ? currentTheme.prompt : currentTheme.text
                      } whitespace-pre-wrap font-mono text-sm leading-relaxed`}
                    >
                      {entry.value}
                    </div>
                  ))}
                  {loading && (
                    <div className={`${currentTheme.accent} animate-pulse`}>
                      Processing command...
                    </div>
                  )}
                </div>
                
                {/* Input Line */}
                <div className={`absolute bottom-0 left-0 right-0 border-t ${currentTheme.border} bg-black/20 backdrop-blur-sm`}>
                  <div className="flex items-center px-4 py-3">
                    <span className={`${currentTheme.prompt} mr-2`}>❯</span>
                    <input
                      ref={inputRef}
                      className={`flex-1 bg-transparent outline-none ${currentTheme.text} placeholder-current/30`}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onInputKeyDown}
                      disabled={loading}
                      placeholder="Enter command..."
                      autoFocus
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>
          
              {/* Status Bar */}
              <div className={`${isMatrixMode ? 'bg-black border-t border-red-500 px-3 py-1 text-xs text-green-400' : 'bg-gray-200 border-t border-gray-400 px-3 py-1 text-xs text-black'} flex justify-between items-center`}>
                <div>
                  {isMatrixMode ? `🔴 MATRIX MODE: ${currentTheme.name}` : `Theme: ${currentTheme.name}`}
                </div>
                <div className="flex items-center gap-4">
                  {isLoading && <span className={isMatrixMode ? "text-yellow-400" : "text-red-700"}>⟳ {isMatrixMode ? "HACKING BLOCKCHAIN" : "Loading Portfolio"}</span>}
                  {error && <span className={isMatrixMode ? "text-red-300" : "text-red-600"}>⚠ {isMatrixMode ? "FIREWALL DETECTED" : "Portfolio Error"}</span>}
                  <span>{isMatrixMode ? "CONNECTED TO MAINFRAME" : "Connected to Live APIs"}</span>
                </div>
                <div>{loading ? (isMatrixMode ? "PROCESSING..." : "BUSY") : (isMatrixMode ? "STANDBY" : "READY")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Terminal;
