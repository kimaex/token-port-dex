import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine, Copy, Check, Clock, Building2, User, CreditCard, DollarSign } from "lucide-react";
import { toast } from "sonner";

type BuyStep = "amount" | "payment" | "processing" | "complete";
type SellStep = "amount" | "bankDetails" | "confirm" | "processing" | "complete";

const EXCHANGE_RATE = 1580; // 1 USDC = 1580 NGN (example rate)

const Fiat = () => {
  // Buy USDC states
  const [buyStep, setBuyStep] = useState<BuyStep>("amount");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [copied, setCopied] = useState(false);

  // Sell USDC states
  const [sellStep, setSellStep] = useState<SellStep>("amount");
  const [sellAmount, setSellAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [currency, setCurrency] = useState("NGN");

  const fiatAmount = parseFloat(usdcAmount || "0") * EXCHANGE_RATE;
  const sellFiatAmount = parseFloat(sellAmount || "0") * EXCHANGE_RATE;

  // Bank details for payment
  const bankDetails = {
    bankName: "First Bank Nigeria",
    accountNumber: "3124567890",
    accountName: "Kimaex Technologies Ltd",
    reference: `KMX-${Date.now().toString(36).toUpperCase()}`,
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleBuyProceed = () => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setBuyStep("payment");
  };

  const handleConfirmPayment = () => {
    setBuyStep("processing");
    // Simulate processing
    setTimeout(() => {
      setBuyStep("complete");
    }, 3000);
  };

  const handleSellAmountProceed = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setSellStep("bankDetails");
  };

  const handleSellBankProceed = () => {
    if (!bankName || !accountNumber || !accountName) {
      toast.error("Please fill in all bank details");
      return;
    }
    setSellStep("confirm");
  };

  const handleConfirmSell = () => {
    setSellStep("processing");
    // Simulate processing
    setTimeout(() => {
      setSellStep("complete");
    }, 3000);
  };

  const resetBuy = () => {
    setBuyStep("amount");
    setUsdcAmount("");
  };

  const resetSell = () => {
    setSellStep("amount");
    setSellAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Buy & Sell USDC</h1>
            <p className="text-sm text-muted-foreground">Convert between fiat and crypto</p>
          </div>
        </div>

        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="buy" className="gap-2">
                  <ArrowDownToLine className="w-4 h-4" />
                  Buy USDC
                </TabsTrigger>
                <TabsTrigger value="sell" className="gap-2">
                  <ArrowUpFromLine className="w-4 h-4" />
                  Sell USDC
                </TabsTrigger>
              </TabsList>

              {/* BUY USDC TAB */}
              <TabsContent value="buy" className="space-y-4">
                {buyStep === "amount" && (
                  <>
                    <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">You want to buy</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={usdcAmount}
                            onChange={(e) => setUsdcAmount(e.target.value)}
                            className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                          />
                          <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl">
                            <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                              ◈
                            </span>
                            <span className="font-semibold">USDC</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/50 pt-4 space-y-2">
                        <Label className="text-muted-foreground">You will pay</Label>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-semibold">
                            {currency === "NGN" ? "₦" : "$"}{fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NGN">NGN</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/20 rounded-xl p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Exchange Rate</span>
                        <span>1 USDC = ₦{EXCHANGE_RATE.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button onClick={handleBuyProceed} className="w-full h-14 text-lg font-semibold">
                      Continue
                    </Button>
                  </>
                )}

                {buyStep === "payment" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Transfer exactly</p>
                      <p className="text-3xl font-bold text-primary">
                        ₦{fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">for {usdcAmount} USDC</p>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Bank Name</span>
                        </div>
                        <span className="font-medium">{bankDetails.bankName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Account Number</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{bankDetails.accountNumber}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCopyAccountNumber}
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Account Name</span>
                        </div>
                        <span className="font-medium">{bankDetails.accountName}</span>
                      </div>

                      <div className="border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Reference</span>
                          <span className="font-mono text-primary font-medium">{bankDetails.reference}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use this reference when making the transfer
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                      <p className="text-sm text-amber-600 text-center">
                        ⏱️ Complete payment within 30 minutes
                      </p>
                    </div>

                    <Button onClick={handleConfirmPayment} className="w-full h-14 text-lg font-semibold">
                      I've Made the Payment
                    </Button>

                    <Button variant="ghost" onClick={resetBuy} className="w-full">
                      Cancel
                    </Button>
                  </>
                )}

                {buyStep === "processing" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Processing Payment</h3>
                    <p className="text-muted-foreground">
                      We're verifying your payment. This usually takes 1-5 minutes.
                    </p>
                  </div>
                )}

                {buyStep === "complete" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Purchase Complete!</h3>
                    <p className="text-muted-foreground">
                      {usdcAmount} USDC has been added to your wallet
                    </p>
                    <Button onClick={resetBuy} className="mt-4">
                      Buy More USDC
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* SELL USDC TAB */}
              <TabsContent value="sell" className="space-y-4">
                {sellStep === "amount" && (
                  <>
                    <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Amount to sell</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                          />
                          <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl">
                            <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                              ◈
                            </span>
                            <span className="font-semibold">USDC</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Balance: 5,234.56 USDC
                        </p>
                      </div>

                      <div className="border-t border-border/50 pt-4 space-y-2">
                        <Label className="text-muted-foreground">You will receive (Local Fiat)</Label>
                        <p className="text-2xl font-semibold">
                          ₦{sellFiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="bg-secondary/20 rounded-xl p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Exchange Rate</span>
                        <span>1 USDC = ₦{EXCHANGE_RATE.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button onClick={handleSellAmountProceed} className="w-full h-14 text-lg font-semibold">
                      Proceed
                    </Button>
                  </>
                )}

                {sellStep === "bankDetails" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Selling</p>
                      <p className="text-3xl font-bold text-primary">{sellAmount} USDC</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ≈ ₦{sellFiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Enter Bank Details
                      </h3>

                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          placeholder="e.g., First Bank, GTBank, Access Bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          placeholder="Enter 10-digit account number"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          maxLength={10}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Account Holder Name</Label>
                        <Input
                          placeholder="Enter full name on account"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSellBankProceed} className="w-full h-14 text-lg font-semibold">
                      Continue
                    </Button>

                    <Button variant="ghost" onClick={() => setSellStep("amount")} className="w-full">
                      Back
                    </Button>
                  </>
                )}

                {sellStep === "confirm" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">You are selling</p>
                      <p className="text-3xl font-bold text-primary">{sellAmount} USDC</p>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
                      <h4 className="font-semibold text-center">Payout Details</h4>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="font-semibold">₦{sellFiatAmount.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Bank</span>
                        <span className="font-medium">{bankName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account</span>
                        <span className="font-mono">{accountNumber}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="font-medium">{accountName}</span>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                      <p className="text-sm text-amber-600 text-center">
                        Please verify your bank details are correct
                      </p>
                    </div>

                    <Button onClick={handleConfirmSell} className="w-full h-14 text-lg font-semibold">
                      Confirm Withdrawal
                    </Button>

                    <Button variant="ghost" onClick={() => setSellStep("bankDetails")} className="w-full">
                      Go Back
                    </Button>
                  </>
                )}

                {sellStep === "processing" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Processing Withdrawal</h3>
                    <p className="text-muted-foreground">
                      Your funds will be sent to your bank account within 24 hours.
                    </p>
                  </div>
                )}

                {sellStep === "complete" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Withdrawal Initiated!</h3>
                    <p className="text-muted-foreground">
                      ₦{sellFiatAmount.toLocaleString()} will be sent to your bank account
                    </p>
                    <Button onClick={resetSell} className="mt-4">
                      Make Another Withdrawal
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          {[
            { type: "buy", amount: "500 USDC", fiat: "₦790,000", time: "2 hours ago", status: "completed" },
            { type: "sell", amount: "200 USDC", fiat: "₦316,000", time: "Yesterday", status: "completed" },
            { type: "buy", amount: "1,000 USDC", fiat: "₦1,580,000", time: "3 days ago", status: "completed" },
          ].map((tx, i) => (
            <Card key={i} className="shadow-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "buy" ? "bg-green-500/10" : "bg-blue-500/10"
                    }`}>
                      {tx.type === "buy" ? (
                        <ArrowDownToLine className="w-5 h-5 text-green-500" />
                      ) : (
                        <ArrowUpFromLine className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{tx.type} USDC</p>
                      <p className="text-sm text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{tx.amount}</p>
                    <p className="text-sm text-muted-foreground">{tx.fiat}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fiat;