"use client";

import { useEffect, useState } from "react";
import { usePoolBasicStore } from "@/store/poolBasicStore";
import { useAlgoMetrics, formatAsPercentage } from "@/utils/algometrics";
import { LuArrowLeft } from "react-icons/lu";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from "recharts";
import { AlertCircle } from "lucide-react";

interface PoolMetrics {
  apy: number;
  mu: number;
  sigma: number;
  symbol: string;
  project: string;
  chain: string;
}

interface PoolHistoryData {
  timestamp: number;
  apy?: number;
  tvlUsd?: number;
  [key: string]: any;
}

export const DataDetailsContent = () => {
  const { selectedPoolId } = usePoolBasicStore();
  const { pools, protocolData, fetchProtocolData, error } = useAlgoMetrics();
  const [poolMetrics, setPoolMetrics] = useState<PoolMetrics | null>(null);
  const [poolHistory, setPoolHistory] = useState<PoolHistoryData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 拉取基本池信息
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

  // 拉取历史曲线
  useEffect(() => {
    const fetchHistory = async () => {
      if (!poolMetrics) return;
      setLoadingHistory(true);
      setPoolHistory([]);
      try {
        // DefiLlama标准API参数格式
        const url = `https://yields.llama.fi/chart/${encodeURIComponent(
          poolMetrics.project
        )}/${encodeURIComponent(poolMetrics.chain)}/${encodeURIComponent(poolMetrics.symbol)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch pool history");
        const json = await res.json();
        setPoolHistory(json.data || []);
      } catch (e) {
        setPoolHistory([]);
      }
      setLoadingHistory(false);
    };
    if (poolMetrics) fetchHistory();
  }, [poolMetrics]);

  if (!selectedPoolId)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-600">
        Loading...
      </div>
    );
  if (error) return <div className="text-gray-600">Failed to load data</div>;
  if (!poolMetrics) return <div className="text-gray-600">Pool data not found</div>;

  const protocolMetrics = protocolData[poolMetrics.project];
  const sharpeRatio = poolMetrics.mu / poolMetrics.sigma;

  // 可视化图表数据（纯真实数据）
  const barData = [
    { name: "APY", value: poolMetrics.apy },
    { name: "Average Return", value: poolMetrics.mu },
    { name: "Volatility", value: poolMetrics.sigma }
  ];

  // 图表X轴格式化
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return `${d.getMonth() + 1}-${d.getDate()}`;
  };

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
                <span className="inline-flex items-center">
                  {sharpeRatio.toFixed(2)}
                  {sharpeRatio < 1 && (
                    <AlertCircle className="w-4 h-4 text-red-500 ml-2">
                      <title>Sharpe Ratio is low, this pool might be risky!</title>
                    </AlertCircle>
                  )}
                </span>
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

          {/* 柱状图对比 */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Key Metrics Comparison</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          {/* TVL/历史收益率曲线 */}
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Historical Trends</h2>
          {loadingHistory ? (
            <div className="text-gray-500">Loading chart...</div>
          ) : poolHistory.length === 0 ? (
            <div className="text-gray-500">No history data available for this pool.</div>
          ) : (
            <div className="space-y-8">
              {/* TVL历史曲线 */}
              <div>
                <h3 className="font-medium mb-1">TVL History</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={poolHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatDate}
                      minTickGap={30}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={v => formatDate(Number(v))}
                      formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "TVL"]}
                    />
                    <Line type="monotone" dataKey="tvlUsd" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* APY历史曲线 */}
              <div>
                <h3 className="font-medium mb-1">APY History</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={poolHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatDate}
                      minTickGap={30}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={v => formatDate(Number(v))}
                      formatter={(v: any) => [formatAsPercentage(Number(v) / 100), "APY"]}
                    />
                    <Line type="monotone" dataKey="apy" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Hallmarks部分 */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Hallmarks</h2>
            {protocolMetrics?.hallmarks && protocolMetrics.hallmarks.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-800">
                {protocolMetrics.hallmarks.map((hallmark: string, index: number) => (
                  <li key={index}>{hallmark}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No hallmarks available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
