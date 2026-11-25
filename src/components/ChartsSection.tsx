"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactINR, formatINR } from "@/lib/formatINR";
import type { AssetItem, EarningEntry, ZakaatEntry } from "@/types/mizan";

interface ChartsSectionProps {
  assets: AssetItem[];
  zakaatEntries: ZakaatEntry[];
  earningEntries: EarningEntry[];
}

const BUCKET_COLORS: Record<string, string> = {
  Savings: "#10B981",
  Investments: "#D4AF37",
  "Gold & Silver": "#F59E0B",
  "Real Estate": "#38BDF8",
  "Business Equity": "#A78BFA",
};

export function ChartsSection({
  assets,
  zakaatEntries,
  earningEntries,
}: ChartsSectionProps) {
  // Aggregate portfolio by bucket
  const bucketTotals = assets.reduce<Record<string, number>>((acc, item) => {
    acc[item.bucket] = (acc[item.bucket] || 0) + item.currentValue;
    return acc;
  }, {});

  const pieData = Object.entries(bucketTotals)
    .filter(([, val]) => val > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: BUCKET_COLORS[name] || "#D4AF37",
    }));

  // Build monthly trajectory from earnings & zakaat entries
  const monthMap = new Map<
    string,
    { month: string; earnings: number; zakaat: number }
  >();

  const ensureMonth = (isoDate: string) => {
    const ym = isoDate.slice(0, 7);
    if (!monthMap.has(ym)) {
      const d = new Date(`${ym}-01`);
      const label = Number.isNaN(d.getTime())
        ? ym
        : d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      monthMap.set(ym, { month: label, earnings: 0, zakaat: 0 });
    }
    return monthMap.get(ym)!;
  };

  for (const e of earningEntries) {
    ensureMonth(e.date).earnings += e.amount;
  }
  for (const z of zakaatEntries) {
    ensureMonth(z.date).zakaat += z.amount;
  }

  const areaData = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Portfolio Allocation Donut */}
      <div className="mizan-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
              Portfolio Allocation
            </h3>
            <p className="text-xs text-[#94A8A0]">
              Asset distribution across Halal buckets
            </p>
          </div>
        </div>

        {pieData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-sm text-[#94A8A0]">
            Add assets in Wealth &amp; Portfolio to view allocation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="#060D0B"
                    strokeWidth={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatINR(Number(value ?? 0))}
                    contentStyle={{
                      backgroundColor: "#0B1A16",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      borderRadius: "0.75rem",
                      color: "#F4F1EA",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#F4F1EA] truncate">{item.name}</span>
                  </div>
                  <span className="tabular-nums-mono text-[#D4AF37] font-medium">
                    {formatCompactINR(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cashflow & Zakaat Trajectory */}
      <div className="mizan-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
              Earnings &amp; Zakaat Flow
            </h3>
            <p className="text-xs text-[#94A8A0]">
              Monthly income vs. charity trajectory
            </p>
          </div>
        </div>

        {areaData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-sm text-[#94A8A0]">
            Log earnings or Zakaat entries to see monthly trends.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="zakGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(212,175,55,0.08)"
                />
                <XAxis
                  dataKey="month"
                  stroke="#94A8A0"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94A8A0"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => formatCompactINR(Number(v))}
                  width={68}
                />
                <Tooltip
                  formatter={(value) => formatINR(Number(value ?? 0))}
                  contentStyle={{
                    backgroundColor: "#0B1A16",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    borderRadius: "0.75rem",
                    color: "#F4F1EA",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#earnGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="zakaat"
                  name="Zakaat / Sadaqah"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fill="url(#zakGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
