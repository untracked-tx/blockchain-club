import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID parameter is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Blockchain Club Portfolio App',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const coinData = await response.json()
    
    // Convert to standardized format
    const formattedCoin = {
      id: coinData.id,
      symbol: coinData.symbol,
      name: coinData.name,
      current_price: coinData.market_data?.current_price?.usd || 0,
      price_change_percentage_24h: coinData.market_data?.price_change_percentage_24h || 0,
      total_volume: coinData.market_data?.total_volume?.usd || 0,
      market_cap: coinData.market_data?.market_cap?.usd || 0,
      market_cap_rank: coinData.market_cap_rank || 999,
      image: coinData.image?.large || coinData.image?.small || coinData.image?.thumb
    }
    
    return NextResponse.json(formattedCoin, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching coin details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coin details' },
      { status: 500 }
    )
  }
}
