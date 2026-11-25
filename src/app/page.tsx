"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  HeartHandshake,
  Sliders,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ChartsSection } from "@/components/ChartsSection";
import { CloudSettingsModal } from "@/components/CloudSettingsModal";
import { GrandfatherPillar } from "@/components/GrandfatherPillar";
import { HeaderBar } from "@/components/HeaderBar";
import { RulesAndBucketsPillar } from "@/components/RulesAndBucketsPillar";
import { WealthPillar } from "@/components/WealthPillar";
import { ZakaatPillar } from "@/components/ZakaatPillar";
import { createEmptyState, createInitialState } from "@/lib/defaultState";
import { formatCompactINR, formatINR } from "@/lib/formatINR";
import {
  fetchCloudState,
  hasSavedLocalState,
  loadLocalState,
  pushCloudState,
  saveLocalState,
} from "@/lib/storage";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  AllocationRule,
  AssetItem,
  CustomBucket,
  EarningEntry,
  GrandfatherEntry,
  MizanSettings,
  MizanState,
  TabKey,
  ZakaatEntry,
} from "@/types/mizan";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export default function MizanHomePage() {
  const [state, setState] = useState<MizanState>(() => createEmptyState());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "local" | "syncing" | "synced" | "error"
  >("local");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load localStorage on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadLocalState());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Listen to Supabase auth & pull initial cloud state
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email ?? null);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
      if (!user) setSyncStatus("local");
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Sync from cloud when userId becomes available
  const handleSyncNow = useCallback(async () => {
    if (!userId) return;
    setSyncStatus("syncing");
    const { state: cloudState, error } = await fetchCloudState(userId);
    if (error) {
      setSyncStatus("error");
      showToast(`Sync error: ${error}`);
      return;
    }
    if (
      cloudState &&
      (!hasSavedLocalState() || cloudState.updatedAt >= state.updatedAt)
    ) {
      setState(cloudState);
      saveLocalState(cloudState);
      setSyncStatus("synced");
      showToast("Pulled latest Mizan state from cloud.");
    } else {
      const res = await pushCloudState(userId, state);
      setSyncStatus(res.ok ? "synced" : "error");
    }
  }, [userId, state, showToast]);

  useEffect(() => {
    if (userId && hydrated) {
      const timer = window.setTimeout(() => {
        void handleSyncNow();
      }, 0);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, hydrated]);

  // Helper to update state + persist locally & debounced to Supabase
  const commitState = useCallback(
    (updater: (prev: MizanState) => MizanState) => {
      setState((prev) => {
        const next = {
          ...updater(prev),
          updatedAt: new Date().toISOString(),
        };
        saveLocalState(next);
        if (userId) {
          setSyncStatus("syncing");
          pushCloudState(userId, next).then((res) => {
            setSyncStatus(res.ok ? "synced" : "error");
          });
        }
        return next;
      });
    },
    [userId]
  );

  // Derived metrics for Overview & Pillars
  const metrics = useMemo(() => {
    const totalZakaat = state.zakaatEntries
      .filter((e) => e.kind === "Zakaat")
      .reduce((s, e) => s + e.amount, 0);
    const totalGrandfather = state.grandfatherEntries.reduce(
      (s, e) => s + e.amount,
      0
    );
    const netWorth = state.assets.reduce((s, a) => s + a.currentValue, 0);
    const zakaatEligibleWealth = state.assets
      .filter((a) => a.zakaatEligible)
      .reduce((s, a) => s + a.currentValue, 0);
    const zakaatPct = Math.min(
      100,
      (totalZakaat / Math.max(1, state.settings.zakaatMissionTarget)) * 100
    );
    const totalEarnings = state.earningEntries.reduce((s, e) => s + e.amount, 0);

    return {
      totalZakaat,
      totalGrandfather,
      netWorth,
      zakaatEligibleWealth,
      zakaatPct,
      totalEarnings,
    };
  }, [state]);

  // Handlers
  const handleAddZakaat = (entry: Omit<ZakaatEntry, "id">) => {
    commitState((prev) => ({
      ...prev,
      zakaatEntries: [{ id: uid("zak"), ...entry }, ...prev.zakaatEntries],
      settings: {
        ...prev.settings,
        zakaatReserveBalance:
          entry.kind === "Zakaat"
            ? Math.max(0, prev.settings.zakaatReserveBalance - entry.amount)
            : prev.settings.zakaatReserveBalance,
      },
    }));
    showToast(`${entry.kind} entry of ${formatINR(entry.amount)} recorded.`);
  };

  const handleDeleteZakaat = (id: string) => {
    commitState((prev) => ({
      ...prev,
      zakaatEntries: prev.zakaatEntries.filter((e) => e.id !== id),
    }));
  };

  const handleAddGrandfather = (entry: Omit<GrandfatherEntry, "id">) => {
    commitState((prev) => ({
      ...prev,
      grandfatherEntries: [
        { id: uid("gf"), ...entry },
        ...prev.grandfatherEntries,
      ],
      settings: {
        ...prev.settings,
        grandfatherReserveBalance: Math.max(
          0,
          prev.settings.grandfatherReserveBalance - entry.amount
        ),
      },
    }));
    showToast(`Recorded ${formatINR(entry.amount)} for Grandfather.`);
  };

  const handleDeleteGrandfather = (id: string) => {
    commitState((prev) => ({
      ...prev,
      grandfatherEntries: prev.grandfatherEntries.filter((e) => e.id !== id),
    }));
  };

  const handleAddEarning = (
    entry: Omit<EarningEntry, "id" | "autoAllocatedSummary">
  ) => {
    commitState((prev) => {
      let addZakaatReserve = 0;
      let addGrandfatherReserve = 0;
      const bucketAdditions: Record<string, number> = {};
      const summary: string[] = [];

      for (const rule of prev.rules) {
        if (!rule.enabled || rule.percentage <= 0) continue;
        const slice = Math.round((entry.amount * rule.percentage) / 100);
        if (slice <= 0) continue;

        if (rule.targetType === "zakaat_mission") {
          addZakaatReserve += slice;
          summary.push(`${rule.percentage}% (${formatINR(slice)}) → Zakaat Reserve`);
        } else if (rule.targetType === "grandfather_fund") {
          addGrandfatherReserve += slice;
          summary.push(
            `${rule.percentage}% (${formatINR(slice)}) → Grandfather Fund`
          );
        } else if (
          rule.targetType === "custom_bucket" &&
          rule.targetBucketId
        ) {
          bucketAdditions[rule.targetBucketId] =
            (bucketAdditions[rule.targetBucketId] || 0) + slice;
          summary.push(
            `${rule.percentage}% (${formatINR(slice)}) → ${rule.targetLabel}`
          );
        }
      }

      const nextBuckets = prev.customBuckets.map((b) => {
        const addAmt = bucketAdditions[b.id];
        if (!addAmt) return b;
        return {
          ...b,
          currentAmount: b.currentAmount + addAmt,
          transactions: [
            {
              id: uid("bt"),
              date: entry.date,
              amount: addAmt,
              note: `Auto-rule from ${entry.source}`,
              source: "rule" as const,
            },
            ...b.transactions,
          ],
        };
      });

      return {
        ...prev,
        earningEntries: [
          {
            id: uid("earn"),
            ...entry,
            autoAllocatedSummary: summary,
          },
          ...prev.earningEntries,
        ],
        customBuckets: nextBuckets,
        settings: {
          ...prev.settings,
          zakaatReserveBalance:
            prev.settings.zakaatReserveBalance + addZakaatReserve,
          grandfatherReserveBalance:
            prev.settings.grandfatherReserveBalance + addGrandfatherReserve,
        },
      };
    });
    showToast(
      `Earning of ${formatINR(entry.amount)} logged & allocation rules applied.`
    );
  };

  const handleDeleteEarning = (id: string) => {
    commitState((prev) => ({
      ...prev,
      earningEntries: prev.earningEntries.filter((e) => e.id !== id),
    }));
  };

  const handleAddAsset = (asset: Omit<AssetItem, "id" | "lastUpdated">) => {
    commitState((prev) => ({
      ...prev,
      assets: [
        {
          id: uid("ast"),
          ...asset,
          lastUpdated: new Date().toISOString().slice(0, 10),
        },
        ...prev.assets,
      ],
    }));
    showToast(`Added ${asset.name} to portfolio.`);
  };

  const handleUpdateAssetValue = (id: string, newValue: number) => {
    commitState((prev) => ({
      ...prev,
      assets: prev.assets.map((a) =>
        a.id === id
          ? {
            ...a,
            currentValue: newValue,
            lastUpdated: new Date().toISOString().slice(0, 10),
          }
          : a
      ),
    }));
  };

  const handleDeleteAsset = (id: string) => {
    commitState((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));
  };

  const handleToggleRule = (id: string) => {
    commitState((prev) => ({
      ...prev,
      rules: prev.rules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  };

  const handleAddRule = (rule: Omit<AllocationRule, "id">) => {
    commitState((prev) => ({
      ...prev,
      rules: [...prev.rules, { id: uid("rule"), ...rule }],
    }));
    showToast(`Rule "${rule.name}" activated.`);
  };

  const handleDeleteRule = (id: string) => {
    commitState((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== id),
    }));
  };

  const handleAddBucket = (
    bucket: Omit<CustomBucket, "id" | "transactions">
  ) => {
    commitState((prev) => ({
      ...prev,
      customBuckets: [
        ...prev.customBuckets,
        { id: uid("bkt"), ...bucket, transactions: [] },
      ],
    }));
    showToast(`Created bucket "${bucket.name}".`);
  };

  const handleFundBucket = (bucketId: string, amount: number, note: string) => {
    commitState((prev) => ({
      ...prev,
      customBuckets: prev.customBuckets.map((b) =>
        b.id === bucketId
          ? {
            ...b,
            currentAmount: b.currentAmount + amount,
            transactions: [
              {
                id: uid("bt"),
                date: new Date().toISOString().slice(0, 10),
                amount,
                note,
                source: "manual",
              },
              ...b.transactions,
            ],
          }
          : b
      ),
    }));
    showToast(`Added ${formatINR(amount)} to bucket.`);
  };

  const handleDeleteBucket = (id: string) => {
    commitState((prev) => ({
      ...prev,
      customBuckets: prev.customBuckets.filter((b) => b.id !== id),
    }));
  };

  const handleUpdateSettings = (nextSettings: MizanSettings) => {
    commitState((prev) => ({ ...prev, settings: nextSettings }));
    showToast("Preferences saved.");
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-12">
      <HeaderBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        displayName={state.settings.displayName}
        syncStatus={syncStatus}
        userEmail={userEmail}
        onOpenCloudModal={() => setCloudModalOpen(true)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm rounded-xl bg-[#0B1A16] border border-[#D4AF37]/50 px-4 py-3 text-xs text-[#F4F1EA] shadow-2xl">
          {toast}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 4 Pillars Command Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: 1 Cr Zakaat Mission */}
              <button
                onClick={() => setActiveTab("zakaat")}
                className="mizan-card mizan-hero-card p-5 text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#D4AF37] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />1 Cr Zakaat Mission
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#94A8A0] group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <p className="tabular-nums-mono text-2xl font-bold text-[#F4F1EA] mt-3">
                  {formatCompactINR(metrics.totalZakaat)}
                </p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-[#060D0B] overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37] rounded-full"
                    style={{ width: `${Math.max(2, metrics.zakaatPct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#94A8A0] mt-2">
                  {metrics.zakaatPct.toFixed(2)}% of{" "}
                  {formatCompactINR(state.settings.zakaatMissionTarget)}
                </p>
              </button>

              {/* Pillar 2: Grandfather Support */}
              <button
                onClick={() => setActiveTab("grandfather")}
                className="mizan-card p-5 text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#10B981] flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Silat al-Rahim
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#94A8A0] group-hover:text-[#10B981] transition-colors" />
                </div>
                <p className="tabular-nums-mono text-2xl font-bold text-[#F4F1EA] mt-3">
                  {formatINR(metrics.totalGrandfather)}
                </p>
                <p className="text-[11px] text-[#94A8A0] mt-2">
                  Grandfather Support · {state.grandfatherEntries.length} logs
                </p>
                <p className="text-[11px] text-[#10B981] mt-0.5 tabular-nums-mono">
                  Reserve: {formatINR(state.settings.grandfatherReserveBalance)}
                </p>
              </button>

              {/* Pillar 3: Unified Net Worth */}
              <button
                onClick={() => setActiveTab("wealth")}
                className="mizan-card p-5 text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#F4F1EA] flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Net Worth
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#94A8A0] group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <p className="tabular-nums-mono text-2xl font-bold text-[#F4F1EA] mt-3">
                  {formatCompactINR(metrics.netWorth)}
                </p>
                <p className="text-[11px] text-[#94A8A0] mt-2 tabular-nums-mono">
                  {formatINR(metrics.netWorth)}
                </p>
                <p className="text-[11px] text-[#D4AF37] mt-0.5 tabular-nums-mono">
                  2.5% Zakaat Due:{" "}
                  {formatINR(
                    metrics.zakaatEligibleWealth >=
                      state.settings.nisabThreshold
                      ? metrics.zakaatEligibleWealth * 0.025
                      : 0
                  )}
                </p>
              </button>

              {/* Pillar 4: Active Rules & Buckets */}
              <button
                onClick={() => setActiveTab("rules")}
                className="mizan-card p-5 text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#F59E0B] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Rules &amp; Buckets
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#94A8A0] group-hover:text-[#F59E0B] transition-colors" />
                </div>
                <p className="tabular-nums-mono text-2xl font-bold text-[#F4F1EA] mt-3">
                  {state.rules.filter((r) => r.enabled).length} Active
                </p>
                <p className="text-[11px] text-[#94A8A0] mt-2">
                  {state.customBuckets.length} custom goal buckets
                </p>
                <p className="text-[11px] text-[#F59E0B] mt-0.5 tabular-nums-mono">
                  Zakaat Reserve: {formatINR(state.settings.zakaatReserveBalance)}
                </p>
              </button>
            </div>

            {/* Charts */}
            <ChartsSection
              assets={state.assets}
              zakaatEntries={state.zakaatEntries}
              earningEntries={state.earningEntries}
            />

            {/* Custom Buckets Quick Preview */}
            {state.customBuckets.length > 0 && (
              <div className="mizan-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-[family-name:var(--font-cinzel)] text-base font-semibold text-[#F4F1EA]">
                    Custom Goal Buckets
                  </h3>
                  <button
                    onClick={() => setActiveTab("rules")}
                    className="text-xs text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Manage Buckets →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.customBuckets.map((b) => {
                    const pct = Math.min(
                      100,
                      (b.currentAmount / Math.max(1, b.targetAmount)) * 100
                    );
                    return (
                      <div
                        key={b.id}
                        className="rounded-xl bg-[#060D0B] border border-[#D4AF37]/15 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#F4F1EA]">
                            {b.name}
                          </span>
                          {b.arabicLabel && (
                            <span className="font-[family-name:var(--font-arabic)] text-sm text-[#D4AF37]">
                              {b.arabicLabel}
                            </span>
                          )}
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#0B1A16] overflow-hidden">
                          <div
                            className="h-full bg-[#10B981] rounded-full"
                            style={{ width: `${Math.max(2, pct)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#94A8A0] tabular-nums-mono">
                          <span>{formatCompactINR(b.currentAmount)}</span>
                          <span>Goal: {formatCompactINR(b.targetAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "zakaat" && (
          <ZakaatPillar
            zakaatEntries={state.zakaatEntries}
            missionTarget={state.settings.zakaatMissionTarget}
            nisabThreshold={state.settings.nisabThreshold}
            zakaatReserveBalance={state.settings.zakaatReserveBalance}
            zakaatEligibleWealth={metrics.zakaatEligibleWealth}
            onAddEntry={handleAddZakaat}
            onDeleteEntry={handleDeleteZakaat}
          />
        )}

        {activeTab === "grandfather" && (
          <GrandfatherPillar
            entries={state.grandfatherEntries}
            grandfatherReserveBalance={state.settings.grandfatherReserveBalance}
            onAddEntry={handleAddGrandfather}
            onDeleteEntry={handleDeleteGrandfather}
          />
        )}

        {activeTab === "wealth" && (
          <WealthPillar
            earningEntries={state.earningEntries}
            assets={state.assets}
            onAddEarning={handleAddEarning}
            onDeleteEarning={handleDeleteEarning}
            onAddAsset={handleAddAsset}
            onUpdateAssetValue={handleUpdateAssetValue}
            onDeleteAsset={handleDeleteAsset}
          />
        )}

        {activeTab === "rules" && (
          <RulesAndBucketsPillar
            rules={state.rules}
            buckets={state.customBuckets}
            onToggleRule={handleToggleRule}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onAddBucket={handleAddBucket}
            onFundBucket={handleFundBucket}
            onDeleteBucket={handleDeleteBucket}
          />
        )}
      </main>

      <CloudSettingsModal
        open={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        userEmail={userEmail}
        settings={state.settings}
        fullState={state}
        onUpdateSettings={handleUpdateSettings}
        onSyncNow={handleSyncNow}
        onResetEmpty={() => {
          commitState(() => createEmptyState());
          showToast("Started fresh with ₹0 balances.");
        }}
        onLoadSample={() => {
          commitState(() => createInitialState());
          showToast("Loaded sample Mizan data.");
        }}
      />
    </div>
  );
}
