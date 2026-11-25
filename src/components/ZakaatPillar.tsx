"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Calculator,
  CheckCircle2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  formatCompactINR,
  formatINR,
  formatShortDate,
} from "@/lib/formatINR";
import type { ZakaatCategory, ZakaatEntry } from "@/types/mizan";

interface ZakaatPillarProps {
  zakaatEntries: ZakaatEntry[];
  missionTarget: number;
  nisabThreshold: number;
  zakaatReserveBalance: number;
  zakaatEligibleWealth: number;
  onAddEntry: (entry: Omit<ZakaatEntry, "id">) => void;
  onDeleteEntry: (id: string) => void;
}

const CATEGORIES: ZakaatCategory[] = [
  "Fakir / Miskin",
  "Education & Orphans",
  "Medical Relief",
  "Masjid & Dawah",
  "Debt Relief",
  "Community Aid",
  "Other",
];

const MILESTONES = [
  { label: "₹1 Lakh", amount: 1_00_000 },
  { label: "₹5 Lakhs", amount: 5_00_000 },
  { label: "₹10 Lakhs", amount: 10_00_000 },
  { label: "₹25 Lakhs", amount: 25_00_000 },
  { label: "₹50 Lakhs", amount: 50_00_000 },
  { label: "₹1 Crore", amount: 1_00_00_000 },
];

