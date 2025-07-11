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

    // Fetch both normal transactions and token transfers in parallel
    const txUrl = `${config.apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${limit}&sort=desc&apikey=${config.apiKey}`
    const tokenTxUrl = `${config.apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${limit}&sort=desc&apikey=${config.apiKey}`
    
    const [txResponse, tokenTxResponse] = await Promise.all([
      fetch(txUrl),
      fetch(tokenTxUrl)
    ])
    
    const [txData, tokenTxData] = await Promise.all([
      txResponse.json(),
      tokenTxResponse.json()
    ])

    console.log(`📊 ${config.name} API response:`, {
      normalTxStatus: txData.status,
      normalTxCount: txData.result?.length || 0,
      tokenTxStatus: tokenTxData.status, 
      tokenTxCount: tokenTxData.result?.length || 0
    })

    // Combine both types of transactions
    const allTransactions = []
    
    // Add normal transactions (ETH, POL, BNB transfers)
    if (txData.status === '1' && txData.result?.length > 0) {
      // Process normal transactions and ensure status is properly set
      const processedTx = txData.result.map((tx: any) => ({
        ...tx,
        // Ensure status is available for status parsing
        txreceipt_status: tx.txreceipt_status || (tx.isError === '0' ? '1' : '0')
      }))
      allTransactions.push(...processedTx)
    }
    
    // Add token transfers (USDC, WBTC, etc.)
    if (tokenTxData.status === '1' && tokenTxData.result?.length > 0) {
      // Mark token transfers with a flag to distinguish them and ensure status
      const tokenTransfers = tokenTxData.result.map((tx: any) => ({
        ...tx,
        isTokenTransfer: true,
        // Token transfers typically don't have txreceipt_status, so derive from isError
        txreceipt_status: tx.txreceipt_status || (tx.isError === '0' ? '1' : '0')
      }))
      allTransactions.push(...tokenTransfers)
    }

    // Sort combined transactions by timestamp (newest first)
    allTransactions.sort((a: any, b: any) => parseInt(b.timeStamp) - parseInt(a.timeStamp))

    // Apply limit to combined results
    const limitedTransactions = allTransactions.slice(0, limit)

    return NextResponse.json({
      result: limitedTransactions,
      status: '1',
      message: `OK (${txData.result?.length || 0} normal + ${tokenTxData.result?.length || 0} token transactions)`
    })

  } catch (error) {
    console.error('❌ Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
