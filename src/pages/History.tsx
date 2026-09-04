import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Clock, Repeat, TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FuturesHistoryEntry {
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

const NGN_PER_USD = 1580;
const fmtNGN = (v: number, dp = 2) =>
  "₦" +
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(v);

const History = () => {
  const { formatPrice } = useCurrency();
  const [futures, setFutures] = useState<FuturesHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const h = localStorage.getItem("futures_history");
      if (h) setFutures(JSON.parse(h));
    } catch {}
  }, []);

  const transactions = [
    { id: 1, type: "receive", asset: "BTC", amount: "+0.025", valueUSD: 1250, time: "2 hours ago", status: "completed" },
    { id: 2, type: "send", asset: "ETH", amount: "-1.5", valueUSD: 4500, time: "5 hours ago", status: "completed" },
    { id: 3, type: "swap", asset: "USDT → BNB", amount: "500", valueUSD: 500, time: "1 day ago", status: "completed" },
    { id: 4, type: "receive", asset: "SOL", amount: "+25", valueUSD: 2000, time: "2 days ago", status: "completed" },
    { id: 5, type: "send", asset: "USDC", amount: "-1000", valueUSD: 1000, time: "3 days ago", status: "completed" },
    { id: 6, type: "swap", asset: "ETH → BTC", amount: "0.5", valueUSD: 1500, time: "4 days ago", status: "pending" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "receive":
        return <ArrowDownLeft className="w-5 h-5" />;
      case "send":
        return <ArrowUpRight className="w-5 h-5" />;
      case "swap":
        return <Repeat className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "receive":
        return "text-green-500";
      case "send":
        return "text-red-500";
      case "swap":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <Card key={tx.id} className="hover:shadow-card transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getColor(tx.type)}`}>
                    {getIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold capitalize">{tx.type}</p>
                      <p className={`font-bold ${tx.amount.startsWith('+') ? 'text-green-500' : tx.amount.startsWith('-') ? 'text-red-500' : 'text-foreground'}`}>
                        {tx.amount} {tx.asset}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{tx.time}</span>
                      <span>{formatPrice(tx.valueUSD)}</span>
                    </div>
                  </div>
                  <Badge variant={tx.status === "completed" ? "secondary" : "outline"} className="text-xs">
                    {tx.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {futures.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Futures History</h2>
            </div>
            <div className="space-y-3">
              {futures.map((h) => (
                <Card key={h.id} className="hover:shadow-card transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{h.symbol}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            className={`text-[10px] border-0 ${
                              h.side === "long"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-rose-500/15 text-rose-500"
                            }`}
                          >
                            {h.side === "long" ? "Long" : "Short"} {h.leverage}x
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            Closed
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(h.at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                          Entry {fmtNGN(h.entry, 0)} → Exit {fmtNGN(h.exit, 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums">{fmtNGN(h.proceeds)}</p>
                        <p
                          className={`text-[10px] font-semibold tabular-nums ${
                            h.pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {h.pnl >= 0 ? "+" : ""}
                          {fmtNGN(h.pnl)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default History;
