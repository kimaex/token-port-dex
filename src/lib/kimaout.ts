// KimaOut auto-share + follower notification store (device-local).
// Privacy: only symbol, side, entry price, leverage and time are ever published —
// never balances, amounts, bank details or portfolio value.

export const CALLS_KEY = "kimaout_calls_v1";
const SETTINGS_KEY = "kimaout_settings_v1";
const NOTIF_KEY = "kimaout_notifs_v1";
const FOLLOWS_KEY = "kimaout_follows_v1";
const SUBS_KEY = "kimaout_subs_v1";

export type NotifKind = "swap" | "futures" | "closed" | "tp" | "sl";

export interface KimaOutSettings {
  autoShare: boolean;
  muteAll: boolean;
  kinds: Record<NotifKind, boolean>;
}

export const DEFAULT_SETTINGS: KimaOutSettings = {
  autoShare: false,
  muteAll: false,
  kinds: { swap: true, futures: true, closed: false, tp: false, sl: false },
};

export interface KimaOutNotif {
  id: string; user: string; kind: NotifKind; text: string;
  callId: string; route: string; ts: number; read: boolean;
}

const read = <T,>(k: string, d: T): T => { try { const r = localStorage.getItem(k); return r ? { ...(d as object), ...JSON.parse(r) } as T : d; } catch { return d; } };
const readArr = <T,>(k: string): T[] => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };

export const getSettings = (): KimaOutSettings => {
  const s = read(SETTINGS_KEY, DEFAULT_SETTINGS);
  return { ...s, kinds: { ...DEFAULT_SETTINGS.kinds, ...s.kinds } };
};
export const saveSettings = (s: KimaOutSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

export const getFollows = (): string[] => readArr<string>(FOLLOWS_KEY);
/** Handles the user has Trade Notifications ON for. */
export const getSubs = (): string[] => readArr<string>(SUBS_KEY);
export const setSubs = (s: string[]) => localStorage.setItem(SUBS_KEY, JSON.stringify(s));

export const getNotifs = (): KimaOutNotif[] => readArr<KimaOutNotif>(NOTIF_KEY);
export const saveNotifs = (n: KimaOutNotif[]) => localStorage.setItem(NOTIF_KEY, JSON.stringify(n.slice(0, 100)));

/** Seed traders' own Auto Share setting (simulated other users). */
export const traderAutoShare = (handle: string) => handle !== "abujaTrader";

/** Permission rule: trader Auto Share ON AND follower follows + Trade Notifications ON + kind enabled + not muted. */
export const shouldNotify = (traderAuto: boolean, following: boolean, subscribed: boolean, s: KimaOutSettings, kind: NotifKind) =>
  traderAuto && following && subscribed && !s.muteAll && s.kinds[kind];

export const userHandle = () => {
  try { const p = JSON.parse(localStorage.getItem("kimaex_profile") || "{}"); return (p.firstName || p.name || "you").toString().split(" ")[0]; } catch { return "you"; }
};

const pushCall = (call: Record<string, unknown>) => {
  const calls = readArr<Record<string, unknown>>(CALLS_KEY);
  localStorage.setItem(CALLS_KEY, JSON.stringify([call, ...calls]));
};

/** Called after a completed swap. No-op if Auto Share is OFF. */
export const autoShareSwap = (symbol: string, priceNGN: number) => {
  if (!getSettings().autoShare) return false;
  pushCall({
    id: `auto${Date.now()}`, user: "you", type: "MEME", token: symbol, entry: priceNGN,
    target: priceNGN * 1.5, stop: priceNGN * 0.7, leverage: 1, note: `swapped into $${symbol}`,
    createdAt: Date.now(), likes: [], comments: [], shares: 0, auto: "swap", ngn: true, route: "/swap",
  });
  return true;
};

/** Called after a futures position opens. No-op if Auto Share is OFF. */
export const autoShareFutures = (pair: string, side: "long" | "short", entryNGN: number, leverage: number) => {
  if (!getSettings().autoShare) return false;
  const long = side === "long";
  pushCall({
    id: `auto${Date.now()}`, user: "you", type: long ? "LONG" : "SHORT", token: pair.split("/")[0], entry: entryNGN,
    target: entryNGN * (long ? 1.1 : 0.9), stop: entryNGN * (long ? 0.95 : 1.05), leverage,
    note: `opened a ${long ? "LONG" : "SHORT"} · ${pair} PERP`,
    createdAt: Date.now(), likes: [], comments: [], shares: 0, auto: "futures", ngn: true, route: "/futures",
  });
  return true;
};
