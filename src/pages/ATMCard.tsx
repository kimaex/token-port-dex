import { useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";

export default function ATMCard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cardType, setCardType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleOrder = () => {
    if (!cardType || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Card Order Initiated",
      description: `Your ${cardType} card order has been placed. You'll receive it within 5-7 business days.`,
    });

    setCardType("");
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/more")}
            className="text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">ATM Card</h1>
        </div>

        <Card className="p-6 mb-6 bg-gradient-primary border-0">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="h-8 w-8 text-primary-foreground" />
            <span className="text-primary-foreground font-semibold">kimaex</span>
          </div>
          <div className="space-y-2 text-primary-foreground">
            <p className="text-sm opacity-80">Available Balance</p>
            <p className="text-3xl font-bold">$12,450.00</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Order New Card</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardType" className="text-foreground">Card Type</Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual Card</SelectItem>
                  <SelectItem value="physical">Physical Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="text-foreground">Initial Load Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-background border-border text-foreground"
              />
            </div>

            <Button 
              onClick={handleOrder}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Order Card
            </Button>
          </div>
        </Card>

        <Card className="p-4 mt-6 bg-card border-border">
          <h3 className="font-semibold mb-2 text-foreground">Card Benefits</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Withdraw cash at any ATM worldwide</li>
            <li>• No monthly fees for virtual cards</li>
            <li>• Instant top-up from your crypto balance</li>
            <li>• Enhanced security with 3D Secure</li>
          </ul>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
