import { useState } from "react";
import { ArrowLeft, Receipt, Zap, Droplet, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";

export default function UtilitiesBills() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billType, setBillType] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const billTypes = [
    { value: "electricity", label: "Electricity", icon: Zap },
    { value: "water", label: "Water", icon: Droplet },
    { value: "internet", label: "Internet", icon: Wifi },
  ];

  const handlePayment = () => {
    if (!billType || !accountNumber || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Payment Successful",
      description: `Your ${billType} bill payment of $${amount} has been processed.`,
    });

    setBillType("");
    setAccountNumber("");
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
          <h1 className="text-2xl font-bold text-foreground">Utilities Bills</h1>
        </div>

        <Card className="p-6 mb-6 bg-gradient-primary border-0">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="h-6 w-6 text-primary-foreground" />
            <span className="text-primary-foreground font-semibold text-lg">Pay with Crypto</span>
          </div>
          <p className="text-primary-foreground text-sm opacity-90">
            Settle your utility bills using your crypto balance
          </p>
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {billTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.value}
                className={`p-4 cursor-pointer text-center transition-all ${
                  billType === type.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:bg-card/80"
                }`}
                onClick={() => setBillType(type.value)}
              >
                <Icon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs font-medium">{type.label}</p>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Bill Payment</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="billType" className="text-foreground">Bill Type</Label>
              <Select value={billType} onValueChange={setBillType}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select bill type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountNumber" className="text-foreground">Account Number</Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-foreground">Amount (USD)</Label>
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
              onClick={handlePayment}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Pay Bill
            </Button>
          </div>
        </Card>

        <Card className="p-4 mt-6 bg-card border-border">
          <h3 className="font-semibold mb-2 text-foreground">Payment Benefits</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Instant bill payment processing</li>
            <li>• Pay with any supported cryptocurrency</li>
            <li>• Transaction history and receipts</li>
            <li>• Set up automatic recurring payments</li>
          </ul>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
