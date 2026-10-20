import { autoShareSwap } from "@/lib/kimaout";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpDown,
  Search,
  Settings2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { fmtNGN, fmtNGNShort, useNaira } from "@/lib/naira";

export interface Token {
  symbol: string;
  name: string;
  emoji: string;
  priceNGN: number;
  change: number;
  meme?: boolean;
  marketCapNGN: number;
}

export const TOKENS: Token[] = [
  { symbol: "PEPE", name: "Pepe", emoji: "🐸", priceNGN: 0.0000198, change: 12.4, meme: true, marketCapNGN: 13_200_000_000_000 },
  { symbol: "BONK", name: "Bonk", emoji: "🐕", priceNGN: 0.0000451, change: -4.2, meme: true, marketCapNGN: 4_100_000_000_000 },
  { symbol: "DOGE", name: "Dogecoin", emoji: "🐶", priceNGN: 602.3, change: 5.9, meme: true, marketCapNGN: 88_000_000_000_000 },
  { symbol: "SHIB", name: "Shiba Inu", emoji: "🦊", priceNGN: 0.0000342, change: 2.1, meme: true, marketCapNGN: 20_100_000_000_000 },
  { symbol: "WIF", name: "dogwifhat", emoji: "🧢", priceNGN: 3_140, change: 8.7, meme: true, marketCapNGN: 3_100_000_000_000 },
  { symbol: "FLOKI", name: "Floki", emoji: "🐺", priceNGN: 0.243, change: -1.8, meme: true, marketCapNGN: 2_300_000_000_000 },
  { symbol: "BTC", name: "Bitcoin", emoji: "₿", priceNGN: 152_343_600, change: 2.4, marketCapNGN: 3_000_000_000_000_000 },
  { symbol: "ETH", name: "Ethereum", emoji: "Ξ", priceNGN: 5_245_600, change: -1.1, marketCapNGN: 630_000_000_000_000 },
  { symbol: "SOL", name: "Solana", emoji: "◎", priceNGN: 313_472, change: 4.9, marketCapNGN: 150_000_000_000_000 },
  { symbol: "NEAR", name: "NEAR Protocol", emoji: "Ⓝ", priceNGN: 8_184, change: 3.2, marketCapNGN: 10_600_000_000_000 },
];

const FEE_PCT = 0.02;

