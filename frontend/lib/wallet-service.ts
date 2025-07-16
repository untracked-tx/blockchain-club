import { ethers } from 'ethers'

// Multisig wallet address
export const MULTISIG_WALLET = '0x0A1a8e1fFe25B63E3965FaEbe230e498AfC7EAb6'

// Common ERC-20 token addresses on Ethereum mainnet
// Common ERC-20 token addresses on Ethereum mainnet
const TOKEN_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xa0b86a33e6417ab7a7e1ab88c1f35fb4c6ab5be8', 
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  '1INCH': '0x111111111117dC0aa78b770fA6A738034120C302',
  SUSHI: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'
}

// ERC-20 ABI for balance and metadata queries
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
]

export interface WalletAsset {
  id: string
  name: string
  symbol: string
  amount: number
  value: number
  price: number
  change24h: number
  color: string
  contractAddress?: string
}

export interface WalletPortfolio {
  totalValue: number
  dailyChange: number
  dailyChangePercentage: number
  weeklyChange: number
  weeklyChangePercentage: number
  monthlyChange: number
  monthlyChangePercentage: number
  assets: WalletAsset[]
  lastUpdated: string
}

// CoinGecko API for price data
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Token color mapping for UI
const TOKEN_COLORS: Record<string, string> = {
  ETH: '#627EEA',
  WETH: '#627EEA',
  BTC: '#F7931A',
  USDC: '#2775CA',
  USDT: '#26A17B',
  DAI: '#F5AC37',
  LINK: '#2A5ADA',
  UNI: '#FF007A',
  AAVE: '#B6509E',
  COMP: '#00D395',
  MKR: '#1AAB9B',
  SNX: '#5FCF95',
  CRV: '#40E0D0',
  '1INCH': '#1B2A4E',
  SUSHI: '#FA52A0'
}

// CoinGecko ID mapping for price queries
const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  WETH: 'weth',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  COMP: 'compound-governance-token',
  MKR: 'maker',
  SNX: 'havven',
  CRV: 'curve-dao-token',
  '1INCH': '1inch',
  SUSHI: 'sushi'
}

class WalletService {
  private provider: ethers.Provider
  private priceCache: Map<string, { price: number, change24h: number, timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Use public RPC endpoints - in production, consider using Infura/Alchemy
    this.provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com')
  }

