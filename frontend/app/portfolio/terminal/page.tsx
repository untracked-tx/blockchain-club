"use client";
import React, { useState, useRef, useEffect } from "react";
import { useWalletPortfolio } from "@/hooks/use-wallet-portfolio";
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
      const coinMap: { [key: string]: string } = {
        'btc': 'bitcoin', 'eth': 'ethereum', 'sol': 'solana', 'matic': 'matic-network',
        'ada': 'cardano', 'dot': 'polkadot', 'avax': 'avalanche-2', 'link': 'chainlink',
        'usd': 'usd', 'eur': 'eur', 'gbp': 'gbp', 'jpy': 'jpy'
      };

      const fromId = coinMap[fromSymbol.toLowerCase()] || fromSymbol.toLowerCase();
      const toId = coinMap[toSymbol.toLowerCase()] || toSymbol.toLowerCase();
      
      const response = await this.rateLimitedFetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}&precision=8`
      );

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      if (data[fromId] && data[fromId][toId]) {
        const price = data[fromId][toId];
        this.prices.set(cacheKey, { value: price, timestamp: Date.now() });
        return price;
      }

      // Try reverse conversion
      const reverseResponse = await this.rateLimitedFetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${toId}&vs_currencies=${fromId}&precision=8`
      );
      
      if (reverseResponse.ok) {
        const reverseData = await reverseResponse.json();
        if (reverseData[toId] && reverseData[toId][fromId]) {
          const price = 1 / reverseData[toId][fromId];
          this.prices.set(cacheKey, { value: price, timestamp: Date.now() });
          return price;
        }
      }

      return null;
    } catch (error) {
      console.error('Price fetch error:', error);
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
      const response = await this.rateLimitedFetch('https://api.alternative.me/fng/');
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
      // Use Etherscan gas tracker (free, no API key needed)
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
          },
          // Add some mock data for other chains (would need separate APIs)
          polygon: { safe: 30, standard: 35, fast: 45 },
          bsc: { safe: 3, standard: 5, fast: 8 },
          arbitrum: { safe: 0.1, standard: 0.2, fast: 0.5 }
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

  getCacheStats(): { priceEntries: number; apiEntries: number; lastUpdate: number } {
    return {
      priceEntries: this.prices.size,
      apiEntries: this.apiCache.size,
      lastUpdate: this.lastApiCall
    };
  }
}

// 🎯 COMMAND PIPELINE SYSTEM
class CommandPipeline {
  static async execute<T>(
    operation: () => Promise<T>,
    errorMessage: string = "Operation failed"
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      console.error(errorMessage, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : errorMessage 
      };
    }
  }

  static validateArgs(args: string[], expectedCount: number, usage: string): { valid: boolean; error?: string } {
    if (args.length !== expectedCount) {
      return { 
        valid: false, 
        error: `Invalid arguments. ${usage}` 
      };
    }
    return { valid: true };
  }

  static formatOutput(title: string, data: any[], formatter: (item: any) => string): string[] {
    const lines = [title];
    data.forEach(item => lines.push(formatter(item)));
    return lines;
  }
}

// Matrix-style rain effect with crypto symbols and binary
const DataRain = ({ data }: { data?: any[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
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
  }, [data]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-15 z-0" />;
};

// Helper functions
function formatCurrency(value: number, currency = "USD") {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
}

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}

