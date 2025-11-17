import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine, CreditCard } from "lucide-react";
import { toast } from "sonner";

const Fiat = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  
  // Deposit fields
  const [depositAccountNumber, setDepositAccountNumber] = useState("");
  const [depositFullName, setDepositFullName] = useState("");
  
  // Withdrawal fields
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawPersonName, setWithdrawPersonName] = useState("");

  const handleDeposit = () => {
    if (!amount || !depositAccountNumber || !depositFullName) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Deposit of ${currency} ${amount} initiated`);
    setAmount("");
    setDepositAccountNumber("");
    setDepositFullName("");
  };

  const handleWithdraw = () => {
    if (!amount || !withdrawBankName || !withdrawAccountNumber || !withdrawPersonName) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Withdrawal of ${currency} ${amount} initiated`);
    setAmount("");
    setWithdrawBankName("");
    setWithdrawAccountNumber("");
    setWithdrawPersonName("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Deposit & Withdrawal</h1>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Fiat Transactions</CardTitle>
            <CardDescription>Deposit funds or withdraw to your bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deposit">
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="withdraw">
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  Withdraw
                </TabsTrigger>
              </TabsList>
              <TabsContent value="deposit" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Cryptocurrency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT - Tether</SelectItem>
                      <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                      <SelectItem value="CNGN">CNGN - Nigerian Naira Stablecoin</SelectItem>
                      <SelectItem value="BUSD">BUSD - Binance USD</SelectItem>
                      <SelectItem value="DAI">DAI - Dai Stablecoin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    type="text"
                    placeholder="Enter account number"
                    value={depositAccountNumber}
                    onChange={(e) => setDepositAccountNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={depositFullName}
                    onChange={(e) => setDepositFullName(e.target.value)}
                  />
                </div>
                <Button onClick={handleDeposit} className="w-full" size="lg">
                  Deposit {amount && `${currency} ${amount}`}
                </Button>
              </TabsContent>
              <TabsContent value="withdraw" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Cryptocurrency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT - Tether</SelectItem>
                      <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                      <SelectItem value="CNGN">CNGN - Nigerian Naira Stablecoin</SelectItem>
                      <SelectItem value="BUSD">BUSD - Binance USD</SelectItem>
                      <SelectItem value="DAI">DAI - Dai Stablecoin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter bank name"
                    value={withdrawBankName}
                    onChange={(e) => setWithdrawBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    type="text"
                    placeholder="Enter account number"
                    value={withdrawAccountNumber}
                    onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter account holder name"
                    value={withdrawPersonName}
                    onChange={(e) => setWithdrawPersonName(e.target.value)}
                  />
                </div>
                <Button onClick={handleWithdraw} className="w-full" size="lg">
                  Withdraw {amount && `${currency} ${amount}`}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Fiat;
