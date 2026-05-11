import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine, Copy, Check, Clock, Building2, User, CreditCard, DollarSign, Smartphone, ChevronDown, Globe } from "lucide-react";

import { toast } from "sonner";

type BuyStep = "amount" | "paymentMethod" | "payment" | "processing" | "complete";
type SellStep = "amount" | "paymentMethod" | "paymentDetails" | "confirm" | "processing" | "complete";
type PaymentMethod = "bank" | "mobile_money" | "card";

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  paymentMethods: {
    bank: boolean;
    mobileMoneyProviders: string[];
    card: boolean;
  };
}

const COUNTRIES: Country[] = [
  {
    code: "NG",
    name: "Nigeria",
    currency: "NGN",
    currencySymbol: "₦",
    exchangeRate: 1580,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["OPay", "Palmpay", "Moniepoint", "Kuda"],
      card: true,
    },
  },
  {
    code: "GH",
    name: "Ghana",
    currency: "GHS",
    currencySymbol: "GH₵",
    exchangeRate: 15.5,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"],
      card: true,
    },
  },
  {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    currencySymbol: "KSh",
    exchangeRate: 153,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["M-Pesa", "Airtel Money", "T-Kash"],
      card: true,
    },
  },
  {
    code: "ZA",
    name: "South Africa",
    currency: "ZAR",
    currencySymbol: "R",
    exchangeRate: 18.5,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["FNB eWallet", "Vodapay", "MTN MoMo"],
      card: true,
    },
  },
  {
    code: "TZ",
    name: "Tanzania",
    currency: "TZS",
    currencySymbol: "TSh",
    exchangeRate: 2650,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["M-Pesa", "Tigo Pesa", "Airtel Money", "HaloPesa"],
      card: false,
    },
  },
  {
    code: "UG",
    name: "Uganda",
    currency: "UGX",
    currencySymbol: "USh",
    exchangeRate: 3750,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["MTN MoMo", "Airtel Money"],
      card: false,
    },
  },
  {
    code: "RW",
    name: "Rwanda",
    currency: "RWF",
    currencySymbol: "FRw",
    exchangeRate: 1300,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["MTN MoMo", "Airtel Money"],
      card: false,
    },
  },
  {
    code: "SN",
    name: "Senegal",
    currency: "XOF",
    currencySymbol: "CFA",
    exchangeRate: 610,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["Orange Money", "Wave", "Free Money"],
      card: true,
    },
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    currency: "XOF",
    currencySymbol: "CFA",
    exchangeRate: 610,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["Orange Money", "MTN MoMo", "Wave", "Moov Money"],
      card: true,
    },
  },
  {
    code: "CM",
    name: "Cameroon",
    currency: "XAF",
    currencySymbol: "FCFA",
    exchangeRate: 610,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["MTN MoMo", "Orange Money"],
      card: false,
    },
  },
  {
    code: "EG",
    name: "Egypt",
    currency: "EGP",
    currencySymbol: "E£",
    exchangeRate: 49,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["Vodafone Cash", "Orange Cash", "Etisalat Cash", "Fawry"],
      card: true,
    },
  },
  {
    code: "MA",
    name: "Morocco",
    currency: "MAD",
    currencySymbol: "DH",
    exchangeRate: 10.2,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["M-Wallet", "Orange Money"],
      card: true,
    },
  },
  {
    code: "ZM",
    name: "Zambia",
    currency: "ZMW",
    currencySymbol: "ZK",
    exchangeRate: 27,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["MTN MoMo", "Airtel Money", "Zamtel Kwacha"],
      card: false,
    },
  },
  {
    code: "BW",
    name: "Botswana",
    currency: "BWP",
    currencySymbol: "P",
    exchangeRate: 13.5,
    paymentMethods: {
      bank: true,
      mobileMoneyProviders: ["Orange Money", "Smega"],
      card: true,
    },
  },
];

