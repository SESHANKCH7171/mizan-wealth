"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  formatCompactINR,
  formatINR,
  formatShortDate,
} from "@/lib/formatINR";
import type {
  AssetBucket,
  AssetItem,
  EarningCategory,
  EarningEntry,
  HalalStatus,
} from "@/types/mizan";

interface WealthPillarProps {
  earningEntries: EarningEntry[];
  assets: AssetItem[];
  onAddEarning: (entry: Omit<EarningEntry, "id" | "autoAllocatedSummary">) => void;
  onDeleteEarning: (id: string) => void;
  onAddAsset: (asset: Omit<AssetItem, "id" | "lastUpdated">) => void;
  onUpdateAssetValue: (id: string, newValue: number) => void;
  onDeleteAsset: (id: string) => void;
}

const EARNING_CATEGORIES: EarningCategory[] = [
  "Salary",
  "Business / Freelance",
  "Halal Dividends / Yield",
  "Rental",
  "Bonus / Gift",
  "Other",
];

const ASSET_BUCKETS: AssetBucket[] = [
  "Savings",
  "Investments",
  "Gold & Silver",
  "Real Estate",
  "Business Equity",
];

const HALAL_STATUSES: HalalStatus[] = [
  "Verified Halal",
  "Under Review",
  "Purification Needed",
];

