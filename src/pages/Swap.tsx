import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, ChevronDown, Search, Settings, X, Zap, Info } from "lucide-react";
import { toast } from "sonner";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  icon: string;
  network: string;
}

const tokens: Token[] = [
  { symbol: "BTC", name: "Bitcoin", balance: "0.5432", price: 43250, icon: "₿", network: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum", balance: "3.2145", price: 2650, icon: "Ξ", network: "Ethereum" },
  { symbol: "USDC", name: "USD Coin", balance: "5,234.56", price: 1, icon: "◈", network: "Multi-chain" },
  { symbol: "USDT", name: "Tether", balance: "1,234.56", price: 1, icon: "₮", network: "Multi-chain" },
  { symbol: "SOL", name: "Solana", balance: "45.67", price: 98.5, icon: "◎", network: "Solana" },
  { symbol: "BNB", name: "BNB", balance: "12.34", price: 312, icon: "◇", network: "BSC" },
  { symbol: "XRP", name: "Ripple", balance: "1,500.00", price: 0.62, icon: "✕", network: "XRP Ledger" },
  { symbol: "ADA", name: "Cardano", balance: "2,500.00", price: 0.52, icon: "₳", network: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin", balance: "10,000.00", price: 0.085, icon: "Ð", network: "Dogecoin" },
  { symbol: "MATIC", name: "Polygon", balance: "500.00", price: 0.92, icon: "⬡", network: "Polygon" },
];

export default function Swap() {
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[2]);
  const [fromAmount, setFromAmount] = useState("");
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [searchQuery, setSearchQuery] = useState("");

  const toAmount = useMemo(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) return "";
    const fromValue = parseFloat(fromAmount) * fromToken.price;
    const result = fromValue / toToken.price;
    return result.toFixed(6);
  }, [fromAmount, fromToken, toToken]);

  const exchangeRate = useMemo(() => {
    return (fromToken.price / toToken.price).toFixed(6);
  }, [fromToken, toToken]);

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSwapDirection = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount("");
  };

  const handleSelectToken = (token: Token, isFrom: boolean) => {
    if (isFrom) {
      if (token.symbol === toToken.symbol) {
        setToToken(fromToken);
      }
      setFromToken(token);
      setShowFromSelector(false);
    } else {
      if (token.symbol === fromToken.symbol) {
        setFromToken(toToken);
      }
      setToToken(token);
      setShowToSelector(false);
    }
    setSearchQuery("");
  };

  const handleSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
  };

  const handleMaxAmount = () => {
    setFromAmount(fromToken.balance.replace(",", ""));
  };

  const TokenSelector = ({ isFrom }: { isFrom: boolean }) => (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col h-full max-w-md mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Select Token</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowFromSelector(false);
              setShowToSelector(false);
              setSearchQuery("");
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {filteredTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => handleSelectToken(token, isFrom)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {token.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{token.balance}</p>
                  <p className="text-sm text-muted-foreground">{token.network}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Swap Settings</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Slippage Tolerance</label>
            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlippage(value)}
                  className="flex-1"
                >
                  {value}%
                </Button>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-16 text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => setShowSettings(false)} className="w-full">
          Save Settings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Swap</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Swap Card */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          {/* From Token */}
          <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You pay</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Balance: {fromToken.balance}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-primary"
                  onClick={handleMaxAmount}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              />
              <button
                onClick={() => setShowFromSelector(true)}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {fromToken.icon}
                </div>
                <span className="font-semibold">{fromToken.symbol}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            {fromAmount && (
              <p className="text-sm text-muted-foreground">
                ≈ ${(parseFloat(fromAmount || "0") * fromToken.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 bg-background border-2"
              onClick={handleSwapDirection}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You receive</span>
              <span className="text-sm text-muted-foreground">Balance: {toToken.balance}</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="flex-1 text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              />
              <button
                onClick={() => setShowToSelector(true)}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {toToken.icon}
                </div>
                <span className="font-semibold">{toToken.symbol}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            {toAmount && (
              <p className="text-sm text-muted-foreground">
                ≈ ${(parseFloat(toAmount || "0") * toToken.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Rate Info */}
          {fromAmount && parseFloat(fromAmount) > 0 && (
            <div className="bg-secondary/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Rate
                </span>
                <span>1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slippage</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-green-500" />
                  ~$0.50
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            className="w-full h-14 text-lg font-semibold"
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          >
            {!fromAmount || parseFloat(fromAmount) <= 0 ? "Enter amount" : "Swap"}
          </Button>
        </div>

        {/* Recent Swaps */}
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          {[
            { from: "0.1 BTC", to: "4,325 USDC", time: "2 min ago", status: "completed" },
            { from: "500 USDC", to: "0.188 ETH", time: "1 hour ago", status: "completed" },
            { from: "2.5 SOL", to: "246.25 USDC", time: "3 hours ago", status: "completed" },
          ].map((swap, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{swap.from} → {swap.to}</p>
                  <p className="text-sm text-muted-foreground">{swap.time}</p>
                </div>
                <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  {swap.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Selectors */}
      {showFromSelector && <TokenSelector isFrom={true} />}
      {showToSelector && <TokenSelector isFrom={false} />}
      {showSettings && <SettingsModal />}
    </div>
  );
}