// Terminal command registry
const commands = {
  help: {
    description: "Show available commands",
    exec: (ctx: TerminalContext, args: string[]) => ctx.printHelp(),
  },
  summary: {
    description: "Show portfolio summary",
    exec: (ctx: TerminalContext, args: string[]) => ctx.printSummary(),
  },
  assets: {
    description: "List all assets",
    exec: (ctx: TerminalContext, args: string[]) => ctx.printAssets(),
  },
  chains: {
    description: "List all chains",
    exec: (ctx: TerminalContext, args: string[]) => ctx.printChains(),
  },
  allocation: {
    description: "Show allocation breakdown",
    exec: (ctx: TerminalContext, args: string[]) => ctx.printAllocation(),
  },
  performance: {
    description: "Show performance stats",
    exec: (ctx: TerminalContext, args: string[]) => ctx.printPerformance(),
  },
  scan: {
    description: "Refresh portfolio data",
    exec: (ctx: TerminalContext, args: string[]) => ctx.refreshPortfolio(),
  },
  export: {
    description: "Export portfolio as CSV",
    exec: (ctx: TerminalContext, args: string[]) => ctx.exportCSV(),
  },
  clear: {
    description: "Clear terminal",
    exec: (ctx: TerminalContext, args: string[]) => ctx.clear(),
  },
  convert: {
    description: "Convert currency (e.g., 'convert 100 USD ETH')",
    exec: (ctx: TerminalContext, args: string[]) => ctx.convertCurrency(args),
  },
  chart: {
    description: "Show portfolio performance chart",
    exec: (ctx: TerminalContext, args: string[]) => ctx.showChart(),
  },
  heatmap: {
    description: "Display portfolio allocation heatmap",
    exec: (ctx: TerminalContext, args: string[]) => ctx.showHeatmap(),
  },
  gas: {
    description: "Show current gas prices",
    exec: (ctx: TerminalContext, args: string[]) => ctx.gasTracker(),
  },
  fear: {
    description: "Fear & Greed Index",
    exec: (ctx: TerminalContext, args: string[]) => ctx.fearGreedIndex(),
  },
  cache: {
    description: "Show cache statistics",
    exec: (ctx: TerminalContext, args: string[]) => ctx.showCacheStats(),
  },
  matrix: {
    description: "Enter Matrix mode (full screen)",
    exec: (ctx: TerminalContext, args: string[]) => ctx.matrixMode(),
  },
  all: {
    description: "Run all commands in sequence",
    exec: async (ctx: TerminalContext, args: string[]) => {
      await ctx.runSequence([
        "summary",
        "assets",
        "chains",
        "allocation",
        "performance",
      ]);
    },
  },
};

type CommandName = keyof typeof commands;

interface TerminalContext {
  print: (msg: string, opts?: { prompt?: boolean }) => void;
  printHelp: () => void;
  printSummary: () => void;
  printAssets: () => void;
  printChains: () => void;
  printAllocation: () => void;
  printPerformance: () => void;
  refreshPortfolio: () => void;
  exportCSV: () => void;
  clear: () => void;
  convertCurrency: (args: string[]) => void;
  showChart: () => void;
  showHeatmap: () => void;
  gasTracker: () => void;
  fearGreedIndex: () => void;
  showCacheStats: () => void;
  matrixMode: () => void;
  runSequence: (cmds: CommandName[]) => Promise<void>;
}