  async getETHBalance(address: string): Promise<number> {
    try {
      const balance = await this.provider.getBalance(address)
      return parseFloat(ethers.formatEther(balance))
    } catch (error) {
      console.error('Error fetching ETH balance:', error)
      return 0
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<{
    balance: number
    symbol: string
    name: string
    decimals: number
  }> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider)
      
      const [balance, symbol, name, decimals] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.symbol(),
        contract.name(),
        contract.decimals()
      ])

      return {
        balance: parseFloat(ethers.formatUnits(balance, decimals)),
        symbol,
        name,
        decimals: Number(decimals)
      }
    } catch (error) {
      console.error(`Error fetching token balance for ${tokenAddress}:`, error)
      return { balance: 0, symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18 }
    }
  }

  async getPriceData(symbols: string[]): Promise<Map<string, { price: number, change24h: number }>> {
    const priceData = new Map<string, { price: number, change24h: number }>()
    const symbolsToFetch: string[] = []

    // Check cache first
    for (const symbol of symbols) {
      const cached = this.priceCache.get(symbol)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        priceData.set(symbol, { price: cached.price, change24h: cached.change24h })
      } else {
        symbolsToFetch.push(symbol)
      }
    }

    if (symbolsToFetch.length === 0) {
      return priceData
    }

    try {
      // Map symbols to CoinGecko IDs
      const geckoIds = symbolsToFetch
        .map(symbol => COINGECKO_IDS[symbol])
        .filter(Boolean)
        .join(',')

      if (!geckoIds) {
        return priceData
      }

      // Use our API route instead of direct CoinGecko calls
      const response = await fetch(
        `/api/prices?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true`
      )

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`)
      }

      const data = await response.json()

      // Process the response and update cache
      for (const symbol of symbolsToFetch) {
        const geckoId = COINGECKO_IDS[symbol]
        if (geckoId && data[geckoId]) {
          const price = data[geckoId].usd || 0
          const change24h = data[geckoId].usd_24h_change || 0
          
          priceData.set(symbol, { price, change24h })
          
          // Update cache
          this.priceCache.set(symbol, {
            price,
            change24h,
            timestamp: Date.now()
          })
        }
      }
    } catch (error) {
      console.error('Error fetching price data:', error)
      
      // Fallback to cached data or defaults
      for (const symbol of symbolsToFetch) {
        const cached = this.priceCache.get(symbol)
        if (cached) {
          priceData.set(symbol, { price: cached.price, change24h: cached.change24h })
        } else {
          priceData.set(symbol, { price: 0, change24h: 0 })
        }
      }
    }

    return priceData
  }

  async getWalletPortfolio(walletAddress: string = MULTISIG_WALLET): Promise<WalletPortfolio> {
    try {
      const assets: WalletAsset[] = []
      
      // Get ETH balance
      const ethBalance = await this.getETHBalance(walletAddress)
      
      // Get token balances
      const tokenBalances = await Promise.all(
        Object.entries(TOKEN_ADDRESSES).map(async ([tokenSymbol, address]) => {
          const tokenData = await this.getTokenBalance(address, walletAddress)
          return {
            symbol: tokenSymbol, // Use the token symbol from our mapping
            address,
            balance: tokenData.balance,
            name: tokenData.name,
            decimals: tokenData.decimals
          }
        })
      )

      // Filter out tokens with zero balance and collect symbols for price fetching
      const symbolsToPrice: string[] = []
      if (ethBalance > 0) symbolsToPrice.push('ETH')
      
      const nonZeroTokens = tokenBalances.filter(token => token.balance > 0.001) // Filter out dust
      nonZeroTokens.forEach(token => symbolsToPrice.push(token.symbol))

      // Get price data for all relevant tokens
      const priceData = await this.getPriceData(symbolsToPrice)

      // Create ETH asset if balance exists
      if (ethBalance > 0) {
        const ethPriceInfo = priceData.get('ETH') || { price: 0, change24h: 0 }
        assets.push({
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          amount: ethBalance,
          value: ethBalance * ethPriceInfo.price,
          price: ethPriceInfo.price,
          change24h: ethPriceInfo.change24h,
          color: TOKEN_COLORS.ETH
        })
      }

      // Create token assets
      for (const token of nonZeroTokens) {
        const priceInfo = priceData.get(token.symbol) || { price: 0, change24h: 0 }
        assets.push({
          id: token.symbol.toLowerCase(),
          name: token.name,
          symbol: token.symbol,
          amount: token.balance,
          value: token.balance * priceInfo.price,
          price: priceInfo.price,
          change24h: priceInfo.change24h,
          color: TOKEN_COLORS[token.symbol] || '#6B7280',
          contractAddress: token.address
        })
      }

      // Sort assets by value (descending)
      assets.sort((a, b) => b.value - a.value)

      // Calculate total portfolio value
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

      // Calculate weighted average daily change
      const totalWeightedChange = assets.reduce((sum, asset) => {
        const weight = asset.value / totalValue || 0
        return sum + (asset.change24h * weight)
      }, 0)

      const dailyChangePercentage = totalWeightedChange
      const dailyChange = totalValue * (dailyChangePercentage / 100)

      // For now, use mock data for weekly/monthly changes since we don't have historical data
      // In a production app, you'd store historical portfolio values
      const weeklyChangePercentage = dailyChangePercentage * 3.5 // Rough estimate
      const weeklyChange = totalValue * (weeklyChangePercentage / 100)
      
      const monthlyChangePercentage = dailyChangePercentage * 12 // Rough estimate
      const monthlyChange = totalValue * (monthlyChangePercentage / 100)

      return {
        totalValue,
        dailyChange,
        dailyChangePercentage,
        weeklyChange,
        weeklyChangePercentage,
        monthlyChange,
        monthlyChangePercentage,
        assets,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error)
      
      // Return empty portfolio on error
      return {
        totalValue: 0,
        dailyChange: 0,
        dailyChangePercentage: 0,
        weeklyChange: 0,
        weeklyChangePercentage: 0,
        monthlyChange: 0,
        monthlyChangePercentage: 0,
        assets: [],
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

export const walletService = new WalletService()
