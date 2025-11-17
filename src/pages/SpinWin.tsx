import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function SpinWin() {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const prizes = [1, 5, 10, 25, 50, 100];
      const won = prizes[Math.floor(Math.random() * prizes.length)];
      toast.success(`Congratulations! You won ${won} USDT!`);
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Spin and Win</h1>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Win USDT</CardTitle>
            <CardDescription>Try your luck and win up to 100 USDT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className={`w-48 h-48 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow ${isSpinning ? 'animate-spin' : ''}`}>
                <Sparkles className="w-24 h-24 text-primary-foreground" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Spins remaining today</p>
              <p className="text-3xl font-bold text-primary">3</p>
            </div>
            <Button 
              onClick={handleSpin} 
              className="w-full" 
              size="lg"
              disabled={isSpinning}
            >
              {isSpinning ? "Spinning..." : "Spin Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
