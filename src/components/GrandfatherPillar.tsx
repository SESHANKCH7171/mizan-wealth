"use client";

import React, { useEffect, useState } from "react";
import { HeartHandshake, Plus, Trash2 } from "lucide-react";
import { formatINR, formatShortDate } from "@/lib/formatINR";
import type { GrandfatherEntry, GrandfatherPurpose } from "@/types/mizan";

interface GrandfatherPillarProps {
  entries: GrandfatherEntry[];
  grandfatherReserveBalance: number;
  onAddEntry: (entry: Omit<GrandfatherEntry, "id">) => void;
  onDeleteEntry: (id: string) => void;
}

const PURPOSES: GrandfatherPurpose[] = [
  "Monthly Allowance",
  "Medical & Care",
  "Eid / Gift",
  "Household",
  "Travel / Comfort",
  "Other",
];

const MODES: GrandfatherEntry["paymentMode"][] = [
  "Bank Transfer",
  "UPI",
  "Cash",
  "Card",
];

export function GrandfatherPillar({
  entries,
  grandfatherReserveBalance,
  onAddEntry,
  onDeleteEntry,
}: GrandfatherPillarProps) {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState<GrandfatherPurpose>("Monthly Allowance");
  const [paymentMode, setPaymentMode] =
    useState<GrandfatherEntry["paymentMode"]>("Bank Transfer");
  const [date, setDate] = useState("2026-11-25");
  const [notes, setNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState("2026-11");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
      setCurrentMonth(today.slice(0, 7));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const totalGiven = entries.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthTotal = entries
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return;
    onAddEntry({
      date,
      amount: numeric,
      purpose,
      paymentMode,
      notes: notes.trim() || undefined,
    });
    setAmount("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Hero Summary */}
      <div className="mizan-card mizan-hero-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-medium text-[#10B981]">
              <HeartHandshake className="w-3.5 h-3.5" />
              Silat al-Rahim · Grandfather Support Ledger
            </div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-[#F4F1EA] tabular-nums-mono">
              {formatINR(totalGiven)}
            </h2>
            <p className="text-xs text-[#94A8A0]">
              Lifetime honoring &amp; care recorded across {entries.length} contributions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#060D0B] border border-[#D4AF37]/20 p-3.5">
              <p className="text-[11px] text-[#94A8A0]">This Month</p>
              <p className="tabular-nums-mono text-lg font-bold text-[#D4AF37] mt-0.5">
                {formatINR(thisMonthTotal)}
              </p>
            </div>
            <div className="rounded-xl bg-[#060D0B] border border-[#10B981]/25 p-3.5">
              <p className="text-[11px] text-[#94A8A0]">Earmarked Reserve</p>
              <p className="tabular-nums-mono text-lg font-bold text-[#10B981] mt-0.5">
                {formatINR(grandfatherReserveBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Log Form */}
      <form onSubmit={handleSubmit} className="mizan-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
            Quick-Log Grandfather Support
          </h3>
          <div className="flex items-center gap-2">
            {[5000, 10000, 25000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="px-2.5 py-1 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 hover:border-[#D4AF37] text-xs text-[#D4AF37] tabular-nums-mono cursor-pointer transition-colors"
              >
                +{formatINR(preset)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs text-[#94A8A0] mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25000"
              className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#94A8A0] mb-1">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as GrandfatherPurpose)}
              className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#94A8A0] mb-1">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) =>
                setPaymentMode(e.target.value as GrandfatherEntry["paymentMode"])
              }
              className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#94A8A0] mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional note (e.g. Monthly support, pharmacy, gift)"
            className="flex-1 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-[#060D0B] font-semibold text-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Record Support
          </button>
        </div>
      </form>

      {/* Ledger */}
      <div className="mizan-card p-5">
        <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA] mb-4">
          Support History
        </h3>
        {entries.length === 0 ? (
          <p className="text-sm text-[#94A8A0] py-6 text-center">
            No support entries recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-[#D4AF37]/10">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-[#F4F1EA]">
                      {entry.purpose}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                      {entry.paymentMode}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A8A0] mt-0.5">
                    {formatShortDate(entry.date)}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="tabular-nums-mono text-sm font-semibold text-[#10B981]">
                    {formatINR(entry.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
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
  );
}
