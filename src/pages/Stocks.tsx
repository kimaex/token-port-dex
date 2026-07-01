import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, TrendingUp, TrendingDown, Star, StarOff, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { BottomNav } from "@/components/BottomNav";
import { STOCKS, type Stock } from "@/data/stocksData";
import { usePortfolio } from "@/lib/portfolioStore";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const genSpark = (ticker: string, positive: boolean, points = 32) => {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const data = [];
  let v = 100;
  for (let i = 0; i < points; i++) {
    const r = seededRandom(seed + i) - (positive ? 0.4 : 0.6);
    v = Math.max(70, Math.min(130, v + r * 6));
    data.push({ i, v });
  }
  return data;
};

const genPortfolioChart = (seed: number) => {
  const data = [];
  let v = 100;
  for (let i = 0; i < 40; i++) {
    const r = seededRandom(seed + i) - 0.38;
    v = Math.max(60, Math.min(140, v + r * 5));
    data.push({ i, v });
  }
  return data;
};

const StockLogo = ({ stock, size = 44 }: { stock: Stock; size?: number }) => (
  <div
    className="rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg"
    style={{
      background: `linear-gradient(135deg, ${stock.color}, ${stock.color}cc)`,
      width: size,
      height: size,
      fontSize: size * 0.42,
    }}
  >
    {stock.logo || stock.ticker[0]}
  </div>
);

export default function Stocks() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Stock | null>(null);
  const [tab, setTab] = useState<"mine" | "watch">("mine");
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(STOCKS.map((s) => [s.ticker, s.price]))
  );
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kimaex_stock_watchlist") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        for (const s of STOCKS) {
          const drift = (Math.random() - 0.5) * (s.price * 0.0008);
          next[s.ticker] = Math.max(1, (prev[s.ticker] ?? s.price) + drift);
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const toggleWatch = (ticker: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker];
      localStorage.setItem("kimaex_stock_watchlist", JSON.stringify(next));
      return next;
    });
  };

  const { holdings } = usePortfolio();

  const portfolioValue = holdings.reduce(
    (sum, h) => sum + h.shares * (prices[h.ticker] ?? STOCKS.find((s) => s.ticker === h.ticker)?.price ?? 0),
    0
  );
  const portfolioCost = holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
  const pnl = portfolioValue - portfolioCost;
  const pnlPct = portfolioCost > 0 ? (pnl / portfolioCost) * 100 : 5.34;
  const displayValue = portfolioValue > 0 ? portfolioValue : 2874.56;

  const chartData = useMemo(() => genPortfolioChart(7), []);

  // ---------- Detail view ----------
  if (selected) {
    const livePrice = prices[selected.ticker] ?? selected.price;
    const positive = selected.change >= 0;
    const chartColor = positive ? "#22c55e" : "#ef4444";
    const data = genSpark(selected.ticker, positive).map((d) => ({ ...d, v: d.v * (livePrice / 100) }));

    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <StockLogo stock={selected} size={32} />
              <div>
                <p className="font-semibold leading-none">{selected.ticker}</p>
                <p className="text-[10px] text-muted-foreground">{selected.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleWatch(selected.ticker)}>
              {watchlist.includes(selected.ticker) ? (
                <Star className="h-5 w-5 fill-primary text-primary" />
              ) : (
                <StarOff className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="p-6 text-center">
            <p className="text-4xl font-bold tabular-nums">${livePrice.toFixed(2)}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`text-lg font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? "+" : ""}
                {selected.change}%
              </span>
              {positive ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            </div>
          </div>

          <div className="px-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
                  labelFormatter={() => ""}
                />
                <Area type="monotone" dataKey="v" stroke={chartColor} strokeWidth={2} fill="url(#stockGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="px-4 mt-4 grid grid-cols-2 gap-3">
            <Button className="h-12 bg-success hover:bg-success/90 text-white font-semibold" onClick={() => navigate(`/stocks/buy/${selected.ticker}`)}>
              Buy {selected.ticker}
            </Button>
            <Button className="h-12 bg-destructive hover:bg-destructive/90 text-white font-semibold" onClick={() => navigate(`/stocks/sell/${selected.ticker}`)}>
              Sell {selected.ticker}
            </Button>
          </div>

          <div className="mx-4 mt-6 p-4 bg-card border border-border rounded-2xl">
            <h3 className="font-semibold mb-3">Market Stats</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="font-semibold">{selected.marketCap}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">P/E Ratio</p>
                <p className="font-semibold">{selected.peRatio}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="font-semibold">{selected.volume}</p>
              </div>
            </div>
          </div>

          <div className="mx-4 mt-4 p-4 bg-card border border-border rounded-2xl">
            <h3 className="font-semibold mb-2">About {selected.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{selected.about}</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ---------- List view ----------
  const list = tab === "mine"
    ? STOCKS
    : STOCKS.filter((s) => watchlist.includes(s.ticker));

  return (
    <div className="min-h-screen bg-background pb-28 relative overflow-hidden">
      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold">Stocks</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate("/notifications")}>
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Portfolio Value Card */}
        <div className="mx-4 mt-2 rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(270 80% 20% / 0.9), hsl(280 70% 15% / 0.85) 50%, hsl(260 80% 25% / 0.9))",
            boxShadow: "0 20px 60px -20px hsl(270 90% 50% / 0.5), inset 0 1px 0 hsl(280 90% 70% / 0.15)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs uppercase tracking-wider text-purple-200/70 font-medium">Portfolio Value</p>
            <p className="text-4xl font-bold tabular-nums mt-1 text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
              ${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">
                +{pnlPct.toFixed(2)}% <span className="text-emerald-300/70 font-normal">(24h)</span>
              </span>
            </div>

            {/* Chart */}
            <div className="mt-3 -mx-2 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={0.7} />
                      <stop offset="50%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <filter id="portfolioGlow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#d8b4fe"
                    strokeWidth={2.5}
                    fill="url(#portfolioGrad)"
                    filter="url(#portfolioGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 px-4">
          <div className="flex items-center gap-6 border-b border-border">
            {[
              { id: "mine", label: "My stocks" },
              { id: "watch", label: "Watchlist" },
            ].map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as "mine" | "watch")}
                  className={`relative pb-3 text-sm font-semibold transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span
                      className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #a855f7, #c084fc)",
                        boxShadow: "0 0 12px rgba(168,85,247,0.7)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="px-4 mt-4 space-y-2">
          {list.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {tab === "watch" ? "Tap the star on any stock to add it here." : "No stocks yet."}
            </div>
          )}
          {list.map((s) => {
            const live = prices[s.ticker] ?? s.price;
            const positive = s.change >= 0;
            return (
              <button
                key={s.ticker}
                onClick={() => setSelected(s)}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:border-purple-500/40 transition-all text-left"
              >
                <StockLogo stock={s} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm tabular-nums">${live.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-rose-500"}`}>
                    {positive ? "+" : ""}
                    {s.change}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Trade button */}
      <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-md mx-auto px-6 flex justify-center">
          <button
            onClick={() => setSelected(STOCKS[0])}
            className="pointer-events-auto px-10 h-14 rounded-full font-bold text-white text-base transition-transform active:scale-95 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #a855f7, #7c3aed 50%, #c026d3)",
              boxShadow: "0 10px 40px -5px rgba(168,85,247,0.7), 0 0 30px rgba(192,38,211,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            Trade
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