const Swap = () => {
  const navigate = useNavigate();
  const { balance, credit, debit } = useNaira();

  const [direction, setDirection] = useState<"buy" | "sell">("buy"); // buy = ₦ -> token
  const [token, setToken] = useState<Token>(TOKENS[0]);
  const [amount, setAmount] = useState(""); // ₦ when buying, token qty when selling
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [slipOpen, setSlipOpen] = useState(false);
  const [holdings, setHoldings] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("kimaex_token_holdings") || "{}");
    } catch {
      return {};
    }
  });

  const saveHoldings = (h: Record<string, number>) => {
    setHoldings(h);
    localStorage.setItem("kimaex_token_holdings", JSON.stringify(h));
  };

  const value = parseFloat(amount) || 0;
  const ngnValue = direction === "buy" ? value : value * token.priceNGN;
  const fee = ngnValue * FEE_PCT;
  const receiveQty = direction === "buy" ? (ngnValue - fee) / token.priceNGN : 0;
  const receiveNGN = direction === "sell" ? ngnValue - fee : 0;
  const owned = holdings[token.symbol] || 0;

  const filtered = useMemo(
    () =>
      TOKENS.filter(
        (t) =>
          t.symbol.toLowerCase().includes(query.toLowerCase()) ||
          t.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const [reviewOpen, setReviewOpen] = useState(false);

  const executeSwap = () => {
    if (ngnValue <= 0) return toast.error("Enter an amount");
    if (direction === "buy") {
      if (ngnValue > balance) return toast.error("Not enough balance");
      debit(ngnValue);
      saveHoldings({ ...holdings, [token.symbol]: owned + receiveQty });
      toast.success(
        `Bought ${receiveQty.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token.symbol}`
      );
      if (autoShareSwap(token.symbol, token.priceNGN)) toast("📣 Auto-shared to KimaOut");
    } else {
      if (value > owned) return toast.error(`Not enough ${token.symbol}`);
      saveHoldings({ ...holdings, [token.symbol]: owned - value });
      credit(receiveNGN);
      toast.success(`Sold ${token.symbol} for ${fmtNGN(receiveNGN)}`);
    }
    setAmount("");
    setReviewOpen(false);
  };

  const openReview = () => {
    if (ngnValue <= 0) return toast.error("Enter an amount");
    if (direction === "buy" && ngnValue > balance) return toast.error("Not enough balance");
    if (direction === "sell" && value > owned)
      return toast.error(`Not enough ${token.symbol}`);
    setReviewOpen(true);
  };

  const payLabel = direction === "buy" ? "You Pay" : "You Pay";
  const memeTokens = TOKENS.filter((t) => t.meme);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Swap</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSlipOpen(true)}>
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="px-4 space-y-2">
          {/* Pay */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{payLabel}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {direction === "buy"
                  ? `Balance ${fmtNGN(balance, 0)}`
                  : `You own ${owned.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token.symbol}`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="border-0 bg-transparent p-0 h-auto text-3xl font-bold focus-visible:ring-0"
              />
              {direction === "buy" ? (
                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2">
                  <span className="text-lg">🇳🇬</span>
                  <span className="text-sm font-semibold">Naira</span>
                </div>
              ) : (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-muted px-3 py-2"
                >
                  <span className="text-lg">{token.emoji}</span>
                  <span className="text-sm font-semibold">{token.symbol}</span>
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setAmount(
                      direction === "buy"
                        ? ((balance * p) / 100).toFixed(2)
                        : ((owned * p) / 100).toString()
                    )
                  }
                  className="flex-1 text-[11px] py-1.5 rounded-lg bg-muted text-muted-foreground"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center -my-4 relative z-10">
            <button
              onClick={() => {
                setDirection(direction === "buy" ? "sell" : "buy");
                setAmount("");
              }}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* Receive */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">You Receive</span>
            <div className="flex items-center gap-3 mt-2">
              <p className="flex-1 text-3xl font-bold tabular-nums truncate">
                {direction === "buy"
                  ? receiveQty.toLocaleString(undefined, { maximumFractionDigits: 4 })
                  : fmtNGN(receiveNGN)}
              </p>
              {direction === "buy" ? (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-muted px-3 py-2"
                >
                  <span className="text-lg">{token.emoji}</span>
                  <span className="text-sm font-semibold">{token.symbol}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2">
                  <span className="text-lg">🇳🇬</span>
                  <span className="text-sm font-semibold">Naira</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-muted-foreground pt-2">
            <div className="flex justify-between">
              <span>Price</span>
              <span className="text-foreground tabular-nums">
                1 {token.symbol} = {fmtNGN(token.priceNGN, token.priceNGN < 1 ? 8 : 2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Trading fee (2%)</span>
              <span className="text-foreground tabular-nums">{fmtNGN(fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Max slippage</span>
              <span className="text-foreground">{slippage}%</span>
            </div>
          </div>

          <Button className="w-full h-12 mt-3 text-base font-semibold" onClick={openReview}>
            Review Swap
          </Button>
        </div>

        {/* Meme markets */}
        <div className="px-4 pt-7">
          <h2 className="text-sm font-bold mb-3">Meme tokens · priced in ₦</h2>
          <div className="space-y-2">
            {memeTokens.map((t) => {
              const held = holdings[t.symbol] || 0;
              return (
                <button
                  key={t.symbol}
                  onClick={() => {
                    setToken(t);
                    setDirection("buy");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {t.symbol}/₦{" "}
                      <Badge variant="outline" className="text-[9px] ml-1">
                        Meme
                      </Badge>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Mkt cap {fmtNGNShort(t.marketCapNGN)}
                      {held > 0 &&
                        ` · You own ${held.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {fmtNGN(t.priceNGN, t.priceNGN < 1 ? 8 : 2)}
                    </p>
                    <p
                      className={`text-[11px] font-medium tabular-nums flex items-center justify-end gap-1 ${
                        t.change >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {t.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {t.change >= 0 ? "+" : ""}
                      {t.change.toFixed(2)}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <BottomNav />
      </div>

      {/* Token picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select token</DialogTitle>
            <DialogDescription>Everything is priced in Naira</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or symbol"
              className="pl-9"
            />
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {filtered.map((t) => (
              <button
                key={t.symbol}
                onClick={() => {
                  setToken(t);
                  setPickerOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
              >
                <span className="text-xl">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.symbol}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.name}</p>
                </div>
                <span className="text-sm tabular-nums">
                  {fmtNGN(t.priceNGN, t.priceNGN < 1 ? 8 : 2)}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Slippage */}
      <Dialog open={slipOpen} onOpenChange={setSlipOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Max slippage</DialogTitle>
            <DialogDescription>How much price movement you accept</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSlippage(s);
                  setSlipOpen(false);
                }}
                className={`h-10 rounded-lg text-sm font-semibold ${
                  slippage === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review before swap */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Review swap</DialogTitle>
            <DialogDescription>Check the details before you confirm</DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-card p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{direction === "buy" ? "🇳🇬" : token.emoji}</span>
                <div>
                  <p className="text-[11px] text-muted-foreground">You pay</p>
                  <p className="font-semibold tabular-nums">
                    {direction === "buy"
                      ? fmtNGN(value)
                      : `${value.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${token.symbol}`}
                  </p>
                </div>
              </div>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground rotate-90" />
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-[11px] text-muted-foreground">You receive</p>
                  <p className="font-semibold tabular-nums">
                    {direction === "buy"
                      ? `${receiveQty.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token.symbol}`
                      : fmtNGN(receiveNGN)}
                  </p>
                </div>
                <span className="text-lg">{direction === "buy" ? token.emoji : "🇳🇬"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="tabular-nums">
                1 {token.symbol} = {fmtNGN(token.priceNGN, token.priceNGN < 1 ? 8 : 2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trading fee (2%)</span>
              <span className="tabular-nums">{fmtNGN(fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max slippage</span>
              <span>{slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold tabular-nums">
                {direction === "buy" ? fmtNGN(ngnValue) : fmtNGN(ngnValue)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={executeSwap}>
              Confirm Swap
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Swap;
