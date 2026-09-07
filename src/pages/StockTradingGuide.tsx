import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, ArrowRight, ShoppingCart, DollarSign, ClipboardCheck, CheckCircle2, Wallet, ListChecks, PackageOpen, BarChart3, Landmark, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";

const BUY_STEPS = [
  { icon: Search, text: "Open Stocks tab" },
  { icon: Search, text: "Search for a stock (AAPL, TSLA, MSFT)" },
  { icon: ArrowRight, text: "Select the stock" },
  { icon: ShoppingCart, text: "Click Buy" },
  { icon: DollarSign, text: "Enter amount in ₦ or number of shares" },
  { icon: ClipboardCheck, text: "Review order: price, fees, shares" },
  { icon: CheckCircle2, text: "Confirm purchase" },
  { icon: Wallet, text: "Stock appears in Portfolio" },
];

const SELL_STEPS = [
  { icon: ListChecks, text: "Open Portfolio" },
  { icon: PackageOpen, text: "Select stock (e.g. AAPL)" },
  { icon: ShoppingCart, text: "Click Sell" },
  { icon: BarChart3, text: "Enter quantity (e.g. 2 shares)" },
  { icon: ClipboardCheck, text: "Review market price, total value, fees" },
  { icon: CheckCircle2, text: "Confirm sell order" },
  { icon: Landmark, text: "Receive ₦ instantly after settlement" },
];

export default function StockTradingGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate("/stocks")}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold">How It Works</h1>
          <div className="w-10" />
        </div>

        {/* Hero */}
        <div className="px-6 pt-6 pb-2 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold mb-2">How Stock Trading Works</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From discovery to settlement — every step happens inside your wallet.
          </p>
        </div>

        {/* Buying Section */}
        <div className="px-4 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-success" />
            </div>
            <h3 className="font-bold text-lg">Buying Stocks</h3>
          </div>

          <div className="relative pl-4">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />
            <div className="space-y-5">
              {BUY_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-start gap-3 relative">
                    <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-card border border-border rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm font-medium leading-snug">{step.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selling Section */}
        <div className="px-4 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-destructive" />
            </div>
            <h3 className="font-bold text-lg">Selling Stocks</h3>
          </div>

          <div className="relative pl-4">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />
            <div className="space-y-5">
              {SELL_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-start gap-3 relative">
                    <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-card border border-border rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm font-medium leading-snug">{step.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pt-8 pb-4">
          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
            onClick={() => navigate("/stocks")}
          >
            Go to Stock Market
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
