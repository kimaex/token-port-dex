import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function GovernmentBonds() {
  const [amount, setAmount] = useState("");

  const handleBuy = () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Purchase of ${amount} in government bonds initiated`);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Landmark className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Government Bonds</h1>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Buy Government Bonds</CardTitle>
            <CardDescription>Invest in secure government bonds with crypto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Investment Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="text-2xl font-bold text-primary">8.75%</p>
              <p className="text-xs text-muted-foreground mt-2">Maturity: 5 years</p>
            </div>
            <Button onClick={handleBuy} className="w-full" size="lg">
              Buy Bonds
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
