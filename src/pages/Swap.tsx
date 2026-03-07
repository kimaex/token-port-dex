import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, ChevronDown, Search, Settings, X, Zap, Info, Shield, Users } from "lucide-react";
import KimaexShield from "@/components/KimaexShield";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

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

type SwapStep = "input" | "shield" | "confirm" | "finalConfirm";
type OrderType = "market" | "limit";

export default function Swap() {
  const { formatPrice, currency } = useCurrency();
  const navigate = useNavigate();
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[2]);
  const [fromAmount, setFromAmount] = useState("");
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [searchQuery, setSearchQuery] = useState("");
  const [swapStep, setSwapStep] = useState<SwapStep>("input");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
  const [stopLossPercent, setStopLossPercent] = useState<number | null>(null);
  const [takeProfitPercent, setTakeProfitPercent] = useState<number | null>(null);

  const toAmount = useMemo(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) return "";
    const fromValue = parseFloat(fromAmount) * fromToken.price;
    const result = fromValue / toToken.price;
    return result.toFixed(6);
  }, [fromAmount, fromToken, toToken]);

  const limitToAmount = useMemo(() => {
    if (!fromAmount || !limitPrice || isNaN(parseFloat(fromAmount)) || isNaN(parseFloat(limitPrice))) return "";
    const result = parseFloat(fromAmount) * parseFloat(limitPrice);
    return result.toFixed(6);
  }, [fromAmount, limitPrice]);

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
    setLimitPrice("");
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
    setLimitPrice("");
  };

  const handleProceedToConfirm = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    setSwapStep("shield");
  };

  const handleShieldProceed = () => {
    setSwapStep("confirm");
  };

  const handleProceedToFinalConfirm = () => {
    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error("Please enter a limit price");
      return;
    }
    if (orderType === "limit") {
      setSwapStep("finalConfirm");
    } else {
      handleConfirmSwap();
    }
  };

  const handleConfirmSwap = () => {
    if (orderType === "limit") {
      let message = `Limit order placed: ${fromAmount} ${fromToken.symbol} → ${limitToAmount} ${toToken.symbol} at ${limitPrice} ${toToken.symbol}/${fromToken.symbol}`;
      if (stopLoss) message += ` | SL: ${stopLoss}`;
      if (takeProfit) message += ` | TP: ${takeProfit}`;
      toast.success(message);
    } else {
      toast.success(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
    }
    setSwapStep("input");
    setFromAmount("");
    setOrderType("market");
    setLimitPrice("");
    setStopLoss("");
    setTakeProfit("");
    setStopLossEnabled(false);
    setTakeProfitEnabled(false);
    setStopLossPercent(null);
    setTakeProfitPercent(null);
  };

  const handleStopLossPercentClick = (percent: number) => {
    if (!limitPrice) return;
    setStopLossPercent(percent);
    const slPrice = parseFloat(limitPrice) * (1 - percent / 100);
    setStopLoss(slPrice.toFixed(6));
  };

  const handleTakeProfitPercentClick = (percent: number) => {
    if (!limitPrice) return;
    setTakeProfitPercent(percent);
    const tpPrice = parseFloat(limitPrice) * (1 + percent / 100);
    setTakeProfit(tpPrice.toFixed(6));
  };

  const handleCancelConfirm = () => {
    setSwapStep("input");
  };

  const handleBackToConfirm = () => {
    setSwapStep("confirm");
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

  // Confirmation Modal
  const ConfirmationModal = () => (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Confirm Swap</h2>
          <Button variant="ghost" size="icon" onClick={handleCancelConfirm}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Order Type Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Order Type</label>
          <div className="flex gap-2">
            <Button
              variant={orderType === "market" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setOrderType("market")}
            >
              Market
            </Button>
            <Button
              variant={orderType === "limit" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setOrderType("limit")}
            >
              Limit Order
            </Button>
          </div>
        </div>

        {/* Limit Price Input */}
        {orderType === "limit" && (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs font-medium">Limit Price ({toToken.symbol}/{fromToken.symbol})</label>
              <div className="bg-secondary/30 rounded-lg p-2">
                <Input
                  type="number"
                  placeholder={`Current: ${exchangeRate}`}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="text-sm font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Stop Loss Toggle - Compact */}
            <div className="space-y-1.5 border border-red-500/20 rounded-lg p-2 bg-red-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <label className="text-xs font-medium">Stop Loss</label>
                </div>
                <button
                  onClick={() => {
                    setStopLossEnabled(!stopLossEnabled);
                    if (stopLossEnabled) {
                      setStopLoss("");
                      setStopLossPercent(null);
                    }
                  }}
                  className={`w-9 h-5 rounded-full transition-colors ${stopLossEnabled ? 'bg-red-500' : 'bg-secondary'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${stopLossEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              {stopLossEnabled && (
                <>
                  <div className="flex gap-1">
                    {[5, 10, 15, 25].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => handleStopLossPercentClick(percent)}
                        className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                          stopLossPercent === percent
                            ? 'bg-red-500 text-white'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        -{percent}%
                      </button>
                    ))}
                  </div>
                  <div className="bg-secondary/50 rounded p-1.5">
                    <Input
                      type="number"
                      placeholder="Custom price"
                      value={stopLoss}
                      onChange={(e) => {
                        setStopLoss(e.target.value);
                        setStopLossPercent(null);
                      }}
                      className="text-xs bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  {stopLoss && (
                    <p className="text-[10px] text-red-400">
                      Sell at {stopLoss} {toToken.symbol}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Take Profit Toggle - Compact */}
            <div className="space-y-1.5 border border-green-500/20 rounded-lg p-2 bg-green-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <label className="text-xs font-medium">Take Profit</label>
                </div>
                <button
                  onClick={() => {
                    setTakeProfitEnabled(!takeProfitEnabled);
                    if (takeProfitEnabled) {
                      setTakeProfit("");
                      setTakeProfitPercent(null);
                    }
                  }}
                  className={`w-9 h-5 rounded-full transition-colors ${takeProfitEnabled ? 'bg-green-500' : 'bg-secondary'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${takeProfitEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              {takeProfitEnabled && (
                <>
                  <div className="flex gap-1">
                    {[10, 25, 50, 100].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => handleTakeProfitPercentClick(percent)}
                        className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                          takeProfitPercent === percent
                            ? 'bg-green-500 text-white'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        +{percent}%
                      </button>
                    ))}
                  </div>
                  <div className="bg-secondary/50 rounded p-1.5">
                    <Input
                      type="number"
                      placeholder="Custom price"
                      value={takeProfit}
                      onChange={(e) => {
                        setTakeProfit(e.target.value);
                        setTakeProfitPercent(null);
                      }}
                      className="text-xs bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  {takeProfit && (
                    <p className="text-[10px] text-green-400">
                      Sell at {takeProfit} {toToken.symbol}
                    </p>
                  )}
                </>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
              Executes at {limitPrice || "..."} {toToken.symbol}/{fromToken.symbol}
            </p>
          </div>
        )}

        {/* Swap Summary */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You pay</span>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                  {fromToken.icon}
                </div>
                <span className="font-semibold">{fromAmount} {fromToken.symbol}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ≈ {formatPrice(parseFloat(fromAmount || "0") * fromToken.price)}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You receive</span>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                  {toToken.icon}
                </div>
                <span className="font-semibold">
                  {orderType === "limit" ? (limitToAmount || "...") : toAmount} {toToken.symbol}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ≈ {formatPrice(parseFloat(orderType === "limit" ? (limitToAmount || "0") : (toAmount || "0")) * toToken.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span>
              1 {fromToken.symbol} = {orderType === "limit" && limitPrice ? limitPrice : exchangeRate} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Slippage</span>
            <span>{slippage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service Fee (2%)</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-green-500" />
              ~{formatPrice(parseFloat(fromAmount || "0") * fromToken.price * 0.02)}
            </span>
          </div>
          {orderType === "limit" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Type</span>
                <span className="text-amber-500">Limit Order</span>
              </div>
              {stopLoss && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="text-red-500">{stopLoss} {toToken.symbol}</span>
                </div>
              )}
              {takeProfit && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Take Profit</span>
                  <span className="text-green-500">{takeProfit} {toToken.symbol}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancelConfirm} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleProceedToFinalConfirm} 
            className="flex-1"
            disabled={orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)}
          >
            {orderType === "limit" ? "Review Order" : "Confirm Swap"}
          </Button>
        </div>
      </div>
    </div>
  );

  // Final Confirmation Modal for Limit Orders
  const FinalConfirmationModal = () => (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Confirm Limit Order</h2>
          <Button variant="ghost" size="icon" onClick={handleCancelConfirm}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Order Summary */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">You are about to place a limit order</p>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {fromToken.icon}
              </div>
              <span className="text-xl font-bold">{fromAmount} {fromToken.symbol}</span>
            </div>
            <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {toToken.icon}
              </div>
              <span className="text-xl font-bold">{limitToAmount} {toToken.symbol}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Limit Price</span>
            <span className="font-semibold text-amber-500">{limitPrice} {toToken.symbol}/{fromToken.symbol}</span>
          </div>
          {stopLoss && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stop Loss</span>
              <span className="font-semibold text-red-500">{stopLoss} {toToken.symbol}</span>
            </div>
          )}
          {takeProfit && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Take Profit</span>
              <span className="font-semibold text-green-500">{takeProfit} {toToken.symbol}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Service Fee (2%)</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-green-500" />
              ~{formatPrice(parseFloat(fromAmount || "0") * fromToken.price * 0.02)}
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            This order will execute when {fromToken.symbol} reaches {limitPrice} {toToken.symbol}. Make sure you have reviewed all details before confirming.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBackToConfirm} className="flex-1">
            Back
          </Button>
          <Button onClick={handleConfirmSwap} className="flex-1">
            Place Order
          </Button>
        </div>
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
                <span className="text-muted-foreground">Service Fee (2%)</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-green-500" />
                  ~{formatPrice(parseFloat(fromAmount || "0") * fromToken.price * 0.02)}
                </span>
              </div>
            </div>
          )}

          {/* Kimaex Shield Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 mt-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Kimaex Shield 🛡️ — Auto-scans tokens before every swap</span>
          </div>

          {/* Proceed Button */}
          <Button
            onClick={handleProceedToConfirm}
            className="w-full h-14 text-lg font-semibold"
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          >
            {!fromAmount || parseFloat(fromAmount) <= 0 ? "Enter amount" : "Scan & Proceed"}
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
      {swapStep === "shield" && (
        <KimaexShield
          tokenSymbol={toToken.symbol}
          tokenName={toToken.name}
          onClose={() => setSwapStep("input")}
          onProceed={handleShieldProceed}
        />
      )}
      {swapStep === "confirm" && <ConfirmationModal />}
      {swapStep === "finalConfirm" && <FinalConfirmationModal />}
    </div>
  );
}