import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Clock, Repeat } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const History = () => {
  const { formatPrice } = useCurrency();
  
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
      </div>
    </div>
  );
};

export default History;
