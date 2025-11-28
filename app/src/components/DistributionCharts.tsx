"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface ChartData {
  dataDeficientHistogram: { bins: { occurrenceCount: number; count: number }[]; total: number };
  categoryPieChart: { name: string; value: number; color: string }[];
  totalSpecies: number;
}

export default function DistributionCharts() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch("/api/charts");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      }
      setLoading(false);
    }
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
        <div className="h-96 flex items-center justify-center text-zinc-500">
          Loading charts...
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
        Distribution Visualizations
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div>
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Species by Occurrence Count
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.categoryPieChart}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {data.categoryPieChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "Species"]}
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Species Histogram (≤100 occurrences) */}
        <div>
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Species with ≤100 Occurrences (n={formatNumber(data.dataDeficientHistogram.total)})
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dataDeficientHistogram.bins}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="occurrenceCount"
                tick={{ fontSize: 10 }}
                className="text-zinc-500"
                label={{ value: "Occurrence Count", position: "insideBottom", offset: -5, fontSize: 11 }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                className="text-zinc-500"
                label={{ value: "Number of Species", angle: -90, position: "insideLeft", fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "Species"]}
                labelFormatter={(label) => `${label} occurrences`}
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