export function WealthPillar({
  earningEntries,
  assets,
  onAddEarning,
  onDeleteEarning,
  onAddAsset,
  onUpdateAssetValue,
  onDeleteAsset,
}: WealthPillarProps) {
  const [subTab, setSubTab] = useState<"portfolio" | "earnings">("portfolio");

  // Asset form
  const [assetName, setAssetName] = useState("");
  const [assetBucket, setAssetBucket] = useState<AssetBucket>("Savings");
  const [assetCurrent, setAssetCurrent] = useState("");
  const [assetInvested, setAssetInvested] = useState("");
  const [assetHalal, setAssetHalal] = useState<HalalStatus>("Verified Halal");
  const [assetZakaatEligible, setAssetZakaatEligible] = useState(true);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Earning form
  const [earnAmount, setEarnAmount] = useState("");
  const [earnSource, setEarnSource] = useState("");
  const [earnCategory, setEarnCategory] = useState<EarningCategory>("Salary");
  const [earnDate, setEarnDate] = useState("2026-11-25");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEarnDate(new Date().toISOString().slice(0, 10));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const [earnHalal, setEarnHalal] = useState(true);
  const [earnNotes, setEarnNotes] = useState("");

  const netWorth = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalInvested = assets.reduce((s, a) => s + a.investedAmount, 0);
  const netGain = netWorth - totalInvested;
  const totalEarnings = earningEntries.reduce((s, e) => s + e.amount, 0);
  const zakaatEligibleTotal = assets
    .filter((a) => a.zakaatEligible)
    .reduce((s, a) => s + a.currentValue, 0);

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = Number(assetCurrent);
    const inv = Number(assetInvested || assetCurrent);
    if (!assetName.trim() || !curr || curr < 0) return;
    onAddAsset({
      name: assetName.trim(),
      bucket: assetBucket,
      currentValue: curr,
      investedAmount: inv,
      halalStatus: assetHalal,
      zakaatEligible: assetZakaatEligible,
    });
    setAssetName("");
    setAssetCurrent("");
    setAssetInvested("");
  };

  const handleAddEarningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(earnAmount);
    if (!amt || amt <= 0 || !earnSource.trim()) return;
    onAddEarning({
      date: earnDate,
      amount: amt,
      source: earnSource.trim(),
      category: earnCategory,
      halalVerified: earnHalal,
      notes: earnNotes.trim() || undefined,
    });
    setEarnAmount("");
    setEarnSource("");
    setEarnNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Top Wealth Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mizan-card mizan-hero-card p-4">
          <p className="text-xs text-[#94A8A0]">Total Net Worth</p>
          <p className="tabular-nums-mono text-xl sm:text-2xl font-bold text-[#F4F1EA] mt-1">
            {formatCompactINR(netWorth)}
          </p>
          <p className="text-[11px] text-[#94A8A0] tabular-nums-mono mt-0.5">
            {formatINR(netWorth)}
          </p>
        </div>

        <div className="mizan-card p-4">
          <p className="text-xs text-[#94A8A0]">Total Gain / Growth</p>
          <p
            className={`tabular-nums-mono text-xl sm:text-2xl font-bold mt-1 ${
              netGain >= 0 ? "text-[#10B981]" : "text-red-400"
            }`}
          >
            {formatCompactINR(netGain)}
          </p>
          <p className="text-[11px] text-[#94A8A0] mt-0.5">
            Cost basis: {formatCompactINR(totalInvested)}
          </p>
        </div>

        <div className="mizan-card p-4">
          <p className="text-xs text-[#94A8A0]">Zakaat-Eligible Base</p>
          <p className="tabular-nums-mono text-xl sm:text-2xl font-bold text-[#D4AF37] mt-1">
            {formatCompactINR(zakaatEligibleTotal)}
          </p>
          <p className="text-[11px] text-[#94A8A0] mt-0.5">
            2.5% due: {formatINR(zakaatEligibleTotal * 0.025)}
          </p>
        </div>

        <div className="mizan-card p-4">
          <p className="text-xs text-[#94A8A0]">Recorded Earnings</p>
          <p className="tabular-nums-mono text-xl sm:text-2xl font-bold text-[#10B981] mt-1">
            {formatCompactINR(totalEarnings)}
          </p>
          <p className="text-[11px] text-[#94A8A0] mt-0.5">
            {earningEntries.length} income entries
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-[#D4AF37]/15 pb-3">
        <button
          onClick={() => setSubTab("portfolio")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            subTab === "portfolio"
              ? "bg-[#D4AF37] text-[#060D0B]"
              : "bg-[#0B1A16] text-[#94A8A0] hover:text-[#F4F1EA] border border-[#D4AF37]/20"
          }`}
        >
          <Wallet className="w-4 h-4" />
          Assets &amp; Portfolio ({assets.length})
        </button>
        <button
          onClick={() => setSubTab("earnings")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            subTab === "earnings"
              ? "bg-[#D4AF37] text-[#060D0B]"
              : "bg-[#0B1A16] text-[#94A8A0] hover:text-[#F4F1EA] border border-[#D4AF37]/20"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Earnings &amp; Cashflow ({earningEntries.length})
        </button>
      </div>

      {subTab === "portfolio" ? (
        <div className="space-y-6">
          {/* Add Asset Form */}
          <form onSubmit={handleAddAssetSubmit} className="mizan-card p-5 space-y-4">
            <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
              Add Asset / Holding
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="text"
                required
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Asset name (e.g. Nifty Shariah ETF)"
                className="lg:col-span-2 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
              />
              <select
                value={assetBucket}
                onChange={(e) => setAssetBucket(e.target.value as AssetBucket)}
                className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
              >
                {ASSET_BUCKETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                required
                value={assetCurrent}
                onChange={(e) => setAssetCurrent(e.target.value)}
                placeholder="Current Value (₹)"
                className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="number"
                min="0"
                value={assetInvested}
                onChange={(e) => setAssetInvested(e.target.value)}
                placeholder="Invested (₹)"
                className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={assetHalal}
                  onChange={(e) => setAssetHalal(e.target.value as HalalStatus)}
                  className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-1.5 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
                >
                  {HALAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-2 text-xs text-[#F4F1EA] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assetZakaatEligible}
                    onChange={(e) => setAssetZakaatEligible(e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  Zakaat Eligible
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#060D0B] font-semibold text-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add to Portfolio
              </button>
            </div>
          </form>

          {/* Asset List */}
          <div className="mizan-card p-5">
            <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA] mb-4">
              Holdings &amp; Halal Verification
            </h3>
            {assets.length === 0 ? (
              <p className="text-sm text-[#94A8A0] py-6 text-center">
                No assets added yet.
              </p>
            ) : (
              <div className="divide-y divide-[#D4AF37]/10">
                {assets.map((asset) => {
                  const gain = asset.currentValue - asset.investedAmount;
                  const isEditing = editingAssetId === asset.id;
                  return (
                    <div
                      key={asset.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-[#F4F1EA]">
                            {asset.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                            {asset.bucket}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                              asset.halalStatus === "Verified Halal"
                                ? "bg-[#10B981]/15 text-[#10B981]"
                                : "bg-[#F59E0B]/15 text-[#F59E0B]"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {asset.halalStatus}
                          </span>
                          {asset.zakaatEligible && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#060D0B] border border-[#D4AF37]/25 text-[#94A8A0]">
                              Zakaat Eligible
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#94A8A0] mt-0.5">
                          Invested: {formatINR(asset.investedAmount)} · Gain:{" "}
                          <span
                            className={
                              gain >= 0 ? "text-[#10B981]" : "text-red-400"
                            }
                          >
                            {formatINR(gain, { showSign: true })}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="w-28 rounded-lg bg-[#060D0B] border border-[#D4AF37] px-2 py-1 text-xs text-[#F4F1EA] tabular-nums-mono"
                            />
                            <button
                              onClick={() => {
                                const val = Number(editingValue);
                                if (Number.isFinite(val) && val >= 0) {
                                  onUpdateAssetValue(asset.id, val);
                                }
                                setEditingAssetId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#10B981] text-[#060D0B] text-xs font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingAssetId(asset.id);
                              setEditingValue(String(asset.currentValue));
                            }}
                            className="tabular-nums-mono text-sm font-semibold text-[#F4F1EA] hover:text-[#D4AF37] px-2 py-1 rounded-lg hover:bg-[#112620] cursor-pointer"
                            title="Click to update current value"
                          >
                            {formatINR(asset.currentValue)}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="p-1.5 rounded-lg text-[#94A8A0] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Log Earning Form */}
          <form onSubmit={handleAddEarningSubmit} className="mizan-card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
                Log New Earning
              </h3>
              <span className="text-xs text-[#10B981]">
                Active Allocation Rules run automatically on submit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="number"
                min="1"
                required
                value={earnAmount}
                onChange={(e) => setEarnAmount(e.target.value)}
                placeholder="Amount (₹)"
                className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="text"
                required
                value={earnSource}
                onChange={(e) => setEarnSource(e.target.value)}
                placeholder="Source (e.g. Monthly Salary)"
                className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
              />
              <select
                value={earnCategory}
                onChange={(e) =>
                  setEarnCategory(e.target.value as EarningCategory)
                }
                className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
              >
                {EARNING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="date"
                required
                value={earnDate}
                onChange={(e) => setEarnDate(e.target.value)}
                className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="text"
                  value={earnNotes}
                  onChange={(e) => setEarnNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="flex-1 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
                />
                <label className="inline-flex items-center gap-2 text-xs text-[#F4F1EA] shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={earnHalal}
                    onChange={(e) => setEarnHalal(e.target.checked)}
                    className="accent-[#10B981]"
                  />
                  Halal Verified
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-[#060D0B] font-semibold text-sm transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Record Earning
              </button>
            </div>
          </form>

          {/* Earnings History */}
          <div className="mizan-card p-5">
            <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA] mb-4">
              Earnings Ledger
            </h3>
            {earningEntries.length === 0 ? (
              <p className="text-sm text-[#94A8A0] py-6 text-center">
                No earnings recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-[#D4AF37]/10">
                {earningEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-3.5 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-[#F4F1EA]">
                          {entry.source}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                          {entry.category}
                        </span>
                        {entry.halalVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981]">
                            <CheckCircle2 className="w-3 h-3" />
                            Halal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A8A0] mt-0.5">
                        {formatShortDate(entry.date)}
                        {entry.notes ? ` · ${entry.notes}` : ""}
                      </p>
                      {entry.autoAllocatedSummary &&
                        entry.autoAllocatedSummary.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {entry.autoAllocatedSummary.map((line, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#060D0B] border border-[#10B981]/30 text-[#10B981]"
                              >
                                {line}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="tabular-nums-mono text-sm font-semibold text-[#10B981]">
                        {formatINR(entry.amount, { showSign: true })}
                      </span>
                      <button
                        onClick={() => onDeleteEarning(entry.id)}
                        className="p-1.5 rounded-lg text-[#94A8A0] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
