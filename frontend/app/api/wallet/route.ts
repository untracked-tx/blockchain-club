import { NextRequest, NextResponse } from 'next/server'

// Chain configurations for blockchain explorer APIs
const CHAIN_CONFIGS = {
  ethereum: {
    name: 'Ethereum',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
  },
  polygon: {
    name: 'Polygon',
    apiUrl: 'https://api.polygonscan.com/api',
    apiKey: process.env.POLYGONSCAN_API_KEY || 'YourApiKeyToken'
  },
  bsc: {
    name: 'BSC',
    apiUrl: 'https://api.bscscan.com/api',
    apiKey: process.env.BSCSCAN_API_KEY || 'YourApiKeyToken'
  },
  arbitrum: {
    name: 'Arbitrum',
    apiUrl: 'https://api.arbiscan.io/api',
    apiKey: process.env.ARBISCAN_API_KEY || 'YourApiKeyToken'
  },
  optimism: {
    name: 'Optimism',
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    apiKey: process.env.OPTIMISMSCAN_API_KEY || 'YourApiKeyToken'
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const chain = searchParams.get('chain') || 'ethereum'

  if (!address) {
    return NextResponse.json(
      { error: 'Missing required parameter: address' },
      { status: 400 }
    )
  }

  const config = CHAIN_CONFIGS[chain as keyof typeof CHAIN_CONFIGS]
  if (!config) {
    return NextResponse.json(
      { error: `Unsupported chain: ${chain}` },
      { status: 400 }
    )
  }

  try {
    console.log(`🔍 Fetching ${config.name} wallet data for ${address}`)

    // Get ETH/native token balance
    const balanceResponse = await fetch(
      `${config.apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${config.apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Blockchain Club Portfolio App',
        },
        next: { revalidate: 180 }, // Cache for 3 minutes
      }
    )

    // Get token transactions to discover tokens
    const tokenResponse = await fetch(
      `${config.apiUrl}?module=account&action=tokentx&address=${address}&page=1&offset=10000&sort=desc&apikey=${config.apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Blockchain Club Portfolio App',
        },
        next: { revalidate: 180 }, // Cache for 3 minutes
      }
    )

    const balanceData = await balanceResponse.json()
    const tokenData = await tokenResponse.json()

    console.log(`📊 ${config.name} API responses:`, {
      balanceStatus: balanceData.status,
      tokenStatus: tokenData.status,
      tokenCount: tokenData.result?.length || 0
    })

    // Combine the results
    const result = {
      nativeBalance: balanceData.result || '0',
      tokens: tokenData.result || [],
      chain: config.name.toLowerCase(),
      status: 'success'
    }
    
    return NextResponse.json({
      source: config.name.toLowerCase(),
      data: result,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
      },
    })

  } catch (error) {
    console.error(`❌ Error fetching ${config.name} wallet data:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${config.name} wallet data` },
      { status: 500 }
    )
  }
}
