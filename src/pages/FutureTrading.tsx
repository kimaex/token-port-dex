import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";

interface TradingPair {
  id: string;
  pair: string;
  price: string;
  change: number;
  volume: string;
  leverage: string;
}

const FutureTrading = () => {
  const navigate = useNavigate();
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);

  const tradingPairs: TradingPair[] = [
    { id: "1", pair: "BTC/USDT", price: "43,250.00", change: 2.45, volume: "1.2B", leverage: "125x" },
    { id: "2", pair: "ETH/USDT", price: "2,280.50", change: 3.12, volume: "890M", leverage: "100x" },
    { id: "3", pair: "BNB/USDT", price: "312.80", change: -1.23, volume: "245M", leverage: "75x" },
    { id: "4", pair: "XRP/USDT", price: "0.6245", change: 5.67, volume: "180M", leverage: "75x" },
    { id: "5", pair: "SOL/USDT", price: "98.45", change: 4.89, volume: "320M", leverage: "50x" },
    { id: "6", pair: "ADA/USDT", price: "0.5120", change: -2.15, volume: "95M", leverage: "75x" },
    { id: "7", pair: "DOGE/USDT", price: "0.0845", change: 1.78, volume: "150M", leverage: "50x" },
    { id: "8", pair: "DOT/USDT", price: "7.25", change: -0.95, volume: "65M", leverage: "50x" },
    { id: "9", pair: "MATIC/USDT", price: "0.8920", change: 2.34, volume: "120M", leverage: "50x" },
    { id: "10", pair: "LINK/USDT", price: "14.85", change: 3.45, volume: "85M", leverage: "50x" },
  ];

  const hotPairs = tradingPairs.filter(p => p.change > 3);
  const topGainers = [...tradingPairs].sort((a, b) => b.change - a.change).slice(0, 5);
  const topLosers = [...tradingPairs].sort((a, b) => a.change - b.change).slice(0, 5);

  const PairCard = ({ pair }: { pair: TradingPair }) => (
    <div 
      onClick={() => setSelectedPair(pair)}
      className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{pair.pair.split('/')[0].slice(0, 2)}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">{pair.pair}</p>
          <p className="text-sm text-muted-foreground">Vol: {pair.volume}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-foreground">${pair.price}</p>
        <div className={`flex items-center gap-1 ${pair.change >= 0 ? 'text-success' : 'text-destructive'}`}>
          {pair.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-sm font-medium">{pair.change >= 0 ? '+' : ''}{pair.change}%</span>
        </div>
      </div>
    </div>
  );

  if (selectedPair) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-border">
            <button onClick={() => setSelectedPair(null)} className="p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{selectedPair.pair}</h1>
              <p className="text-sm text-muted-foreground">Perpetual • {selectedPair.leverage}</p>
            </div>
          </div>

          {/* Price Display */}
          <div className="p-6 border-b border-border">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-foreground">${selectedPair.price}</span>
              <span className={`text-lg font-medium ${selectedPair.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">24h Volume: {selectedPair.volume}</p>
          </div>

          {/* Trading Actions */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-success hover:bg-success/90 text-success-foreground font-semibold py-6">
                <TrendingUp className="w-5 h-5 mr-2" />
                Long
              </Button>
              <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-6">
                <TrendingDown className="w-5 h-5 mr-2" />
                Short
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-card rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground">Leverage</p>
                <p className="text-lg font-bold text-primary">{selectedPair.leverage}</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground">24h High</p>
                <p className="text-lg font-bold text-success">${(parseFloat(selectedPair.price.replace(',', '')) * 1.05).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground">24h Low</p>
                <p className="text-lg font-bold text-destructive">${(parseFloat(selectedPair.price.replace(',', '')) * 0.95).toFixed(2)}</p>
              </div>
            </div>

            {/* Order Book Preview */}
            <div className="mt-6 p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-3">Order Book</h3>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-destructive">{(parseFloat(selectedPair.price.replace(',', '')) * (1 + (0.001 * (4 - i)))).toFixed(2)}</span>
                    <span className="text-muted-foreground">{(Math.random() * 10).toFixed(4)}</span>
                  </div>
                ))}
                <div className="border-t border-border my-2"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-success">{(parseFloat(selectedPair.price.replace(',', '')) * (1 - (0.001 * (i + 1)))).toFixed(2)}</span>
                    <span className="text-muted-foreground">{(Math.random() * 10).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Futures Trading</h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="p-4">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hot">Hot 🔥</TabsTrigger>
            <TabsTrigger value="gainers">Gainers</TabsTrigger>
            <TabsTrigger value="losers">Losers</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {tradingPairs.map(pair => (
              <PairCard key={pair.id} pair={pair} />
            ))}
          </TabsContent>

          <TabsContent value="hot" className="space-y-3 mt-4">
            {hotPairs.length > 0 ? (
              hotPairs.map(pair => (
                <PairCard key={pair.id} pair={pair} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No hot pairs right now</p>
            )}
          </TabsContent>

          <TabsContent value="gainers" className="space-y-3 mt-4">
            {topGainers.map(pair => (
              <PairCard key={pair.id} pair={pair} />
            ))}
          </TabsContent>

          <TabsContent value="losers" className="space-y-3 mt-4">
            {topLosers.map(pair => (
              <PairCard key={pair.id} pair={pair} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default FutureTrading;
