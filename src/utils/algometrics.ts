import { useAlgoMetricsStore } from '@/store/algometricsStore'

/**
 * Format decimal number as percentage string
 * @param value Decimal number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatAsPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Hook for accessing algorithm metrics
 */
export const useAlgoMetrics = () => {
  const store = useAlgoMetricsStore();

  return {
    pools: store.pools,
    protocolData: store.protocolData,
    isLoading: store.isLoading,
    error: store.error,
    fetchPools: store.fetchPools,
    fetchProtocolData: store.fetchProtocolData,
  };
}; 