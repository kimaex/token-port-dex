import { useState } from "react";
import { ArrowLeft, Users, Trophy, Shield, TrendingUp, Star, Copy, AlertTriangle, CheckCircle, Settings2, DollarSign, Percent, Target, XCircle, Zap, Droplets, Eye, Activity, Flame, Bell, BarChart3, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

type Tab = "pumps" | "active" | "settings";

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
  earlyPumps: number;
  pumpSuccessRate: number;
}

interface PumpToken {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  pumpScore: number;
  riskLevel: "safe" | "medium" | "dangerous";
  liquidity: number;
  holderGrowth: number;
  whalesBuying: number;
  smartWallets: number;
  age: string;
  dex: string;
  devHolding: number;
  liquidityLocked: boolean;
  priceChange: number;
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
  { id: "1", name: "Trader Alpha", avatar: "🦁", profit: 120, winRate: 78, followers: 4200, trades: 892, riskLevel: "low", assets: ["BONK", "WIF", "POPCAT"], pnl7d: 18.5, earlyPumps: 34, pumpSuccessRate: 82 },
  { id: "2", name: "Meme Hunter", avatar: "🐸", profit: 300, winRate: 65, followers: 8500, trades: 2341, riskLevel: "high", assets: ["WIF", "BONK", "BOME"], pnl7d: 45.2, earlyPumps: 67, pumpSuccessRate: 71 },
  { id: "3", name: "Degen Lord", avatar: "🐋", profit: 85, winRate: 82, followers: 3100, trades: 567, riskLevel: "low", assets: ["MYRO", "WEN", "MEW"], pnl7d: 8.3, earlyPumps: 18, pumpSuccessRate: 89 },
  { id: "4", name: "Gem Finder", avatar: "💎", profit: 210, winRate: 71, followers: 6700, trades: 1450, riskLevel: "medium", assets: ["POPCAT", "SLERF", "JTO"], pnl7d: 32.1, earlyPumps: 45, pumpSuccessRate: 76 },
  { id: "5", name: "SOL Sniper", avatar: "🎯", profit: 55, winRate: 88, followers: 2800, trades: 345, riskLevel: "low", assets: ["SAMO", "BONK", "WIF"], pnl7d: 5.7, earlyPumps: 12, pumpSuccessRate: 92 },
  { id: "6", name: "Moon Caller", avatar: "🚀", profit: 450, winRate: 58, followers: 12000, trades: 3200, riskLevel: "high", assets: ["WIF", "BOME", "FLOKI"], pnl7d: 67.8, earlyPumps: 89, pumpSuccessRate: 64 },
];

const pumpTokens: PumpToken[] = [
  { id: "p1", name: "CatWifHat", symbol: "CATWIF", chain: "Solana", pumpScore: 8.7, riskLevel: "safe", liquidity: 245000, holderGrowth: 340, whalesBuying: 5, smartWallets: 8, age: "2h", dex: "Raydium", devHolding: 3.2, liquidityLocked: true, priceChange: 1250 },
  { id: "p2", name: "SolPepe", symbol: "SPEPE", chain: "Solana", pumpScore: 7.2, riskLevel: "medium", liquidity: 89000, holderGrowth: 180, whalesBuying: 3, smartWallets: 5, age: "45m", dex: "Jupiter", devHolding: 8.5, liquidityLocked: false, priceChange: 680 },
  { id: "p3", name: "BabyBonk", symbol: "BBONK", chain: "Solana", pumpScore: 9.1, riskLevel: "safe", liquidity: 520000, holderGrowth: 890, whalesBuying: 12, smartWallets: 15, age: "4h", dex: "Orca", devHolding: 1.8, liquidityLocked: true, priceChange: 3200 },
  { id: "p4", name: "MoonDog", symbol: "MDOG", chain: "Solana", pumpScore: 4.3, riskLevel: "dangerous", liquidity: 12000, holderGrowth: 45, whalesBuying: 1, smartWallets: 1, age: "15m", dex: "Raydium", devHolding: 22.5, liquidityLocked: false, priceChange: 120 },
  { id: "p5", name: "FrogKing", symbol: "FKING", chain: "Solana", pumpScore: 6.8, riskLevel: "medium", liquidity: 156000, holderGrowth: 210, whalesBuying: 4, smartWallets: 6, age: "1h", dex: "Jupiter", devHolding: 6.1, liquidityLocked: true, priceChange: 450 },
  { id: "p6", name: "SolCat", symbol: "SCAT", chain: "Solana", pumpScore: 8.2, riskLevel: "safe", liquidity: 380000, holderGrowth: 560, whalesBuying: 8, smartWallets: 11, age: "3h", dex: "Raydium", devHolding: 2.4, liquidityLocked: true, priceChange: 1890 },
];