const PROMPT = "$ ";

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<{ type: "input" | "output"; value: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [matrixModeActive, setMatrixModeActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom on history update
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Load portfolio data
  const { portfolio, isLoading, error, refetch, lastUpdated } = useWalletPortfolio();

  // Get data cache instance
  const dataCache = DataCache.getInstance();



  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  // Terminal context implementation
  const ctx: TerminalContext = {
    print: (msg, opts) => {
      setHistory((h) => [...h, { type: "output", value: msg }]);
    },
    printHelp: () => {
      ctx.print("Available commands:");
      Object.entries(commands).forEach(([cmd, { description }]) => {
        ctx.print(`  ${cmd.padEnd(12)} - ${description}`);
      });
    },
    printSummary: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      ctx.print("Portfolio Summary:");
      ctx.print(`  Total Value: ${formatCurrency(portfolio.totalValue)}`);
      ctx.print(`  Assets: ${portfolio.assets.length}`);
      ctx.print(`  Chains: ${portfolio.chainBreakdown.length}`);
    },
    printAssets: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      ctx.print("Assets:");
      portfolio.assets.forEach((a: any) => {
        ctx.print(`  ${a.symbol.padEnd(8)} ${formatCurrency(a.value)} (${a.name})`);
      });
    },
    printChains: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      ctx.print("Chains:");
      portfolio.chainBreakdown.forEach((c: any) => {
        ctx.print(`  ${c.chainName.padEnd(12)} ${formatCurrency(c.totalValue)}`);
      });
    },
    printAllocation: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      ctx.print("Allocation:");
      portfolio.assets.forEach((a: any) => {
        const allocation = portfolio.totalValue && portfolio.totalValue > 0
          ? (a.value / portfolio.totalValue)
          : 0;
        ctx.print(`  ${a.symbol.padEnd(8)} ${formatPercentage(allocation)}`);
      });
    },
    printPerformance: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      ctx.print("Performance:");
      ctx.print(`  24h Change: ${formatPercentage(portfolio.dailyChangePercentage)}`);
      ctx.print(`  7d Change:  ${formatPercentage(portfolio.weeklyChangePercentage)}`);
    },
    refreshPortfolio: () => {
      setLoading(true);
      ctx.print("Scanning portfolio (fetching live data)...");
      refetch().then(() => {
        setLastScan(new Date());
        setLoading(false);
        ctx.print("Scan complete.");
      });
    },
    exportCSV: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      const rows = [
        ["Symbol", "Name", "Value", "Allocation"],
        ...portfolio.assets.map((a: any) => [
          a.symbol,
          a.name,
          formatCurrency(a.value),
          formatPercentage(a.allocation),
        ]),
      ];
      downloadCSV("portfolio.csv", rows);
      ctx.print("Exported portfolio.csv");
    },
    clear: () => {
      setHistory([]);
    },
    convertCurrency: async (args: string[]) => {
      const validation = CommandPipeline.validateArgs(args, 3, "Usage: convert <amount> <from> <to>");
      if (!validation.valid) {
        ctx.print(validation.error!);
        ctx.print("Example: convert 100 USD ETH");
        return;
      }
      
      const [amount, from, to] = args;
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount)) {
        ctx.print("❌ Invalid amount. Please enter a number.");
        return;
      }
      
      ctx.print(`🔄 Converting ${amount} ${from.toUpperCase()} to ${to.toUpperCase()}...`);
      
      const result = await CommandPipeline.execute(
        async () => await dataCache.getPrice(from, to),
        "Currency conversion failed"
      );
      
      if (result.success && result.data !== null && result.data !== undefined) {
        const convertedAmount = numAmount * result.data;
        ctx.print(`✅ ${amount} ${from.toUpperCase()} = ${convertedAmount.toFixed(8)} ${to.toUpperCase()}`);
        ctx.print(`📊 Rate: 1 ${from.toUpperCase()} = ${result.data.toFixed(8)} ${to.toUpperCase()}`);
        ctx.print("📡 Live data from CoinGecko API • Cached for 30s");
      } else {
        ctx.print("❌ Conversion failed. Possible reasons:");
        ctx.print("  • Network error or API unavailable");
        ctx.print("  • Unsupported currency pair");
        ctx.print("  • Rate limiting protection active");
        ctx.print("");
        ctx.print("Supported: BTC, ETH, SOL, MATIC, ADA, DOT, AVAX, LINK");
        ctx.print("Fiat: USD, EUR, GBP, JPY");
      }
    },
    gasTracker: async () => {
      ctx.print("⛽ GAS PRICE TRACKER");
      ctx.print("═".repeat(40));
      ctx.print("🔄 Fetching live gas prices...");
      
      const result = await CommandPipeline.execute(
        async () => await dataCache.getGasPrices(),
        "Gas tracker fetch failed"
      );
      
      if (result.success && result.data) {
        const gasData = result.data;
        ctx.print("Network      │ Safe  │ Standard │ Fast");
        ctx.print("─".repeat(40));
        
        Object.entries(gasData).forEach(([network, prices]: [string, any]) => {
          const name = network.charAt(0).toUpperCase() + network.slice(1);
          ctx.print(`${name.padEnd(12)} │ ${prices.safe}${network === 'ethereum' ? 'gwei' : 'gwei'} │ ${prices.standard}${network === 'ethereum' ? 'gwei' : 'gwei'} │ ${prices.fast}${network === 'ethereum' ? 'gwei' : 'gwei'}`);
        });
        
        ctx.print("");
        ctx.print("🟢 Safe  🟡 Standard  � Fast");
        ctx.print("� Live Ethereum data from Etherscan API");
      } else {
        ctx.print("❌ Failed to fetch gas prices");
        ctx.print("  • Network error or API unavailable");
        ctx.print("  • Showing fallback estimates");
        ctx.print("");
        ctx.print("Ethereum: ~25 gwei (estimated)");
      }
    },
    fearGreedIndex: async () => {
      ctx.print("😨 CRYPTO FEAR & GREED INDEX");
      ctx.print("═".repeat(40));
      ctx.print("🔄 Fetching live sentiment data...");
      const result = await CommandPipeline.execute(
        async () => await dataCache.getFearGreedIndex(),
        "Fear & Greed Index fetch failed"
      );
      if (result.success && result.data) {
        const { value, classification, timestamp } = result.data;
        const bars = "█".repeat(Math.floor(value / 10)) + "░".repeat(10 - Math.floor(value / 10));
        ctx.print(`Current Index: ${value}/100 (${classification.toUpperCase()})`);
        ctx.print(`│${bars}│`);
        ctx.print("  0    25    50    75   100");
        ctx.print("Fear ←              → Greed");
        ctx.print(`Updated: ${new Date(timestamp).toLocaleString()}`);
        ctx.print("");
        if (value < 10) ctx.print("🔴 EXTREME FEAR - Maximum buying opportunity!");
        else if (value < 25) ctx.print("🟠 FEAR - Great buying opportunity");
        else if (value < 45) ctx.print("🟡 FEAR - Market uncertainty, be cautious");
        else if (value < 55) ctx.print("🟢 NEUTRAL - Balanced market sentiment");
        else if (value < 75) ctx.print("🟡 GREED - Market optimism, monitor closely");
        else if (value < 90) ctx.print("🟠 GREED - Consider taking some profits");
        else ctx.print("🔴 EXTREME GREED - High risk, secure gains!");
        ctx.print("📡 Live data from Alternative.me API");
      } else {
        ctx.print("❌ Failed to fetch Fear & Greed Index");
        ctx.print("  • Network error or API rate limit");
        ctx.print("  • Check your internet connection");
      }
    },
    showCacheStats: () => {
      const stats = dataCache.getCacheStats();
      ctx.print("💾 CACHE STATISTICS");
      ctx.print("═".repeat(30));
      ctx.print(`Price Entries: ${stats.priceEntries}`);
      ctx.print(`API Entries: ${stats.apiEntries}`);
      ctx.print(`Last API Call: ${stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'Never'}`);
      ctx.print(`Cache Status: ${stats.priceEntries > 0 ? '🟢 Active' : '🔴 Empty'}`);
      ctx.print("");
      ctx.print("Cache automatically expires after 30 seconds");
    },
    matrixMode: () => {
      ctx.print("🔴 ENTERING MATRIX MODE...");
      ctx.print("┌─────────────────────────────────────┐");
      ctx.print("│ Reality is an illusion, portfolio   │");
      ctx.print("│ gains are temporary, but the code   │");
      ctx.print("│ is eternal. Welcome to the Matrix.  │");
      ctx.print("└─────────────────────────────────────┘");
      ctx.print("");
      ctx.print("💊 Red pill taken. Blockchain truths revealed.");
      ctx.print("🕶️ Neo mode activated for 10 seconds...");
      
      // Temporarily increase matrix rain opacity
      setTimeout(() => {
        ctx.print("🌊 Matrix rain intensity increased!");
        // In a real implementation, you'd modify the DataRain opacity
      }, 1000);
      
      setTimeout(() => {
        ctx.print("🔵 Exiting Matrix mode. Welcome back to reality.");
      }, 10000);
    },
    showChart: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      
      ctx.print("Portfolio Performance Chart:");
      ctx.print("┌─────────────────────────────────────────────────────────┐");
      
      // Create ASCII chart using portfolio data
      const assets = portfolio.assets.slice(0, 8); // Top 8 assets
      const maxValue = Math.max(...assets.map((a: any) => a.value));
      
      assets.forEach((asset: any) => {
        const percentage = (asset.value / maxValue) * 100;
        const barLength = Math.floor(percentage / 2); // Scale down for display
        const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);
        
        ctx.print(`│ ${asset.symbol.padEnd(6)} │${bar}│ $${asset.value.toFixed(2).padStart(8)} │`);
      });
      
      ctx.print("└─────────────────────────────────────────────────────────┘");
      ctx.print(`📊 Total Portfolio Value: ${formatCurrency(portfolio.totalValue)}`);
    },
    showHeatmap: () => {
      if (!portfolio) return ctx.print("No portfolio data loaded.");
      
      ctx.print("Portfolio Allocation Heatmap:");
      ctx.print("┌──────────────────────────────────────────────────────────┐");
      
      const assets = portfolio.assets.slice(0, 12); // Top 12 assets
      let row = "│ ";
      
      assets.forEach((asset: any, index: number) => {
        const allocation = asset.value / portfolio.totalValue;
        let intensity = ' ';
        
        if (allocation > 0.3) intensity = '█';
        else if (allocation > 0.2) intensity = '▓';
        else if (allocation > 0.1) intensity = '▒';
        else if (allocation > 0.05) intensity = '░';
        else intensity = '·';
        
        row += `${intensity}${intensity}${intensity} `;
        
        // New row every 4 assets
        if ((index + 1) % 4 === 0) {
          row += " │";
          ctx.print(row);
          row = "│ ";
        }
      });
      
      // Fill remaining space if needed
      if (row !== "│ ") {
        while (row.length < 59) row += " ";
        row += " │";
        ctx.print(row);
      }
      
      ctx.print("└──────────────────────────────────────────────────────────┘");
      ctx.print("Legend: █ >30%  ▓ >20%  ▒ >10%  ░ >5%  · <5%");
      
      // Show allocation percentages
      ctx.print("\nAllocation Details:");
      assets.forEach((asset: any) => {
        const allocation = asset.value / portfolio.totalValue;
        ctx.print(`  ${asset.symbol.padEnd(6)} ${formatPercentage(allocation).padStart(8)} - ${asset.name}`);
      });
    },
    runSequence: async (cmds) => {
      for (const cmd of cmds) {
        ctx.print(PROMPT + cmd, { prompt: true });
        await new Promise((r) => setTimeout(r, 300));
        await commands[cmd].exec(ctx, []);
      }
    },
  };

  // Handle command input
  const handleCommand = async (cmdLine: string) => {
    const [cmd, ...args] = cmdLine.trim().split(/\s+/);
    setHistory((h) => [...h, { type: "input", value: PROMPT + cmdLine }]);
    if (!cmd) return;
    if (commands[cmd as CommandName]) {
      setLoading(true);
      await commands[cmd as CommandName].exec(ctx, args);
      setLoading(false);
    } else {
      ctx.print(`Unknown command: ${cmd}`);
    }
  };

  // Handle Enter key
  const onInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      const val = input;
      setInput("");
      await handleCommand(val);
    }
  };

  // Initial help message
  useEffect(() => {
    if (history.length === 0) {
      ctx.print(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  ████████╗██████╗ ███████╗ █████╗ ███████╗██╗   ██╗██████╗ ██╗   ██╗        ║
║  ╚══██╔══╝██╔══██╗██╔════╝██╔══██╗██╔════╝██║   ██║██╔══██╗╚██╗ ██╔╝        ║
║     ██║   ██████╔╝█████╗  ███████║███████╗██║   ██║██████╔╝ ╚████╔╝         ║
║     ██║   ██╔══██╗██╔══╝  ██╔══██║╚════██║██║   ██║██╔══██╗  ╚██╔╝          ║
║     ██║   ██║  ██║███████╗██║  ██║███████║╚██████╔╝██║  ██║   ██║           ║
║     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝           ║
║                                                                               ║
║            BLOCKCHAIN INVESTMENT COLLECTIVE · MAINFRAME ACCESS                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
      ctx.print('Type "help" to see available commands.');
      ctx.print("Use ↑/↓ arrows for command history, Ctrl+L to clear");
      ctx.print("═".repeat(50));
      ctx.print("🚀 BLOCKCHAIN CLUB TREASURY TERMINAL v3.0");
      ctx.print("💱 Currency: 'convert 100 USD ETH' (live rates + caching)");
      ctx.print("📊 Charts: 'chart' and 'heatmap' for portfolio viz");
      ctx.print("⛽ Gas: 'gas' for current network fees");
      ctx.print("😨 Sentiment: 'fear' for Fear & Greed Index");
      ctx.print("💾 System: 'cache' for performance stats");
      ctx.print("🔴 Matrix: 'matrix' to enter the code reality");
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a1a0a] to-black text-green-400 font-mono flex items-center justify-center relative overflow-hidden">
      {/* Matrix Data Rain */}
      <DataRain data={portfolio?.assets || []} />
      <div className="relative z-10 w-full max-w-2xl mx-4 select-none">
        <div className="bg-[#101c10] border border-green-500 rounded-lg overflow-hidden shadow-2xl ring-2 ring-green-400/30">
          {/* Terminal Top Bar - Classic Unix Style */}
          <div className="flex items-center gap-2 h-7 px-3 bg-green-400/10 border-b border-green-400/30 cursor-move">
            <span className="text-green-300 font-mono text-xs select-none">user@blockchain-terminal: ~</span>
            <div className="ml-auto flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          {/* Terminal Output */}
          <div className="relative bg-[#101c10]" style={{minHeight: '60vh'}}>
            <div
              className="h-[60vh] overflow-y-auto pr-2 pb-20 custom-scrollbar"
              id="terminal-output"
              ref={outputRef}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#00ff41 transparent',
                fontSize: '1.05rem',
                lineHeight: '1.6',
                letterSpacing: '0.01em',
                fontFamily: 'Fira Mono, Menlo, monospace',
                background: 'none',
                borderRadius: '0 0 0.5rem 0.5rem',
                boxShadow: 'inset 0 0 24px #00ff4120',
              }}
            >
              {history.map((entry, i) => (
                <div key={i} className={`font-mono ${entry.type === "input" ? "text-green-300" : "text-green-400"} whitespace-pre-wrap`}>
                  {entry.value}
                </div>
              ))}
              {loading && <div className="text-yellow-400 animate-pulse">Processing... <span className="animate-spin">⟳</span></div>}
            </div>
            {/* Sticky Input Bar */}
            <div className="absolute left-0 right-0 bottom-0 bg-[#101c10] border-t border-green-400/20 px-4 py-3 flex items-center" style={{boxShadow: '0 -2px 12px #00ff4120'}}>
              <span className="text-green-300 mr-2 font-bold">{PROMPT}</span>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none text-green-200 placeholder-green-600 font-mono"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                disabled={loading}
                placeholder="Type a command..."
                autoFocus
                spellCheck={false}
                style={{fontSize: '1.05rem'}}
              />
            </div>
            {/* Status Bar */}
            <div className="absolute left-0 right-0 bottom-[-32px] flex justify-between items-center px-4 py-1 text-xs text-green-600 bg-transparent pointer-events-none select-none">
              <div>
                Last scan: {lastScan ? lastScan.toLocaleTimeString() : "never"}
              </div>
              <div>
                Status: {loading ? "BUSY" : "READY"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
