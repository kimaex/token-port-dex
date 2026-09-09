import { useCallback, useEffect, useState } from "react";
import { getUsdcBalance, setUsdcBalance } from "@/lib/portfolioStore";
import { NGN_PER_USD } from "@/lib/naira";

/**
 * Futures wallet — a separate Naira balance used only for futures trading.
 * Users transfer instantly between Main Wallet (USDC balance) and Futures Wallet.
 */
const FUT_KEY = "kimaex_futures_ngn";
const EVT = "kimaex:futures-wallet";

const emit = () => window.dispatchEvent(new Event(EVT));

export const getFuturesNGN = (): number => {
  const raw = localStorage.getItem(FUT_KEY);
  const n = raw == null ? 0 : parseFloat(raw);
  return isFinite(n) ? Math.max(0, n) : 0;
};

export const setFuturesNGN = (v: number) => {
  localStorage.setItem(FUT_KEY, String(Math.max(0, v)));
  emit();
};

export const creditFutures = (ngn: number) => setFuturesNGN(getFuturesNGN() + ngn);
export const debitFutures = (ngn: number) => setFuturesNGN(getFuturesNGN() - ngn);

export const getMainNGN = () => getUsdcBalance() * NGN_PER_USD;

/** Main Wallet -> Futures Wallet (instant, no fee) */
export const transferToFutures = (ngn: number) => {
  if (!(ngn > 0)) throw new Error("Enter an amount");
  if (ngn > getMainNGN()) throw new Error("Insufficient Main Wallet balance");
  setUsdcBalance(getUsdcBalance() - ngn / NGN_PER_USD);
  creditFutures(ngn);
};

/** Futures Wallet -> Main Wallet (instant, no fee) */
export const transferToMain = (ngn: number) => {
  if (!(ngn > 0)) throw new Error("Enter an amount");
  if (ngn > getFuturesNGN()) throw new Error("Insufficient Futures Wallet balance");
  debitFutures(ngn);
  setUsdcBalance(getUsdcBalance() + ngn / NGN_PER_USD);
};

export const useFuturesWallet = () => {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    window.addEventListener(EVT, refresh);
    window.addEventListener("kimaex:portfolio", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("kimaex:portfolio", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return { futuresNGN: getFuturesNGN(), mainNGN: getMainNGN() };
};
