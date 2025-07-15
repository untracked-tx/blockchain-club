"use client";
import React, { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";

// 🚀 UNIFIED DATA CACHE SYSTEM
class DataCache {
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
      const response = await this.rateLimitedFetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromSymbol}&vs_currencies=${toSymbol}`
      );

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      if (data[fromSymbol] && data[fromSymbol][toSymbol]) {
        const price = data[fromSymbol][toSymbol];
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

  async getTrendingCoins(): Promise<any[] | null> {
    const cacheKey = 'trending-coins';
    const cached = this.apiCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await this.rateLimitedFetch(
        'https://api.coingecko.com/api/v3/search/trending'
      );
      
      if (!response.ok) throw new Error('Trending coins fetch failed');
      
      const data = await response.json();
      this.apiCache.set(cacheKey, { data: data.coins, timestamp: Date.now() });
      return data.coins;
    } catch (error) {
      console.error('Trending coins fetch error:', error);
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
      this.apiCache.set(cacheKey, { data: data.data, timestamp: Date.now() });
      return data.data;
    } catch (error) {
      console.error('Global data fetch error:', error);
      return null;
    }
  }

  clearCache(): void {
    this.prices.clear();
    this.apiCache.clear();
  }
}

// Subtle animated background
const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: any[] = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 255, 150, ${particle.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" />;
};

// Command definitions
const commands = {
  help: {
    description: "Show available commands",
    category: "system"
  },
  market: {
    description: "Show top 20 cryptocurrencies by market cap",
    category: "market"
  },
  trending: {
    description: "Show trending coins on CoinGecko",
    category: "market"
  },
  price: {
    description: "Get price of a specific coin (e.g., 'price bitcoin usd')",
    category: "market"
  },
  global: {
    description: "Show global crypto market statistics",
    category: "market"
  },
  portfolio: {
    description: "View treasury portfolio summary",
    category: "treasury"
  },
  assets: {
    description: "List all treasury assets",
    category: "treasury"
  },
  convert: {
    description: "Convert between currencies (e.g., 'convert 100 bitcoin usd')",
    category: "tools"
  },
  clear: {
    description: "Clear terminal screen",
    category: "system"
  },
  about: {
    description: "About this terminal",
    category: "system"
  },
  theme: {
    description: "Toggle between themes (retro/modern)",
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
  retro: {
    name: "Retro Green",
    bg: "from-black via-green-950/20 to-black",
    terminal: "bg-black/90",
    text: "text-green-400",
    accent: "text-green-300",
    border: "border-green-500/50",
    prompt: "text-green-500"
  },
  modern: {
    name: "Modern Blue",
    bg: "from-slate-900 via-blue-950/30 to-slate-900",
    terminal: "bg-slate-900/90",
    text: "text-blue-300",
    accent: "text-blue-400",
    border: "border-blue-500/50",
    prompt: "text-blue-500"
  }
};

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<{ type: "input" | "output"; value: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<TerminalTheme>(themes.retro);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  const dataCache = DataCache.getInstance();

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  const print = (msg: string) => {
    setHistory(h => [...h, { type: "output", value: msg }]);
  };

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

  const executeCommand = async (cmdLine: string) => {
    const [cmd, ...args] = cmdLine.trim().toLowerCase().split(/\s+/);
    
    if (!cmd) return;
    
    switch (cmd) {
      case 'help':
        print("╔═══════════════════════════════════════════════════════════╗");
        print("║                    AVAILABLE COMMANDS                     ║");
        print("╠═══════════════════════════════════════════════════════════╣");
        
        const categories = {
          system: "SYSTEM",
          market: "MARKET DATA",
          treasury: "TREASURY",
          tools: "TOOLS"
        };
        
        Object.entries(categories).forEach(([key, label]) => {
          print(`║ ${label.padEnd(57)} ║`);
          Object.entries(commands).forEach(([cmdName, cmdInfo]) => {
            if (cmdInfo.category === key) {
              print(`║   ${cmdName.padEnd(12)} - ${cmdInfo.description.padEnd(40)} ║`);
            }
          });
          print("║" + " ".repeat(59) + "║");
        });
        
        print("╚═══════════════════════════════════════════════════════════╝");
        break;
        
      case 'market':
        setLoading(true);
        print("📊 Fetching market data...");
        const marketData = await dataCache.getMarketData();
        setLoading(false);
        
        if (marketData) {
          print("\n💹 TOP 20 CRYPTOCURRENCIES BY MARKET CAP");
          print("─".repeat(80));
          
          const headers = ["#", "Symbol", "Name", "Price", "24h %", "7d %", "Market Cap"];
          const rows = marketData.map((coin: any, i: number) => [
            (i + 1).toString(),
            coin.symbol.toUpperCase(),
            coin.name.substring(0, 15),
            `$${coin.current_price.toFixed(2)}`,
            formatPercentage(coin.price_change_percentage_24h),
            formatPercentage(coin.price_change_percentage_7d_in_currency || 0),
            `$${formatNumber(coin.market_cap)}`
          ]);
          
          printTable(headers, rows);
          print(`\n📅 Last updated: ${new Date().toLocaleString()}`);
        } else {
          print("❌ Failed to fetch market data");
        }
        break;
        
      case 'trending':
        setLoading(true);
        print("🔥 Fetching trending coins...");
        const trending = await dataCache.getTrendingCoins();
        setLoading(false);
        
        if (trending) {
          print("\n🚀 TRENDING COINS ON COINGECKO");
          print("─".repeat(60));
          
          trending.forEach((coin: any, i: number) => {
            const item = coin.item;
            print(`${i + 1}. ${item.name} (${item.symbol.toUpperCase()})`);
            print(`   Market Cap Rank: #${item.market_cap_rank}`);
            print(`   Score: ${item.score}`);
            print("");
          });
        } else {
          print("❌ Failed to fetch trending data");
        }
        break;
        
      case 'global':
        setLoading(true);
        print("🌍 Fetching global market data...");
        const globalData = await dataCache.getGlobalData();
        setLoading(false);
        
        if (globalData) {
          print("\n🌐 GLOBAL CRYPTOCURRENCY MARKET");
          print("─".repeat(60));
          print(`Active Cryptocurrencies: ${globalData.active_cryptocurrencies.toLocaleString()}`);
          print(`Total Market Cap: $${formatNumber(globalData.total_market_cap.usd)}`);
          print(`24h Volume: $${formatNumber(globalData.total_volume.usd)}`);
          print(`Bitcoin Dominance: ${globalData.market_cap_percentage.btc.toFixed(2)}%`);
          print(`Ethereum Dominance: ${globalData.market_cap_percentage.eth.toFixed(2)}%`);
          print("");
          print("📈 24h Market Cap Change: " + formatPercentage(globalData.market_cap_change_percentage_24h_usd));
        } else {
          print("❌ Failed to fetch global data");
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
        
      case 'portfolio':
        print("\n💼 TREASURY PORTFOLIO SUMMARY");
        print("─".repeat(60));
        print("Total Value: $2,451,337.42");
        print("24h Change: +5.23% ($121,884.21)");
        print("Number of Assets: 12");
        print("Primary Holdings: BTC (45%), ETH (30%), SOL (15%)");
        print("\n[Connect wallet to see live data]");
        break;
        
      case 'clear':
        setHistory([]);
        break;
        
      case 'theme':
        const newTheme = currentTheme === themes.retro ? themes.modern : themes.retro;
        setCurrentTheme(newTheme);
        print(`🎨 Theme changed to: ${newTheme.name}`);
        break;
        
      case 'about':
        print("\n╔═══════════════════════════════════════════════════════════╗");
        print("║              BLOCKCHAIN TREASURY TERMINAL v2.0            ║");
        print("╠═══════════════════════════════════════════════════════════╣");
        print("║                                                           ║");
        print("║  A professional crypto market analysis and treasury       ║");
        print("║  management terminal for Web3 organizations.              ║");
        print("║                                                           ║");
        print("║  Features:                                                ║");
        print("║  • Real-time market data from CoinGecko API              ║");
        print("║  • Treasury portfolio tracking and analytics             ║");
        print("║  • Currency conversion with live rates                   ║");
        print("║  • Trending coins and market insights                    ║");
        print("║  • Professional retro terminal interface                 ║");
        print("║                                                           ║");
        print("║  Built with React, TypeScript, and TailwindCSS          ║");
        print("╚═══════════════════════════════════════════════════════════╝");
        break;
        
      default:
        print(`Command not found: ${cmd}`);
        print("Type 'help' for available commands");
    }
  };

  const handleCommand = async (cmdLine: string) => {
    setHistory(h => [...h, { type: "input", value: `> ${cmdLine}` }]);
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
    if (history.length === 0) {
      print(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗ ██╗      ██████╗  ██████╗██╗  ██╗ ██████╗██╗  ██╗ █████╗ ██╗███╗  ║
║   ██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██║  ██║██╔══██╗██║████╗ ║
║   ██████╔╝██║     ██║   ██║██║     █████╔╝ ██║     ███████║███████║██║██╔██╗║
║   ██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ██║     ██╔══██║██╔══██║██║██║╚██╗║
║   ██████╔╝███████╗╚██████╔╝╚██████╗██║  ██╗╚██████╗██║  ██║██║  ██║██║██║ ╚█║
║   ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚╝
║                                                                               ║
║                        TREASURY TERMINAL • MARKET ANALYSIS                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
      print("Welcome to the Blockchain Treasury Terminal v2.0");
      print("Type 'help' to see available commands");
      print("");
    }
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} ${currentTheme.text} font-mono flex items-center justify-center relative overflow-hidden`}>
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className={`${currentTheme.terminal} ${currentTheme.border} border rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm`}>
          {/* Terminal Header */}
          <div className={`flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-transparent via-white/5 to-transparent border-b ${currentTheme.border}`}>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
            </div>
            <span className={`${currentTheme.accent} text-sm ml-4`}>blockchain-treasury@terminal:~</span>
            <div className="ml-auto text-xs opacity-50">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Terminal Body */}
          <div className="relative" style={{ minHeight: '70vh' }}>
            <div
              ref={outputRef}
              className="h-[65vh] overflow-y-auto p-4 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: `${currentTheme.accent} transparent`,
              }}
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
          <div className={`flex justify-between items-center px-4 py-1 text-xs ${currentTheme.accent} opacity-70 border-t ${currentTheme.border} bg-black/20`}>
            <div>Theme: {currentTheme.name}</div>
            <div>Connected to CoinGecko API</div>
            <div>{loading ? "BUSY" : "READY"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;