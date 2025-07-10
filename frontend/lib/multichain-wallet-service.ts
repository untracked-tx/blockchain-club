import { ethers } from 'ethers'

// Multisig wallet address
export const MULTISIG_WALLET = '0x0A1a8e1fFe25B63E3965FaEbe230e498AfC7EAb6'

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
  chain: string
  logoUrl?: string
  percentageOfPortfolio?: number
}

export interface ChainAssets {
  chainName: string
  nativeAsset?: WalletAsset
  tokens: WalletAsset[]
  totalValue: number
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
  chainBreakdown: ChainAssets[]
  lastUpdated: string
  supportedChains: string[]
}

// Individual chain APIs for multichain data
const CHAIN_APIS = {
  ethereum: {
    name: 'Ethereum',
    apiUrl: 'https://api.etherscan.io/api',
    rpcUrl: 'https://eth.llamarpc.com',
    nativeCurrency: { symbol: 'ETH', decimals: 18, name: 'Ether' },
    chainId: 1,
    coingeckoId: 'ethereum',
    explorerUrl: 'https://etherscan.io'
  },
  polygon: {
    name: 'Polygon',
    apiUrl: 'https://api.polygonscan.com/api',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: { symbol: 'MATIC', decimals: 18, name: 'Polygon' },
    chainId: 137,
    coingeckoId: 'matic-network',
    explorerUrl: 'https://polygonscan.com'
  },
  bsc: {
    name: 'BNB Smart Chain',
    apiUrl: 'https://api.bscscan.com/api',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    nativeCurrency: { symbol: 'BNB', decimals: 18, name: 'BNB' },
    chainId: 56,
    coingeckoId: 'binancecoin',
    explorerUrl: 'https://bscscan.com'
  },
  arbitrum: {
    name: 'Arbitrum One',
    apiUrl: 'https://api.arbiscan.io/api',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: { symbol: 'ETH', decimals: 18, name: 'Ether' },
    chainId: 42161,
    coingeckoId: 'ethereum',
    explorerUrl: 'https://arbiscan.io'
  },
  optimism: {
    name: 'Optimism',
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    rpcUrl: 'https://mainnet.optimism.io',
    nativeCurrency: { symbol: 'ETH', decimals: 18, name: 'Ether' },
    chainId: 10,
    coingeckoId: 'ethereum',
    explorerUrl: 'https://optimistic.etherscan.io'
  }
}

