import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Clock,
  Users,
  Trophy,
  Zap,
  BarChart3,
  Filter,
  Star,
  Flame,
  Sparkles,
  Activity,
  Award,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useCurrency } from "@/contexts/CurrencyContext";
import { MARKETS, MarketCategory, TOP_TRADERS, ACTIVITY_FEED, UPDOWN_MARKETS } from "@/data/kimapreMarkets";
import { ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

type Category = "All" | MarketCategory;
type Tab = "markets" | "activity" | "leaderboard" | "portfolio";
type SortKey = "trending" | "new" | "volume" | "ending";

const CATEGORIES: Category[] = [
  "All",
  "Crypto",
  "Politics",
  "Elections",
  "Sports",
  "Economy",
  "Tech",
  "Culture",
  "World",
];

const formatVolume = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof Flame }[] = [
  { key: "trending", label: "Trending", icon: Flame },
  { key: "new", label: "New", icon: Sparkles },
  { key: "volume", label: "Top Volume", icon: BarChart3 },
  { key: "ending", label: "Ending Soon", icon: Clock },
];

interface Position {
  marketId: string;
  outcomeId: string;
  side: "YES" | "NO";
  shares: number;
  avgPrice: number;
  cost: number;
}

const Kimapre = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [tab, setTab] = useState<Tab>("markets");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("trending");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // Load persisted state
  useEffect(() => {
    try {
      const w = localStorage.getItem("kimapre_watchlist");
      if (w) setWatchlist(JSON.parse(w));
      const p = localStorage.getItem("kimapre_positions");
      if (p) setPositions(JSON.parse(p));
    } catch {}
  }, []);

  const toggleWatch = (id: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("kimapre_watchlist", JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const updownIds = new Set(UPDOWN_MARKETS.map((m) => m.id));
    let list = MARKETS.filter((m) => {
      if (updownIds.has(m.id)) return false;
      const matchCat = activeCategory === "All" || m.category === activeCategory;
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    switch (sortKey) {
      case "volume":
        list = [...list].sort((a, b) => b.volume - a.volume);
        break;
      case "ending":
        list = [...list].sort((a, b) => a.endsAtTs - b.endsAtTs);
        break;
      case "new":
        list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case "trending":
        list = [...list].sort((a, b) => Number(b.trending) - Number(a.trending) || b.volume24h - a.volume24h);
        break;
    }
    return list;
  }, [activeCategory, search, sortKey]);

  const totalVolume = MARKETS.reduce((s, m) => s + m.volume, 0);
  const portfolioValue = positions.reduce((s, p) => {
    const market = MARKETS.find((m) => m.id === p.marketId);
    if (!market) return s;
    const out = market.outcomes.find((o) => o.id === p.outcomeId);
    if (!out) return s;
    const currentPrice = p.side === "YES" ? out.price : 1 - out.price;
    return s + p.shares * currentPrice;
  }, 0);
  const portfolioCost = positions.reduce((s, p) => s + p.cost, 0);
  const portfolioPnL = portfolioValue - portfolioCost;

  return (
    <div className="min-h-screen bg-background pb-24 [&_.font-bold]:tracking-tight">
      {/* Header — Blofin style */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 uppercase">
                Kimapre
              </h1>
            </div>
            <button
              onClick={() => toast.info("Filters coming soon")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Filter"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Top tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {([
              { k: "markets", label: "Markets", icon: BarChart3 },
              { k: "activity", label: "Activity", icon: Activity },
              { k: "leaderboard", label: "Top", icon: Award },
              { k: "portfolio", label: "Portfolio", icon: Wallet },
            ] as const).map(({ k, label, icon: Icon }) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  tab === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* MARKETS TAB */}
        {tab === "markets" && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-muted/50 border-0"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Up/Down Crypto Trading */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Up / Down · 24h</h2>
                <Badge className="bg-primary/15 text-primary text-[10px] border-0 ml-auto">BTC · SOL · ETH</Badge>
              </div>
              <div className="space-y-2">
                {UPDOWN_MARKETS.map((m) => {
                  const symbol = m.id.split("-")[0].toUpperCase();
                  const upPct = Math.round(m.yesPrice * 100);
                  const downPct = 100 - upPct;
                  return (
                    <Card key={m.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => navigate(`/kimapre/${m.id}`)}
                          className="flex items-center gap-2 text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary">
                            {symbol}
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight">{symbol} · 24h</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatVolume(m.volume24h)} · 24h vol
                            </p>
                          </div>
                        </button>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {m.endsAt}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => navigate(`/kimapre/${m.id}?side=YES`)}
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 h-9 gap-1"
                        >
                          <ArrowUp className="h-4 w-4" /> Up · {upPct}¢
                        </Button>
                        <Button
                          onClick={() => navigate(`/kimapre/${m.id}?side=NO`)}
                          variant="outline"
                          className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 h-9 gap-1"
                        >
                          <ArrowDown className="h-4 w-4" /> Down · {downPct}¢
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Watchlist */}
            {watchlist.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <h2 className="text-sm font-bold">Watchlist</h2>
                </div>
                <div className="space-y-2">
                  {MARKETS.filter((m) => watchlist.includes(m.id)).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => navigate(`/kimapre/${m.id}`)}
                      className="w-full text-left"
                    >
                      <Card className="p-3 hover:border-primary/50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">{m.category}</p>
                            <p className="text-sm font-semibold truncate">{m.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold tabular-nums text-emerald-500">
                              {Math.round(m.yesPrice * 100)}%
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Markets list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold">
                  {activeCategory === "All" ? "All Markets" : `${activeCategory}`}
                </h2>
                <span className="text-xs text-muted-foreground">{filtered.length} markets</span>
              </div>

              <div className="space-y-3">
                {filtered.length === 0 && (
                  <Card className="p-8 text-center">
                    <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No markets found</p>
                  </Card>
                )}
                {filtered.map((m) => {
                  const isWatched = watchlist.includes(m.id);
                  if (m.type === "multi") {
                    const top = [...m.outcomes].sort((a, b) => b.price - a.price).slice(0, 3);
                    return (
                      <Card key={m.id} className="p-4 hover:border-primary/50">
                        <button
                          onClick={() => navigate(`/kimapre/${m.id}`)}
                          className="w-full text-left mb-3"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px]">
                                {m.category}
                              </Badge>
                              <Badge className="bg-primary/15 text-primary text-[10px] border-0">
                                Multi
                              </Badge>
                              {m.trending && (
                                <Badge className="bg-orange-500/15 text-orange-500 text-[10px] border-0">
                                  <Flame className="h-2.5 w-2.5 mr-0.5" /> Hot
                                </Badge>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWatch(m.id);
                              }}
                              className="p-1 -mr-1"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  isWatched ? "fill-primary text-primary" : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-sm font-semibold leading-snug">{m.title}</p>
                        </button>
                        <div className="space-y-1.5 mb-3">
                          {top.map((o) => (
                            <div key={o.id} className="flex items-center gap-2">
                              <span className="text-xs flex-1 truncate">{o.label}</span>
                              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${o.price * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold tabular-nums w-9 text-right">
                                {Math.round(o.price * 100)}%
                              </span>
                            </div>
                          ))}
                          {m.outcomes.length > 3 && (
                            <p className="text-[10px] text-muted-foreground pt-0.5">
                              +{m.outcomes.length - 3} more outcomes
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" /> {formatVolume(m.volume)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {m.traders.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {m.endsAt}
                          </span>
                        </div>
                      </Card>
                    );
                  }
                  const yesPct = Math.round(m.yesPrice * 100);
                  const noPct = 100 - yesPct;
                  return (
                    <Card key={m.id} className="p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <button
                          onClick={() => navigate(`/kimapre/${m.id}`)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge variant="outline" className="text-[10px]">
                              {m.category}
                            </Badge>
                            {m.trending && (
                              <Badge className="bg-orange-500/15 text-orange-500 text-[10px] border-0">
                                <Flame className="h-2.5 w-2.5 mr-0.5" /> Hot
                              </Badge>
                            )}
                            {m.isNew && (
                              <Badge className="bg-emerald-500/15 text-emerald-500 text-[10px] border-0">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-semibold leading-snug">{m.title}</p>
                        </button>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => toggleWatch(m.id)}
                            className="p-1"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                isWatched ? "fill-primary text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </button>
                          <p className="text-2xl font-bold tabular-nums text-emerald-500 leading-none">{yesPct}%</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Yes</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <Button
                          onClick={() => navigate(`/kimapre/${m.id}?side=YES`)}
                          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 h-9"
                          variant="outline"
                        >
                          Yes · {yesPct}¢
                        </Button>
                        <Button
                          onClick={() => navigate(`/kimapre/${m.id}?side=NO`)}
                          className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 h-9"
                          variant="outline"
                        >
                          No · {noPct}¢
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" /> {formatVolume(m.volume)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {m.traders.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {m.endsAt}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Live Activity</h2>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
              </span>
            </div>
            <div className="space-y-2">
              {ACTIVITY_FEED.map((a) => (
                <Card
                  key={a.id}
                  onClick={() => navigate(`/kimapre/${a.market}`)}
                  className="p-3 cursor-pointer hover:border-primary/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {a.user.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-semibold">{a.user}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>{" "}
                        <span
                          className={`font-semibold ${
                            a.side === "YES" ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {a.shares.toLocaleString()} {a.side}
                        </span>{" "}
                        <span className="text-muted-foreground">at {a.price}¢</span>
                      </p>
                      <p className="text-xs font-medium truncate mt-0.5">{a.marketTitle}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ${a.amount.toLocaleString()} · {a.time}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Top Traders · 30 days</h2>
            </div>
            <div className="space-y-2">
              {TOP_TRADERS.map((t) => (
                <Card key={t.rank} className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        t.rank === 1
                          ? "bg-yellow-500/20 text-yellow-500"
                          : t.rank === 2
                          ? "bg-gray-400/20 text-gray-400"
                          : t.rank === 3
                          ? "bg-orange-500/20 text-orange-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      #{t.rank}
                    </div>
                    <div className="text-2xl">{t.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatVolume(t.volume)} vol · {t.winRate}% win
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-500">
                        +${t.pnl.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">P&L</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {tab === "portfolio" && (
          <div>
            <Card className="p-4 bg-zinc-900 text-zinc-100 border-zinc-800 rounded-xl mb-4">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Portfolio Value</p>
              <p className="text-3xl font-bold tabular-nums">{formatPrice(portfolioValue)}</p>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-800">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Cost Basis</p>
                  <p className="text-sm font-semibold tabular-nums">{formatPrice(portfolioCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">P&L</p>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      portfolioPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {portfolioPnL >= 0 ? "+" : ""}
                    {formatPrice(portfolioPnL)}
                  </p>
                </div>
                <div className="ml-auto">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Positions</p>
                  <p className="text-sm font-semibold tabular-nums">{positions.length}</p>
                </div>
              </div>
            </Card>

            <h2 className="text-sm font-bold mb-2">Open Positions</h2>
            {positions.length === 0 ? (
              <Card className="p-8 text-center">
                <Wallet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No open positions yet</p>
                <Button onClick={() => setTab("markets")} className="h-9">
                  Browse Markets
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {positions.map((p, i) => {
                  const market = MARKETS.find((m) => m.id === p.marketId);
                  if (!market) return null;
                  const out = market.outcomes.find((o) => o.id === p.outcomeId);
                  const currentPrice = p.side === "YES" || !out
                    ? out?.price ?? 0
                    : 1 - (out?.price ?? 0);
                  const value = p.shares * currentPrice;
                  const pnl = value - p.cost;
                  return (
                    <Card
                      key={i}
                      className="p-3 cursor-pointer hover:border-primary/50"
                      onClick={() => navigate(`/kimapre/${p.marketId}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{market.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={`text-[10px] border-0 ${
                                p.side === "YES"
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : "bg-rose-500/15 text-rose-500"
                              }`}
                            >
                              {p.side} · {out?.label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {p.shares.toFixed(0)} shares
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatPrice(value)}</p>
                          <p
                            className={`text-[10px] font-semibold ${
                              pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}
                            {formatPrice(pnl)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-center text-muted-foreground pt-2 pb-4">
          Markets resolve based on real-world outcomes. Trade with USDC. 2% platform fee.
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Kimapre;
