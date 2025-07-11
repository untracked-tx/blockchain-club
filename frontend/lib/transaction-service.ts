export interface Transaction {
  hash: string
  chainName: string
  status: 'Success' | 'Failed' | 'Pending'
  action: string
  token: string
  value: string
  from: string
  fromInfo: string
  to: string
  toInfo: string
  timestamp: number
  blockNumber: number
  gasUsed?: string
  gasPrice?: string
}

export interface TransactionResponse {
  transactions: Transaction[]
  total: number
  hasMore: boolean
}

// Chain configurations for blockchain explorer APIs
const CHAIN_CONFIGS = {
  ethereum: {
    name: 'Ethereum',
    chainId: '1',
    apiUrl: 'https://api.etherscan.io/api',
    explorerUrl: 'https://etherscan.io',
    apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY
  },
  polygon: {
    name: 'Polygon',
    chainId: '137',
    apiUrl: 'https://api.polygonscan.com/api',
    explorerUrl: 'https://polygonscan.com',
    apiKey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY
  },
  bsc: {
    name: 'BSC',
    chainId: '56',
    apiUrl: 'https://api.bscscan.com/api',
    explorerUrl: 'https://bscscan.com',
    apiKey: process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || process.env.BSCSCAN_API_KEY
  }
}

export class TransactionService {
  private static instance: TransactionService
  
  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService()
    }
    return TransactionService.instance
  }

  async getTransactionsForAddress(
    address: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<TransactionResponse> {
    const allTransactions: Transaction[] = []
    
    // Fetch transactions from multiple chains in parallel
    const chainPromises = Object.entries(CHAIN_CONFIGS).map(async ([chainKey, config]) => {
      try {
        console.log(`🔍 Fetching ${config.name} transactions for ${address}`)
        
        const response = await fetch(
          `/api/transactions?chain=${chainKey}&address=${address}&limit=${limit}&offset=${offset}`
        )
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${config.name} transactions:`, response.status)
          return []
        }
        
        const data = await response.json()
        
        if (data.status !== '1' || !data.result) {
          console.warn(`No transactions found for ${config.name}`)
          return []
        }
        
        return this.parseTransactions(data.result || [], config.name)
      } catch (error) {
        console.warn(`Error fetching ${config.name} transactions:`, error)
        return []
      }
    })

    const chainResults = await Promise.all(chainPromises)
    chainResults.forEach(transactions => allTransactions.push(...transactions))

    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => b.timestamp - a.timestamp)

    return {
      transactions: allTransactions.slice(0, limit),
      total: allTransactions.length,
      hasMore: allTransactions.length >= limit
    }
  }

  private parseTransactions(transactions: any[], chainName: string): Transaction[] {
    return transactions.map((tx: any) => ({
      hash: tx.hash,
      chainName,
      status: this.parseTransactionStatus(tx.txreceipt_status || tx.isError || '1'),
      action: this.determineAction(tx),
      token: this.determineToken(tx, chainName),
      value: this.formatTransactionValue(tx),
      from: tx.from,
      fromInfo: this.getAddressInfo(tx.from),
      to: tx.to,
      toInfo: this.getAddressInfo(tx.to),
      timestamp: parseInt(tx.timeStamp) * 1000,
      blockNumber: parseInt(tx.blockNumber),
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    }))
  }

  private parseTransactionStatus(status: string | number): 'Success' | 'Failed' | 'Pending' {
    // For Etherscan API:
    // - txreceipt_status: '1' = success, '0' = failed, '' or undefined = pending
    // - isError: '0' = success, '1' = failed
    
    // Convert to string for consistent comparison
    const statusStr = String(status).toLowerCase()
    
    // Handle explicit success indicators
    if (statusStr === '1' || statusStr === 'success' || statusStr === 'true') {
      return 'Success'
    }
    
    // Handle explicit failure indicators
    if (statusStr === '0' || statusStr === 'failed' || statusStr === 'false') {
      return 'Failed'
    }
    
    // Handle pending states
    if (statusStr === 'pending' || statusStr === '') {
      return 'Pending'
    }
    
    // Default to success for most completed transactions in blockchain explorers
    // (Most APIs only return completed transactions unless specifically querying pending)
    return 'Success'
  }

  private determineAction(tx: any): string {
    // Check if this is explicitly marked as a token transfer
    if (tx.isTokenTransfer === true || tx.tokenSymbol) {
      return 'Token Transfer'
    }
    
    // Check for contract interaction
    if (tx.input && tx.input !== '0x' && tx.input.length > 2) {
      // Contract interaction with data
      if (tx.methodId) {
        return tx.methodId
      }
      return 'Contract Call'
    }
    
    // Check if value is 0 (might be a contract call without ETH transfer)
    if (tx.value === '0' || !tx.value) {
      return 'Contract Call'
    }
    
    // Default to Transfer for native token movements
    return 'Transfer'
  }

  private formatTransactionValue(tx: any): string {
    // For token transfers, use the token amount
    if (tx.isTokenTransfer || tx.tokenSymbol) {
      return tx.value || '0'
    }
    // For regular transactions, use the ETH/native token value
    return tx.value || '0'
  }

  private determineToken(tx: any, chainName: string): string {
    // For explicit token transfers, use the token symbol first
    if (tx.tokenSymbol) {
      return tx.tokenSymbol
    }
    
    // For token transfers marked with isTokenTransfer flag
    if (tx.isTokenTransfer === true) {
      if (tx.tokenName) {
        return tx.tokenName
      }
      if (tx.contractAddress) {
        return `Token (${tx.contractAddress.slice(0, 8)}...)`
      }
    }
    
    // For regular transactions, check if there's value being transferred
    if (tx.value && tx.value !== '0' && tx.value !== 0) {
      // Native token transfer
      switch (chainName.toLowerCase()) {
        case 'ethereum': return 'ETH'
        case 'polygon': return 'POL' // Updated to POL (was MATIC)
        case 'bsc': return 'BNB'
        case 'arbitrum': return 'ETH'
        case 'optimism': return 'ETH'
        default: return 'ETH'
      }
    }
    
    // For contract calls with no value transfer
    return 'Contract'
  }

  private getAddressInfo(address: string): string {
    // Known contract addresses mapping
    const knownAddresses: { [key: string]: string } = {
      '0xda30c053156e690176574daee79ceb94e3c8f0cc': 'Address',
      '0x4e1dcf7ad4e460cfd30791ccc4f9c8a4f820ec67': 'Safe: Proxy Factory 1.4.1',
      // Add more known addresses as needed
    }
    
    return knownAddresses[address.toLowerCase()] || 'Address'
  }

  // Generate CSV export data
  generateCSV(transactions: Transaction[]): string {
    const headers = [
      'Chain Name',
      'Hash', 
      'Status',
      'Action',
      'Token',
      'Value',
      'From',
      'From Info',
      'To',
      'To Info'
    ]
    
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.chainName,
        tx.hash,
        tx.status,
        tx.action,
        tx.token,
        tx.value,
        tx.from,
        tx.fromInfo,
        tx.to,
        tx.toInfo
      ].join(','))
    ].join('\n')
    
    return csvContent
  }

  // Download CSV file
  downloadCSV(transactions: Transaction[], filename: string = 'treasury-transactions.csv'): void {
    const csvContent = this.generateCSV(transactions)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}

export const transactionService = TransactionService.getInstance()
