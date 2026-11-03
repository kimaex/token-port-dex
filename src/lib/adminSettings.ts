import { useEffect, useState } from "react";

// Kimaex admin settings (device-local, editable from /admin).
// Controls platform fees, limits and which home/nav features are visible.

const KEY = "kimaex_admin_settings_v1";
const EVT = "kimaex:admin";

export interface AdminSettings {
  swapFeePct: number;
  futuresFeePct: number;
  withdrawalFeeNGN: number;
  minTxNGN: number;
  features: Record<string, boolean>;
}

export const DEFAULT_ADMIN: AdminSettings = {
  swapFeePct: 2,
  futuresFeePct: 0.09,
  withdrawalFeeNGN: 20,
  minTxNGN: 790, // ₦790 ≈ $0.50 platform-wide minimum
  features: {
    addMoney: true,
    send: true,
    receive: true,
    bills: true,
    quickSwap: true,
    swapNav: true,
    historyNav: true,
    futuresNav: true,
  },
};

export const FEATURE_LABELS: Record<string, string> = {
  addMoney: "Add Money (home)",
  send: "Send (home)",
  receive: "Receive (home)",
  bills: "Bills (home)",
  quickSwap: "Quick Swap (home)",
  swapNav: "Swap (bottom nav)",
  historyNav: "History (bottom nav)",
  futuresNav: "Futures (bottom nav)",
};

const read = (): AdminSettings => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_ADMIN };
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    return {
      ...DEFAULT_ADMIN,
      ...parsed,
      features: { ...DEFAULT_ADMIN.features, ...(parsed.features || {}) },
    };
  } catch {
    return { ...DEFAULT_ADMIN };
  }
};

const emit = () => window.dispatchEvent(new Event(EVT));

export const getAdmin = (): AdminSettings => read();

export const saveAdmin = (patch: Partial<AdminSettings>) => {
  const next = {
    ...read(),
    ...patch,
    features: { ...read().features, ...(patch.features || {}) },
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
};

export const resetAdmin = () => {
  localStorage.removeItem(KEY);
  emit();
};

export const getSwapFeePct = () => read().swapFeePct;
export const getFuturesFeePct = () => read().futuresFeePct;
export const getWithdrawalFeeNGN = () => read().withdrawalFeeNGN;
export const getMinTxNGN = () => read().minTxNGN;
export const isFeatureOn = (id: string) => read().features[id] !== false;

/** Reactive settings for components. */
export const useAdmin = (): AdminSettings => {
  const [s, setS] = useState<AdminSettings>(read);
  useEffect(() => {
    const refresh = () => setS(read());
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return s;
};
