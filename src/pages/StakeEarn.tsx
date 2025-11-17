import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function StakeEarn() {
  const [amount, setAmount] = useState("");

  const handleStake = () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Staking ${amount} crypto initiated`);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Stake and Earn</h1>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Stake Your Crypto</CardTitle>
            <CardDescription>Earn rewards by staking your cryptocurrency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount to Stake</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Annual Percentage Yield (APY)</p>
              <p className="text-2xl font-bold text-primary">12.5%</p>
            </div>
            <Button onClick={handleStake} className="w-full" size="lg">
              Stake Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
