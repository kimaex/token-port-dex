import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

export default function Swap() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const cryptoOptions = [
    { symbol: "BTC", name: "Bitcoin", balance: "0.5432" },
    { symbol: "ETH", name: "Ethereum", balance: "3.2145" },
    { symbol: "USDT", name: "Tether", balance: "1,234.56" },
    { symbol: "SOL", name: "Solana", balance: "45.67" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Swap Crypto
        </h1>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Exchange Tokens</CardTitle>
            <CardDescription>Swap your crypto assets instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1"
                />
                <select className="w-28 px-3 py-2 rounded-lg bg-secondary text-foreground border border-border">
                  {cryptoOptions.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: {cryptoOptions[0].balance} {cryptoOptions[0].symbol}
              </p>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
              >
                <ArrowDownUp className="h-5 w-5" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="flex-1"
                />
                <select className="w-28 px-3 py-2 rounded-lg bg-secondary text-foreground border border-border">
                  {cryptoOptions.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: {cryptoOptions[1].balance} {cryptoOptions[1].symbol}
              </p>
            </div>

            {/* Exchange Rate */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-medium">1 BTC = 15.8 ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-medium">~$2.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-medium">~30 seconds</span>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Swap Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Recent Swaps */}
        <div className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">Recent Swaps</h2>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">0.1 BTC → 1.58 ETH</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-500">Completed</p>
                    <p className="text-xs text-muted-foreground">Fee: $2.50</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
