import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TrendingUp, Clock, Users, Trophy, Zap, BarChart3, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

type Category = "All" | "Crypto" | "Politics" | "Sports" | "Economy" | "Tech" | "Culture";

interface Market {
  id: string;
  title: string;
  category: Exclude<Category, "All">;
  yesPrice: number; // 0-1 probability
  volume: number; // USDC
  liquidity: number;
  endsAt: string;
  traders: number;
  trending?: boolean;
  image?: string;
}

const MARKETS: Market[] = [
  {
    id: "btc-150k",
    title: "Will Bitcoin reach $150,000 before end of 2026?",
    category: "Crypto",
    yesPrice: 0.62,
    volume: 1284500,
    liquidity: 320000,
    endsAt: "Dec 31, 2026",
    traders: 4821,
    trending: true,
  },
  {
    id: "eth-flip",
    title: "Will ETH flip BTC in market cap by 2027?",
    category: "Crypto",
    yesPrice: 0.08,
    volume: 540200,
    liquidity: 120000,
    endsAt: "Jan 1, 2027",
    traders: 1932,
  },
  {
    id: "fed-cut-may",
    title: "Will the Fed cut rates in May 2026?",
    category: "Economy",
    yesPrice: 0.74,
    volume: 982300,
    liquidity: 410000,
    endsAt: "May 31, 2026",
    traders: 3210,
    trending: true,
  },
  {
    id: "afcon-winner",
    title: "Will Nigeria win AFCON 2026?",
    category: "Sports",
    yesPrice: 0.31,
    volume: 412800,
    liquidity: 95000,
    endsAt: "Feb 15, 2026",
    traders: 2715,
  },
  {
    id: "openai-ipo",
    title: "Will OpenAI IPO before 2027?",
    category: "Tech",
    yesPrice: 0.22,
    volume: 678400,
    liquidity: 180000,
    endsAt: "Dec 31, 2026",
    traders: 1840,
  },
  {
    id: "sol-300",
    title: "Will Solana hit $300 in 2026?",
    category: "Crypto",
    yesPrice: 0.45,
    volume: 524100,
    liquidity: 140000,
    endsAt: "Dec 31, 2026",
    traders: 2401,
  },
  {
    id: "ng-election",
    title: "Will turnout exceed 40% in next Nigerian election?",
    category: "Politics",
    yesPrice: 0.38,
    volume: 215400,
    liquidity: 60000,
    endsAt: "Feb 25, 2027",
    traders: 894,
  },
  {
    id: "tesla-1t",
    title: "Will Tesla reach $1T market cap by Q4 2026?",
    category: "Tech",
    yesPrice: 0.51,
    volume: 386200,
    liquidity: 110000,
    endsAt: "Dec 31, 2026",
    traders: 1602,
  },
];

const CATEGORIES: Category[] = ["All", "Crypto", "Politics", "Sports", "Economy", "Tech", "Culture"];

const formatVolume = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

