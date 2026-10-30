import { useEffect, useState } from "react";

/**
 * Live market data for Kimaex trading.
 * Source: CoinGecko public market API (free, no key required) — returns live
 * USD and NGN prices, 24h change and market caps. One shared poll feeds every
 * screen, and the latest snapshot is cached in localStorage so prices render
 * instantly even before the first refresh of a session.
 */
const ENDPOINT = "https://api.coingecko.com/api/v3/simple/price";
const POLL_MS = 20_000;
const CACHE_KEY = "kimaex_live_prices_v1";
const EVT = "kimaex:liveprices";

/** Kimaex trading symbol -> CoinGecko market id. */
export const SYMBOL_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  NEAR: "near",
  BNB: "binancecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
  TON: "the-open-network",
  AVAX: "avalanche-2",
  ADA: "cardano",
  PEPE: "pepe",
  BONK: "bonk",
  SHIB: "shiba-inu",
  WIF: "dogwifcoin",
  FLOKI: "floki",
  USDC: "usd-coin",
};

export interface LivePrice {
  usd: number;
  ngn: number;
  change24h: number;
  usdMarketCap?: number;
  ngnMarketCap?: number;
  at: number;
}

export interface LiveFeed {
  prices: Record<string, LivePrice>;
  live: boolean;
  updatedAt: number;
}

const readCache = (): LiveFeed => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { prices: {}, live: false, updatedAt: 0 };
    const parsed = JSON.parse(raw) as LiveFeed;
    return {
      prices: parsed.prices ?? {},
      live: (parsed.updatedAt ?? 0) > 0,
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return { prices: {}, live: false, updatedAt: 0 };
  }
};

let state: LiveFeed = readCache();
let fetching = false;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

const publish = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch {
    /* storage full — in-memory price still works */
  }
  listeners.forEach((l) => l());
  window.dispatchEvent(new Event(EVT));
};

export const fetchLivePrices = async (): Promise<void> => {
  if (fetching) return;
  fetching = true;
  try {
    const ids = Array.from(new Set(Object.values(SYMBOL_IDS))).join(",");
    const res = await fetch(
      `${ENDPOINT}?ids=${ids}&vs_currencies=usd,ngn&include_24hr_change=true&include_market_cap=true`
    );
    if (!res.ok) throw new Error(`Live prices HTTP ${res.status}`);
    const data = (await res.json()) as Record<string, Record<string, number>>;
    const prices: Record<string, LivePrice> = {};
    for (const [symbol, id] of Object.entries(SYMBOL_IDS)) {
      const d = data[id];
      if (!d || typeof d.ngn !== "number" || d.ngn <= 0) continue;
      prices[symbol] = {
        usd: d.usd ?? 0,
        ngn: d.ngn,
        change24h: d.ngn_24h_change ?? d.usd_24h_change ?? 0,
        usdMarketCap: d.usd_market_cap,
        ngnMarketCap: d.ngn_market_cap,
        at: Date.now(),
      };
    }
    if (Object.keys(prices).length > 0) {
      state = { prices, live: true, updatedAt: Date.now() };
      publish();
    }
  } catch {
    // Network hiccup: keep the last good prices; the next poll retries.
  } finally {
    fetching = false;
  }
};

const ensureLoop = () => {
  if (timer) return;
  timer = setInterval(fetchLivePrices, POLL_MS);
  if (Date.now() - state.updatedAt > POLL_MS) void fetchLivePrices();
};

export const subscribeLivePrices = (fn: () => void) => {
  listeners.add(fn);
  ensureLoop();
  return () => {
    listeners.delete(fn);
  };
};

export const getLiveFeed = (): LiveFeed => state;

/** Reactive hook: every subscribed screen re-renders on each price refresh. */
export const useLivePrices = (): LiveFeed => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = subscribeLivePrices(() => setTick((t) => t + 1));
    return unsub;
  }, []);
  return state;
};

/** Format a live NGN price with sensible decimals (8dp under ₦1, else 2dp). */
export const fmtLiveNgn = (v: number) =>
  "₦" +
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: v < 1 ? 8 : 2,
    maximumFractionDigits: v < 1 ? 8 : 2,
  }).format(v);
