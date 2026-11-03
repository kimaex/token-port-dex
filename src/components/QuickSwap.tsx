import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmtNGN, useNaira } from "@/lib/naira";
import { useLivePrices } from "@/lib/livePrices";
import { autoShareSwap } from "@/lib/kimaout";
import { getMinTxNGN, getSwapFeePct, isFeatureOn, useAdmin } from "@/lib/adminSettings";

interface Token {
  symbol: string;
  name: string;
  emoji: string;
  priceNGN: number;
}

const TOKENS: Token[] = [
  { symbol: "PEPE", name: "Pepe", emoji: "🐸", priceNGN: 0.0000198 },
  { symbol: "BONK", name: "Bonk", emoji: "🐕", priceNGN: 0.0000451 },
  { symbol: "DOGE", name: "Dogecoin", emoji: "🐶", priceNGN: 602.3 },
  { symbol: "SHIB", name: "Shiba Inu", emoji: "🦊", priceNGN: 0.0000342 },
  { symbol: "WIF", name: "dogwifhat", emoji: "🧢", priceNGN: 3140 },
  { symbol: "FLOKI", name: "Floki", emoji: "🐺", priceNGN: 0.243 },
  { symbol: "BTC", name: "Bitcoin", emoji: "₿", priceNGN: 152_343_600 },
  { symbol: "ETH", name: "Ethereum", emoji: "Ξ", priceNGN: 5_245_600 },
  { symbol: "SOL", name: "Solana", emoji: "◎", priceNGN: 313_472 },
  { symbol: "NEAR", name: "NEAR Protocol", emoji: "Ⓝ", priceNGN: 8184 },
];

const readHoldings = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem("kimaex_token_holdings") || "{}");
  } catch {
    return {};
  }
};

const priceFmt = (p: number) => fmtNGN(p, p < 1 ? 8 : 2);

/** Compact Naira <-> token swap that lives on the home page. */
export const QuickSwap = () => {
  const { balance, credit, debit } = useNaira();
  const live = useLivePrices();
  const admin = useAdmin();
  if (!isFeatureOn("quickSwap")) return null;

  const tokens = useMemo<Token[]>(
    () =>
      TOKENS.map((t) => {
        const L = live.prices[t.symbol];
        return L ? { ...t, priceNGN: L.ngn } : t;
      }),
    [live.prices]
  );

  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [tokenState, setTokenState] = useState<Token>(TOKENS[0]);
  const token = tokens.find((t) => t.symbol === tokenState.symbol) ?? tokenState;
  const [amount, setAmount] = useState("");
  const [holdings, setHoldings] = useState<Record<string, number>>(readHoldings);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const saveHoldings = (h: Record<string, number>) => {
    setHoldings(h);
    localStorage.setItem("kimaex_token_holdings", JSON.stringify(h));
  };

  const feePct = admin.swapFeePct;
  const value = parseFloat(amount) || 0;
  const ngnValue = direction === "buy" ? value : value * token.priceNGN;
  const fee = ngnValue * (feePct / 100);
  const receiveQty = direction === "buy" ? (ngnValue - fee) / token.priceNGN : 0;
  const receiveNGN = direction === "sell" ? ngnValue - fee : 0;
  const owned = holdings[token.symbol] || 0;
  const minTx = getMinTxNGN();

  const openReview = () => {
    if (ngnValue <= 0) return toast.error("Enter an amount");
    if (ngnValue < minTx)
      return toast.error(`Minimum swap is ${fmtNGN(minTx, 0)}`);
    if (direction === "buy" && ngnValue > balance)
      return toast.error("Not enough balance");
    if (direction === "sell" && value > owned)
      return toast.error(`Not enough ${token.symbol}`);
    setReviewOpen(true);
  };

  const executeSwap = () => {
    if (direction === "buy") {
      debit(ngnValue);
      saveHoldings({ ...holdings, [token.symbol]: owned + receiveQty });
      toast.success(
        `Bought ${receiveQty.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token.symbol}`
      );
      if (autoShareSwap(token.symbol, token.priceNGN))
        toast("📣 Auto-shared to KimaOut");
    } else {
      saveHoldings({ ...holdings, [token.symbol]: owned - value });
      credit(receiveNGN);
      toast.success(`Sold ${token.symbol} for ${fmtNGN(receiveNGN)}`);
    }
    setAmount("");
    setReviewOpen(false);
  };

  return (
    <div className="px-6 pb-6">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Repeat className="h-4 w-4 text-primary-foreground" />
            </div>
            <h3 className="text-sm font-bold">Quick Swap</h3>
            {live.live && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <div className="flex rounded-lg bg-muted p-0.5">
            {(["buy", "sell"] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDirection(d);
                  setAmount("");
                }}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  direction === d
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {d === "buy" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={direction === "buy" ? "₦ amount" : "0.00"}
            className="border-0 bg-transparent p-0 h-auto text-xl font-bold focus-visible:ring-0"
          />
          <button
            onClick={() => setPickerOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-2"
          >
            <span className="text-base">
              {direction === "buy" ? token.emoji : token.emoji}
            </span>
            <span className="text-xs font-semibold">{token.symbol}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
          <span>
            {direction === "buy"
              ? `≈ ${receiveQty ? receiveQty.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0"} ${token.symbol} · fee ${feePct}%`
              : `You own ${owned.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token.symbol}`}
          </span>
          {direction === "buy" ? (
            <span className="tabular-nums">Bal {fmtNGN(balance, 0)}</span>
          ) : (
            <span className="tabular-nums">
              ≈ {fmtNGN(receiveNGN)} · fee {feePct}%
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {[25, 50, 100].map((p) => (
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
          <Button className="flex-1 h-7 text-[11px] font-semibold" onClick={openReview}>
            Swap
          </Button>
        </div>
      </div>

      {/* Token picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select token</DialogTitle>
            <DialogDescription>Live prices, settled in Naira</DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {tokens.map((t) => (
              <button
                key={t.symbol}
                onClick={() => {
                  setTokenState(t);
                  setPickerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
              >
                <span className="text-xl">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.symbol}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.name}</p>
                </div>
                <span className="text-sm tabular-nums">{priceFmt(t.priceNGN)}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Review swap</DialogTitle>
            <DialogDescription>Check the details before you confirm</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You pay</span>
              <span className="font-semibold tabular-nums">
                {direction === "buy"
                  ? fmtNGN(value)
                  : `${value.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${token.symbol}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">You receive</span>
              <span className="font-semibold tabular-nums">
                {direction === "buy"
                  ? `${receiveQty.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token.symbol}`
                  : fmtNGN(receiveNGN)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="tabular-nums">
                1 {token.symbol} = {priceFmt(token.priceNGN)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trading fee ({feePct}%)</span>
              <span className="tabular-nums">{fmtNGN(fee)}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={executeSwap}>
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
