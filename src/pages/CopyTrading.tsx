import { useState } from "react";
import { ArrowLeft, Users, Trophy, Shield, TrendingUp, Star, Copy, AlertTriangle, CheckCircle, Settings2, DollarSign, Percent, Target, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

type Tab = "leaderboard" | "active" | "settings";

interface Trader {
  id: string;
  name: string;
  avatar: string;
  profit: number;
  winRate: number;
  followers: number;
  trades: number;
  riskLevel: "low" | "medium" | "high";
  assets: string[];
  pnl7d: number;
}

interface ActiveCopy {
  traderId: string;
  traderName: string;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  stopLoss: number;
  tradesExecuted: number;
}

const traders: Trader[] = [
  { id: "1", name: "Trader Alpha", avatar: "🦁", profit: 120, winRate: 78, followers: 4200, trades: 892, riskLevel: "low", assets: ["SOL", "ETH", "BTC"], pnl7d: 18.5 },
  { id: "2", name: "Meme Hunter", avatar: "🐸", profit: 300, winRate: 65, followers: 8500, trades: 2341, riskLevel: "high", assets: ["PEPE", "DOGE", "BONK"], pnl7d: 45.2 },
  { id: "3", name: "DeFi Whale", avatar: "🐋", profit: 85, winRate: 82, followers: 3100, trades: 567, riskLevel: "low", assets: ["ETH", "AAVE", "UNI"], pnl7d: 8.3 },
  { id: "4", name: "Gem Finder", avatar: "💎", profit: 210, winRate: 71, followers: 6700, trades: 1450, riskLevel: "medium", assets: ["SOL", "ARB", "OP"], pnl7d: 32.1 },
  { id: "5", name: "Steady Earner", avatar: "🎯", profit: 55, winRate: 88, followers: 2800, trades: 345, riskLevel: "low", assets: ["BTC", "ETH", "USDC"], pnl7d: 5.7 },
  { id: "6", name: "Moon Caller", avatar: "🚀", profit: 450, winRate: 58, followers: 12000, trades: 3200, riskLevel: "high", assets: ["SHIB", "WIF", "FLOKI"], pnl7d: 67.8 },
];

const activeCopies: ActiveCopy[] = [
  { traderId: "1", traderName: "Trader Alpha", invested: 200, currentValue: 236, pnl: 36, pnlPercent: 18, stopLoss: 15, tradesExecuted: 12 },
  { traderId: "4", traderName: "Gem Finder", invested: 150, currentValue: 178.5, pnl: 28.5, pnlPercent: 19, stopLoss: 20, tradesExecuted: 8 },
];

export default function CopyTrading() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [investAmount, setInvestAmount] = useState("200");
  const [stopLoss, setStopLoss] = useState("15");
  const [maxTrade, setMaxTrade] = useState("40");
  const [takeProfit, setTakeProfit] = useState("50");
  const [maxDailyLoss, setMaxDailyLoss] = useState("10");

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400 bg-green-500/10";
      case "medium": return "text-yellow-400 bg-yellow-500/10";
      case "high": return "text-red-400 bg-red-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low": return <CheckCircle className="w-3 h-3" />;
      case "medium": return <AlertTriangle className="w-3 h-3" />;
      case "high": return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleCopyTrader = () => {
    if (!selectedTrader) return;
    const fee = parseFloat(investAmount) * 0.02;
    toast({
      title: "Copy Trading Started! 🎉",
      description: `Now copying ${selectedTrader.name} with ${formatPrice(parseFloat(investAmount))}. Platform fee: ${formatPrice(fee)} (2%)`,
    });
    setSelectedTrader(null);
  };

  const handleStopCopy = (traderName: string) => {
    toast({
      title: "Copy Stopped",
      description: `Stopped copying ${traderName}. Funds returned to wallet.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Copy Trading</h1>
              <p className="text-sm text-muted-foreground">Replicate top trader strategies</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
              <Users className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">37.4K Users</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {([
              { key: "leaderboard" as Tab, label: "Leaderboard", icon: Trophy },
              { key: "active" as Tab, label: "Active", icon: Copy },
              { key: "settings" as Tab, label: "Risk", icon: Shield },
            ]).map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy Settings Modal */}
        {selectedTrader && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="max-w-md w-full bg-card border-t border-border rounded-t-3xl p-6 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTrader.avatar}</span>
                  <div>
                    <h3 className="font-bold text-foreground">{selectedTrader.name}</h3>
                    <p className="text-sm text-green-400">+{selectedTrader.profit}% Profit</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTrader(null)} className="p-2 rounded-full bg-muted">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                    <DollarSign className="w-3 h-3" /> Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      className="bg-muted border-border pl-7"
                      placeholder="200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                    <Settings2 className="w-3 h-3" /> Maximum Trade Size per Token
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={maxTrade}
                      onChange={(e) => setMaxTrade(e.target.value)}
                      className="bg-muted border-border pl-7"
                      placeholder="40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Percent className="w-3 h-3" /> Stop Loss
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className="bg-muted border-border pr-7"
                        placeholder="15"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Target className="w-3 h-3" /> Take Profit
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        className="bg-muted border-border pr-7"
                        placeholder="50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Shield className="w-3 h-3" /> Max Daily
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={maxDailyLoss}
                        onChange={(e) => setMaxDailyLoss(e.target.value)}
                        className="bg-muted border-border pr-7"
                        placeholder="10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <Card className="p-4 bg-muted/50 border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investment</span>
                    <span className="text-foreground font-medium">{formatPrice(parseFloat(investAmount || "0"))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max per Token</span>
                    <span className="text-foreground font-medium">{formatPrice(parseFloat(maxTrade || "0"))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stop Loss</span>
                    <span className="text-destructive">{stopLoss}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Take Profit</span>
                    <span className="text-green-400">{takeProfit}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Daily Loss</span>
                    <span className="text-destructive">{maxDailyLoss}%</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (2%)</span>
                    <span className="text-primary font-medium">{formatPrice(parseFloat(investAmount || "0") * 0.02)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trader Fee (10%)</span>
                    <span className="text-muted-foreground">On profit only</span>
                  </div>
                </Card>

                <Button
                  onClick={handleCopyTrader}
                  className="w-full bg-gradient-primary text-primary-foreground font-semibold py-6 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Start Copying {selectedTrader.name}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="px-6 space-y-3">
            {/* Stats Banner */}
            <Card className="p-4 bg-card border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">$12.4M</p>
                  <p className="text-xs text-muted-foreground">Total Copied</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-400">+89%</p>
                  <p className="text-xs text-muted-foreground">Avg. Return</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">6.2K</p>
                  <p className="text-xs text-muted-foreground">Active Copiers</p>
                </div>
              </div>
            </Card>

            {/* Trader Cards */}
            {traders.map((trader, index) => (
              <Card key={trader.id} className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                      {trader.avatar}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{trader.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getRiskColor(trader.riskLevel)}`}>
                        {getRiskIcon(trader.riskLevel)}
                        {trader.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      <div>
                        <span className="text-green-400 font-bold text-sm">+{trader.profit}%</span>
                        <p className="text-[10px] text-muted-foreground">Total Profit</p>
                      </div>
                      <div>
                        <span className="text-foreground font-medium text-sm">{trader.winRate}%</span>
                        <p className="text-[10px] text-muted-foreground">Win Rate</p>
                      </div>
                      <div>
                        <span className="text-foreground font-medium text-sm">{trader.followers.toLocaleString()}</span>
                        <p className="text-[10px] text-muted-foreground">Followers</p>
                      </div>
                      <div>
                        <span className="text-foreground font-medium text-sm">{trader.trades}</span>
                        <p className="text-[10px] text-muted-foreground">Trades</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {trader.assets.map(asset => (
                        <span key={asset} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{asset}</span>
                      ))}
                      <span className="text-xs text-green-400 ml-auto">7d: +{trader.pnl7d}%</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedTrader(trader)}
                  className="w-full mt-3 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Trader
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Active Copies Tab */}
        {activeTab === "active" && (
          <div className="px-6 space-y-3">
            {activeCopies.length === 0 ? (
              <Card className="p-8 bg-card border-border text-center">
                <Copy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active copies yet</p>
                <Button onClick={() => setActiveTab("leaderboard")} className="mt-3 bg-primary text-primary-foreground">
                  Browse Traders
                </Button>
              </Card>
            ) : (
              <>
                {/* Portfolio Summary */}
                <Card className="p-4 bg-card border-border">
                  <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(414.5)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">+{formatPrice(64.5)} (18.4%)</span>
                  </div>
                </Card>

                {activeCopies.map(copy => (
                  <Card key={copy.traderId} className="p-4 bg-card border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{copy.traderName}</h3>
                      <span className={`text-sm font-bold ${copy.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {copy.pnl >= 0 ? "+" : ""}{copy.pnlPercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Invested</p>
                        <p className="text-foreground font-medium">{formatPrice(copy.invested)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Value</p>
                        <p className="text-foreground font-medium">{formatPrice(copy.currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">PnL</p>
                        <p className="text-green-400 font-medium">+{formatPrice(copy.pnl)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Trades Executed</p>
                        <p className="text-foreground font-medium">{copy.tradesExecuted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${Math.min(100, (copy.pnlPercent / copy.stopLoss) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">SL: {copy.stopLoss}%</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-border text-muted-foreground"
                        onClick={() => handleStopCopy(copy.traderName)}
                      >
                        Stop Copy
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-border text-foreground"
                      >
                        <Settings2 className="w-4 h-4 mr-1" />
                        Adjust
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Profit Sharing Info */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-foreground text-sm">Profit Sharing</h4>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your profit</span>
                      <span className="text-green-400 font-medium">+{formatPrice(64.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trader fee (10%)</span>
                      <span className="text-foreground">-{formatPrice(6.45)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kimaex fee (2%)</span>
                      <span className="text-foreground">-{formatPrice(1.29)}</span>
                    </div>
                    <div className="border-t border-border pt-1.5 flex justify-between">
                      <span className="text-foreground font-medium">Net Profit</span>
                      <span className="text-green-400 font-bold">+{formatPrice(56.76)}</span>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Risk Protection Tab */}
        {activeTab === "settings" && (
          <div className="px-6 space-y-3">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Risk Protection</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Automated safeguards to protect your investments from excessive losses.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Max Daily Loss</p>
                    <p className="text-xs text-muted-foreground">Stop all copies if daily loss exceeds limit</p>
                  </div>
                  <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-sm font-medium">
                    -10%
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-Stop Losing Trader</p>
                    <p className="text-xs text-muted-foreground">Stop copying if trader loses more than</p>
                  </div>
                  <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-sm font-medium">
                    -20%
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Blacklist Scam Tokens</p>
                    <p className="text-xs text-muted-foreground">Skip trades on flagged tokens</p>
                  </div>
                  <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-sm font-medium">
                    Active
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Rug-Pull Detection</p>
                    <p className="text-xs text-muted-foreground">Kimaex Shield integration</p>
                  </div>
                  <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Active
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Max Open Positions</p>
                    <p className="text-xs text-muted-foreground">Limit concurrent positions per trader</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium">
                    5
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Fee Structure</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-primary font-medium">2% on profits</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-muted-foreground">Trader Performance Fee</span>
                  <span className="text-foreground font-medium">10% on profits</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-muted-foreground">Copy Setup Fee</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}