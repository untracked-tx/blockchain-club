import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🎯 Fetching Fear & Greed Index from CoinMarketCap')
    
    const apiKey = process.env.COINMARKETCAP_API_KEY
    if (!apiKey || apiKey === 'your_coinmarketcap_api_key_here') {
      console.log('⚠️ CoinMarketCap API key not configured, falling back to alternative.me')
      return fetchAlternativeAPI()
    }

    try {
      const response = await fetch('https://pro-api.coinmarketcap.com/v3/fear-and-greed/historical?limit=1', {
        headers: {
          'Accept': 'application/json',
          'X-CMC_PRO_API_KEY': apiKey,
          'User-Agent': 'Blockchain Club Portfolio App',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      })

      if (!response.ok) {
        console.error('❌ CoinMarketCap API error:', response.status)
        console.log('🔄 Falling back to alternative.me')
        return fetchAlternativeAPI()
      }

      const data = await response.json()
      
      if (data.status?.error_code !== 0) {
        console.error('❌ CoinMarketCap API error:', data.status?.error_message)
        console.log('🔄 Falling back to alternative.me')
        return fetchAlternativeAPI()
      }

      console.log('✅ CMC Fear & Greed Index fetched successfully:', data.data?.[0]?.value_classification)
      
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      })
    } catch (cmcError) {
      console.error('❌ CoinMarketCap fetch failed:', cmcError)
      console.log('🔄 Falling back to alternative.me')
      return fetchAlternativeAPI()
    }
  } catch (error) {
    console.error('❌ Error fetching Fear & Greed Index:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Fear & Greed Index' },
      { status: 500 }
    )
  }
}

// Fallback function for alternative.me API
async function fetchAlternativeAPI() {
  try {
    const response = await fetch('https://api.alternative.me/fng/', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Blockchain Club Portfolio App',
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Alternative API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Alternative.me Fear & Greed Index fetched successfully:', data.data[0]?.value_classification)
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('❌ Alternative.me fallback failed:', error)
    return NextResponse.json(
      { error: 'All Fear & Greed APIs failed' },
      { status: 500 }
    )
  }
}