// CoinGecko API
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Known important token contracts to check
const KNOWN_TOKENS = {
  ethereum: [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin' },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink' },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap' }
  ],
  polygon: [
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin' },
    { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', name: 'Wrapped Ether' }
  ],
  arbitrum: [
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin' },
    { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether' }
  ],
  optimism: [
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', name: 'USD Coin' },
    { address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether' }
  ],
  bsc: [
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin' },
    { address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', symbol: 'BTCB', name: 'Bitcoin BEP2' },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'ETH', name: 'Ethereum Token' }
  ]
}

// Enhanced token color mapping
const TOKEN_COLORS: Record<string, string> = {
  ETH: '#627EEA',
  WETH: '#627EEA',
  BTC: '#F7931A',
  WBTC: '#F7931A',
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
  MATIC: '#8247E5',
  POL: '#8247E5',
  BNB: '#F3BA2F',
  ARB: '#28A0F0',
  OP: '#FF0420'
}

// Generate random color for unknown tokens
function generateTokenColor(symbol: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

interface EtherscanTokenBalance {
  contractAddress: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  balance: string
}

interface TokenPriceData {
  price: number
  change24h: number
  logoUrl?: string
}

class MultichainWalletService {
  private providers: Map<string, ethers.Provider> = new Map()
  private priceCache: Map<string, { data: TokenPriceData, timestamp: number }> = new Map()
  private portfolioCache: Map<string, { data: WalletPortfolio, timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly PORTFOLIO_CACHE_DURATION = 3 * 60 * 1000 // 3 minutes for portfolio data
  private readonly API_RATE_LIMIT = 200 // ms between requests

  constructor() {
    // Initialize providers for each supported chain
    Object.entries(CHAIN_APIS).forEach(([chainKey, config]) => {
      this.providers.set(chainKey, new ethers.JsonRpcProvider(config.rpcUrl))
    })
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getTokenBalancesFromChain(
    walletAddress: string, 
    chainKey: string
  ): Promise<EtherscanTokenBalance[]> {
    const config = CHAIN_APIS[chainKey as keyof typeof CHAIN_APIS]
    if (!config) return []

    try {
      // Use our API route to avoid CORS issues
      const response = await fetch(`/api/wallet?address=${walletAddress}&chain=${chainKey}`)
      
      if (!response.ok) {
        console.log(`Wallet API returned error for ${chainKey}`)
        return []
      }
      
      const result = await response.json()
      const data = result.data

      if (!data || data.status !== '1' || !data.result) {
        console.log(`No token transactions found for ${chainKey}`)
        return []
      }

      // Extract unique token contracts from transactions
      const tokenContracts = new Map<string, EtherscanTokenBalance>()
      
      data.result.forEach((tx: any) => {
        if (tx.to?.toLowerCase() === walletAddress.toLowerCase() || 
            tx.from?.toLowerCase() === walletAddress.toLowerCase()) {
          tokenContracts.set(tx.contractAddress.toLowerCase(), {
            contractAddress: tx.contractAddress,
            tokenName: tx.tokenName,
            tokenSymbol: tx.tokenSymbol,
            tokenDecimal: tx.tokenDecimal,
            balance: '0' // Will be fetched separately
          })
        }
      })

      return Array.from(tokenContracts.values())
    } catch (error) {
      console.error(`Error fetching token list from ${chainKey}:`, error)
      return []
    }
  }

  async getNativeBalance(walletAddress: string, chainKey: string): Promise<number> {
    try {
      const provider = this.providers.get(chainKey)
      if (!provider) return 0

      const balance = await provider.getBalance(walletAddress)
      return parseFloat(ethers.formatEther(balance))
    } catch (error) {
      console.error(`Error fetching native balance for ${chainKey}:`, error)
      return 0
    }
  }

  async getTokenBalance(
    contractAddress: string, 
    walletAddress: string, 
    chainKey: string
  ): Promise<{ balance: number; symbol: string; name: string; decimals: number }> {
    try {
      const provider = this.providers.get(chainKey)
      if (!provider) throw new Error(`Provider not found for ${chainKey}`)

      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider)
      
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
      console.error(`Error fetching token balance for ${contractAddress} on ${chainKey}:`, error)
      return { balance: 0, symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18 }
    }
  }

  async getPriceData(symbols: string[]): Promise<Map<string, TokenPriceData>> {
    const priceData = new Map<string, TokenPriceData>()
    const symbolsToFetch: string[] = []

    // Check cache first
    for (const symbol of symbols) {
      const cached = this.priceCache.get(symbol.toLowerCase())
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        priceData.set(symbol, cached.data)
      } else {
        symbolsToFetch.push(symbol)
      }
    }

    if (symbolsToFetch.length === 0) {
      return priceData
    }

    try {
      // Map symbols to CoinGecko IDs
      const symbolToId: Record<string, string> = {
        'ETH': 'ethereum',
        'WETH': 'weth',
        'BTC': 'bitcoin',
        'WBTC': 'wrapped-bitcoin',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'DAI': 'dai',
        'LINK': 'chainlink',
        'UNI': 'uniswap',
        'AAVE': 'aave',
        'COMP': 'compound-governance-token',
        'MKR': 'maker',
        'SNX': 'havven',
        'CRV': 'curve-dao-token',
        'MATIC': 'matic-network',
        'POL': 'matic-network',
        'BNB': 'binancecoin',
        'ARB': 'arbitrum',
        'OP': 'optimism'
      }

      const idsToFetch = symbolsToFetch
        .map(symbol => symbolToId[symbol.toUpperCase()])
        .filter(Boolean)

      if (idsToFetch.length > 0) {
        const idsParam = idsToFetch.join(',')
        const response = await fetch(`/api/prices?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`)

        if (response.ok) {
          const data = await response.json()
          
          // Map back to symbols
          for (const symbol of symbolsToFetch) {
            const id = symbolToId[symbol.toUpperCase()]
            const tokenData = data[id]
            
            if (tokenData) {
              const priceInfo: TokenPriceData = {
                price: tokenData.usd || 0,
                change24h: tokenData.usd_24h_change || 0
              }
              
              priceData.set(symbol, priceInfo)
              this.priceCache.set(symbol.toLowerCase(), {
                data: priceInfo,
                timestamp: Date.now()
              })
            }
          }
        }
      }

      // For symbols not found, set to 0
      for (const symbol of symbolsToFetch) {
        if (!priceData.has(symbol)) {
          const fallbackData: TokenPriceData = { price: 0, change24h: 0 }
          priceData.set(symbol, fallbackData)
        }
      }
    } catch (error) {
      console.error('Error fetching price data:', error)
      
      // Set all symbols to 0 on error
      for (const symbol of symbolsToFetch) {
        priceData.set(symbol, { price: 0, change24h: 0 })
      }
    }

    return priceData
  }

  async getChainAssets(walletAddress: string, chainKey: string): Promise<ChainAssets> {
    const config = CHAIN_APIS[chainKey as keyof typeof CHAIN_APIS]
    if (!config) {
      return {
        chainName: chainKey,
        tokens: [],
        totalValue: 0
      }
    }

    try {
      const assets: WalletAsset[] = []
      
      // Get native currency balance
      const nativeBalance = await this.getNativeBalance(walletAddress, chainKey)
      let nativeAsset: WalletAsset | undefined

      if (nativeBalance > 0.001) {
        const nativePriceData = await this.getPriceData([config.nativeCurrency.symbol])
        const priceInfo = nativePriceData.get(config.nativeCurrency.symbol) || { price: 0, change24h: 0 }
        
        nativeAsset = {
          id: `${chainKey}-native`,
          name: config.nativeCurrency.name,
          symbol: config.nativeCurrency.symbol,
          amount: nativeBalance,
          value: nativeBalance * priceInfo.price,
          price: priceInfo.price,
          change24h: priceInfo.change24h,
          color: TOKEN_COLORS[config.nativeCurrency.symbol] || generateTokenColor(config.nativeCurrency.symbol),
          chain: config.name,
          contractAddress: undefined // Native currency has no contract
        }
        assets.push(nativeAsset)
      }

      // Get token balances using enhanced discovery method
      const allTokensToCheck = await this.getEnhancedTokenDiscovery(walletAddress, chainKey)
      
      console.log(`Checking ${allTokensToCheck.length} tokens for ${chainKey}:`, 
                  allTokensToCheck.map(t => t.tokenSymbol))
      
      // Fetch balances for all tokens
      const tokenPromises = allTokensToCheck.map(async (tokenInfo: EtherscanTokenBalance, index: number) => {
        // Add staggered delay to avoid overwhelming APIs
        await this.delay(this.API_RATE_LIMIT * index) 
        
        try {
          const tokenData = await this.getTokenBalance(
            tokenInfo.contractAddress, 
            walletAddress, 
            chainKey
          )
          
          console.log(`${chainKey}: ${tokenInfo.tokenSymbol} (${tokenInfo.contractAddress}): ${tokenData.balance} tokens`)
          
          // Use an even smaller dust filter to catch USDC and other important tokens
          if (tokenData.balance > 0.000001) { 
            return {
              tokenInfo,
              tokenData
            }
          }
          return null
        } catch (error) {
          console.error(`Error fetching balance for ${tokenInfo.tokenSymbol} on ${chainKey}:`, error)
          return null
        }
      })

      const tokenResults = await Promise.all(tokenPromises)
      const validTokens = tokenResults.filter(Boolean) as Array<{
        tokenInfo: EtherscanTokenBalance
        tokenData: { balance: number; symbol: string; name: string; decimals: number }
      }>

      // Get price data for all valid tokens
      const symbols = validTokens.map(t => t.tokenData.symbol)
      const priceData = await this.getPriceData(symbols)

      // Create token assets
      for (const { tokenInfo, tokenData } of validTokens) {
        const priceInfo = priceData.get(tokenData.symbol) || { price: 0, change24h: 0 }
        
        assets.push({
          id: `${chainKey}-${tokenInfo.contractAddress}`,
          name: tokenData.name,
          symbol: tokenData.symbol,
          amount: tokenData.balance,
          value: tokenData.balance * priceInfo.price,
          price: priceInfo.price,
          change24h: priceInfo.change24h,
          color: TOKEN_COLORS[tokenData.symbol] || generateTokenColor(tokenData.symbol),
          chain: config.name,
          contractAddress: tokenInfo.contractAddress
        })
      }

      // Sort by value
      assets.sort((a, b) => b.value - a.value)
      
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

      return {
        chainName: config.name,
        nativeAsset,
        tokens: assets.filter(asset => asset.contractAddress), // Only tokens, not native
        totalValue
      }
    } catch (error) {
      console.error(`Error fetching chain assets for ${chainKey}:`, error)
      return {
        chainName: config.name,
        tokens: [],
        totalValue: 0
      }
    }
  }

  async getEnhancedTokenDiscovery(walletAddress: string, chainKey: string): Promise<EtherscanTokenBalance[]> {
    const config = CHAIN_APIS[chainKey as keyof typeof CHAIN_APIS]
    if (!config) return []

    try {
      console.log(`🔍 Discovering tokens for ${chainKey}...`)
      
      // Method 1: Get tokens from transaction history (existing method)
      const txTokens = await this.getTokenBalancesFromChain(walletAddress, chainKey)
      console.log(`📝 Found ${txTokens.length} tokens from transaction history on ${chainKey}`)
      
      // Method 2: Check known important tokens for this chain
      const knownTokensForChain = KNOWN_TOKENS[chainKey as keyof typeof KNOWN_TOKENS] || []
      console.log(`⭐ Checking ${knownTokensForChain.length} known important tokens on ${chainKey}`)
      
      // Method 3: Try to get token list from the chain's token API if available
      let apiTokens: EtherscanTokenBalance[] = []
      try {
        const tokenListUrl = `${config.apiUrl}?module=account&action=tokenlist&address=${walletAddress}`
        const response = await fetch(tokenListUrl)
        const data = await response.json()
        
        if (data.status === '1' && data.result) {
          apiTokens = data.result.map((token: any) => ({
            contractAddress: token.contractAddress,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            tokenDecimal: token.decimals?.toString() || '18',
            balance: '0'
          }))
          console.log(`🗂️  Found ${apiTokens.length} tokens from ${chainKey} token list API`)
        }
      } catch (error) {
        console.log(`ℹ️  Token list API not available for ${chainKey}`)
      }
      
      // Combine all sources and deduplicate
      const allTokens = new Map<string, EtherscanTokenBalance>()
      
      // Add transaction-discovered tokens
      txTokens.forEach(token => {
        allTokens.set(token.contractAddress.toLowerCase(), token)
      })
      
      // Add API-discovered tokens
      apiTokens.forEach(token => {
        allTokens.set(token.contractAddress.toLowerCase(), token)
      })
      
      // Add known important tokens
      knownTokensForChain.forEach(knownToken => {
        if (!allTokens.has(knownToken.address.toLowerCase())) {
          allTokens.set(knownToken.address.toLowerCase(), {
            contractAddress: knownToken.address,
            tokenName: knownToken.name,
            tokenSymbol: knownToken.symbol,
            tokenDecimal: '18', // Will be fetched correctly later
            balance: '0'
          })
        }
      })
      
      const finalTokenList = Array.from(allTokens.values())
      console.log(`✅ Total unique tokens to check on ${chainKey}: ${finalTokenList.length}`)
      
      return finalTokenList
    } catch (error) {
      console.error(`❌ Error in enhanced token discovery for ${chainKey}:`, error)
      
      // Fallback to just known tokens
      const knownTokensForChain = KNOWN_TOKENS[chainKey as keyof typeof KNOWN_TOKENS] || []
      return knownTokensForChain.map(token => ({
        contractAddress: token.address,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        tokenDecimal: '18',
        balance: '0'
      }))
    }
  }

  async getMultichainPortfolio(walletAddress: string = MULTISIG_WALLET): Promise<WalletPortfolio> {
    // Check cache first to avoid redundant API calls
    const cacheKey = walletAddress.toLowerCase()
    const cached = this.portfolioCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.PORTFOLIO_CACHE_DURATION) {
      console.log('📦 Returning cached portfolio data')
      return cached.data
    }

    console.log('🔄 Fetching fresh portfolio data...')
    
    try {
      // Get assets from individual supported chains
      const chainKeys = Object.keys(CHAIN_APIS)
      
      const chainAssetsPromises = chainKeys.map(chainKey => 
        this.getChainAssets(walletAddress, chainKey)
      )
      
      const chainBreakdown = await Promise.all(chainAssetsPromises)
      
      // Combine all assets
      const allAssets: WalletAsset[] = []
      chainBreakdown.forEach(chain => {
        allAssets.push(...chain.tokens)
        if (chain.nativeAsset) {
          allAssets.push(chain.nativeAsset)
        }
      })

      // Sort assets by value
      allAssets.sort((a, b) => b.value - a.value)

      // Calculate total portfolio value
      const totalValue = allAssets.reduce((sum, asset) => sum + asset.value, 0)

      // Add portfolio percentage to each asset
      allAssets.forEach(asset => {
        asset.percentageOfPortfolio = totalValue > 0 ? (asset.value / totalValue) * 100 : 0
      })

      // Calculate weighted average daily change
      const totalWeightedChange = allAssets.reduce((sum, asset) => {
        const weight = asset.value / totalValue || 0
        return sum + (asset.change24h * weight)
      }, 0)

      const dailyChangePercentage = totalWeightedChange
      const dailyChange = totalValue * (dailyChangePercentage / 100)

      // Mock weekly/monthly changes (in production, store historical data)
      const weeklyChangePercentage = dailyChangePercentage * 3.5
      const weeklyChange = totalValue * (weeklyChangePercentage / 100)
      
      const monthlyChangePercentage = dailyChangePercentage * 12
      const monthlyChange = totalValue * (monthlyChangePercentage / 100)

      const portfolioData = {
        totalValue,
        dailyChange,
        dailyChangePercentage,
        weeklyChange,
        weeklyChangePercentage,
        monthlyChange,
        monthlyChangePercentage,
        assets: allAssets,
        chainBreakdown: chainBreakdown.filter(chain => chain.totalValue > 0),
        lastUpdated: new Date().toISOString(),
        supportedChains: chainKeys.map(key => CHAIN_APIS[key as keyof typeof CHAIN_APIS].name)
      }

      // Cache the result
      this.portfolioCache.set(cacheKey, {
        data: portfolioData,
        timestamp: Date.now()
      })

      console.log('✅ Portfolio data fetched and cached successfully')
      return portfolioData
    } catch (error) {
      console.error('Error fetching multichain portfolio:', error)
      
      return {
        totalValue: 0,
        dailyChange: 0,
        dailyChangePercentage: 0,
        weeklyChange: 0,
        weeklyChangePercentage: 0,
        monthlyChange: 0,
        monthlyChangePercentage: 0,
        assets: [],
        chainBreakdown: [],
        lastUpdated: new Date().toISOString(),
        supportedChains: []
      }
    }
  }

  // Clear cache to force fresh data fetch
  clearCache(): void {
    console.log('🗑️  Clearing all caches')
    this.priceCache.clear()
    this.portfolioCache.clear()
  }

  // Clear only portfolio cache (keep price cache for performance)
  clearPortfolioCache(): void {
    console.log('🗑️  Clearing portfolio cache')
    this.portfolioCache.clear()
  }
}

export const multichainWalletService = new MultichainWalletService()

// Legacy export for backward compatibility
export const walletService = {
  getWalletPortfolio: (walletAddress?: string) => 
    multichainWalletService.getMultichainPortfolio(walletAddress)
}

// Helper functions for explorer URLs
export function getExplorerAddressUrl(address: string, chain: string = 'ethereum'): string {
  const config = CHAIN_APIS[chain as keyof typeof CHAIN_APIS]
  if (!config) {
    return `https://etherscan.io/address/${address}`
  }
  return `${config.explorerUrl}/address/${address}`
}

export function getExplorerTokenUrl(contractAddress: string, chain: string = 'ethereum'): string {
  const config = CHAIN_APIS[chain as keyof typeof CHAIN_APIS]
  if (!config) {
    return `https://etherscan.io/token/${contractAddress}`
  }
  return `${config.explorerUrl}/token/${contractAddress}`
}

// Legacy functions for backward compatibility
export function getBlockscanAddressUrl(address: string): string {
  return getExplorerAddressUrl(address, 'ethereum')
}

export function getBlockscanTokenUrl(contractAddress: string, chain?: string): string {
  return getExplorerTokenUrl(contractAddress, chain || 'ethereum')
}
