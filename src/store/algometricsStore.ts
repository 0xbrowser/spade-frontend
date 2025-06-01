import { create } from 'zustand'

interface Pool {
  id: string
  symbol: string
  project: string
  chain: string
  apy: number
  mu: number
  sigma: number
}

interface Raise {
  date: number
  amount: number
  round: string
  investors: string[]
}

interface ProtocolData {
  tvl: number
  listedAt: number
  audits: number
  hallmarks: string[]
  raises: Raise[]
  mcap: number
}

interface AlgoMetricsState {
  pools: Pool[]
  protocolData: Record<string, ProtocolData>
  isLoading: boolean
  error: string | null
  fetchPools: () => Promise<void>
  fetchProtocolData: (project: string) => Promise<void>
  updatePoolMetrics: (poolId: string, metrics: { volatility: number; sharpeRatio: number }) => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const useAlgoMetricsStore = create<AlgoMetricsState>((set, get) => ({
  pools: [],
  protocolData: {},
  isLoading: false,
  error: null,

  fetchPools: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetcher('https://yields.llama.fi/pools')
      const pools = response.data.map((pool: any) => ({
        ...pool,
        id: pool.pool,
      }))
      set({ pools, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch pools data', isLoading: false })
    }
  },

  fetchProtocolData: async (project: string) => {
    if (get().protocolData[project]) return // Already fetched

    set({ isLoading: true, error: null })
    try {
      const data = await fetcher(`https://api.llama.fi/protocol/${project}`)
      set((state) => ({
        protocolData: { ...state.protocolData, [project]: data },
        isLoading: false,
      }))
    } catch {
      set({ error: 'Failed to fetch protocol data', isLoading: false })
    }
  },

  updatePoolMetrics: (poolId: string, metrics: { volatility: number; sharpeRatio: number }) => {
    set((state) => ({
      pools: state.pools.map((pool) =>
        pool.id === poolId
          ? { ...pool, volatility: metrics.volatility, sharpeRatio: metrics.sharpeRatio }
          : pool
      ),
    }))
  },
})) 