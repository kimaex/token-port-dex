import { useState } from "react";
import { TrendingUp, TrendingDown, Send, Download, ArrowLeftRight, LineChart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleAction = (action: string) => {
    if (selectedAsset) {
      console.log(`${action} action for ${selectedAsset.name}`);
      // Here you would navigate to the respective page or open a modal
    }
    setSelectedAsset(null);
  };

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

      {/* Asset Action Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-card border border-border rounded-t-3xl w-full max-w-md p-6 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold shadow-glow">
                  {selectedAsset.icon}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedAsset.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAsset.balance} {selectedAsset.symbol}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedAsset(null)}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Price Info */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Value</span>
                <span className="font-bold text-xl">{selectedAsset.value}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-muted-foreground">24h Change</span>
                <span className={`font-semibold ${selectedAsset.change >= 0 ? "text-success" : "text-destructive"}`}>
                  {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => handleAction("Send")}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Send</span>
              </button>

              <button
                onClick={() => handleAction("Receive")}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Receive</span>
              </button>

              <button
                onClick={() => handleAction("Swap")}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Swap</span>
              </button>

              <button
                onClick={() => handleAction("Chart")}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Chart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