const Kimapre = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Market | null>(null);
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("");

  const filtered = useMemo(() => {
    return MARKETS.filter((m) => {
      const matchCat = activeCategory === "All" || m.category === activeCategory;
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const trending = MARKETS.filter((m) => m.trending);

  const openMarket = (m: Market) => {
    setSelected(m);
    setSide("YES");
    setAmount("");
  };

  const placeBet = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 0.5) {
      toast.error("Minimum bet is $0.50 USDC");
      return;
    }
    if (!selected) return;
    const price = side === "YES" ? selected.yesPrice : 1 - selected.yesPrice;
    const shares = amt / price;
    const potential = shares * 1; // payout per share at resolution = $1
    toast.success(
      `${side} bet placed on "${selected.title.slice(0, 24)}..." — potential payout ${formatPrice(potential)}`
    );
    setSelected(null);
    setAmount("");
  };

  const totalVolume = MARKETS.reduce((s, m) => s + m.volume, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Kimapre
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">BETA</Badge>
              </h1>
              <p className="text-xs text-muted-foreground">Prediction markets · Trade on outcomes</p>
            </div>
            <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Filter">
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
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
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Stats banner */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Volume Traded</p>
              <p className="text-2xl font-bold">{formatVolume(totalVolume)}</p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <BarChart3 className="h-5 w-5" />
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
            <div>
              <p className="text-[10px] text-muted-foreground">Markets</p>
              <p className="text-sm font-semibold">{MARKETS.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Active Traders</p>
              <p className="text-sm font-semibold">19.4K</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Fee</p>
              <p className="text-sm font-semibold">2%</p>
            </div>
          </div>
        </Card>

        {/* Trending */}
        {activeCategory === "All" && !search && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Trending Now</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
              {trending.map((m) => (
                <button
                  key={m.id}
                  onClick={() => openMarket(m)}
                  className="shrink-0 w-64 text-left"
                >
                  <Card className="p-3 hover:border-primary/50 transition-colors h-full">
                    <Badge variant="outline" className="text-[10px] mb-2">
                      {m.category}
                    </Badge>
                    <p className="text-sm font-semibold line-clamp-2 mb-3 min-h-[40px]">{m.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${m.yesPrice * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {Math.round(m.yesPrice * 100)}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {formatVolume(m.volume)} vol
                    </p>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All markets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">
              {activeCategory === "All" ? "All Markets" : `${activeCategory} Markets`}
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
              const yesPct = Math.round(m.yesPrice * 100);
              const noPct = 100 - yesPct;
              return (
                <Card key={m.id} className="p-4 hover:border-primary/50 transition-colors">
                  <button onClick={() => openMarket(m)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-[10px] mb-2">
                          {m.category}
                        </Badge>
                        <p className="text-sm font-semibold leading-snug">{m.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-primary leading-none">{yesPct}%</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Yes</p>
                      </div>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button
                      onClick={() => {
                        setSelected(m);
                        setSide("YES");
                        setAmount("");
                      }}
                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 h-9"
                      variant="outline"
                    >
                      Yes · {yesPct}¢
                    </Button>
                    <Button
                      onClick={() => {
                        setSelected(m);
                        setSide("NO");
                        setAmount("");
                      }}
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

        <p className="text-[10px] text-center text-muted-foreground pt-2 pb-4">
          Markets resolve based on real-world outcomes. Trade with USDC. 2% platform fee.
        </p>
      </div>

      {/* Bet dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Place Prediction</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <Card className="p-3 bg-muted/40">
                <Badge variant="outline" className="text-[10px] mb-2">
                  {selected.category}
                </Badge>
                <p className="text-sm font-semibold">{selected.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Resolves {selected.endsAt}</p>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSide("YES")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    side === "YES"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">Yes</p>
                  <p className="text-lg font-bold text-emerald-500">
                    {Math.round(selected.yesPrice * 100)}¢
                  </p>
                </button>
                <button
                  onClick={() => setSide("NO")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    side === "NO"
                      ? "border-rose-500 bg-rose-500/10"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">No</p>
                  <p className="text-lg font-bold text-rose-500">
                    {Math.round((1 - selected.yesPrice) * 100)}¢
                  </p>
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Amount (USDC)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 h-12 text-lg font-semibold"
                />
                <div className="flex gap-2 mt-2">
                  {[5, 25, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-md bg-muted hover:bg-muted/70"
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <Card className="p-3 bg-primary/5 border-primary/20 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg. price</span>
                    <span className="font-semibold">
                      {Math.round(
                        (side === "YES" ? selected.yesPrice : 1 - selected.yesPrice) * 100
                      )}
                      ¢
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Shares</span>
                    <span className="font-semibold">
                      {(
                        parseFloat(amount) /
                        (side === "YES" ? selected.yesPrice : 1 - selected.yesPrice)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-border/50">
                    <span className="font-semibold">Potential payout</span>
                    <span className="font-bold text-primary">
                      {formatPrice(
                        parseFloat(amount) /
                          (side === "YES" ? selected.yesPrice : 1 - selected.yesPrice)
                      )}
                    </span>
                  </div>
                </Card>
              )}

              <Button onClick={placeBet} className="w-full h-12 font-bold">
                Buy {side} · {amount ? `$${amount}` : "Enter amount"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Kimapre;
