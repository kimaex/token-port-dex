import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, TrendingUp, TrendingDown, Circle, Bell, Star, StarOff, BookOpen, HelpCircle, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { STOCKS, type Stock } from "@/data/stocksData";
import { usePortfolio } from "@/lib/portfolioStore";

const INDICES = [
  { name: "S&P 500", value: "5,978.42", change: 0.51 },
  { name: "NASDAQ", value: "19,372.71", change: 0.82 },
  { name: "DOW JONES", value: "44,011.13", change: -0.18 },
];

const NEWS = [
  "NVDA hits fresh all-time high as AI demand surges",
  "Fed signals patience on rate cuts amid resilient labor market",
  "Apple unveils new AI features for iPhone — analysts bullish",
  "Tesla deliveries beat estimates in Q4",
  "Meta expands Reality Labs investments into 2026",
];

const seededRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const genSpark = (ticker: string, positive: boolean) => {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const data = [];
  let v = 100;
  for (let i = 0; i < 24; i++) {
    const r = seededRandom(seed + i) - (positive ? 0.4 : 0.6);
    v = Math.max(70, Math.min(130, v + r * 6));
    data.push({ i, v });
  }
  return data;
};

const isMarketOpen = () => {
  const now = new Date();
  // Convert to ET (UTC-5, ignoring DST for simplicity)
  const utc = now.getUTCHours() * 60 + now.getUTCMinutes();
  const etMin = (utc - 5 * 60 + 24 * 60) % (24 * 60);
  const day = now.getUTCDay();
  const isWeekday = day >= 1 && day <= 5;
  // 9:30 to 16:00 ET
  return isWeekday && etMin >= 9 * 60 + 30 && etMin < 16 * 60;
};

