import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const vs_currency = searchParams.get('vs_currency') || 'usd'
  const per_page = searchParams.get('per_page') || '50'
  const order = searchParams.get('order') || 'market_cap_desc'
  const sparkline = searchParams.get('sparkline') || 'false'
  const price_change_percentage = searchParams.get('price_change_percentage') || '1h,24h,7d'

  // Check cache first
  const cacheKey = `market-${vs_currency}-${order}-${per_page}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🚀 Returning cached market data')
    return NextResponse.json(cached.data)
  }

  try {
    const apiKey = process.env.COINGECKO_API_KEY
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Blockchain Club Portfolio App',
    }
    
    // Add API key - free tier from .env.local
    if (apiKey) {
      headers['x-cg-pro-api-key'] = apiKey
      console.log('🔑 Using CoinGecko API key (free tier) for market data (coins + global)')
    } else {
      console.warn('⚠️ No CoinGecko API key found in environment variables - using anonymous requests')
    }

    // Fetch both coins market data and global data in parallel
    const [coinsResponse, globalResponse] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=1&sparkline=${sparkline}&price_change_percentage=${price_change_percentage}`,
        {
          headers,
          next: { revalidate: 60 }, // Cache for 1 minute
        }
      ),
      fetch(
        'https://api.coingecko.com/api/v3/global',
        {
          headers,
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      )
    ])

    // Handle coins data with fallback
    let coinsData = []
    if (coinsResponse.ok) {
      coinsData = await coinsResponse.json()
      console.log('✅ Coins data loaded successfully')
    } else if (coinsResponse.status === 429) {
      console.warn('⚠️ Coins API rate limited, using fallback data')
      coinsData = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 67500,
          price_change_percentage_24h: 2.5,
          total_volume: 15000000000,
          market_cap: 1320000000000,
          market_cap_rank: 1,
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
          id: 'ethereum', 
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3980,
          price_change_percentage_24h: -0.8,
          total_volume: 8500000000,
          market_cap: 478000000000,
          market_cap_rank: 2,
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        }
      ]
    } else {
      return NextResponse.json({ error: `CoinGecko coins API error: ${coinsResponse.status}` }, { status: coinsResponse.status });
    }
    
    // Handle global data with fallback
    let globalData = {
      total_market_cap: { usd: 2400000000000 },
      total_volume: { usd: 89000000000 },
      market_cap_percentage: { btc: 55.2, eth: 18.5 },
      market_cap_change_percentage_24h_usd: 1.2
    }
    
    if (globalResponse.ok) {
      const globalJson = await globalResponse.json()
      globalData = globalJson.data || globalJson
      console.log('✅ Global data loaded successfully')
    } else if (globalResponse.status === 429) {
      console.warn('⚠️ Global API rate limited, using fallback data')
    } else {
      console.warn(`⚠️ Global API error ${globalResponse.status}, using fallback data`)
    }
    
    // Combine the data in the format expected by the widget
    const combinedData = {
      coins: coinsData,
      global: globalData
    }

    // Cache the successful response
    cache.set(cacheKey, { data: combinedData, timestamp: Date.now() })

    return NextResponse.json(combinedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching market data:', error)
    
    // Return comprehensive fallback data
    const fallbackData = {
      coins: [
        {
          id: 'bitcoin',
          symbol: 'btc', 
          name: 'Bitcoin',
          current_price: 67500,
          price_change_percentage_24h: 2.5,
          total_volume: 15000000000,
          market_cap: 1320000000000,
          market_cap_rank: 1,
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum', 
          current_price: 3980,
          price_change_percentage_24h: -0.8,
          total_volume: 8500000000,
          market_cap: 478000000000,
          market_cap_rank: 2,
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        }
      ],
      global: {
        total_market_cap: { usd: 2400000000000 },
        total_volume: { usd: 89000000000 },
        market_cap_percentage: { btc: 55.2, eth: 18.5 },
        market_cap_change_percentage_24h_usd: 1.2
      }
    }
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  }
}
