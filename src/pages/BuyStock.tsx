import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { buyStock, usePortfolio } from "@/lib/portfolioStore";
import { STOCKS } from "@/data/stocksData";

const TRADING_FEE = 1; // USDC

export default function BuyStock() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const stock = STOCKS.find((s) => s.ticker === ticker);
  const { usdc } = usePortfolio();
  const [mode, setMode] = useState<"usdc" | "shares">("usdc");
  const [usdcAmt, setUsdcAmt] = useState("");
  const [sharesAmt, setSharesAmt] = useState("");
  const [success, setSuccess] = useState<null | {
    id: string;
    shares: number;
    cost: number;
  }>(null);

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Stock not found</p>
      </div>
    );
  }

  const price = stock.price;

  const { shares, cost } = useMemo(() => {
    if (mode === "usdc") {
      const u = parseFloat(usdcAmt) || 0;
      const tradable = Math.max(0, u - TRADING_FEE);
      const sh = tradable / price;
      return { shares: sh, cost: u };
    } else {
      const sh = parseFloat(sharesAmt) || 0;
      return { shares: sh, cost: sh * price + TRADING_FEE };
    }
  }, [mode, usdcAmt, sharesAmt, price]);

  const canSubmit = shares > 0 && cost > 0 && cost <= usdc;

  const handleConfirm = () => {
    try {
      const tx = buyStock(stock.ticker, stock.name, shares, price, TRADING_FEE);
      setSuccess({ id: tx.id, shares, cost });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="max-w-md mx-auto p-6">
          <div className="text-center pt-10">
            <div className="h-20 w-20 mx-auto rounded-full bg-success/15 flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold">Purchase Successful</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your stock has been added to your portfolio.
            </p>
          </div>
          <div className="mt-8 bg-card border border-border rounded-2xl p-5 space-y-3">
            <Row label="Stock" value={`${stock.name} (${stock.ticker})`} />
            <Row label="Shares Received" value={success.shares.toFixed(4)} />
            <Row label="Price / share" value={`$${price.toFixed(2)}`} />
            <Row label="Trading Fee" value={`${TRADING_FEE.toFixed(2)} USDC`} />
            <Row label="Total Cost" value={`${success.cost.toFixed(2)} USDC`} bold />
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Transaction ID</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(success.id);
                  toast.success("Copied");
                }}
                className="flex items-center gap-1.5 font-mono text-xs"
              >
                {success.id}
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12" onClick={() => navigate("/stocks")}>
              Done
            </Button>
            <Button className="h-12" onClick={() => navigate("/stocks?tab=portfolio")}>
              View Portfolio
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="font-bold">Buy {stock.ticker}</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: stock.color }}
            >
              {stock.ticker[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{stock.name}</p>
              <p className="text-xs text-muted-foreground">{stock.ticker}</p>
            </div>
            <div className="text-right">
              <p className="font-bold tabular-nums">${price.toFixed(2)}</p>
              <p className={`text-xs ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                {stock.change >= 0 ? "+" : ""}
                {stock.change}%
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 bg-secondary p-1 rounded-xl">
            <button
              onClick={() => setMode("usdc")}
              className={`py-2 text-sm font-medium rounded-lg ${
                mode === "usdc" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Buy by USDC
            </button>
            <button
              onClick={() => setMode("shares")}
              className={`py-2 text-sm font-medium rounded-lg ${
                mode === "shares" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Buy by Shares
            </button>
          </div>

          <div className="mt-4 bg-card border border-border rounded-2xl p-4">
            {mode === "usdc" ? (
              <>
                <label className="text-xs text-muted-foreground">USDC Amount</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={usdcAmt}
                    onChange={(e) => setUsdcAmt(e.target.value)}
                    className="text-2xl font-bold h-14 border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                  <span className="font-semibold text-muted-foreground">USDC</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated Shares:{" "}
                  <span className="text-foreground font-medium">
                    {shares.toFixed(4)} {stock.ticker}
                  </span>
                </p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">
                    Available: {usdc.toFixed(2)} USDC
                  </span>
                  <button
                    onClick={() => setUsdcAmt(usdc.toFixed(2))}
                    className="text-primary font-medium"
                  >
                    MAX
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="text-xs text-muted-foreground">Number of Shares</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sharesAmt}
                    onChange={(e) => setSharesAmt(e.target.value)}
                    className="text-2xl font-bold h-14 border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                  <span className="font-semibold text-muted-foreground">{stock.ticker}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated Cost:{" "}
                  <span className="text-foreground font-medium">
                    {cost.toFixed(2)} USDC
                  </span>
                </p>
              </>
            )}
          </div>

          <div className="mt-4 bg-card border border-border rounded-2xl p-4 space-y-2.5">
            <h3 className="font-semibold text-sm mb-1">Order Review</h3>
            <Row label="Stock Price" value={`$${price.toFixed(2)}`} />
            <Row label="Number of Shares" value={shares.toFixed(4)} />
            <Row label="Trading Fee" value={`${TRADING_FEE.toFixed(2)} USDC`} />
            <Row label="Network Fee" value="0.00 USDC" />
            <div className="pt-2 border-t border-border">
              <Row label="Total Cost" value={`${cost.toFixed(2)} USDC`} bold />
            </div>
          </div>

          {cost > usdc && (
            <p className="mt-3 text-xs text-destructive text-center">
              Insufficient USDC balance
            </p>
          )}

          <Button
            disabled={!canSubmit}
            onClick={handleConfirm}
            className="w-full h-13 mt-4 bg-success hover:bg-success/90 text-white font-semibold py-3"
          >
            Confirm Purchase
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