export function ZakaatPillar({
  zakaatEntries,
  missionTarget,
  nisabThreshold,
  zakaatReserveBalance,
  zakaatEligibleWealth,
  onAddEntry,
  onDeleteEntry,
}: ZakaatPillarProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [category, setCategory] = useState<ZakaatCategory>("Fakir / Miskin");
  const [kind, setKind] = useState<"Zakaat" | "Sadaqah">("Zakaat");
  const [date, setDate] = useState("2026-11-25");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDate(new Date().toISOString().slice(0, 10));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const [notes, setNotes] = useState("");
  const [filterKind, setFilterKind] = useState<"All" | "Zakaat" | "Sadaqah">("All");

  const totalZakaatGiven = zakaatEntries
    .filter((e) => e.kind === "Zakaat")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSadaqahGiven = zakaatEntries
    .filter((e) => e.kind === "Sadaqah")
    .reduce((sum, e) => sum + e.amount, 0);

  const progressPct = Math.min(100, (totalZakaatGiven / Math.max(1, missionTarget)) * 100);
  const remainingToCr = Math.max(0, missionTarget - totalZakaatGiven);

  const isAboveNisab = zakaatEligibleWealth >= nisabThreshold;
  const annualZakaatDue = isAboveNisab ? zakaatEligibleWealth * 0.025 : 0;

  const filteredEntries = zakaatEntries.filter((e) =>
    filterKind === "All" ? true : e.kind === filterKind
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!numeric || numeric <= 0 || !recipient.trim()) return;
    onAddEntry({
      date,
      amount: numeric,
      recipient: recipient.trim(),
      category,
      kind,
      notes: notes.trim() || undefined,
    });
    setAmount("");
    setRecipient("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Hero Mission Banner */}
      <div className="mizan-card mizan-hero-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-medium text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              1 Crore Zakaat Mission
            </div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-[#F4F1EA]">
              <span className="tabular-nums-mono text-[#D4AF37]">
                {formatINR(totalZakaatGiven)}
              </span>{" "}
              <span className="text-base font-normal text-[#94A8A0]">
                of {formatCompactINR(missionTarget)}
              </span>
            </h2>
            <p className="text-sm text-[#94A8A0]">
              Remaining to goal:{" "}
              <span className="tabular-nums-mono text-[#F4F1EA] font-medium">
                {formatINR(remainingToCr)}
              </span>{" "}
              · Sadaqah also given:{" "}
              <span className="tabular-nums-mono text-[#10B981]">
                {formatINR(totalSadaqahGiven)}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl bg-[#060D0B] border border-[#D4AF37]/20 p-3.5">
              <p className="text-[11px] text-[#94A8A0]">Mission Progress</p>
              <p className="tabular-nums-mono text-xl font-bold text-[#D4AF37] mt-0.5">
                {progressPct.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-xl bg-[#060D0B] border border-[#10B981]/25 p-3.5">
              <p className="text-[11px] text-[#94A8A0]">Earmarked Reserve</p>
              <p className="tabular-nums-mono text-xl font-bold text-[#10B981] mt-0.5">
                {formatCompactINR(zakaatReserveBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="h-3 w-full rounded-full bg-[#060D0B] border border-[#D4AF37]/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#10B981] transition-all duration-500"
              style={{ width: `${Math.max(1.5, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {MILESTONES.map((m) => {
            const reached = totalZakaatGiven >= m.amount;
            return (
              <div
                key={m.label}
                className={`rounded-lg px-3 py-2 border text-xs flex items-center justify-between ${
                  reached
                    ? "bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]"
                    : "bg-[#060D0B]/70 border-[#D4AF37]/15 text-[#94A8A0]"
                }`}
              >
                <span className="font-medium">{m.label}</span>
                {reached ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                ) : (
                  <Award className="w-3.5 h-3.5 opacity-40" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.5% Zakaat Calculator + Quick Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2.5% Calculator */}
        <div className="mizan-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
              2.5% Zakaat Calculator
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#D4AF37]/10">
              <span className="text-[#94A8A0]">Zakaat-Eligible Wealth</span>
              <span className="tabular-nums-mono text-[#F4F1EA] font-medium">
                {formatINR(zakaatEligibleWealth)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#D4AF37]/10">
              <span className="text-[#94A8A0]">Nisab Threshold</span>
              <span className="tabular-nums-mono text-[#94A8A0]">
                {formatINR(nisabThreshold)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#D4AF37]/10">
              <span className="text-[#94A8A0]">Nisab Status</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isAboveNisab
                    ? "bg-[#10B981]/15 text-[#10B981]"
                    : "bg-[#94A8A0]/15 text-[#94A8A0]"
                }`}
              >
                {isAboveNisab ? "Zakaat Obligatory" : "Below Nisab"}
              </span>
            </div>
            <div className="rounded-xl bg-[#060D0B] border border-[#D4AF37]/25 p-4">
              <p className="text-xs text-[#94A8A0]">Estimated Annual Zakaat (2.5%)</p>
              <p className="tabular-nums-mono text-2xl font-bold text-[#D4AF37] mt-1">
                {formatINR(annualZakaatDue)}
              </p>
            </div>
          </div>
        </div>

        {/* Log Zakaat / Sadaqah Form */}
        <form
          onSubmit={handleSubmit}
          className="mizan-card p-5 lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
              Record Zakaat or Sadaqah
            </h3>
            <div className="flex rounded-lg bg-[#060D0B] p-0.5 border border-[#D4AF37]/20">
              {(["Zakaat", "Sadaqah"] as const).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    kind === k
                      ? "bg-[#D4AF37] text-[#060D0B]"
                      : "text-[#94A8A0] hover:text-[#F4F1EA]"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                placeholder="e.g. 50000"
                className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#94A8A0] mb-1">
                Recipient / Cause
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Al-Falah Orphanage"
                className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#94A8A0] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ZakaatCategory)}
                className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
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

          <div>
            <label className="block text-xs text-[#94A8A0] mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Intention, receipt reference, or details"
              className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#060D0B] font-semibold text-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log {kind} Entry
          </button>
        </form>
      </div>

      {/* Ledger Table */}
      <div className="mizan-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
            Zakaat &amp; Charity Ledger
          </h3>
          <div className="flex items-center gap-1.5">
            {(["All", "Zakaat", "Sadaqah"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterKind(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterKind === tab
                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40"
                    : "text-[#94A8A0] hover:text-[#F4F1EA]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-sm text-[#94A8A0] py-6 text-center">
            No entries logged yet.
          </p>
        ) : (
          <div className="divide-y divide-[#D4AF37]/10">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-[#F4F1EA] truncate">
                      {entry.recipient}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        entry.kind === "Zakaat"
                          ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                          : "bg-[#10B981]/15 text-[#10B981]"
                      }`}
                    >
                      {entry.kind}
                    </span>
                    <span className="text-[11px] text-[#94A8A0]">
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A8A0] mt-0.5">
                    {formatShortDate(entry.date)}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="tabular-nums-mono text-sm font-semibold text-[#D4AF37]">
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
