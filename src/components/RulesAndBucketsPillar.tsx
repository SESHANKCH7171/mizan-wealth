"use client";

import React, { useState } from "react";
import {
  FolderPlus,
  Plus,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { formatCompactINR, formatINR } from "@/lib/formatINR";
import type { AllocationRule, CustomBucket } from "@/types/mizan";

interface RulesAndBucketsPillarProps {
  rules: AllocationRule[];
  buckets: CustomBucket[];
  onToggleRule: (id: string) => void;
  onAddRule: (rule: Omit<AllocationRule, "id">) => void;
  onDeleteRule: (id: string) => void;
  onAddBucket: (bucket: Omit<CustomBucket, "id" | "transactions">) => void;
  onFundBucket: (bucketId: string, amount: number, note: string) => void;
  onDeleteBucket: (id: string) => void;
}

export function RulesAndBucketsPillar({
  rules,
  buckets,
  onToggleRule,
  onAddRule,
  onDeleteRule,
  onAddBucket,
  onFundBucket,
  onDeleteBucket,
}: RulesAndBucketsPillarProps) {
  // New rule state
  const [ruleName, setRuleName] = useState("");
  const [rulePct, setRulePct] = useState("10");
  const [ruleTarget, setRuleTarget] = useState<string>("zakaat_mission");

  // New bucket state
  const [bucketName, setBucketName] = useState("");
  const [bucketArabic, setBucketArabic] = useState("");
  const [bucketTarget, setBucketTarget] = useState("");
  const [bucketAccent, setBucketAccent] = useState<"gold" | "emerald" | "amber">(
    "gold"
  );
  const [fundAmounts, setFundAmounts] = useState<Record<string, string>>({});

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = Number(rulePct);
    if (!ruleName.trim() || !pct || pct <= 0 || pct > 100) return;

    let targetType: AllocationRule["targetType"] = "zakaat_mission";
    let targetBucketId: string | undefined;
    let targetLabel = "1 Cr Zakaat Reserve";

    if (ruleTarget === "grandfather_fund") {
      targetType = "grandfather_fund";
      targetLabel = "Grandfather Support Reserve";
    } else if (ruleTarget.startsWith("bucket:")) {
      const bId = ruleTarget.replace("bucket:", "");
      const found = buckets.find((b) => b.id === bId);
      if (found) {
        targetType = "custom_bucket";
        targetBucketId = found.id;
        targetLabel = found.name;
      }
    }

    onAddRule({
      name: ruleName.trim(),
      enabled: true,
      percentage: pct,
      targetType,
      targetBucketId,
      targetLabel,
      description: `Automatically allocate ${pct}% of every new Earning to ${targetLabel}.`,
    });
    setRuleName("");
    setRulePct("10");
  };

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(bucketTarget);
    if (!bucketName.trim() || !target || target <= 0) return;
    onAddBucket({
      name: bucketName.trim(),
      arabicLabel: bucketArabic.trim() || undefined,
      targetAmount: target,
      currentAmount: 0,
      accent: bucketAccent,
    });
    setBucketName("");
    setBucketArabic("");
    setBucketTarget("");
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Dynamic Allocation Rules */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-[#F4F1EA]">
              Automated Earning Allocation Rules
            </h2>
            <p className="text-xs text-[#94A8A0]">
              When you record a new Earning, enabled rules automatically earmark percentages into your missions &amp; buckets.
            </p>
          </div>
        </div>

        {/* Rule List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`mizan-card p-4 flex flex-col justify-between gap-3 ${
                rule.enabled ? "border-[#D4AF37]/35" : "opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#F4F1EA]">
                      {rule.name}
                    </span>
                    <span className="tabular-nums-mono text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-semibold">
                      {rule.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-[#94A8A0] mt-1">
                    {rule.description}
                  </p>
                </div>

                <button
                  onClick={() => onToggleRule(rule.id)}
                  className="text-[#D4AF37] cursor-pointer shrink-0"
                  title={rule.enabled ? "Disable rule" : "Enable rule"}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-7 h-7 text-[#10B981]" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-[#94A8A0]" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/10 text-xs">
                <span className="text-[#94A8A0]">
                  Target:{" "}
                  <span className="text-[#F4F1EA]">{rule.targetLabel}</span>
                </span>
                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="text-[#94A8A0] hover:text-red-400 cursor-pointer"
                  title="Delete rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create New Rule */}
        <form onSubmit={handleCreateRule} className="mizan-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#F4F1EA]">
            + Create Custom Allocation Rule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Rule name (e.g. Sadaqah Jar)"
              className="sm:col-span-2 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            />
            <input
              type="number"
              min="1"
              max="100"
              required
              value={rulePct}
              onChange={(e) => setRulePct(e.target.value)}
              placeholder="% of Earning"
              className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
            />
            <select
              value={ruleTarget}
              onChange={(e) => setRuleTarget(e.target.value)}
              className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="zakaat_mission">1 Cr Zakaat Reserve</option>
              <option value="grandfather_fund">
                Grandfather Support Reserve
              </option>
              {buckets.map((b) => (
                <option key={b.id} value={`bucket:${b.id}`}>
                  Bucket: {b.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#060D0B] font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </form>
      </div>

      {/* Section 2: Custom Goal Buckets */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-[#10B981]" />
          <div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-[#F4F1EA]">
              Custom Goal Buckets
            </h2>
            <p className="text-xs text-[#94A8A0]">
              Create dedicated Islamic or personal financial buckets directly from the UI.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buckets.map((bucket) => {
            const pct = Math.min(
              100,
              (bucket.currentAmount / Math.max(1, bucket.targetAmount)) * 100
            );
            const barColor =
              bucket.accent === "emerald"
                ? "bg-[#10B981]"
                : bucket.accent === "amber"
                  ? "bg-[#F59E0B]"
                  : "bg-[#D4AF37]";

            return (
              <div key={bucket.id} className="mizan-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-[#F4F1EA]">
                        {bucket.name}
                      </h3>
                      {bucket.arabicLabel && (
                        <span className="font-[family-name:var(--font-arabic)] text-base text-[#D4AF37]">
                          {bucket.arabicLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#94A8A0] mt-0.5">
                      <span className="tabular-nums-mono text-[#F4F1EA] font-medium">
                        {formatINR(bucket.currentAmount)}
                      </span>{" "}
                      of {formatCompactINR(bucket.targetAmount)} ({pct.toFixed(1)}%)
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteBucket(bucket.id)}
                    className="p-1.5 rounded-lg text-[#94A8A0] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                    title="Delete bucket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-2.5 w-full rounded-full bg-[#060D0B] border border-[#D4AF37]/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-300`}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min="1"
                    value={fundAmounts[bucket.id] || ""}
                    onChange={(e) =>
                      setFundAmounts((prev) => ({
                        ...prev,
                        [bucket.id]: e.target.value,
                      }))
                    }
                    placeholder="Add ₹ amount"
                    className="flex-1 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-1.5 text-xs text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const amt = Number(fundAmounts[bucket.id]);
                      if (!amt || amt <= 0) return;
                      onFundBucket(bucket.id, amt, "Manual contribution");
                      setFundAmounts((prev) => ({ ...prev, [bucket.id]: "" }));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-[#060D0B] font-semibold text-xs cursor-pointer"
                  >
                    + Add Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Bucket */}
        <form onSubmit={handleCreateBucket} className="mizan-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#F4F1EA]">
            + Create Custom Goal Bucket
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              placeholder="Bucket name (e.g. Hajj 2028)"
              className="sm:col-span-2 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            />
            <input
              type="number"
              min="1"
              required
              value={bucketTarget}
              onChange={(e) => setBucketTarget(e.target.value)}
              placeholder="Target Amount (₹)"
              className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] tabular-nums-mono focus:outline-none focus:border-[#D4AF37]"
            />
            <select
              value={bucketAccent}
              onChange={(e) =>
                setBucketAccent(e.target.value as "gold" | "emerald" | "amber")
              }
              className="rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="gold">Gold Accent</option>
              <option value="emerald">Emerald Accent</option>
              <option value="amber">Saffron Accent</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <input
              type="text"
              value={bucketArabic}
              onChange={(e) => setBucketArabic(e.target.value)}
              placeholder="Optional Arabic label (e.g. حج)"
              className="w-full sm:w-64 rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-[#060D0B] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Bucket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