export default function Stocks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Stock | null>(null);
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
  const marketOpen = isMarketOpen();

  // Live price ticker
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

  const filtered = useMemo(
    () =>
      STOCKS.filter(
        (s) =>
          s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const watched = STOCKS.filter((s) => watchlist.includes(s.ticker));
  const { usdc, holdings } = usePortfolio();
  const portfolioValue = holdings.reduce(
    (sum, h) => sum + h.shares * (prices[h.ticker] ?? STOCKS.find((s) => s.ticker === h.ticker)?.price ?? 0),
    0
  );

  if (selected) {
    const livePrice = prices[selected.ticker] ?? selected.price;
    const positive = selected.change >= 0;
    const chartColor = positive ? "#22c55e" : "#ef4444";
    const data = genSpark(selected.ticker, positive).map((d) => ({ ...d, v: d.v * (livePrice / 100) }));

    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: selected.color }}
              >
                {selected.ticker[0]}
              </div>
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

          {/* Price */}
          <div className="p-6 text-center">
            <p className="text-4xl font-bold tabular-nums">${livePrice.toFixed(2)}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`text-lg font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? "+" : ""}
                {selected.change}%
              </span>
              {positive ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
          </div>

          {/* Chart */}
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

          {/* Buy/Sell */}
          <div className="px-4 mt-4 grid grid-cols-2 gap-3">
            <Button
              className="h-12 bg-success hover:bg-success/90 text-white font-semibold"
              onClick={() => navigate(`/stocks/buy/${selected.ticker}`)}
            >
              Buy {selected.ticker}
            </Button>
            <Button
              className="h-12 bg-destructive hover:bg-destructive/90 text-white font-semibold"
              onClick={() => navigate(`/stocks/sell/${selected.ticker}`)}
            >
              Sell {selected.ticker}
            </Button>
          </div>

          {/* Market Stats */}
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

          {/* About */}
          <div className="mx-4 mt-4 p-4 bg-card border border-border rounded-2xl">
            <h3 className="font-semibold mb-2">About {selected.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{selected.about}</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold">Stock Market</h1>
            <Button variant="ghost" size="icon" onClick={() => navigate("/notifications")}>
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <Circle
              className={`h-2.5 w-2.5 ${marketOpen ? "fill-success text-success" : "fill-destructive text-destructive"}`}
            />
            <span className="text-xs text-muted-foreground">
              US Market {marketOpen ? "Open" : "Closed"} · NYSE/NASDAQ
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks (e.g. AAPL, Tesla)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>

          <button
            onClick={() => navigate("/stocks/guide")}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            How stock trading works
          </button>
        </div>

        {/* News ticker */}
        <div className="overflow-hidden border-b border-border bg-card/50">
          <div className="flex gap-8 py-2 px-4 whitespace-nowrap animate-[scroll_40s_linear_infinite]">
            {[...NEWS, ...NEWS].map((n, i) => (
              <span key={i} className="text-xs text-muted-foreground">
                <span className="text-primary mr-2">●</span>
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* USDC Balance + Portfolio summary */}
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="h-3 w-3" /> USDC Balance
                </p>
                <p className="text-2xl font-bold tabular-nums mt-1">
                  ${usdc.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
                <p className="text-lg font-semibold tabular-nums mt-1">
                  ${portfolioValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Portfolio */}
        {holdings.length > 0 && (
          <div className="px-4 pt-6">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground">My Portfolio</h2>
            <div className="space-y-2">
              {holdings.map((h) => {
                const s = STOCKS.find((x) => x.ticker === h.ticker);
                const live = prices[h.ticker] ?? s?.price ?? h.avgPrice;
                const value = h.shares * live;
                const pl = (live - h.avgPrice) * h.shares;
                const plPct = ((live - h.avgPrice) / h.avgPrice) * 100;
                return (
                  <div
                    key={h.ticker}
                    onClick={() => s && setSelected(s)}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: s?.color ?? "#666" }}
                      >
                        {h.ticker[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{h.ticker}</p>
                        <p className="text-xs text-muted-foreground">
                          {h.shares.toFixed(4)} shares · avg ${h.avgPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm tabular-nums">${value.toFixed(2)}</p>
                      <p className={`text-xs ${pl >= 0 ? "text-success" : "text-destructive"}`}>
                        {pl >= 0 ? "+" : ""}
                        {pl.toFixed(2)} ({plPct.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Market overview */}
        <div className="px-4 pt-6">
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">Market Overview</h2>
          <div className="grid grid-cols-3 gap-2">
            {INDICES.map((idx) => (
              <div key={idx.name} className="p-3 bg-card border border-border rounded-xl">
                <p className="text-[10px] text-muted-foreground truncate">{idx.name}</p>
                <p className="text-sm font-bold tabular-nums">{idx.value}</p>
                <p className={`text-xs ${idx.change >= 0 ? "text-success" : "text-destructive"}`}>
                  {idx.change >= 0 ? "+" : ""}
                  {idx.change}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stocks list */}
        <div className="px-4 pt-6">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Top Stocks</h2>
          <div className="space-y-3">
            {filtered.map((s) => {
              const live = prices[s.ticker] ?? s.price;
              const positive = s.change >= 0;
              const color = positive ? "#22c55e" : "#ef4444";
              const data = genSpark(s.ticker, positive);
              return (
                <div
                  key={s.ticker}
                  onClick={() => setSelected(s)}
                  className="bg-card border border-border rounded-2xl p-3 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: s.color }}
                    >
                      {s.ticker[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{s.name}</p>
                        <p className="font-semibold text-sm tabular-nums">${live.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{s.ticker}</p>
                        <p className={`text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
                          {positive ? "+" : ""}
                          {s.change}%
                        </p>
                      </div>
                    </div>
                    <div className="w-16 h-10 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                          <defs>
                            <linearGradient id={`g-${s.ticker}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${s.ticker})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      size="sm"
                      className="h-8 bg-success hover:bg-success/90 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stocks/buy/${s.ticker}`);
                      }}
                    >
                      Buy
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-destructive hover:bg-destructive/90 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stocks/sell/${s.ticker}`);
                      }}
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Watchlist */}
        <div className="px-4 pt-6">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">My Watchlist</h2>
          {watched.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-2xl text-center">
              <Star className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Tap the star on a stock to add it to your watchlist.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {watched.map((s) => {
                const live = prices[s.ticker] ?? s.price;
                const positive = s.change >= 0;
                return (
                  <div
                    key={s.ticker}
                    onClick={() => setSelected(s)}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: s.color }}
                      >
                        {s.ticker[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{s.ticker}</p>
                        <p className="text-xs text-muted-foreground">{s.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm tabular-nums">${live.toFixed(2)}</p>
                      <p className={`text-xs ${positive ? "text-success" : "text-destructive"}`}>
                        {positive ? "+" : ""}
                        {s.change}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <BottomNav />
    </div>
  );
}
