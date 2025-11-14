import { TrendingUp, TrendingDown } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
  change: number;
  icon: string;
}

const assets: Asset[] = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.5432",
    value: "$23,456.78",
    change: 5.2,
    icon: "₿",
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    balance: "3.2145",
    value: "$8,234.50",
    change: 3.8,
    icon: "Ξ",
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    balance: "125.50",
    value: "$5,678.90",
    change: -2.1,
    icon: "◎",
  },
  {
    id: "4",
    name: "Cardano",
    symbol: "ADA",
    balance: "2450.00",
    value: "$1,890.00",
    change: 1.5,
    icon: "₳",
  },
];

export const AssetList = () => {
  return (
    <div className="px-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Assets</h3>
      </div>

      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-card border border-border rounded-2xl p-4 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold shadow-glow">
                  {asset.icon}
                </div>
                <div>
                  <p className="font-semibold">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">{asset.value}</p>
                <div className="flex items-center gap-1 text-sm">
                  <p className={asset.change >= 0 ? "text-success" : "text-destructive"}>
                    {asset.change >= 0 ? "+" : ""}
                    {asset.change}%
                  </p>
                  {asset.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
