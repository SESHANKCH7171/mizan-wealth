"use client";

import React, { useEffect, useState } from "react";
import {
  Cloud,
  CloudOff,
  Compass,
  HeartHandshake,
  LayoutDashboard,
  RefreshCw,
  Sliders,
  Sparkles,
  Wallet,
} from "lucide-react";
import { formatGregorianDate, formatHijriDate } from "@/lib/formatINR";
import type { TabKey } from "@/types/mizan";

interface HeaderBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  displayName: string;
  syncStatus: "local" | "syncing" | "synced" | "error";
  userEmail: string | null;
  onOpenCloudModal: () => void;
}

const NAV_ITEMS: { key: TabKey; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  {
    key: "overview",
    label: "Overview",
    shortLabel: "Home",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    key: "zakaat",
    label: "1 Cr Zakaat",
    shortLabel: "Zakaat",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    key: "grandfather",
    label: "Silat al-Rahim",
    shortLabel: "Grandfather",
    icon: <HeartHandshake className="w-4 h-4" />,
  },
  {
    key: "wealth",
    label: "Wealth & Portfolio",
    shortLabel: "Wealth",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    key: "rules",
    label: "Rules & Buckets",
    shortLabel: "Rules",
    icon: <Sliders className="w-4 h-4" />,
  },
];

export function HeaderBar({
  activeTab,
  onTabChange,
  displayName,
  syncStatus,
  userEmail,
  onOpenCloudModal,
}: HeaderBarProps) {
  const [hijri, setHijri] = useState("Islamic Calendar");
  const [gregorian, setGregorian] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHijri(formatHijriDate());
      setGregorian(formatGregorianDate());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#D4AF37]/20 bg-[#060D0B]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand & Islamic Greeting */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0B1A16] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.12)]">
              <Compass className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-[family-name:var(--font-cinzel)] text-lg sm:text-xl font-semibold tracking-wide text-[#F4F1EA] truncate">
                  MIZAN
                </h1>
                <span className="font-[family-name:var(--font-arabic)] text-lg text-[#D4AF37] leading-none">
                  ميزان
                </span>
              </div>
              <p className="text-xs text-[#94A8A0] truncate">
                <span className="text-[#D4AF37]">Bismillah</span> · Assalamu Alaikum,{" "}
                <span className="text-[#F4F1EA]">{displayName}</span>
              </p>
            </div>
          </div>

          {/* Dates & Cloud Sync */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-medium text-[#D4AF37]">{hijri}</span>
              <span className="text-[11px] text-[#94A8A0]">{gregorian}</span>
            </div>

            <button
              onClick={onOpenCloudModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4AF37]/25 bg-[#0B1A16] hover:bg-[#112620] text-xs font-medium transition-colors cursor-pointer"
              title="Cloud Sync & Settings"
            >
              {syncStatus === "syncing" ? (
                <RefreshCw className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" />
              ) : userEmail ? (
                <Cloud className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-[#94A8A0]" />
              )}
              <span className="hidden sm:inline text-[#F4F1EA]">
                {syncStatus === "syncing"
                  ? "Syncing..."
                  : userEmail
                    ? "Synced"
                    : "Local Mode"}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t border-[#D4AF37]/10 bg-[#060D0B]/60">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange(item.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "border-[#D4AF37] text-[#D4AF37] bg-[#0B1A16]/70"
                      : "border-transparent text-[#94A8A0] hover:text-[#F4F1EA] hover:bg-[#0B1A16]/40"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile Date Sub-bar */}
      <div className="md:hidden px-4 py-1.5 bg-[#0B1A16]/70 border-b border-[#D4AF37]/10 flex items-center justify-between text-[11px]">
        <span className="text-[#D4AF37] font-medium">{hijri}</span>
        <span className="text-[#94A8A0]">{gregorian}</span>
      </div>

      {/* Mobile Bottom Navigation (PWA App Feel) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#D4AF37]/25 bg-[#060D0B]/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors ${
                  active ? "text-[#D4AF37]" : "text-[#94A8A0]"
                }`}
              >
                {item.icon}
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
