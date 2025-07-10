import { useState, useEffect, useCallback } from 'react'
import { multichainWalletService, WalletPortfolio, MULTISIG_WALLET } from '@/lib/multichain-wallet-service'

export interface UseWalletPortfolioReturn {
  portfolio: WalletPortfolio | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

export function useWalletPortfolio(
  walletAddress: string = MULTISIG_WALLET,
  autoRefresh: boolean = false, // Changed to false by default
  refreshInterval: number = 300000 // 5 minutes instead of 30 seconds
): UseWalletPortfolioReturn {
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPortfolio = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const portfolioData = await multichainWalletService.getMultichainPortfolio(walletAddress)
      setPortfolio(portfolioData)
      setLastUpdated(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio data'
      setError(errorMessage)
      console.error('Error fetching wallet portfolio:', err)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  // Initial fetch
  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchPortfolio()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchPortfolio])

  const refetch = useCallback(async () => {
    await fetchPortfolio()
  }, [fetchPortfolio])

  return {
    portfolio,
    isLoading,
    error,
    refetch,
    lastUpdated
  }
}
