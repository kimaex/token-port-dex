import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { sellStock, usePortfolio } from "@/lib/portfolioStore";
import { STOCKS } from "@/data/stocksData";

const TRADING_FEE = 1;

export default function SellStock() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const stock = STOCKS.find((s) => s.ticker === ticker);
  const { holdings } = usePortfolio();
  const holding = holdings.find((h) => h.ticker === ticker);
  const [sharesAmt, setSharesAmt] = useState("");
  const [success, setSuccess] = useState<null | {
    id: string;
    shares: number;
    net: number;
  }>(null);

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Stock not found</p>
      </div>
    );
  }

  const price = stock.price;
  const owned = holding?.shares ?? 0;
  const sellShares = parseFloat(sharesAmt) || 0;
  const gross = sellShares * price;
  const net = Math.max(0, gross - TRADING_FEE);
  const canSubmit = sellShares > 0 && sellShares <= owned;

  const handleConfirm = () => {
    try {
      const tx = sellStock(stock.ticker, sellShares, price, TRADING_FEE);
      setSuccess({ id: tx.id, shares: sellShares, net });
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
            <h1 className="text-2xl font-bold">Sell Order Completed</h1>
            <p className="text-sm text-muted-foreground mt-1">
              USDC has been credited to your wallet balance.
            </p>
          </div>
          <div className="mt-8 bg-card border border-border rounded-2xl p-5 space-y-3">
            <Row label="Stock" value={`${stock.name} (${stock.ticker})`} />
            <Row label="Shares Sold" value={success.shares.toFixed(4)} />
            <Row label="Price / share" value={`$${price.toFixed(2)}`} />
            <Row label="Trading Fee" value={`${TRADING_FEE.toFixed(2)} USDC`} />
            <Row label="USDC Received" value={`${success.net.toFixed(2)} USDC`} bold />
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
          <Button className="w-full h-12 mt-6" onClick={() => navigate("/stocks")}>
            Done
          </Button>
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
          <h1 className="font-bold">Sell {stock.ticker}</h1>
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
              <p className="text-xs text-muted-foreground">
                Owned: {owned.toFixed(4)} {stock.ticker}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold tabular-nums">${price.toFixed(2)}</p>
              <p className={`text-xs ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                {stock.change >= 0 ? "+" : ""}
                {stock.change}%
              </p>
            </div>
          </div>

          <div className="mt-4 bg-card border border-border rounded-2xl p-4">
            <label className="text-xs text-muted-foreground">Shares to Sell</label>
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
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted-foreground">
                Available: {owned.toFixed(4)} {stock.ticker}
              </span>
              <button
                onClick={() => setSharesAmt(String(owned))}
                className="text-primary font-medium"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="mt-4 bg-card border border-border rounded-2xl p-4 space-y-2.5">
            <h3 className="font-semibold text-sm mb-1">Order Review</h3>
            <Row label="Current Price" value={`$${price.toFixed(2)}`} />
            <Row label="Shares Selling" value={sellShares.toFixed(4)} />
            <Row label="Gross Value" value={`${gross.toFixed(2)} USDC`} />
            <Row label="Trading Fee" value={`${TRADING_FEE.toFixed(2)} USDC`} />
            <div className="pt-2 border-t border-border">
              <Row label="You Receive" value={`${net.toFixed(2)} USDC`} bold />
            </div>
          </div>

          {sellShares > owned && (
            <p className="mt-3 text-xs text-destructive text-center">
              You don't own that many shares
            </p>
          )}

          <Button
            disabled={!canSubmit}
            onClick={handleConfirm}
            className="w-full h-13 mt-4 bg-destructive hover:bg-destructive/90 text-white font-semibold py-3"
          >
            Confirm Sell
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
