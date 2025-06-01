"use client";

import { useEffect, useState } from "react";
import { usePoolBasicStore } from "@/store/poolBasicStore";
import { useAlgoMetrics, formatAsPercentage } from "@/utils/algometrics";
import { LuArrowLeft } from "react-icons/lu";

interface PoolMetrics {
  apy: number;
  mu: number;
  sigma: number;
  symbol: string;
  project: string;
  chain: string;
}

export const DataDetailsContent = () => {
  const { selectedPoolId } = usePoolBasicStore();
  const { pools, protocolData, fetchProtocolData, error } = useAlgoMetrics();
  const [poolMetrics, setPoolMetrics] = useState<PoolMetrics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedPoolId) {
        const pool = pools.find(p => p.id === selectedPoolId);
        if (!pool) return;

        setPoolMetrics({
          apy: pool.apy,
          mu: pool.mu,
          sigma: pool.sigma,
          symbol: pool.symbol,
          project: pool.project,
          chain: pool.chain
        });
        fetchProtocolData(pool.project);
      }
    };
    fetchData();
  }, [selectedPoolId, fetchProtocolData, pools]);

  if (!selectedPoolId)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-600">
        Loading...
      </div>
    );
  if (error) return <div className="text-gray-600">Failed to load data</div>;
  if (!poolMetrics) return <div className="text-gray-600">Pool data not found</div>;

  const protocolMetrics = poolMetrics ? protocolData[poolMetrics.project] : null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6 hover:bg-gray-100 rounded-lg w-9 h-9 justify-center cursor-pointer">
        <LuArrowLeft 
          className="w-4 h-4 text-gray-900" 
          onClick={() => window.history.back()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Basic Information</h2>
            <div className="space-y-2 text-gray-800">
              <p>
                <span className="font-medium">Chain:</span> {poolMetrics.chain}
              </p>
              <p>
                <span className="font-medium">APY:</span>{" "}
                {formatAsPercentage(poolMetrics.apy / 100)}
              </p>
              <p>
                <span className="font-medium">Average Return:</span>{" "}
                {formatAsPercentage(poolMetrics.mu / 100)}
              </p>
              <p>
                <span className="font-medium">Volatility:</span>{" "}
                {formatAsPercentage(poolMetrics.sigma / 100)}
              </p>
              <p>
                <span className="font-medium">Sharpe Ratio:</span>{" "}
                {(poolMetrics.mu / poolMetrics.sigma).toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Protocol Details</h2>
            <div className="space-y-2 text-gray-800">
              <p>
                <span className="font-medium">TVL:</span>{" "}
                {protocolMetrics?.tvl
                  ? `$${(protocolMetrics.tvl / 1e9).toFixed(2)}B`
                  : "N/A"}
              </p>
              <p>
                <span className="font-medium">Listed At:</span>{" "}
                {protocolMetrics?.listedAt
                  ? new Date(protocolMetrics.listedAt * 1000).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <span className="font-medium">Audits:</span>{" "}
                {protocolMetrics?.audits || "N/A"}
              </p>
              <p>
                <span className="font-medium">Hallmarks:</span>{" "}
                {protocolMetrics?.hallmarks?.length || 0}
              </p>
              <p>
                <span className="font-medium">Raises:</span>{" "}
                {protocolMetrics?.raises?.length || 0}
              </p>
              <p>
                <span className="font-medium">Market Cap:</span>{" "}
                {protocolMetrics?.mcap
                  ? `$${(protocolMetrics.mcap / 1e9).toFixed(2)}B`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Hallmarks</h2>
          {protocolMetrics?.hallmarks && protocolMetrics.hallmarks.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-gray-800">
              {protocolMetrics.hallmarks.map((hallmark: string, index: number) => (
                <li key={index}>
                  {hallmark}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No hallmarks available</p>
          )}
        </div>
      </div>
    </div>
  );
};
