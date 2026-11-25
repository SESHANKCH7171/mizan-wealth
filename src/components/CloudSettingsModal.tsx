"use client";

import React, { useState } from "react";
import {
  Cloud,
  Download,
  LogOut,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { MizanSettings, MizanState } from "@/types/mizan";

interface CloudSettingsModalProps {
  open: boolean;
  onClose: () => void;
  userEmail: string | null;
  settings: MizanSettings;
  fullState: MizanState;
  onUpdateSettings: (next: MizanSettings) => void;
  onSyncNow: () => Promise<void>;
  onResetEmpty: () => void;
  onLoadSample: () => void;
}

const ALLOWED_EMAIL = "seshank@seshankailabs.com";

export function CloudSettingsModal({
  open,
  onClose,
  userEmail,
  settings,
  fullState,
  onUpdateSettings,
  onSyncNow,
  onResetEmpty,
  onLoadSample,
}: CloudSettingsModalProps) {
  const [email, setEmail] = useState(ALLOWED_EMAIL);
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [displayName, setDisplayName] = useState(settings.displayName);
  const [zakaatTarget, setZakaatTarget] = useState(
    String(settings.zakaatMissionTarget)
  );
  const [nisab, setNisab] = useState(String(settings.nisabThreshold));

  if (!open) return null;

  const supabase = getSupabaseClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ALLOWED_EMAIL) {
      setAuthMessage(`Access restricted to ${ALLOWED_EMAIL}.`);
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) setAuthMessage(error.message);
      else setAuthMessage("Signed in! Syncing your Mizan data...");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthMessage("Signed out. Running in Local Mode.");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      displayName: displayName.trim() || "Brother",
      zakaatMissionTarget: Number(zakaatTarget) || 1_00_00_000,
      nisabThreshold: Number(nisab) || 6_50_000,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(fullState, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mizan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="mizan-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-[#F4F1EA]">
              Cloud Sync &amp; Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A8A0] hover:text-[#F4F1EA] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Cloud Sync Section */}
        <div className="rounded-xl bg-[#060D0B] border border-[#D4AF37]/20 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#F4F1EA]">
            Supabase Cloud Sync (`mizan_state`)
          </h3>

          {!isSupabaseConfigured ? (
            <p className="text-xs text-[#94A8A0] leading-relaxed">
              Supabase environment variables (
              <code className="text-[#D4AF37]">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and{" "}
              <code className="text-[#D4AF37]">
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
              </code>
              ) are not configured yet. Add them in{" "}
              <code className="text-[#F4F1EA]">.env.local</code> or Vercel
              Project Settings to enable real-time PC &amp; Mobile sync.
            </p>
          ) : userEmail ? (
            <div className="space-y-3">
              <p className="text-xs text-[#10B981]">
                Connected as <span className="font-semibold">{userEmail}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSyncNow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] text-[#060D0B] font-semibold text-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Now
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 text-[#F4F1EA] text-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-2.5">
              <p className="text-[11px] text-[#94A8A0]">
                Private single-owner login (
                <span className="text-[#D4AF37]">{ALLOWED_EMAIL}</span>)
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ALLOWED_EMAIL}
                className="w-full rounded-lg bg-[#0B1A16] border border-[#D4AF37]/25 px-3 py-2 text-xs text-[#F4F1EA]"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg bg-[#0B1A16] border border-[#D4AF37]/25 px-3 py-2 text-xs text-[#F4F1EA]"
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2 rounded-lg bg-[#D4AF37] text-[#060D0B] font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                {authLoading ? "Connecting..." : "Sign In & Sync"}
              </button>
              {authMessage && (
                <p className="text-xs text-[#F59E0B]">{authMessage}</p>
              )}
            </form>
          )}
        </div>

        {/* Personal & Zakaat Settings */}
        <form onSubmit={handleSaveSettings} className="space-y-3">
          <h3 className="text-sm font-semibold text-[#F4F1EA]">
            Personal &amp; Mission Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#94A8A0] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-xs text-[#F4F1EA]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#94A8A0] mb-1">
                Zakaat Target (₹)
              </label>
              <input
                type="number"
                value={zakaatTarget}
                onChange={(e) => setZakaatTarget(e.target.value)}
                className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-xs text-[#F4F1EA] tabular-nums-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#94A8A0] mb-1">
                Nisab Threshold (₹)
              </label>
              <input
                type="number"
                value={nisab}
                onChange={(e) => setNisab(e.target.value)}
                className="w-full rounded-lg bg-[#060D0B] border border-[#D4AF37]/25 px-3 py-2 text-xs text-[#F4F1EA] tabular-nums-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#060D0B] font-semibold text-xs cursor-pointer"
          >
            Save Preferences
          </button>
        </form>

        {/* Backup & Reset */}
        <div className="border-t border-[#D4AF37]/15 pt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 text-xs text-[#F4F1EA] hover:bg-[#112620] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            Export JSON
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLoadSample();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#10B981]/30 text-xs text-[#10B981] hover:bg-[#10B981]/10 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Demo Data
            </button>
            <button
              type="button"
              onClick={() => {
                onResetEmpty();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Start Fresh (₹0)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
