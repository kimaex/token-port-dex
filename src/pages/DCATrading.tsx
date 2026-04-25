import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, TrendingUp, Info, Play, Pause, Trash2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

type Frequency = "daily" | "weekly" | "monthly";

interface DCAPlan {
  id: string;
  asset: string;
  amount: number;
  frequency: Frequency;
  nextRun: string;
  totalInvested: number;
  totalBought: number;
  active: boolean;
  createdAt: string;
}

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", price: 67500, color: "bg-orange-500" },
  { symbol: "ETH", name: "Ethereum", price: 3450, color: "bg-blue-500" },
  { symbol: "SOL", name: "Solana", price: 168, color: "bg-purple-500" },
  { symbol: "USDC", name: "USD Coin", price: 1, color: "bg-sky-500" },
];

const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
};

const DCATrading = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const formatAmount = (n: number) => formatPrice(n);

  const [plans, setPlans] = useState<DCAPlan[]>([
    {
      id: "1",
      asset: "BTC",
      amount: 25,
      frequency: "weekly",
      nextRun: "In 2 days",
      totalInvested: 325,
      totalBought: 0.00481,
      active: true,
      createdAt: "Mar 1, 2024",
    },
    {
      id: "2",
      asset: "ETH",
      amount: 10,
      frequency: "daily",
      nextRun: "Tomorrow",
      totalInvested: 180,
      totalBought: 0.0521,
      active: true,
      createdAt: "Mar 14, 2024",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [newAsset, setNewAsset] = useState("BTC");
  const [newAmount, setNewAmount] = useState("");
  const [newFreq, setNewFreq] = useState<Frequency>("weekly");

  const totals = useMemo(() => {
    const invested = plans.reduce((s, p) => s + p.totalInvested, 0);
    const active = plans.filter((p) => p.active).length;
    return { invested, active };
  }, [plans]);

  const handleCreate = () => {
    const amt = parseFloat(newAmount);
    if (!amt || amt < 0.5) {
      toast.error("Minimum amount is $0.50");
      return;
    }
    const plan: DCAPlan = {
      id: Date.now().toString(),
      asset: newAsset,
      amount: amt,
      frequency: newFreq,
      nextRun: newFreq === "daily" ? "Tomorrow" : newFreq === "weekly" ? "In 7 days" : "In 30 days",
      totalInvested: 0,
      totalBought: 0,
      active: true,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setPlans((p) => [plan, ...p]);
    setNewAmount("");
    setOpen(false);
    toast.success(`DCA plan created: ${formatAmount(amt)} of ${newAsset} ${FREQUENCY_LABEL[newFreq].toLowerCase()}`);
  };

  const togglePlan = (id: string) => {
    setPlans((p) => p.map((pl) => (pl.id === id ? { ...pl, active: !pl.active } : pl)));
  };

  const deletePlan = (id: string) => {
    setPlans((p) => p.filter((pl) => pl.id !== id));
    toast.success("Plan removed");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">DCA Trading</h1>
            <p className="text-xs text-muted-foreground">Auto-invest, beginner friendly</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* What is DCA */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-primary/15 h-fit">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">What is DCA?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dollar-Cost Averaging buys a small amount of crypto on a schedule. It removes timing
                stress and smooths out price ups and downs — perfect for beginners.
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="text-lg font-bold mt-1">{formatAmount(totals.invested)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Active Plans</p>
            <p className="text-lg font-bold mt-1">{totals.active}</p>
          </Card>
        </div>

        {/* Create plan */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create New DCA Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New DCA Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Asset</Label>
                <Select value={newAsset} onValueChange={setNewAsset}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSETS.map((a) => (
                      <SelectItem key={a.symbol} value={a.symbol}>
                        {a.name} ({a.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount per buy (USD)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="10.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">Minimum $0.50 per buy</p>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "weekly", "monthly"] as Frequency[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setNewFreq(f)}
                      className={`py-2.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        newFreq === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="p-3 bg-muted/40 border-0">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    A 2% service fee applies per buy. You can pause or cancel anytime.
                  </p>
                </div>
              </Card>

              <Button className="w-full" onClick={handleCreate}>
                Start DCA Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Plans */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Your Plans</h2>

          {plans.length === 0 && (
            <Card className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No DCA plans yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first plan to start auto-investing
              </p>
            </Card>
          )}

          {plans.map((plan) => {
            const asset = ASSETS.find((a) => a.symbol === plan.asset)!;
            return (
              <Card key={plan.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${asset.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {asset.symbol.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatAmount(plan.amount)} · {FREQUENCY_LABEL[plan.frequency]}
                      </p>
                    </div>
                  </div>
                  <Badge variant={plan.active ? "default" : "secondary"} className="text-[10px]">
                    {plan.active ? "Active" : "Paused"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Invested</p>
                    <p className="text-xs font-semibold mt-0.5">{formatAmount(plan.totalInvested)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Holdings</p>
                    <p className="text-xs font-semibold mt-0.5">
                      {plan.totalBought.toFixed(plan.asset === "USDC" ? 2 : 5)} {plan.asset}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> Next
                    </p>
                    <p className="text-xs font-semibold mt-0.5">{plan.nextRun}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => togglePlan(plan.id)}
                  >
                    {plan.active ? (
                      <><Pause className="h-3 w-3 mr-1" /> Pause</>
                    ) : (
                      <><Play className="h-3 w-3 mr-1" /> Resume</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:text-destructive"
                    onClick={() => deletePlan(plan.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DCATrading;
