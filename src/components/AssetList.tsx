import { useState } from "react";
import { TrendingUp, TrendingDown, Send, Download, ArrowLeftRight, ChevronLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
  change: number;
  icon: string;
  price: string;
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
    price: "$43,215.67",
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    balance: "3.2145",
    value: "$8,234.50",
    change: 3.8,
    icon: "Ξ",
    price: "$2,561.23",
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    balance: "125.50",
    value: "$5,678.90",
    change: -2.1,
    icon: "◎",
    price: "$45.25",
  },
  {
    id: "4",
    name: "Cardano",
    symbol: "ADA",
    balance: "2450.00",
    value: "$1,890.00",
    change: 1.5,
    icon: "₳",
    price: "$0.77",
  },
];

// Generate mock chart data
const generateChartData = (isPositive: boolean) => {
  const data = [];
  let value = 100;
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - (isPositive ? 0.4 : 0.6)) * 10;
    value = Math.max(50, Math.min(150, value + change));
    data.push({ day: i, value });
  }
  return data;
};

export const AssetList = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  const timeframes = ["1H", "1D", "1W", "1M", "1Y", "ALL"];

  if (selectedAsset) {
    const chartData = generateChartData(selectedAsset.change >= 0);
    const chartColor = selectedAsset.change >= 0 ? "#22c55e" : "#ef4444";

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedAsset(null)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
              {selectedAsset.icon}
            </div>
            <span className="font-semibold">{selectedAsset.name}</span>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Price Section */}
        <div className="p-6 text-center">
          <p className="text-4xl font-bold">{selectedAsset.price}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-lg font-medium ${selectedAsset.change >= 0 ? "text-success" : "text-destructive"}`}>
              {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change}%
            </span>
            {selectedAsset.change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 px-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={2}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Timeframe Selector */}
          <div className="flex justify-between mt-4 bg-muted/50 rounded-xl p-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTimeframe === tf 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Balance Section */}
        <div className="p-4 mx-4 bg-card rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Your Balance</span>
            <span className="font-bold text-lg">{selectedAsset.value}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{selectedAsset.symbol}</span>
            <span className="font-medium">{selectedAsset.balance}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <Button 
            className="flex-col h-auto py-4 gap-2"
            variant="outline"
            onClick={() => {
              console.log("Send", selectedAsset.name);
              setSelectedAsset(null);
            }}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm">Send</span>
          </Button>

          <Button 
            className="flex-col h-auto py-4 gap-2"
            variant="outline"
            onClick={() => {
              console.log("Receive", selectedAsset.name);
              setSelectedAsset(null);
            }}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm">Receive</span>
          </Button>

          <Button 
            className="flex-col h-auto py-4 gap-2"
            variant="outline"
            onClick={() => {
              console.log("Swap", selectedAsset.name);
              setSelectedAsset(null);
            }}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm">Swap</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Assets</h3>
      </div>

      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
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