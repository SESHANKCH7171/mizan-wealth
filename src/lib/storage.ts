import { getSupabaseClient } from "@/lib/supabase";
import { createEmptyState } from "@/lib/defaultState";
import type { MizanState } from "@/types/mizan";

const LOCAL_STORAGE_KEY = "mizan_os_state_v1";

export function hasSavedLocalState(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(LOCAL_STORAGE_KEY));
}

export function loadLocalState(): MizanState {
  if (typeof window === "undefined") {
    return createEmptyState();
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw) as MizanState;
    if (!parsed || typeof parsed !== "object" || !parsed.settings) {
      return createEmptyState();
    }
    return parsed;
  } catch {
    return createEmptyState();
  }
}

export function saveLocalState(state: MizanState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchCloudState(userId: string): Promise<{
  state: MizanState | null;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) return { state: null, error: "Supabase not configured" };

  const { data, error } = await supabase
    .from("mizan_state")
    .select("data, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { state: null, error: error.message };
  }
  if (!data || !data.data) {
    return { state: null };
  }
  return { state: data.data as MizanState };
}

export async function pushCloudState(
  userId: string,
  state: MizanState
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { error } = await supabase.from("mizan_state").upsert(
    {
      user_id: userId,
      data: state,
      updated_at: state.updatedAt || new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
