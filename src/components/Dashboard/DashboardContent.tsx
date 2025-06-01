'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { usePoolBasicStore } from '@/store/poolBasicStore'
import { useAlgoMetrics, formatAsPercentage } from '@/utils/algometrics'
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

interface Pool {
  id: string
  symbol: string
  project: string
  chain: string
  apy: number
  mu: number
  sigma: number
}

type SortKey = keyof Pick<Pool, "symbol" | "project" | "chain" | "apy" | "mu" | "sigma">
const PAGE_SIZE = 50

export const DashboardContent = () => {
  const router = useRouter()
  const { setSelectedPoolId } = usePoolBasicStore()
  const { pools, fetchPools, isLoading, error } = useAlgoMetrics()
  const [processedPools, setProcessedPools] = useState<Pool[]>([])

  // 排序&筛选状态
  const [sortKey, setSortKey] = useState<SortKey>("apy")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchProject, setSearchProject] = useState("")
  const [searchChain, setSearchChain] = useState("")
  const [searchToken, setSearchToken] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  useEffect(() => {
    if (!pools || pools.length === 0) return
    setProcessedPools(pools)
  }, [pools])

  // 搜索或排序条件变化时，重置页码
  useEffect(() => {
    setCurrentPage(1)
  }, [searchProject, searchChain, searchToken, sortKey, sortOrder])

  const handlePoolClick = useCallback((poolId: string) => {
    setSelectedPoolId(poolId)
    router.push(`/pool/${poolId}`)
  }, [setSelectedPoolId, router])

  // 排序&筛选后内容
  const filteredAndSortedPools = useMemo(() => {
    let arr = processedPools.filter(pool => {
      const project = pool.project.toLowerCase()
      const chain = pool.chain.toLowerCase()
      const token = pool.symbol.toLowerCase()
      return (
        (!searchProject || project.includes(searchProject.toLowerCase())) &&
        (!searchChain || chain.includes(searchChain.toLowerCase())) &&
        (!searchToken || token.includes(searchToken.toLowerCase()))
      )
    })
    arr.sort((a, b) => {
      let x = a[sortKey]
      let y = b[sortKey]
      if (typeof x === 'string' && typeof y === 'string') {
        return sortOrder === 'asc'
          ? x.localeCompare(y)
          : y.localeCompare(x)
      } else if (typeof x === 'number' && typeof y === 'number') {
        return sortOrder === 'asc' ? x - y : y - x
      }
      return 0
    })
    return arr
  }, [processedPools, sortKey, sortOrder, searchProject, searchChain, searchToken])

  // 当前页数据
  const pagedPools = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredAndSortedPools.slice(start, start + PAGE_SIZE)
  }, [filteredAndSortedPools, currentPage])

  // 页码
  const pageCount = Math.ceil(filteredAndSortedPools.length / PAGE_SIZE)
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  if (error) return <div>Failed to load data</div>
  if (isLoading || !pools) return (
    <div className="flex items-center justify-center min-h-[400px] text-gray-500">
      Loading...
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col items-center py-8">
      {/* 搜索区 */}
      <div className="flex gap-4 mb-2 w-full max-w-5xl">
  <div className="flex flex-col w-1/4">
    <input
      type="text"
      placeholder="Project"
      className="p-2 border border-emerald-200 rounded bg-white focus:ring-2 focus:ring-emerald-100 w-full text-black"
      value={searchProject}
      onChange={e => setSearchProject(e.target.value)}
    />
    <span className="text-xs text-gray-400 pl-1 pt-1">筛选协议项目名称（模糊匹配）</span>
  </div>
  <div className="flex flex-col w-1/4">
    <input
      type="text"
      placeholder="Chain"
      className="p-2 border border-indigo-200 rounded bg-white focus:ring-2 focus:ring-indigo-100 w-full text-black"
      value={searchChain}
      onChange={e => setSearchChain(e.target.value)}
    />
    <span className="text-xs text-gray-400 pl-1 pt-1">筛选链名称，如ethereum等</span>
  </div>
  <div className="flex flex-col w-1/4">
    <input
      type="text"
      placeholder="Token"
      className="p-2 border border-sky-200 rounded bg-white focus:ring-2 focus:ring-sky-100 w-full text-black"
      value={searchToken}
      onChange={e => setSearchToken(e.target.value)}
    />
    <span className="text-xs text-gray-400 pl-1 pt-1">筛选Token名称（如ETH, USDC...）</span>
  </div>
</div>
      {/* 表格 */}
      <table className="w-[1000px] divide-y divide-gray-200 shadow-xl rounded-xl bg-white">
        <thead className="bg-gradient-to-r from-indigo-100 via-sky-50 to-emerald-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider max-w-[120px] cursor-pointer select-none"
              onClick={() => handleSort("symbol")}>
              Token {sortKey === "symbol" && (sortOrder === "desc" ? <LuChevronDown className="inline ml-1" /> : <LuChevronUp className="inline ml-1" />)}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider max-w-[120px] cursor-pointer select-none"
              onClick={() => handleSort("project")}>
              Project {sortKey === "project" && (sortOrder === "desc" ? <LuChevronDown className="inline ml-1" /> : <LuChevronUp className="inline ml-1" />)}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-sky-700 uppercase tracking-wider max-w-[80px] cursor-pointer select-none"
              onClick={() => handleSort("chain")}>
              Chain {sortKey === "chain" && (sortOrder === "desc" ? <LuChevronDown className="inline ml-1" /> : <LuChevronUp className="inline ml-1" />)}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider max-w-[60px] cursor-pointer select-none"
              onClick={() => handleSort("apy")}>
              APY {sortKey === "apy" && (sortOrder === "desc" ? <LuChevronDown className="inline ml-1" /> : <LuChevronUp className="inline ml-1" />)}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider max-w-[80px] cursor-pointer select-none"
              onClick={() => handleSort("mu")}>
              Avg Return {sortKey === "mu" && (sortOrder === "desc" ? <LuChevronDown className="inline ml-1" /> : <LuChevronUp className="inline ml-1" />)}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider max-w-[80px] cursor-pointer select-none"
              onClick={() => handleSort("sigma")}>
              Volatility {sortKey === "sigma" && (sortOrder === "desc" ? <LuChevronDown className="inline ml-1" /> : <LuChevronUp className="inline ml-1" />)}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider max-w-[80px]">
              Sharpe Ratio
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {pagedPools.map((pool) => (
            <tr
              key={pool.id}
              className="hover:bg-sky-50 cursor-pointer transition-colors"
              onClick={() => handlePoolClick(pool.id)}
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[120px] truncate">
                {pool.symbol}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-700 max-w-[120px] truncate">
                {pool.project}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-sky-700 max-w-[80px] truncate">
                {pool.chain}
              </td>
              <td className={
                "px-4 py-3 whitespace-nowrap text-sm text-right max-w-[60px] " +
                (pool.apy > 20 ? "text-green-600 font-semibold" : pool.apy < 0 ? "text-red-500 font-semibold" : "text-gray-700")
              }>
                {formatAsPercentage(pool.apy / 100)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right max-w-[80px]">
                {formatAsPercentage(pool.mu / 100)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right max-w-[80px]">
                {formatAsPercentage(pool.sigma / 100)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right max-w-[80px]">
                {(pool.mu / pool.sigma).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 分页器 */}
      <div className="flex items-center gap-1 mt-6 select-none flex-wrap">
        <button
          className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-500 hover:bg-gray-200"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          上一页
        </button>
        {pageNumbers.slice(Math.max(0, currentPage - 3), currentPage + 2).map((page) => (
          <button
            key={page}
            className={`px-2 py-1 rounded text-sm ${currentPage === page ? 'bg-emerald-400 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-500 hover:bg-gray-200"
          disabled={currentPage === pageCount || pageCount === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          下一页
        </button>
        <span className="ml-4 text-gray-400 text-sm">共 {filteredAndSortedPools.length} 条</span>
      </div>
    </div>
  )
}
