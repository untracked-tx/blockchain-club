import { NextRequest, NextResponse } from 'next/server'

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
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain') || 'ethereum'
    const address = searchParams.get('address')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const config = CHAIN_CONFIGS[chain as keyof typeof CHAIN_CONFIGS]
    if (!config) {
      return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 })
    }

    const page = Math.floor(offset / limit) + 1

    console.log(`🔍 Fetching ${config.name} transactions for ${address}`)

    // Fetch normal transactions
    const txUrl = `${config.apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${limit}&sort=desc&apikey=${config.apiKey}`
    
    const txResponse = await fetch(txUrl)
    const txData = await txResponse.json()

    console.log(`📊 ${config.name} API response:`, {
      status: txData.status,
      message: txData.message,
      resultCount: txData.result?.length || 0
    })

    // If main transactions failed, try token transfers
    if (txData.status !== '1' || !txData.result || txData.result.length === 0) {
      console.log(`🔄 Trying token transfers for ${config.name}`)
      
      const tokenTxUrl = `${config.apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${limit}&sort=desc&apikey=${config.apiKey}`
      
      const tokenTxResponse = await fetch(tokenTxUrl)
      const tokenTxData = await tokenTxResponse.json()

      if (tokenTxData.status === '1' && tokenTxData.result?.length > 0) {
        return NextResponse.json({
          result: tokenTxData.result,
          status: '1',
          message: 'OK (Token transactions)'
        })
      }
    }

    return NextResponse.json({
      result: txData.result || [],
      status: txData.status || '1',
      message: txData.message || 'OK'
    })

  } catch (error) {
    console.error('❌ Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
