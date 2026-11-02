import { autoShareFutures } from "@/lib/kimaout";
import { useLivePrices } from "@/lib/livePrices";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { usePortfolio } from "@/lib/portfolioStore";
import { NGN_PER_USD, fmtNGN } from "@/lib/naira";
import {
  useFuturesWallet,
  creditFutures,
  debitFutures,
  transferToFutures,
  transferToMain,
} from "@/lib/futuresWallet";
import { WinningPoster, PosterData } from "@/components/WinningPoster";


interface Pair {
  symbol: string;
  base: string;
  usd: number;
  change: number;
}

const PAIRS: Pair[] = [
  { symbol: "BTC/NGN", base: "BTC", usd: 96420, change: 2.41 },
  { symbol: "ETH/NGN", base: "ETH", usd: 3320, change: -1.12 },
  { symbol: "SOL/NGN", base: "SOL", usd: 198.4, change: 4.85 },
  { symbol: "NEAR/NGN", base: "NEAR", usd: 5.18, change: 3.2 },
  { symbol: "BNB/NGN", base: "BNB", usd: 612.3, change: 0.74 },
  { symbol: "XRP/NGN", base: "XRP", usd: 2.31, change: -2.06 },
  { symbol: "DOGE/NGN", base: "DOGE", usd: 0.3812, change: 5.9 },
  { symbol: "TON/NGN", base: "TON", usd: 5.42, change: 1.33 },
  { symbol: "AVAX/NGN", base: "AVAX", usd: 38.7, change: -0.58 },
];

const LEVERAGES = [1, 3, 5, 10, 20, 25, 50, 75, 100, 125];

interface Position {
  id: string;
  symbol: string;
  side: "long" | "short";
  leverage: number;
  entry: number; // NGN
  size: number; // NGN notional
  margin: number; // NGN
  liq: number; // NGN
  mode: "cross" | "isolated";
  tp?: number;
  sl?: number;
  at: number;
}

interface OpenOrder {
  id: string;
  symbol: string;
  side: "long" | "short";
  leverage: number;
  price: number;
  margin: number;
  mode: "cross" | "isolated";
  at: number;
}

const POS_KEY = "futures_positions";
const HIST_KEY = "futures_history";
const ORD_KEY = "futures_open_orders";
const MODE_KEY = "kimaex_futures_ui_mode";

const readPositions = (): Position[] => {
  try {
    return JSON.parse(localStorage.getItem(POS_KEY) || "[]");
  } catch {
    return [];
  }
};

const readOrders = (): OpenOrder[] => {
  try {
    return JSON.parse(localStorage.getItem(ORD_KEY) || "[]");
  } catch {
    return [];
  }
};

interface HistoryEntry {
  id: string;
  symbol: string;
  side: "long" | "short";
  leverage: number;
  entry: number;
  exit: number;
  proceeds: number;
  pnl: number;
  at: number;
}

const readHistory = (): HistoryEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
  } catch {
    return [];
  }
};