const Fiat = () => {
  // Country selection
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

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

  const fiatAmount = parseFloat(usdcAmount || "0") * selectedCountry.exchangeRate;
  // Sell: user enters local currency amount they want to withdraw; we compute USDC to deduct
  const sellFiatAmount = parseFloat(sellAmount || "0");
  const sellUsdcAmount = sellFiatAmount / selectedCountry.exchangeRate;

  // Bank details for payment (for buying)
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
    if (parseFloat(usdcAmount) < 0.5) {
      toast.error("Minimum amount is $0.50");
      return;
    }
    setBuyStep("paymentMethod");
  };

  const handleBuyPaymentMethodProceed = () => {
    setBuyStep("payment");
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === "mobile_money" && !mobileMoneyNumber) {
      toast.error("Please enter your mobile money number");
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      toast.error("Please fill in all card details");
      return;
    }
    setBuyStep("processing");
    setTimeout(() => {
      setBuyStep("complete");
    }, 3000);
  };

  const handleSellAmountProceed = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (sellUsdcAmount < 0.5) {
      toast.error(`Minimum withdrawal is $0.50 (≈ ${selectedCountry.currencySymbol}${(0.5 * selectedCountry.exchangeRate).toLocaleString()})`);
      return;
    }
    setSellStep("paymentMethod");
  };

  const handleSellPaymentMethodProceed = () => {
    setSellStep("paymentDetails");
  };

  const handleSellDetailsProceed = () => {
    if (paymentMethod === "bank" && (!bankName || !accountNumber || !accountName)) {
      toast.error("Please fill in all bank details");
      return;
    }
    if (paymentMethod === "mobile_money" && (!mobileMoneyProvider || !mobileMoneyNumber)) {
      toast.error("Please fill in mobile money details");
      return;
    }
    setSellStep("confirm");
  };

  const handleConfirmSell = () => {
    setSellStep("processing");
    setTimeout(() => {
      setSellStep("complete");
    }, 3000);
  };

  const resetBuy = () => {
    setBuyStep("amount");
    setUsdcAmount("");
    setPaymentMethod("bank");
    setMobileMoneyNumber("");
    setMobileMoneyProvider("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
  };

  const resetSell = () => {
    setSellStep("amount");
    setSellAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setPaymentMethod("bank");
    setMobileMoneyNumber("");
    setMobileMoneyProvider("");
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "bank":
        return <Building2 className="w-5 h-5" />;
      case "mobile_money":
        return <Smartphone className="w-5 h-5" />;
      case "card":
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case "bank":
        return "Bank Transfer";
      case "mobile_money":
        return "Mobile Money";
      case "card":
        return "Card Payment";
    }
  };

  // Country Selector Component
  const CountrySelector = () => (
    <div className="relative mb-4">
      <button
        onClick={() => setShowCountrySelector(!showCountrySelector)}
        className="w-full p-3 bg-secondary rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <div className="text-left">
            <div className="font-medium">{selectedCountry.name}</div>
            <div className="text-xs text-muted-foreground">{selectedCountry.currency} ({selectedCountry.currencySymbol})</div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
      </button>
      
      {showCountrySelector && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                setSelectedCountry(country);
                setShowCountrySelector(false);
                setPaymentMethod("bank");
                setMobileMoneyProvider("");
              }}
              className={`w-full p-3 text-left hover:bg-muted transition-colors flex items-center gap-3 ${
                selectedCountry.code === country.code ? 'bg-muted' : ''
              }`}
            >
              <div>
                <div className="font-medium">{country.name}</div>
                <div className="text-xs text-muted-foreground">{country.currency} ({country.currencySymbol})</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Payment Method Selector Component
  const PaymentMethodSelector = ({ mode }: { mode: "buy" | "sell" }) => (
    <div className="space-y-3">
      <Label className="text-sm text-muted-foreground">Select Payment Method</Label>
      <div className="space-y-2">
        {/* Bank Transfer */}
        {selectedCountry.paymentMethods.bank && (
          <button
            onClick={() => setPaymentMethod("bank")}
            className={`w-full p-4 rounded-xl text-left transition-colors border flex items-center gap-4 ${
              paymentMethod === "bank"
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary hover:bg-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === "bank" ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium">Bank Transfer</div>
              <div className="text-xs text-muted-foreground">Transfer from your bank account</div>
            </div>
          </button>
        )}

        {/* Mobile Money */}
        {selectedCountry.paymentMethods.mobileMoneyProviders.length > 0 && (
          <button
            onClick={() => setPaymentMethod("mobile_money")}
            className={`w-full p-4 rounded-xl text-left transition-colors border flex items-center gap-4 ${
              paymentMethod === "mobile_money"
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary hover:bg-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === "mobile_money" ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium">Mobile Money</div>
              <div className="text-xs text-muted-foreground">
                {selectedCountry.paymentMethods.mobileMoneyProviders.slice(0, 2).join(", ")}
                {selectedCountry.paymentMethods.mobileMoneyProviders.length > 2 && " & more"}
              </div>
            </div>
          </button>
        )}

        {/* Card Payment */}
        {selectedCountry.paymentMethods.card && (
          <button
            onClick={() => setPaymentMethod("card")}
            className={`w-full p-4 rounded-xl text-left transition-colors border flex items-center gap-4 ${
              paymentMethod === "card"
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary hover:bg-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === "card" ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium">Card Payment</div>
              <div className="text-xs text-muted-foreground">Pay with Visa, Mastercard, Verve</div>
            </div>
          </button>
        )}
      </div>

      {/* Mobile Money Provider Selection */}
      {paymentMethod === "mobile_money" && (
        <div className="mt-4 space-y-2">
          <Label>Select Provider</Label>
          <Select value={mobileMoneyProvider} onValueChange={setMobileMoneyProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Choose mobile money provider" />
            </SelectTrigger>
            <SelectContent>
              {selectedCountry.paymentMethods.mobileMoneyProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

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
            <CountrySelector />
            
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
                            {selectedCountry.currencySymbol}{fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                            {selectedCountry.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/20 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Exchange Rate</span>
                        <span>1 USDC = {selectedCountry.currencySymbol}{selectedCountry.exchangeRate.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Service Fee (2%)</span>
                        <span>{selectedCountry.currencySymbol}{(fiatAmount * 0.02).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <Button onClick={handleBuyProceed} className="w-full h-14 text-lg font-semibold">
                      Continue
                    </Button>
                  </>
                )}

                {buyStep === "paymentMethod" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Buying</p>
                      <p className="text-3xl font-bold text-primary">{usdcAmount} USDC</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ≈ {selectedCountry.currencySymbol}{fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <PaymentMethodSelector mode="buy" />

                    <Button 
                      onClick={handleBuyPaymentMethodProceed} 
                      className="w-full h-14 text-lg font-semibold"
                      disabled={paymentMethod === "mobile_money" && !mobileMoneyProvider}
                    >
                      Continue with {getPaymentMethodName(paymentMethod)}
                    </Button>

                    <Button variant="ghost" onClick={() => setBuyStep("amount")} className="w-full">
                      Back
                    </Button>
                  </>
                )}

                {buyStep === "payment" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Pay exactly</p>
                      <p className="text-3xl font-bold text-primary">
                        {selectedCountry.currencySymbol}{fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">for {usdcAmount} USDC</p>
                    </div>

                    {/* Bank Transfer Payment Details */}
                    {paymentMethod === "bank" && (
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
                    )}

                    {/* Mobile Money Payment Details */}
                    {paymentMethod === "mobile_money" && (
                      <div className="space-y-4">
                        <div className="bg-secondary/30 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Smartphone className="w-5 h-5 text-primary" />
                            <span className="font-medium">{mobileMoneyProvider}</span>
                          </div>
                          <div className="space-y-2">
                            <Label>Your {mobileMoneyProvider} Number</Label>
                            <Input
                              placeholder="Enter phone number"
                              value={mobileMoneyNumber}
                              onChange={(e) => setMobileMoneyNumber(e.target.value.replace(/\D/g, ""))}
                              maxLength={15}
                            />
                            <p className="text-xs text-muted-foreground">
                              You'll receive a payment prompt on this number
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Payment Details */}
                    {paymentMethod === "card" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Card Number</Label>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            maxLength={19}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              maxLength={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CVV</Label>
                            <Input
                              placeholder="123"
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              maxLength={4}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Cardholder Name</Label>
                          <Input
                            placeholder="Name on card"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                      <p className="text-sm text-amber-600 text-center">
                        ⏱️ Complete payment within 30 minutes
                      </p>
                    </div>

                    <Button onClick={handleConfirmPayment} className="w-full h-14 text-lg font-semibold">
                      {paymentMethod === "bank" ? "I've Made the Payment" : "Pay Now"}
                    </Button>

                    <Button variant="ghost" onClick={() => setBuyStep("paymentMethod")} className="w-full">
                      Back
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
                        <Label className="text-muted-foreground">You want to withdraw to bank</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                          />
                          <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl">
                            <span className="text-base font-bold">{selectedCountry.currencySymbol}</span>
                            <span className="font-semibold">{selectedCountry.currency}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/50 pt-4 space-y-2">
                        <Label className="text-muted-foreground">USDC to deduct from wallet</Label>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-semibold">
                            {sellUsdcAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          </span>
                          <div className="flex items-center gap-2 bg-secondary px-2 py-1 rounded-xl">
                            <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">◈</span>
                            <span className="text-sm font-semibold">USDC</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Balance: 5,234.56 USDC</p>
                      </div>
                    </div>

                    <div className="bg-secondary/20 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Exchange Rate</span>
                        <span>1 USDC = {selectedCountry.currencySymbol}{selectedCountry.exchangeRate.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Service Fee (2%)</span>
                        <span>{selectedCountry.currencySymbol}{(sellFiatAmount * 0.02).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
                        <span className="text-muted-foreground">You'll receive in bank</span>
                        <span className="font-semibold">
                          {selectedCountry.currencySymbol}{(sellFiatAmount * 0.98).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <Button onClick={handleSellAmountProceed} className="w-full h-14 text-lg font-semibold">
                      Proceed
                    </Button>
                  </>
                )}

                {sellStep === "paymentMethod" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Withdrawing to bank</p>
                      <p className="text-3xl font-bold text-primary">
                        {selectedCountry.currencySymbol}{sellFiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ≈ {sellUsdcAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} USDC deducted
                      </p>
                    </div>

                    <PaymentMethodSelector mode="sell" />

                    <Button 
                      onClick={handleSellPaymentMethodProceed} 
                      className="w-full h-14 text-lg font-semibold"
                      disabled={paymentMethod === "mobile_money" && !mobileMoneyProvider}
                    >
                      Continue
                    </Button>

                    <Button variant="ghost" onClick={() => setSellStep("amount")} className="w-full">
                      Back
                    </Button>
                  </>
                )}

                {sellStep === "paymentDetails" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Receiving</p>
                      <p className="text-3xl font-bold text-primary">
                        {selectedCountry.currencySymbol}{sellFiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {getPaymentMethodIcon(paymentMethod)}
                        <span className="text-sm text-muted-foreground">{getPaymentMethodName(paymentMethod)}</span>
                      </div>
                    </div>

                    {/* Bank Details Form */}
                    {paymentMethod === "bank" && (
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
                            placeholder="Enter account number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 15))}
                            maxLength={15}
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
                    )}

                    {/* Mobile Money Details Form */}
                    {paymentMethod === "mobile_money" && (
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          {mobileMoneyProvider} Details
                        </h3>

                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            placeholder="Enter phone number"
                            value={mobileMoneyNumber}
                            onChange={(e) => setMobileMoneyNumber(e.target.value.replace(/\D/g, ""))}
                            maxLength={15}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Account Name</Label>
                          <Input
                            placeholder="Name registered on mobile money"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Card - not typically used for receiving, show message */}
                    {paymentMethod === "card" && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                        <p className="text-sm text-amber-600">
                          Card withdrawals are processed as refunds to your original payment card.
                          Please use Bank Transfer or Mobile Money for faster withdrawals.
                        </p>
                      </div>
                    )}

                    <Button onClick={handleSellDetailsProceed} className="w-full h-14 text-lg font-semibold">
                      Continue
                    </Button>

                    <Button variant="ghost" onClick={() => setSellStep("paymentMethod")} className="w-full">
                      Back
                    </Button>
                  </>
                )}

                {sellStep === "confirm" && (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Withdraw to your bank</p>
                      <p className="text-3xl font-bold text-primary">
                        {selectedCountry.currencySymbol}{sellFiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sellUsdcAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} USDC will be deducted
                      </p>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
                      <h4 className="font-semibold text-center">Payout Details</h4>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Method</span>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(paymentMethod)}
                          <span className="font-medium">{getPaymentMethodName(paymentMethod)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="font-semibold">
                          {selectedCountry.currencySymbol}{sellFiatAmount.toLocaleString()}
                        </span>
                      </div>

                      {paymentMethod === "bank" && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Bank</span>
                            <span className="font-medium">{bankName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Account</span>
                            <span className="font-mono">{accountNumber}</span>
                          </div>
                        </>
                      )}

                      {paymentMethod === "mobile_money" && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Provider</span>
                            <span className="font-medium">{mobileMoneyProvider}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Phone</span>
                            <span className="font-mono">{mobileMoneyNumber}</span>
                          </div>
                        </>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="font-medium">{accountName}</span>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                      <p className="text-sm text-amber-600 text-center">
                        Please verify your details are correct
                      </p>
                    </div>

                    <Button onClick={handleConfirmSell} className="w-full h-14 text-lg font-semibold">
                      Confirm Withdrawal
                    </Button>

                    <Button variant="ghost" onClick={() => setSellStep("paymentDetails")} className="w-full">
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
                      Your funds will be sent within {paymentMethod === "mobile_money" ? "a few minutes" : "24 hours"}.
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
                      {selectedCountry.currencySymbol}{sellFiatAmount.toLocaleString()} will be sent via {getPaymentMethodName(paymentMethod)}
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
            { type: "buy", amount: "500 USDC", fiat: `${selectedCountry.currencySymbol}${(500 * selectedCountry.exchangeRate).toLocaleString()}`, time: "2 hours ago", status: "completed", method: "Bank Transfer" },
            { type: "sell", amount: "200 USDC", fiat: `${selectedCountry.currencySymbol}${(200 * selectedCountry.exchangeRate).toLocaleString()}`, time: "Yesterday", status: "completed", method: "Mobile Money" },
            { type: "buy", amount: "1,000 USDC", fiat: `${selectedCountry.currencySymbol}${(1000 * selectedCountry.exchangeRate).toLocaleString()}`, time: "3 days ago", status: "completed", method: "Card" },
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
                      <p className="text-xs text-muted-foreground">{tx.method} • {tx.time}</p>
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
