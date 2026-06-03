import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Share2,
  TrendingUp,
  Clock,
  Users,
  BarChart3,
  Info,
  MessageCircle,
  ThumbsUp,
  Send,
  Flame,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useCurrency } from "@/contexts/CurrencyContext";
import { MARKETS, Outcome } from "@/data/kimapreMarkets";
import { toast } from "sonner";

type DetailTab = "trade" | "chart" | "orderbook" | "comments" | "rules";
type TimeRange = "1H" | "1D" | "1W" | "1M" | "ALL";

const formatVolume = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

const KimapreMarket = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const market = MARKETS.find((m) => m.id === id);

  const [side, setSide] = useState<"YES" | "NO">(
    (searchParams.get("side") as "YES" | "NO") || "YES"
  );
  const [outcomeId, setOutcomeId] = useState<string>(market?.outcomes[0].id || "yes");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [tab, setTab] = useState<DetailTab>("trade");
  const [range, setRange] = useState<TimeRange>("1M");
  const [watched, setWatched] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(market?.comments || []);
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const isUpDown = !!market?.id?.includes("updown");
  const DURATIONS = [
    { label: "5m", minutes: 5 },
    { label: "15m", minutes: 15 },
    { label: "30m", minutes: 30 },
    { label: "1h", minutes: 60 },
    { label: "2h", minutes: 120 },
    { label: "4h", minutes: 240 },
    { label: "8h", minutes: 480 },
    { label: "12h", minutes: 720 },
    { label: "24h", minutes: 1440 },
  ] as const;
  const [duration, setDuration] = useState<number>(60);

  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem("kimapre_watchlist") || "[]");
      if (id) setWatched(w.includes(id));
    } catch {}
  }, [id]);

  const toggleWatch = () => {
    try {
      const w: string[] = JSON.parse(localStorage.getItem("kimapre_watchlist") || "[]");
      const next = w.includes(id!) ? w.filter((x) => x !== id) : [...w, id!];
      localStorage.setItem("kimapre_watchlist", JSON.stringify(next));
      setWatched(next.includes(id!));
      toast.success(next.includes(id!) ? "Added to watchlist" : "Removed from watchlist");
    } catch {}
  };

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Market not found</p>
          <Button onClick={() => navigate("/kimapre")}>Back to markets</Button>
        </div>
      </div>
    );
  }

  const selectedOutcome: Outcome =
    market.type === "multi"
      ? market.outcomes.find((o) => o.id === outcomeId) || market.outcomes[0]
      : market.outcomes[0];

  const currentPrice =
    market.type === "multi"
      ? selectedOutcome.price
      : side === "YES"
      ? market.yesPrice
      : 1 - market.yesPrice;

  const execPrice =
    orderType === "market"
      ? currentPrice
      : Math.max(0.01, Math.min(0.99, parseFloat(limitPrice || "0") / 100));

  const amt = parseFloat(amount) || 0;
  const shares = execPrice > 0 ? amt / execPrice : 0;
  const potentialPayout = shares * 1;
  const fee = amt * 0.02;

  const placeBet = () => {
    if (amt < 0.5) {
      toast.error("Minimum is $0.50 USDC");
      return;
    }
    if (orderType === "limit" && !limitPrice) {
      toast.error("Enter limit price (1-99¢)");
      return;
    }
    try {
      const positions = JSON.parse(localStorage.getItem("kimapre_positions") || "[]");
      positions.push({
        marketId: market.id,
        outcomeId: market.type === "multi" ? selectedOutcome.id : "yes",
        side: market.type === "multi" ? "YES" : side,
        shares,
        avgPrice: execPrice,
        cost: amt,
      });
      localStorage.setItem("kimapre_positions", JSON.stringify(positions));
    } catch {}
    toast.success(
      `${orderType === "market" ? "Filled" : "Placed"} ${shares.toFixed(2)} ${
        market.type === "multi" ? selectedOutcome.label : side
      } shares${isUpDown ? ` · ${duration < 60 ? `${duration}m` : `${duration / 60}h`}` : ""} · payout ${formatPrice(potentialPayout)}`
    );
    setAmount("");
    setLimitPrice("");
  };

  // Chart path
  const chartPath = useMemo(() => {
    const points = market.history;
    const w = 320;
    const h = 120;
    const min = Math.min(...points.map((p) => p.p));
    const max = Math.max(...points.map((p) => p.p));
    const span = Math.max(0.01, max - min);
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * w;
        const y = h - ((p.p - min) / span) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [market.history]);

  const priceChange =
    market.history.length > 1
      ? market.history[market.history.length - 1].p - market.history[0].p
      : 0;
  const priceChangePct = (priceChange * 100).toFixed(1);

  const related = MARKETS.filter(
    (m) => m.category === market.category && m.id !== market.id
  ).slice(0, 4);

  const submitComment = () => {
    if (!newComment.trim()) return;
    const c = {
      id: `c${Date.now()}`,
      user: "You",
      avatar: "🟡",
      text: newComment.trim(),
      time: "now",
      likes: 0,
    };
    setComments([c, ...comments]);
    setNewComment("");
    toast.success("Comment posted");
  };

  const toggleLike = (cid: string) => {
    setLikedComments((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{market.category}</p>
            <p className="text-sm font-semibold truncate">{market.title}</p>
          </div>
          <button onClick={toggleWatch} className="p-2 rounded-full hover:bg-muted">
            <Star className={`h-5 w-5 ${watched ? "fill-primary text-primary" : ""}`} />
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied");
            }}
            className="p-2 rounded-full hover:bg-muted"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Title card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">
              {market.category}
            </Badge>
            {market.type === "multi" && (
              <Badge className="bg-primary/15 text-primary text-[10px] border-0">Multi-outcome</Badge>
            )}
            {market.trending && (
              <Badge className="bg-orange-500/15 text-orange-500 text-[10px] border-0">
                <Flame className="h-2.5 w-2.5 mr-0.5" /> Trending
              </Badge>
            )}
          </div>
          <h1 className="text-lg font-bold leading-snug mb-3">{market.title}</h1>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Volume</p>
              <p className="text-sm font-bold">{formatVolume(market.volume)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Liquidity</p>
              <p className="text-sm font-bold">{formatVolume(market.liquidity)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Ends</p>
              <p className="text-sm font-bold">{market.endsAt}</p>
            </div>
          </div>
        </Card>

        {/* Price chart — Blofin trader hero */}
        <Card className="p-4 bg-zinc-900 text-zinc-100 border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                {market.type === "multi" ? selectedOutcome.label : "Yes"} chance
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-bold tabular-nums ${priceChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {Math.round(currentPrice * 100)}%
                </p>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    priceChange >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {priceChange >= 0 ? "+" : ""}
                  {priceChangePct}%
                </span>
              </div>
            </div>
            <TrendingUp
              className={`h-5 w-5 ${
                priceChange >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            />
          </div>
          <svg viewBox="0 0 320 120" className="w-full h-28">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={priceChange >= 0 ? "#10b981" : "#f43f5e"} stopOpacity="0.35" />
                <stop offset="100%" stopColor={priceChange >= 0 ? "#10b981" : "#f43f5e"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${chartPath} L320,120 L0,120 Z`}
              fill="url(#chartFill)"
            />
            <path
              d={chartPath}
              fill="none"
              stroke={priceChange >= 0 ? "#10b981" : "#f43f5e"}
              strokeWidth="2"
            />
          </svg>
          <div className="flex gap-1 mt-2">
            {(["1H", "1D", "1W", "1M", "ALL"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 py-1 text-[10px] font-semibold rounded tabular-nums ${
                  range === r ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </Card>

        {/* Multi-outcome list */}
        {market.type === "multi" && (
          <Card className="p-4">
            <p className="text-xs font-bold mb-3">Outcomes</p>
            <div className="space-y-2">
              {market.outcomes.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOutcomeId(o.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${
                    outcomeId === o.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{o.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatVolume(o.volume)} vol
                    </p>
                  </div>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${o.price * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold tabular-nums w-10 text-right">
                    {Math.round(o.price * 100)}¢
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Detail tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg overflow-x-auto scrollbar-none">
          {([
            { k: "trade", label: "Trade" },
            { k: "chart", label: "Holders" },
            { k: "orderbook", label: "Order Book" },
            { k: "comments", label: `Comments` },
            { k: "rules", label: "Rules" },
          ] as const).map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 shrink-0 px-2 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TRADE TAB */}
        {tab === "trade" && (
          <Card className="p-4 space-y-3">
            {market.type === "binary" && (
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
                    {Math.round(market.yesPrice * 100)}¢
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
                    {Math.round((1 - market.yesPrice) * 100)}¢
                  </p>
                </button>
              </div>
            )}

            {isUpDown && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-muted-foreground">Trade duration</label>
                  <span className="text-[10px] text-muted-foreground">
                    Resolves {duration < 60 ? `in ${duration}m` : `in ${duration / 60}h`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.minutes}
                      onClick={() => setDuration(d.minutes)}
                      className={`py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
                        duration === d.minutes
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order type */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-md">
              {(["market", "limit"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold capitalize ${
                    orderType === t ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {orderType === "limit" && (
              <div>
                <label className="text-xs text-muted-foreground">Limit price (¢)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="50"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
            )}

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
                {[5, 25, 100, 500].map((v) => (
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

            {amt > 0 && (
              <div className="space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg. price</span>
                  <span className="font-semibold">{Math.round(execPrice * 100)}¢</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-semibold">{shares.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fee (2%)</span>
                  <span className="font-semibold">{formatPrice(fee)}</span>
                </div>
                <div className="flex justify-between text-sm pt-1.5 border-t border-border/50">
                  <span className="font-semibold">Potential payout</span>
                  <span className="font-bold text-primary">
                    {formatPrice(potentialPayout)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Potential profit</span>
                  <span className="font-semibold text-emerald-500">
                    +{formatPrice(potentialPayout - amt)}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={placeBet}
              className={`w-full h-12 font-bold ${
                market.type === "binary" && side === "NO"
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              Buy{" "}
              {market.type === "multi" ? selectedOutcome.label : side}{" "}
              · {amount ? `$${amount}` : "Enter amount"}
            </Button>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
              <ShieldCheck className="h-3 w-3" />
              Resolves via {market.resolutionSource}
            </div>
          </Card>
        )}

        {/* HOLDERS / RECENT TRADES */}
        {tab === "chart" && (
          <Card className="p-4">
            <p className="text-xs font-bold mb-3">Recent Trades</p>
            <div className="space-y-2">
              {market.recentTrades.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                      {t.user.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{t.user}</p>
                      <p className="text-[10px] text-muted-foreground">{t.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        t.side === "YES" ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {t.side} · {t.shares} @ {t.price}¢
                    </p>
                    <p className="text-[10px] text-muted-foreground">${t.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ORDER BOOK */}
        {tab === "orderbook" && (
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-bold text-emerald-500 mb-2">Bids (Buy)</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground pb-1 border-b border-border/50">
                    <span>Price</span>
                    <span>Shares</span>
                  </div>
                  {market.orderBook.bids.map((b, i) => (
                    <div key={i} className="relative flex justify-between py-0.5">
                      <div
                        className="absolute inset-y-0 right-0 bg-emerald-500/10 rounded"
                        style={{
                          width: `${
                            (b.shares /
                              Math.max(...market.orderBook.bids.map((x) => x.shares))) *
                            100
                          }%`,
                        }}
                      />
                      <span className="relative font-semibold text-emerald-500">{b.price}¢</span>
                      <span className="relative tabular-nums">{b.shares}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-rose-500 mb-2">Asks (Sell)</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground pb-1 border-b border-border/50">
                    <span>Price</span>
                    <span>Shares</span>
                  </div>
                  {market.orderBook.asks.map((a, i) => (
                    <div key={i} className="relative flex justify-between py-0.5">
                      <div
                        className="absolute inset-y-0 right-0 bg-rose-500/10 rounded"
                        style={{
                          width: `${
                            (a.shares /
                              Math.max(...market.orderBook.asks.map((x) => x.shares))) *
                            100
                          }%`,
                        }}
                      />
                      <span className="relative font-semibold text-rose-500">{a.price}¢</span>
                      <span className="relative tabular-nums">{a.shares}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* COMMENTS */}
        {tab === "comments" && (
          <Card className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your take..."
                className="h-10"
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
              />
              <Button onClick={submitComment} size="icon" className="h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {comments.map((c) => {
                const liked = likedComments.includes(c.id);
                return (
                  <div key={c.id} className="flex gap-2">
                    <div className="text-2xl">{c.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold">{c.user}</p>
                        {c.side && (
                          <Badge
                            className={`text-[9px] border-0 px-1.5 py-0 ${
                              c.side === "YES"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-rose-500/15 text-rose-500"
                            }`}
                          >
                            {c.side}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-xs mt-0.5">{c.text}</p>
                      <button
                        onClick={() => toggleLike(c.id)}
                        className={`flex items-center gap-1 mt-1 text-[10px] ${
                          liked ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <ThumbsUp
                          className={`h-3 w-3 ${liked ? "fill-primary" : ""}`}
                        />
                        {c.likes + (liked ? 1 : 0)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* RULES */}
        {tab === "rules" && (
          <Card className="p-4 space-y-3 text-sm">
            <div>
              <p className="text-xs font-bold mb-1 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" /> Description
              </p>
              <p className="text-xs text-muted-foreground">{market.description}</p>
            </div>
            <div>
              <p className="text-xs font-bold mb-1">Resolution Rules</p>
              <p className="text-xs text-muted-foreground">{market.rules}</p>
            </div>
            <div>
              <p className="text-xs font-bold mb-1">Resolution Source</p>
              <p className="text-xs text-muted-foreground">{market.resolutionSource}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
              <div>
                <p className="text-[10px] text-muted-foreground">Traders</p>
                <p className="text-sm font-bold">{market.traders.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">24h Volume</p>
                <p className="text-sm font-bold">{formatVolume(market.volume24h)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-2">Related Markets</p>
            <div className="space-y-2">
              {related.map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate(`/kimapre/${m.id}`)}
                  className="w-full"
                >
                  <Card className="p-3 hover:border-primary/50">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-semibold truncate">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatVolume(m.volume)} vol
                        </p>
                      </div>
                      <p className="text-sm font-bold tabular-nums text-emerald-500">
                        {Math.round(m.yesPrice * 100)}%
                      </p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default KimapreMarket;