const Futures = () => {
  usePortfolio();
  const { futuresNGN, mainNGN } = useFuturesWallet();
  const [uiMode, setUiMode] = useState<"simple" | "pro">(
    () => (localStorage.getItem(MODE_KEY) as "simple" | "pro") || "simple"
  );
  const live = useLivePrices();

  // Live market prices (refreshed every ~20s) override the base pair list.
  const livePairs = useMemo<Pair[]>(
    () =>
      PAIRS.map((p) => {
        const L = live.prices[p.base];
        return L ? { ...p, usd: L.usd, change: L.change24h } : p;
      }),
    [live.prices]
  );
  const [pairState, setPairState] = useState<Pair>(PAIRS[0]);
  const pair = livePairs.find((p) => p.symbol === pairState.symbol) ?? pairState;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [leverage, setLeverage] = useState(20);
  const [limitPrice, setLimitPrice] = useState("");
  const [amount, setAmount] = useState(""); // margin in NGN
  const [tab, setTab] = useState<"positions" | "orders" | "history">("positions");
  const [positions, setPositions] = useState<Position[]>(readPositions);
  const [orders, setOrders] = useState<OpenOrder[]>(readOrders);
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory);
  const [tick, setTick] = useState(0);
  const [marginMode, setMarginMode] = useState<"cross" | "isolated">("cross");
  const [poster, setPoster] = useState<PosterData | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferDir, setTransferDir] = useState<"toFutures" | "toMain">("toFutures");
  const [transferAmt, setTransferAmt] = useState("");
  const [realized, setRealized] = useState<number>(() =>
    readHistory().reduce((a, h) => a + (h.pnl || 0), 0)
  );
  const [tpslFor, setTpslFor] = useState<Position | null>(null);
  const [tpInput, setTpInput] = useState("");
  const [slInput, setSlInput] = useState("");
  const driftRef = useRef<Record<string, number>>({});

  const pro = uiMode === "pro";

  useEffect(() => {
    localStorage.setItem(MODE_KEY, uiMode);
    if (uiMode === "simple") {
      setOrderType("market");
      setMarginMode("cross");
      if (tab === "orders") setTab("positions");
    }
  }, [uiMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // live-ish price drift
  useEffect(() => {
    const t = setInterval(() => {
      const d = driftRef.current;
      PAIRS.forEach((p) => {
        d[p.symbol] = (d[p.symbol] ?? 0) + (Math.random() - 0.5) * 0.0016;
      });
      setTick((x) => x + 1);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // Snap micro-drift back to zero whenever a fresh market price lands.
  useEffect(() => {
    if (live.updatedAt) {
      driftRef.current = {};
      setTick((x) => x + 1);
    }
  }, [live.updatedAt]);

  const priceOf = (p: Pair) => {
    const L = live.prices[p.base];
    // Live Naira price straight from the market feed; falls back to the
    // configured USD rate when the feed has no data for this pair yet.
    const base = L ? L.ngn : p.usd * NGN_PER_USD;
    return base * (1 + (driftRef.current[p.symbol] ?? 0));
  };

  const mark = priceOf(pair);
  const balanceNGN = futuresNGN;

  /** Funding rate per 8h, drifts slightly with the market. */
  const fundingRate = useMemo(
    () => (pair.change / 100) * 0.012 + 0.0001,
    [pair]
  );

  const persist = (next: Position[]) => {
    setPositions(next);
    localStorage.setItem(POS_KEY, JSON.stringify(next));
  };

  const persistOrders = (next: OpenOrder[]) => {
    setOrders(next);
    localStorage.setItem(ORD_KEY, JSON.stringify(next));
  };


  const series = useMemo(() => {
    const pts: number[] = [];
    let v = 100;
    let seed = pair.symbol.length * 7 + pair.base.charCodeAt(0);
    for (let i = 0; i < 60; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      v += (seed / 233280 - 0.48) * 4;
      pts.push(v);
    }
    return pts;
  }, [pair]);

  const path = useMemo(() => {
    const min = Math.min(...series);
    const max = Math.max(...series);
    const r = max - min || 1;
    return series
      .map((v, i) => {
        const x = (i / (series.length - 1)) * 300;
        const y = 110 - ((v - min) / r) * 100;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [series]);

  const book = useMemo(() => {
    const asks = Array.from({ length: 6 }, (_, i) => ({
      price: mark * (1 + (i + 1) * 0.0006),
      size: 0.12 + ((i * 37) % 9) / 10,
    })).reverse();
    const bids = Array.from({ length: 6 }, (_, i) => ({
      price: mark * (1 - (i + 1) * 0.0006),
      size: 0.14 + ((i * 53) % 9) / 10,
    }));
    return { asks, bids };
  }, [mark]);

  const marginNGN = parseFloat(amount) || 0;
  const entry = orderType === "limit" ? parseFloat(limitPrice) || mark : mark;
  const notional = marginNGN * leverage;
  const qty = entry > 0 ? notional / entry : 0;
  const fee = notional * 0.0009; // 0.09% taker fee
  const liq =
    side === "long" ? entry * (1 - 1 / leverage) : entry * (1 + 1 / leverage);

  const pnlOf = (p: Position) => {
    const cur = priceOf(PAIRS.find((x) => x.symbol === p.symbol) || pair);
    const dir = p.side === "long" ? 1 : -1;
    return ((cur - p.entry) / p.entry) * p.size * dir;
  };

  const openPosition = () => {
    if (marginNGN <= 0) return toast.error("Enter an amount");
    if (marginNGN + fee > balanceNGN)
      return toast.error("Insufficient Futures Wallet balance");
    if (marginNGN < 0.5 * NGN_PER_USD)
      return toast.error(`Minimum margin is ${fmtNGN(0.5 * NGN_PER_USD, 0)}`);

    if (orderType === "limit") {
      debitFutures(marginNGN + fee);
      const ord: OpenOrder = {
        id: "ORD-" + Date.now().toString(36).toUpperCase(),
        symbol: pair.symbol,
        side,
        leverage,
        price: entry,
        margin: marginNGN,
        mode: marginMode,
        at: Date.now(),
      };
      persistOrders([ord, ...orders]);
      setAmount("");
      setTab("orders");
      toast.success(`Limit ${side} placed at ${fmtNGN(entry, 0)}`);
      return;
    }

    debitFutures(marginNGN + fee);
    const pos: Position = {
      id: "FUT-" + Date.now().toString(36).toUpperCase(),
      symbol: pair.symbol,
      side,
      leverage,
      entry,
      size: notional,
      margin: marginNGN,
      liq,
      mode: marginMode,
      at: Date.now(),
    };
    persist([pos, ...positions]);
    setAmount("");
    setTab("positions");
    toast.success(
      `${side === "long" ? "Long" : "Short"} ${pair.symbol} ${leverage}x opened`
    );
    if (autoShareFutures(pair.symbol, side as "long" | "short", entry, leverage)) toast("📣 Auto-shared to KimaOut");
  };

  const cancelOrder = (o: OpenOrder) => {
    creditFutures(o.margin);
    persistOrders(orders.filter((x) => x.id !== o.id));
    toast.success("Order cancelled");
  };

  const fillOrder = (o: OpenOrder) => {
    const pos: Position = {
      id: "FUT-" + Date.now().toString(36).toUpperCase(),
      symbol: o.symbol,
      side: o.side,
      leverage: o.leverage,
      entry: o.price,
      size: o.margin * o.leverage,
      margin: o.margin,
      liq:
        o.side === "long"
          ? o.price * (1 - 1 / o.leverage)
          : o.price * (1 + 1 / o.leverage),
      mode: o.mode,
      at: Date.now(),
    };
    persist([pos, ...positions]);
    persistOrders(orders.filter((x) => x.id !== o.id));
    setTab("positions");
    toast.success("Limit order filled");
  };

  const closePosition = (p: Position) => {
    const pnl = pnlOf(p);
    const closeFee = p.size * 0.0009;
    const proceeds = Math.max(0, p.margin + pnl - closeFee);
    creditFutures(proceeds);
    persist(positions.filter((x) => x.id !== p.id));
    const entryRec: HistoryEntry = {
      id: p.id,
      symbol: p.symbol,
      side: p.side,
      leverage: p.leverage,
      entry: p.entry,
      exit: priceOf(PAIRS.find((x) => x.symbol === p.symbol) || pair),
      proceeds,
      pnl: pnl - closeFee,
      at: Date.now(),
    };
    try {
      const hist = readHistory();
      hist.unshift(entryRec);
      const trimmed = hist.slice(0, 100);
      localStorage.setItem(HIST_KEY, JSON.stringify(trimmed));
      setHistory(trimmed);
    } catch {}
    setRealized((r) => r + pnl - closeFee);
    toast.success(`Position closed · ${pnl >= 0 ? "+" : ""}${fmtNGN(pnl)}`);
    if (pnl - closeFee > 0) {
      setPoster({
        symbol: p.symbol,
        side: p.side,
        leverage: p.leverage,
        pnl: pnl - closeFee,
        roi: ((pnl - closeFee) / p.margin) * 100,
      });
    }
  };

  const doTransfer = () => {
    const v = parseFloat(transferAmt) || 0;
    try {
      if (transferDir === "toFutures") transferToFutures(v);
      else transferToMain(v);
      toast.success(
        `${fmtNGN(v)} moved to ${
          transferDir === "toFutures" ? "Futures Wallet" : "Main Wallet"
        }`
      );
      setTransferAmt("");
      setTransferOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transfer failed");
    }
  };


  const saveTpSl = () => {
    if (!tpslFor) return;
    persist(
      positions.map((p) =>
        p.id === tpslFor.id
          ? {
              ...p,
              tp: parseFloat(tpInput) || undefined,
              sl: parseFloat(slInput) || undefined,
            }
          : p
      )
    );
    setTpslFor(null);
    toast.success("TP/SL updated");
  };

  const filtered = livePairs.filter(
    (p) =>
      p.symbol.toLowerCase().includes(query.toLowerCase()) ||
      p.base.toLowerCase().includes(query.toLowerCase())
  );

  const unrealized = positions.reduce((a, p) => a + pnlOf(p), 0);
  const totalMargin = positions.reduce((a, p) => a + p.margin, 0);
  const totalSize = positions.reduce((a, p) => a + p.size, 0);
  const up = pair.change >= 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-2"
              onClick={() => setPickerOpen(true)}
            >
              <span className="text-lg font-bold">{pair.symbol}</span>
              <Badge className="bg-primary/15 text-primary border-0 text-[10px]">
                Perp
              </Badge>
              {live.live && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  LIVE
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex p-0.5 rounded-lg bg-muted">
              {(["simple", "pro"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setUiMode(m)}
                  className={`px-3 h-7 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                    uiMode === m
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground"
                  }`}
                >
                  {m} mode
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 mt-2">
            <p
              className={`text-2xl font-bold tabular-nums ${
                up ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {fmtNGN(mark, 2)}
            </p>
            <span
              className={`text-sm font-semibold mb-1 ${
                up ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {up ? "+" : ""}
              {pair.change.toFixed(2)}%
            </span>
            {pro && (
              <span className="text-[10px] text-muted-foreground mb-1 ml-auto">
                Funding{" "}
                <span
                  className={
                    fundingRate >= 0 ? "text-emerald-500" : "text-rose-500"
                  }
                >
                  {(fundingRate * 100).toFixed(4)}%
                </span>{" "}
                / 8h
              </span>
            )}
          </div>
        </div>

        {/* Wallets + transfer */}
        <div className="px-4 pt-3">
          <div className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Main Wallet</p>
                <p className="text-sm font-semibold tabular-nums">
                  {fmtNGN(mainNGN, 2)}
                </p>
              </div>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> Futures Wallet
                </p>
                <p className="text-sm font-semibold tabular-nums text-primary">
                  {fmtNGN(futuresNGN, 2)}
                </p>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTransferOpen(true)}
              >
                Transfer
              </Button>
            </div>
            {futuresNGN <= 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Move Naira into your Futures Wallet to start trading.
              </p>
            )}
          </div>
        </div>


        {/* Chart */}
        <div className="px-4 pt-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <svg viewBox="0 0 300 120" className="w-full h-32">
              <defs>
                <linearGradient id="futGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={up ? "#22C55E" : "#EF4444"}
                    stopOpacity="0.35"
                  />
                  <stop
                    offset="100%"
                    stopColor={up ? "#22C55E" : "#EF4444"}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d={`${path} L300,120 L0,120 Z`}
                fill="url(#futGrad)"
                stroke="none"
              />
              <path
                d={path}
                fill="none"
                stroke={up ? "#22C55E" : "#EF4444"}
                strokeWidth="2"
              />
            </svg>
            <div className="flex gap-2 mt-2">
              {["1m", "5m", "15m", "1H", "4H", "1D"].map((tf, i) => (
                <button
                  key={tf}
                  className={`text-[11px] px-2 py-1 rounded-md ${
                    i === 2
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order entry + book */}
        <div className={`px-4 pt-3 grid gap-3 ${pro ? "grid-cols-5" : "grid-cols-1"}`}>
          <div className={`space-y-3 ${pro ? "col-span-3" : ""}`}>
            {pro && (
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted">
                {(["cross", "isolated"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarginMode(m)}
                    className={`h-8 rounded-md text-xs font-semibold capitalize transition-colors ${
                      marginMode === m
                        ? "bg-card text-foreground shadow-card"
                        : "text-muted-foreground"
                    }`}
                  >
                    {m} margin
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSide("long")}
                className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                  side === "long"
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {pro ? "Long" : "Up / Long"}
              </button>
              <button
                onClick={() => setSide("short")}
                className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                  side === "short"
                    ? "bg-rose-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {pro ? "Short" : "Down / Short"}
              </button>
            </div>

            {pro && (
              <div className="flex gap-3 text-xs">
                {(["market", "limit"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`capitalize pb-1 border-b-2 ${
                      orderType === t
                        ? "border-primary text-foreground font-semibold"
                        : "border-transparent text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {pro && orderType === "limit" && (
              <div>
                <label className="text-[11px] text-muted-foreground">
                  Limit price (₦)
                </label>
                <Input
                  inputMode="decimal"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={mark.toFixed(2)}
                  className="h-10"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-muted-foreground">
                Margin (₦ from Futures Wallet)
              </label>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-10"
              />
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() =>
                      setAmount(((balanceNGN * pct) / 100).toFixed(2))
                    }
                    className="flex-1 text-[11px] py-1 rounded-md bg-muted text-muted-foreground"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">
                  Leverage
                </span>
                <span className="text-xs font-bold text-primary">
                  {leverage}x
                </span>
              </div>
              {pro ? (
                <>
                  <Slider
                    value={[
                      LEVERAGES.indexOf(leverage) < 0
                        ? 4
                        : LEVERAGES.indexOf(leverage),
                    ]}
                    min={0}
                    max={LEVERAGES.length - 1}
                    step={1}
                    onValueChange={(v) => setLeverage(LEVERAGES[v[0]])}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>1x</span>
                    <span>125x</span>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  {[2, 5, 10, 20].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLeverage(l)}
                      className={`flex-1 h-9 rounded-lg text-xs font-semibold ${
                        leverage === l
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {l}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order book */}
          {pro && (
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground mb-1">Order book</p>
              <div className="space-y-0.5">
                {book.asks.map((a, i) => (
                  <div key={i} className="flex justify-between text-[10px] tabular-nums">
                    <span className="text-rose-500">{fmtNGN(a.price, 0)}</span>
                    <span className="text-muted-foreground">{a.size.toFixed(2)}</span>
                  </div>
                ))}
                <div className="py-1 text-xs font-bold tabular-nums text-center">
                  {fmtNGN(mark, 0)}
                </div>
                {book.bids.map((b, i) => (
                  <div key={i} className="flex justify-between text-[10px] tabular-nums">
                    <span className="text-emerald-500">{fmtNGN(b.price, 0)}</span>
                    <span className="text-muted-foreground">{b.size.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* Summary + submit */}
        <div className="px-4 pt-3 space-y-1 text-[11px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Order value</span>
            <span className="text-foreground tabular-nums">{fmtNGN(notional)}</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity</span>
            <span className="text-foreground tabular-nums">
              {qty.toFixed(6)} {pair.base}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Est. liquidation</span>
            <span className="text-rose-500 tabular-nums">{fmtNGN(liq)}</span>
          </div>
          <div className="flex justify-between">
            <span>Fee (0.09%)</span>
            <span className="text-foreground tabular-nums">{fmtNGN(fee)}</span>
          </div>
        </div>

        <div className="px-4 pt-3">
          <Button
            onClick={openPosition}
            className={`w-full h-12 text-base font-semibold text-white ${
              side === "long"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-rose-500 hover:bg-rose-600"
            }`}
          >
            {side === "long" ? (
              <TrendingUp className="h-4 w-4 mr-2" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-2" />
            )}
            {side === "long" ? "Buy / Long" : "Sell / Short"} {leverage}x
          </Button>
        </div>

        {/* Positions */}
        <div className="px-4 pt-5">
          <div className="flex gap-4 border-b border-border">
            {(pro
              ? (["positions", "orders", "history"] as const)
              : (["positions", "history"] as const)
            ).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`capitalize pb-2 text-sm border-b-2 ${
                  tab === t
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {t === "positions"
                  ? `Positions (${positions.length})`
                  : t === "orders"
                  ? `Open orders (${orders.length})`
                  : "Order history"}
              </button>
            ))}
          </div>


          {tab === "positions" ? (
            positions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                No open positions
              </p>
            ) : (
              <div className="space-y-3 pt-3">
                {positions.map((p) => {
                  const pnl = pnlOf(p);
                  const roe = (pnl / p.margin) * 100;
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{p.symbol}</span>
                          <Badge
                            className={`text-[10px] border-0 ${
                              p.side === "long"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-rose-500/15 text-rose-500"
                            }`}
                          >
                            {p.side === "long" ? "Long" : "Short"} {p.leverage}x
                          </Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {p.mode ?? "cross"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold tabular-nums ${
                              pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}
                            {fmtNGN(pnl)}
                          </p>
                          <p
                            className={`text-[10px] tabular-nums ${
                              pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {roe >= 0 ? "+" : ""}
                            {roe.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-muted-foreground">
                        <div>
                          <p>Entry</p>
                          <p className="text-foreground tabular-nums">
                            {fmtNGN(p.entry, 0)}
                          </p>
                        </div>
                        <div>
                          <p>Margin</p>
                          <p className="text-foreground tabular-nums">
                            {fmtNGN(p.margin, 0)}
                          </p>
                        </div>
                        <div>
                          <p>Liq. price</p>
                          <p className="text-rose-500 tabular-nums">
                            {fmtNGN(p.liq, 0)}
                          </p>
                        </div>
                        <div>
                          <p>Mark price</p>
                          <p className="text-foreground tabular-nums">
                            {fmtNGN(
                              priceOf(
                                PAIRS.find((x) => x.symbol === p.symbol) || pair
                              ),
                              0
                            )}
                          </p>
                        </div>
                        <div>
                          <p>Position size</p>
                          <p className="text-foreground tabular-nums">
                            {fmtNGN(p.size, 0)}
                          </p>
                        </div>
                        <div>
                          <p>Fees (round trip)</p>
                          <p className="text-foreground tabular-nums">
                            {fmtNGN(p.size * 0.0018, 0)}
                          </p>
                        </div>
                      </div>
                      {(p.tp || p.sl) && (
                        <p className="text-[10px] text-muted-foreground mt-2">
                          TP {p.tp ? fmtNGN(p.tp, 0) : "—"} · SL{" "}
                          {p.sl ? fmtNGN(p.sl, 0) : "—"}
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="secondary"
                          className="flex-1 h-9 text-xs"
                          onClick={() => {
                            setTpslFor(p);
                            setTpInput(p.tp ? String(p.tp) : "");
                            setSlInput(p.sl ? String(p.sl) : "");
                          }}
                        >
                          TP/SL
                        </Button>
                        {pnl > 0 && (
                          <Button
                            variant="secondary"
                            className="flex-1 h-9 text-xs"
                            onClick={() =>
                              setPoster({
                                symbol: p.symbol,
                                side: p.side,
                                leverage: p.leverage,
                                pnl,
                                roi: (pnl / p.margin) * 100,
                              })
                            }
                          >
                            Share Winning
                          </Button>
                        )}
                        <Button
                          className="flex-1 h-9 text-xs"
                          onClick={() => closePosition(p)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : tab === "orders" ? (
            orders.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                No open orders
              </p>
            ) : (
              <div className="space-y-3 pt-3">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{o.symbol}</span>
                        <Badge
                          className={`text-[10px] border-0 ${
                            o.side === "long"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : "bg-rose-500/15 text-rose-500"
                          }`}
                        >
                          {o.side === "long" ? "Long" : "Short"} {o.leverage}x
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Limit
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {fmtNGN(o.price, 0)}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                      Margin {fmtNGN(o.margin, 0)} · Order value{" "}
                      {fmtNGN(o.margin * o.leverage, 0)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="secondary"
                        className="flex-1 h-9 text-xs"
                        onClick={() => cancelOrder(o)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 h-9 text-xs"
                        onClick={() => fillOrder(o)}
                      >
                        Fill now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : history.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">
              No order history yet
            </p>
          ) : (
            <div className="space-y-3 pt-3">
              {history.map((h) => (
                <div key={h.id + h.at} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{h.symbol}</span>
                      <Badge
                        className={`text-[10px] border-0 ${
                          h.side === "long"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-rose-500/15 text-rose-500"
                        }`}
                      >
                        {h.side === "long" ? "Long" : "Short"} {h.leverage}x
                      </Badge>
                    </div>
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        h.pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {h.pnl >= 0 ? "+" : ""}
                      {fmtNGN(h.pnl)}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                    Entry {fmtNGN(h.entry, 0)} → Exit {fmtNGN(h.exit, 0)} ·{" "}
                    {new Date(h.at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        <BottomNav />
      </div>

      {/* Pair picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select market</DialogTitle>
            <DialogDescription>All pairs settle in Naira (₦)</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pair"
              className="pl-9"
            />
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {filtered.map((p) => (
              <button
                key={p.symbol}
                onClick={() => {
                  setPair(p);
                  setPickerOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted"
              >
                <span className="text-sm font-medium">{p.symbol}</span>
                <span className="text-right">
                  <span className="block text-sm tabular-nums">
                    {fmtNGN(priceOf(p), 2)}
                  </span>
                  <span
                    className={`block text-[10px] ${
                      p.change >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {p.change >= 0 ? "+" : ""}
                    {p.change.toFixed(2)}%
                  </span>
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>
              Instant · no fee · between Main Wallet and Futures Wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-1">
              <button
                onClick={() => setTransferDir("toFutures")}
                className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                  transferDir === "toFutures"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Main → Futures
              </button>
              <button
                onClick={() => setTransferDir("toMain")}
                className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                  transferDir === "toMain"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Futures → Main
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Available</span>
              <span className="font-semibold tabular-nums">
                {fmtNGN(transferDir === "toFutures" ? mainNGN : futuresNGN, 2)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₦
              </span>
              <Input
                inputMode="decimal"
                className="pl-8"
                value={transferAmt}
                onChange={(e) => setTransferAmt(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() =>
                setTransferAmt(
                  String(
                    Math.floor(
                      (transferDir === "toFutures" ? mainNGN : futuresNGN) * 100
                    ) / 100
                  )
                )
              }
            >
              Max
            </Button>
            <Button className="w-full" onClick={doTransfer}>
              Confirm Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* TP/SL */}
      <Dialog open={!!tpslFor} onOpenChange={(o) => !o && setTpslFor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Take Profit / Stop Loss</DialogTitle>
            <DialogDescription>{tpslFor?.symbol} · prices in ₦</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Take profit</label>
              <Input
                inputMode="decimal"
                value={tpInput}
                onChange={(e) => setTpInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Stop loss</label>
              <Input
                inputMode="decimal"
                value={slInput}
                onChange={(e) => setSlInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button className="w-full" onClick={saveTpSl}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <WinningPoster data={poster} onOpenChange={(o) => !o && setPoster(null)} />

      <span className="hidden">{tick}</span>
    </div>
  );
};

export default Futures;
