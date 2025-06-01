'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { usePoolBasicStore } from '@/store/poolBasicStore'
import { useAlgoMetrics, formatAsPercentage } from '@/utils/algometrics'

interface Pool {
  id: string
  symbol: string
  project: string
  chain: string
  apy: number
  mu: number
  sigma: number
}

export const DashboardContent = () => {
  const router = useRouter()
  const { setSelectedPoolId } = usePoolBasicStore()
  const { pools, fetchPools, isLoading, error } = useAlgoMetrics()
  const [processedPools, setProcessedPools] = useState<Pool[]>([])

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  useEffect(() => {
    if (!pools || pools.length === 0) return
    setProcessedPools(pools)
  }, [pools])

  const handlePoolClick = useCallback((poolId: string) => {
    setSelectedPoolId(poolId)
    router.push(`/pool/${poolId}`)
  }, [setSelectedPoolId, router])

  const tableContent = useMemo(() => (
    <tbody className="bg-white divide-y divide-gray-200">
      {processedPools.map((pool) => (
        <tr
          key={pool.id}
          className="hover:bg-gray-50 cursor-pointer"
          onClick={() => handlePoolClick(pool.id)}
        >
          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[120px] truncate">
            {pool.symbol}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[120px] truncate">
            {pool.project}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[80px] truncate">
            {pool.chain}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right max-w-[60px]">
            {formatAsPercentage(pool.apy / 100)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right max-w-[80px]">
            {formatAsPercentage(pool.mu / 100)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right max-w-[80px]">
            {formatAsPercentage(pool.sigma / 100)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right max-w-[80px]">
            {(pool.mu / pool.sigma).toFixed(2)}
          </td>
        </tr>
      ))}
    </tbody>
  ), [processedPools, handlePoolClick])

  if (error) return <div>Failed to load data</div>
  if (isLoading || !pools) return (
    <div className="flex items-center justify-center min-h-[400px] text-gray-500">
      Loading...
    </div>
  )

  return (
    <div className="overflow-x-auto flex justify-center">
      <table className="w-[1000px] divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[120px]">
              Token
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[120px]">
              Project
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px]">
              Chain
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[60px]">
              APY
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px]">
              Avg Return
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px]">
              Volatility
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px]">
              Sharpe Ratio
            </th>
          </tr>
        </thead>
        {tableContent}
      </table>
    </div>
  )
}
