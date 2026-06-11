import { useEffect, useState, useCallback } from "react";

const USDC_KEY = "kimaex_usdc_balance";
const HOLDINGS_KEY = "kimaex_stock_holdings";
const TX_KEY = "kimaex_stock_transactions";
const DEFAULT_USDC = 5234.56;

const EVT = "kimaex:portfolio";

export interface Holding {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
}

export interface StockTx {
  id: string;
  ticker: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  fee: number;
  at: number;
}

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const emit = () => window.dispatchEvent(new Event(EVT));

export const getUsdcBalance = (): number => {
  const raw = localStorage.getItem(USDC_KEY);
  if (raw == null) return DEFAULT_USDC;
  const n = parseFloat(raw);
  return isFinite(n) ? n : DEFAULT_USDC;
};

export const setUsdcBalance = (v: number) => {
  localStorage.setItem(USDC_KEY, String(Math.max(0, v)));
  emit();
};

export const getHoldings = (): Holding[] => readJSON<Holding[]>(HOLDINGS_KEY, []);
export const getHolding = (ticker: string) =>
  getHoldings().find((h) => h.ticker === ticker);

export const getTransactions = (): StockTx[] => readJSON<StockTx[]>(TX_KEY, []);

const saveHoldings = (h: Holding[]) => {
  localStorage.setItem(HOLDINGS_KEY, JSON.stringify(h));
  emit();
};

const saveTx = (tx: StockTx) => {
  const all = getTransactions();
  all.unshift(tx);
  localStorage.setItem(TX_KEY, JSON.stringify(all.slice(0, 100)));
};

export const buyStock = (
  ticker: string,
  name: string,
  shares: number,
  price: number,
  fee: number
): StockTx => {
  const cost = shares * price + fee;
  const bal = getUsdcBalance();
  if (cost > bal) throw new Error("Insufficient USDC balance");
  setUsdcBalance(bal - cost);
  const holdings = getHoldings();
  const idx = holdings.findIndex((h) => h.ticker === ticker);
  if (idx >= 0) {
    const prev = holdings[idx];
    const newShares = prev.shares + shares;
    const newAvg = (prev.avgPrice * prev.shares + price * shares) / newShares;
    holdings[idx] = { ...prev, shares: newShares, avgPrice: newAvg };
  } else {
    holdings.push({ ticker, name, shares, avgPrice: price });
  }
  saveHoldings(holdings);
  const tx: StockTx = {
    id: "TX-" + Date.now().toString(36).toUpperCase(),
    ticker,
    side: "buy",
    shares,
    price,
    total: cost,
    fee,
    at: Date.now(),
  };
  saveTx(tx);
  return tx;
};

export const sellStock = (
  ticker: string,
  shares: number,
  price: number,
  fee: number
): StockTx => {
  const holdings = getHoldings();
  const idx = holdings.findIndex((h) => h.ticker === ticker);
  if (idx < 0 || holdings[idx].shares < shares)
    throw new Error("Not enough shares");
  const gross = shares * price;
  const net = Math.max(0, gross - fee);
  holdings[idx].shares -= shares;
  if (holdings[idx].shares <= 0.000001) holdings.splice(idx, 1);
  saveHoldings(holdings);
  setUsdcBalance(getUsdcBalance() + net);
  const tx: StockTx = {
    id: "TX-" + Date.now().toString(36).toUpperCase(),
    ticker,
    side: "sell",
    shares,
    price,
    total: net,
    fee,
    at: Date.now(),
  };
  saveTx(tx);
  return tx;
};

export const usePortfolio = () => {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return {
    usdc: getUsdcBalance(),
    holdings: getHoldings(),
    transactions: getTransactions(),
  };
};
