import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Info, Pause, Play, Trash2, Settings2, Wallet, TrendingUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

type Frequency = "minute" | "hour" | "day" | "week" | "month";

interface Token {
  symbol: string;
  name: string;
  price: number;
  color: string;
  balance: number;
  address?: string;
}

// USDC is the only spending token
const USDC: Token = { symbol: "USDC", name: "USD Coin", price: 1, color: "bg-sky-500", balance: 1250.45 };

// Buyable tokens (searchable by name, symbol, or contract address)
const BUY_TOKENS: Token[] = [
  { symbol: "SOL", name: "Solana", price: 168, color: "bg-purple-500", balance: 4.21, address: "So11111111111111111111111111111111111111112" },
  { symbol: "BTC", name: "Bitcoin", price: 67500, color: "bg-orange-500", balance: 0.012, address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
  { symbol: "ETH", name: "Ethereum", price: 3450, color: "bg-blue-500", balance: 0.45, address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
  { symbol: "USDT", name: "Tether", price: 1, color: "bg-emerald-500", balance: 320.10, address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
  { symbol: "BNB", name: "BNB", price: 615, color: "bg-yellow-500", balance: 0, address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52" },
  { symbol: "XRP", name: "XRP", price: 0.62, color: "bg-slate-500", balance: 0, address: "rXRPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.16, color: "bg-amber-500", balance: 0, address: "DOGExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { symbol: "ADA", name: "Cardano", price: 0.48, color: "bg-indigo-500", balance: 0, address: "ADAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { symbol: "AVAX", name: "Avalanche", price: 38.5, color: "bg-red-500", balance: 0, address: "0x85f138bfee4ef8e540890cfb48f620571d67eda3" },
  { symbol: "LINK", name: "Chainlink", price: 18.2, color: "bg-blue-600", balance: 0, address: "0x514910771af9ca656af840dff83e8264ecf986ca" },
  { symbol: "MATIC", name: "Polygon", price: 0.72, color: "bg-violet-500", balance: 0, address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0" },
  { symbol: "JUP", name: "Jupiter", price: 1.05, color: "bg-pink-500", balance: 0, address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  { symbol: "WIF", name: "dogwifhat", price: 2.85, color: "bg-rose-500", balance: 0, address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  { symbol: "PEPE", name: "Pepe", price: 0.0000095, color: "bg-green-500", balance: 0, address: "0x6982508145454ce325ddbe47a25d4ec3d2311933" },
  { symbol: "BONK", name: "Bonk", price: 0.0000218, color: "bg-orange-600", balance: 0, address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
];

const ALL_TOKENS: Token[] = [USDC, ...BUY_TOKENS];

const FREQUENCY_LABEL: Record<Frequency, string> = {
  minute: "Minute",
  hour: "Hour",
  day: "Day",
  week: "Week",
  month: "Month",
};

const FREQUENCY_SHORT: Record<Frequency, string> = {
  minute: "min",
  hour: "hr",
  day: "day",
  week: "week",
  month: "month",
};

interface DCAPlan {
  id: string;
  from: string;
  to: string;
  totalAmount: number;
  perOrder: number;
  frequency: Frequency;
  every: number;
  ordersTotal: number;
  ordersDone: number;
  nextRun: string;
  averagePrice: number;
  bought: number;
  active: boolean;
  createdAt: string;
}

const DCATrading = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [tab, setTab] = useState<"create" | "active" | "history">("create");

  // Create form state — spending is always USDC
  const from = "USDC";
  const [to, setTo] = useState("SOL");
  const [amount, setAmount] = useState("");
  const [orders, setOrders] = useState("10");
  const [every, setEvery] = useState("1");
  const [freq, setFreq] = useState<Frequency>("day");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fromToken = USDC;
  const toToken = ALL_TOKENS.find((t) => t.symbol === to) ?? BUY_TOKENS[0];

  const totalAmount = parseFloat(amount) || 0;
  const orderCount = Math.max(1, parseInt(orders) || 1);
  const perOrder = totalAmount / orderCount;
  const everyN = Math.max(1, parseInt(every) || 1);

  // Plans
  const [plans, setPlans] = useState<DCAPlan[]>([
    {
      id: "1",
      from: "USDC",
      to: "SOL",
      totalAmount: 250,
      perOrder: 25,
      frequency: "day",
      every: 1,
      ordersTotal: 10,
      ordersDone: 4,
      nextRun: "in 18h 23m",
      averagePrice: 165.4,
      bought: 0.6045,
      active: true,
      createdAt: "Apr 20, 2026",
    },
    {
      id: "2",
      from: "USDT",
      to: "BTC",
      totalAmount: 500,
      perOrder: 50,
      frequency: "week",
      every: 1,
      ordersTotal: 10,
      ordersDone: 2,
      nextRun: "in 4d 6h",
      averagePrice: 66800,
      bought: 0.00149,
      active: true,
      createdAt: "Apr 12, 2026",
    },
  ]);

  const [history] = useState<DCAPlan[]>([
    {
      id: "h1",
      from: "USDC",
      to: "ETH",
      totalAmount: 300,
      perOrder: 30,
      frequency: "week",
      every: 1,
      ordersTotal: 10,
      ordersDone: 10,
      nextRun: "—",
      averagePrice: 3380,
      bought: 0.0888,
      active: false,
      createdAt: "Feb 1, 2026",
    },
  ]);

  const handleCreate = () => {
    if (!totalAmount || totalAmount < 0.5) {
      toast.error("Minimum amount is $0.50");
      return;
    }
    if (perOrder < 0.5) {
      toast.error("Each order must be at least $0.50");
      return;
    }
    if (totalAmount > fromToken.balance * fromToken.price) {
      toast.error(`Insufficient ${from} balance`);
      return;
    }
    if (from === to) {
      toast.error("Choose different tokens");
      return;
    }

    const plan: DCAPlan = {
      id: Date.now().toString(),
      from,
      to,
      totalAmount,
      perOrder,
      frequency: freq,
      every: everyN,
      ordersTotal: orderCount,
      ordersDone: 0,
      nextRun: `in ${everyN} ${FREQUENCY_SHORT[freq]}${everyN > 1 ? "s" : ""}`,
      averagePrice: 0,
      bought: 0,
      active: true,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setPlans((p) => [plan, ...p]);
    setAmount("");
    toast.success("DCA order placed");
    setTab("active");
  };

  const togglePlan = (id: string) => {
    setPlans((p) => p.map((pl) => (pl.id === id ? { ...pl, active: !pl.active } : pl)));
  };
  const deletePlan = (id: string) => {
    setPlans((p) => p.filter((pl) => pl.id !== id));
    toast.success("Order cancelled");
  };

  const selectToken = (sym: string) => {
    if (pickerOpen === "from") setFrom(sym);
    if (pickerOpen === "to") setTo(sym);
    setPickerOpen(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold">DCA</h1>
            <p className="text-[11px] text-muted-foreground">Dollar-Cost Average into any token</p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-muted">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-md mx-auto px-4 pb-2">
          <div className="flex gap-1 p-1 rounded-xl bg-muted/60">
            {(["create", "active", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  tab === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t === "active" ? `Active (${plans.length})` : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {tab === "create" && (
          <>
            {/* I'm spending */}
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">I'm spending</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  {fromToken.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {from}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0 shadow-none"
                />
                <button
                  onClick={() => setPickerOpen("from")}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors shrink-0"
                >
                  <div className={`h-6 w-6 rounded-full ${fromToken.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {from.slice(0, 1)}
                  </div>
                  <span className="text-sm font-semibold">{from}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount(((fromToken.balance * fromToken.price * pct) / 100).toFixed(2))}
                    className="flex-1 py-1 rounded-md bg-muted/60 hover:bg-muted text-[10px] font-medium text-muted-foreground"
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>
            </Card>

            {/* To buy */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">To buy</span>
              </div>
              <button
                onClick={() => setPickerOpen("to")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${toToken.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {to.slice(0, 1)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{toToken.name}</p>
                    <p className="text-[11px] text-muted-foreground">{to}</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </Card>

            {/* Schedule */}
            <Card className="p-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Over how many orders</p>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={orders}
                  onChange={(e) => setOrders(e.target.value)}
                  className="text-base font-semibold"
                />
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Every</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={every}
                    onChange={(e) => setEvery(e.target.value)}
                    className="w-20 text-base font-semibold"
                  />
                  <div className="flex-1 grid grid-cols-5 gap-1 p-1 rounded-lg bg-muted/60">
                    {(["minute", "hour", "day", "week", "month"] as Frequency[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFreq(f)}
                        className={`py-1.5 rounded-md text-[10px] font-semibold transition-colors ${
                          freq === f
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        }`}
                      >
                        {FREQUENCY_LABEL[f].slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Summary */}
            <Card className="p-4 space-y-2.5 bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sell total</span>
                <span className="font-semibold">{formatPrice(totalAmount)} {from}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Each order</span>
                <span className="font-semibold">{formatPrice(perOrder)} {from}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-semibold">
                  Every {everyN} {FREQUENCY_LABEL[freq].toLowerCase()}{everyN > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-semibold">2% per order</span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-border">
                <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Orders execute automatically at market price. You can cancel anytime.
                </p>
              </div>
            </Card>

            <Button className="w-full h-12 text-sm font-semibold" onClick={handleCreate}>
              Place DCA Order
            </Button>
          </>
        )}

        {tab === "active" && (
          <div className="space-y-3">
            {plans.length === 0 ? (
              <Card className="p-8 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No active DCA orders</p>
                <p className="text-xs text-muted-foreground mt-1">Create one to start auto-investing</p>
                <Button size="sm" className="mt-4" onClick={() => setTab("create")}>
                  Create Order
                </Button>
              </Card>
            ) : (
              plans.map((p) => <PlanCard key={p.id} plan={p} onToggle={togglePlan} onDelete={deletePlan} formatPrice={formatPrice} />)
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No past orders</p>
              </Card>
            ) : (
              history.map((p) => <PlanCard key={p.id} plan={p} formatPrice={formatPrice} readOnly />)
            )}
          </div>
        )}
      </div>

      {/* Token picker */}
      <Dialog open={pickerOpen !== null} onOpenChange={(o) => !o && setPickerOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select token</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 pt-2">
            {TOKENS.map((t) => (
              <button
                key={t.symbol}
                onClick={() => selectToken(t.symbol)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {t.symbol.slice(0, 1)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{t.symbol}</p>
                    <p className="text-[11px] text-muted-foreground">{t.name}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

interface PlanCardProps {
  plan: DCAPlan;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  formatPrice: (n: number) => string;
  readOnly?: boolean;
}

const PlanCard = ({ plan, onToggle, onDelete, formatPrice, readOnly }: PlanCardProps) => {
  const fromToken = TOKENS.find((t) => t.symbol === plan.from)!;
  const toToken = TOKENS.find((t) => t.symbol === plan.to)!;
  const progress = (plan.ordersDone / plan.ordersTotal) * 100;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className={`h-8 w-8 rounded-full ${fromToken.color} flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-card`}>
              {plan.from.slice(0, 1)}
            </div>
            <div className={`h-8 w-8 rounded-full ${toToken.color} flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-card`}>
              {plan.to.slice(0, 1)}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">{plan.from} → {plan.to}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatPrice(plan.perOrder)} every {plan.every} {FREQUENCY_SHORT[plan.frequency]}{plan.every > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Badge variant={plan.active ? "default" : "secondary"} className="text-[10px]">
          {readOnly ? "Completed" : plan.active ? "Active" : "Paused"}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{plan.ordersDone} / {plan.ordersTotal} orders</span>
          <span>Next: {plan.nextRun}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
        <div>
          <p className="text-[10px] text-muted-foreground">Spent</p>
          <p className="text-xs font-semibold mt-0.5">
            {formatPrice(plan.perOrder * plan.ordersDone)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Bought</p>
          <p className="text-xs font-semibold mt-0.5">
            {plan.bought.toFixed(plan.to === "USDC" ? 2 : 5)} {plan.to}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Avg price</p>
          <p className="text-xs font-semibold mt-0.5">
            {plan.averagePrice > 0 ? formatPrice(plan.averagePrice) : "—"}
          </p>
        </div>
      </div>

      {!readOnly && onToggle && onDelete && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => onToggle(plan.id)}>
            {plan.active ? <><Pause className="h-3 w-3 mr-1" /> Pause</> : <><Play className="h-3 w-3 mr-1" /> Resume</>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete(plan.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DCATrading;