const activeCopies: ActiveCopy[] = [
  { traderId: "1", traderName: "Trader Alpha", invested: 200, currentValue: 236, pnl: 36, pnlPercent: 18, stopLoss: 15, tradesExecuted: 12 },
  { traderId: "4", traderName: "Gem Finder", invested: 150, currentValue: 178.5, pnl: 28.5, pnlPercent: 19, stopLoss: 20, tradesExecuted: 8 },
];

export default function CopyTrading() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("pumps");
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [selectedPump, setSelectedPump] = useState<PumpToken | null>(null);
  const [investAmount, setInvestAmount] = useState("200");
  const [stopLoss, setStopLoss] = useState("15");
  const [maxTrade, setMaxTrade] = useState("40");
  const [takeProfit, setTakeProfit] = useState("50");
  const [maxDailyLoss, setMaxDailyLoss] = useState("10");
  const [copyMode, setCopyMode] = useState<"auto" | "manual">("auto");

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": case "safe": return "text-green-400 bg-green-500/10";
      case "medium": return "text-yellow-400 bg-yellow-500/10";
      case "high": case "dangerous": return "text-red-400 bg-red-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low": case "safe": return <CheckCircle className="w-3 h-3" />;
      case "medium": return <AlertTriangle className="w-3 h-3" />;
      case "high": case "dangerous": return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPumpScoreColor = (score: number) => {
    if (score >= 7) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getPumpScoreBg = (score: number) => {
    if (score >= 7) return "bg-green-500/20 border-green-500/30";
    if (score >= 5) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const handleCopyTrader = () => {
    if (!selectedTrader) return;
    if (!investAmount || parseFloat(investAmount) < 0.5) {
      toast({ title: "Minimum amount is $0.50", variant: "destructive" });
      return;
    }
    const fee = parseFloat(investAmount) * 0.02;
    toast({
      title: "Copy Trading Started! 🎉",
      description: `Now copying ${selectedTrader.name} with ${formatPrice(parseFloat(investAmount))}. Platform fee: ${formatPrice(fee)} (2%)`,
    });
    setSelectedTrader(null);
  };

  const handleCopyPump = () => {
    if (!selectedPump) return;
    if (!investAmount || parseFloat(investAmount) < 0.5) {
      toast({ title: "Minimum amount is $0.50", variant: "destructive" });
      return;
    }
    toast({
      title: copyMode === "auto" ? "Auto-Copy Activated! 🚀" : "Alert Set! 🔔",
      description: copyMode === "auto"
        ? `Auto-copying smart wallets on ${selectedPump.symbol} with ${formatPrice(parseFloat(investAmount))}`
        : `You'll be notified before any ${selectedPump.symbol} trade executes`,
    });
    setSelectedPump(null);
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
              <p className="text-sm text-muted-foreground">Solana Meme Tokens • Early Pump Detector</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
              <Users className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">37.4K</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-4">
            {([
              { key: "leaderboard" as Tab, label: "Leaders", icon: Trophy },
              { key: "pumps" as Tab, label: "Pumps", icon: Flame },
              { key: "active" as Tab, label: "Active", icon: Copy },
              { key: "settings" as Tab, label: "Risk", icon: Shield },
            ]).map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
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
                    <p className="text-sm text-green-400">+{selectedTrader.profit}% Profit • {selectedTrader.earlyPumps} Pumps Detected</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTrader(null)} className="p-2 rounded-full bg-muted">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Copy Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCopyMode("auto")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${copyMode === "auto" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    <Zap className="w-3.5 h-3.5 inline mr-1" />
                    Auto Copy
                  </button>
                  <button
                    onClick={() => setCopyMode("manual")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${copyMode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    <Bell className="w-3.5 h-3.5 inline mr-1" />
                    Alert Only
                  </button>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                    <DollarSign className="w-3 h-3" /> Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="bg-muted border-border pl-7" placeholder="200" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                    <Settings2 className="w-3 h-3" /> Maximum Trade Size per Token
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" value={maxTrade} onChange={(e) => setMaxTrade(e.target.value)} className="bg-muted border-border pl-7" placeholder="40" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Percent className="w-3 h-3" /> Stop Loss
                    </label>
                    <div className="relative">
                      <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="bg-muted border-border pr-7" placeholder="15" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Target className="w-3 h-3" /> Take Profit
                    </label>
                    <div className="relative">
                      <Input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="bg-muted border-border pr-7" placeholder="50" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Shield className="w-3 h-3" /> Max Daily
                    </label>
                    <div className="relative">
                      <Input type="number" value={maxDailyLoss} onChange={(e) => setMaxDailyLoss(e.target.value)} className="bg-muted border-border pr-7" placeholder="10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <Card className="p-4 bg-muted/50 border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="text-foreground font-medium">{copyMode === "auto" ? "⚡ Auto Copy" : "🔔 Alert Only"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investment</span>
                    <span className="text-foreground font-medium">{formatPrice(parseFloat(investAmount || "0"))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max per Token</span>
                    <span className="text-foreground font-medium">{formatPrice(parseFloat(maxTrade || "0"))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stop Loss / Take Profit</span>
                    <span><span className="text-destructive">{stopLoss}%</span> / <span className="text-green-400">{takeProfit}%</span></span>
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

                <Button onClick={handleCopyTrader} className="w-full bg-gradient-primary text-primary-foreground font-semibold py-6 rounded-xl">
                  <Copy className="w-4 h-4 mr-2" />
                  {copyMode === "auto" ? `Start Copying ${selectedTrader.name}` : `Set Alerts for ${selectedTrader.name}`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pump Copy Modal */}
        {selectedPump && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="max-w-md w-full bg-card border-t border-border rounded-t-3xl p-6 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{selectedPump.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPump.symbol} • {selectedPump.dex} • {selectedPump.age} old</p>
                </div>
                <button onClick={() => setSelectedPump(null)} className="p-2 rounded-full bg-muted">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Pump Score + Risk */}
              <div className="flex gap-3 mb-4">
                <div className={`flex-1 p-3 rounded-xl border ${getPumpScoreBg(selectedPump.pumpScore)}`}>
                  <p className="text-xs text-muted-foreground mb-1">Pump Score</p>
                  <p className={`text-2xl font-black ${getPumpScoreColor(selectedPump.pumpScore)}`}>{selectedPump.pumpScore}/10</p>
                </div>
                <div className={`flex-1 p-3 rounded-xl ${getRiskColor(selectedPump.riskLevel)} border border-current/20`}>
                  <p className="text-xs opacity-70 mb-1">Kimaex Shield</p>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span className="font-bold capitalize">{selectedPump.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Token Metrics */}
              <Card className="p-3 bg-muted/50 border-border mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Liquidity</p>
                      <p className="text-foreground font-medium">${(selectedPump.liquidity / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Holders +{selectedPump.age}</p>
                      <p className="text-green-400 font-medium">+{selectedPump.holderGrowth}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Smart Wallets</p>
                      <p className="text-foreground font-medium">{selectedPump.smartWallets} buying</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Waves className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Whales</p>
                      <p className="text-foreground font-medium">{selectedPump.whalesBuying} active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Dev Holding</p>
                      <p className={`font-medium ${selectedPump.devHolding > 10 ? "text-red-400" : "text-green-400"}`}>{selectedPump.devHolding}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Liq. Locked</p>
                      <p className={`font-medium ${selectedPump.liquidityLocked ? "text-green-400" : "text-red-400"}`}>{selectedPump.liquidityLocked ? "✅ Yes" : "❌ No"}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Copy Mode */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setCopyMode("auto")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${copyMode === "auto" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <Zap className="w-3.5 h-3.5 inline mr-1" />
                  Auto Copy
                </button>
                <button
                  onClick={() => setCopyMode("manual")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${copyMode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <Bell className="w-3.5 h-3.5 inline mr-1" />
                  Alert First
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="bg-muted border-border pl-7" placeholder="200" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Stop Loss (%)</label>
                  <div className="relative">
                    <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="bg-muted border-border pr-7" placeholder="15" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleCopyPump} className="w-full bg-gradient-primary text-primary-foreground font-semibold py-6 rounded-xl">
                {copyMode === "auto" ? (
                  <><Zap className="w-4 h-4 mr-2" />Auto Copy Smart Wallets</>
                ) : (
                  <><Bell className="w-4 h-4 mr-2" />Set Alert for {selectedPump.symbol}</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="px-6 space-y-3">
            {/* Stats Banner */}
            <Card className="p-4 bg-card border-border">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-sm font-bold text-foreground">$12.4M</p>
                  <p className="text-[10px] text-muted-foreground">Total Copied</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-400">+89%</p>
                  <p className="text-[10px] text-muted-foreground">Avg. Return</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">6.2K</p>
                  <p className="text-[10px] text-muted-foreground">Active Copiers</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">265</p>
                  <p className="text-[10px] text-muted-foreground">Pumps Found</p>
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
                        <p className="text-[10px] text-muted-foreground">Profit</p>
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
                        <span className="text-primary font-bold text-sm">{trader.earlyPumps}</span>
                        <p className="text-[10px] text-muted-foreground">Pumps 🔥</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {trader.assets.map(asset => (
                        <span key={asset} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{asset}</span>
                      ))}
                      <span className="text-[10px] text-primary ml-auto">🎯 {trader.pumpSuccessRate}% pump rate</span>
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

        {/* Early Pump Detection Tab */}
        {activeTab === "pumps" && (
          <div className="px-6 space-y-3">
            {/* Live Pump Banner */}
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="font-bold text-foreground">Live Pump Detector</h3>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">● LIVE</span>
              </div>
              <p className="text-xs text-muted-foreground">Monitoring Raydium, Orca & Jupiter for new liquidity pools, whale buys, and holder surges on Solana meme tokens.</p>
            </Card>

            {/* Pump Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 bg-card border-border text-center">
                <Droplets className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">42</p>
                <p className="text-[10px] text-muted-foreground">New Pools (1h)</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <Eye className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">18</p>
                <p className="text-[10px] text-muted-foreground">Smart Wallets</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <Waves className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">7</p>
                <p className="text-[10px] text-muted-foreground">Whale Alerts</p>
              </Card>
            </div>

            {/* Pump Token Cards */}
            {pumpTokens
              .sort((a, b) => b.pumpScore - a.pumpScore)
              .map(token => (
              <Card key={token.id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{token.symbol}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${getRiskColor(token.riskLevel)}`}>
                        {getRiskIcon(token.riskLevel)}
                        {token.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{token.name} • {token.dex} • {token.age} old</p>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-xl border ${getPumpScoreBg(token.pumpScore)} text-center`}>
                    <p className={`text-lg font-black leading-none ${getPumpScoreColor(token.pumpScore)}`}>{token.pumpScore}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">PUMP</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div className="p-1.5 rounded-lg bg-muted">
                    <p className="text-[10px] text-muted-foreground">Liquidity</p>
                    <p className="text-xs font-bold text-foreground">${(token.liquidity / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted">
                    <p className="text-[10px] text-muted-foreground">Holders</p>
                    <p className="text-xs font-bold text-green-400">+{token.holderGrowth}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted">
                    <p className="text-[10px] text-muted-foreground">Whales</p>
                    <p className="text-xs font-bold text-foreground">{token.whalesBuying}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted">
                    <p className="text-[10px] text-muted-foreground">Smart 🧠</p>
                    <p className="text-xs font-bold text-primary">{token.smartWallets}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className="text-green-400 font-bold">+{token.priceChange}%</span>
                  <span className="text-muted-foreground">•</span>
                  <span className={token.liquidityLocked ? "text-green-400" : "text-red-400"}>
                    {token.liquidityLocked ? "🔒 Liq Locked" : "⚠️ Liq Unlocked"}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className={token.devHolding > 10 ? "text-red-400" : "text-muted-foreground"}>
                    Dev: {token.devHolding}%
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedPump(token)}
                    className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                    variant="outline"
                    size="sm"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    Copy Trade
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedPump(token);
                      setCopyMode("manual");
                    }}
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </Button>
                </div>
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
                      <Button variant="outline" className="flex-1 border-border text-muted-foreground" onClick={() => handleStopCopy(copy.traderName)}>
                        Stop Copy
                      </Button>
                      <Button variant="outline" className="flex-1 border-border text-foreground">
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
                  <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-sm font-medium">-10%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-Stop Losing Trader</p>
                    <p className="text-xs text-muted-foreground">Stop copying if trader loses more than</p>
                  </div>
                  <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-sm font-medium">-20%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Blacklist Scam Tokens</p>
                    <p className="text-xs text-muted-foreground">Skip trades on flagged tokens</p>
                  </div>
                  <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-sm font-medium">Active</div>
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
                    <p className="text-sm font-medium text-foreground">Min Pump Score Filter</p>
                    <p className="text-xs text-muted-foreground">Only copy tokens above threshold</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium">≥ 6.0</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Max Open Positions</p>
                    <p className="text-xs text-muted-foreground">Limit concurrent positions per trader</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium">5</div>
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
