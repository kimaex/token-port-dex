import { useState } from "react";
import { TrendingUp, TrendingDown, Send, Download, ArrowLeftRight, ChevronLeft, MoreVertical, Copy, Check, QrCode, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Network {
  id: string;
  name: string;
  symbol: string;
  address: string;
  fee: string;
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
  change: number;
  icon: string;
  price: string;
  networks?: Network[];
}

const generateWalletAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

const assets: Asset[] = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.5432",
    value: "$23,456.78",
    change: 5.2,
    icon: "₿",
    price: "$43,215.67",
    networks: [
      { id: "btc-main", name: "Bitcoin", symbol: "BTC", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", fee: "0.0001 BTC" },
      { id: "btc-bep20", name: "BNB Smart Chain (BEP20)", symbol: "BTC", address: generateWalletAddress(), fee: "0.000005 BNB" },
    ]
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    balance: "3.2145",
    value: "$8,234.50",
    change: 3.8,
    icon: "Ξ",
    price: "$2,561.23",
    networks: [
      { id: "eth-main", name: "Ethereum (ERC20)", symbol: "ETH", address: generateWalletAddress(), fee: "0.001 ETH" },
      { id: "eth-bep20", name: "BNB Smart Chain (BEP20)", symbol: "ETH", address: generateWalletAddress(), fee: "0.000005 BNB" },
      { id: "eth-arb", name: "Arbitrum One", symbol: "ETH", address: generateWalletAddress(), fee: "0.0001 ETH" },
    ]
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    balance: "125.50",
    value: "$5,678.90",
    change: -2.1,
    icon: "◎",
    price: "$45.25",
    networks: [
      { id: "sol-main", name: "Solana", symbol: "SOL", address: "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2", fee: "0.000005 SOL" },
    ]
  },
  {
    id: "4",
    name: "Cardano",
    symbol: "ADA",
    balance: "2450.00",
    value: "$1,890.00",
    change: 1.5,
    icon: "₳",
    price: "$0.77",
    networks: [
      { id: "ada-main", name: "Cardano", symbol: "ADA", address: "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", fee: "0.17 ADA" },
    ]
  },
  {
    id: "5",
    name: "USD Coin",
    symbol: "USDC",
    balance: "5,234.56",
    value: "$5,234.56",
    change: 0.01,
    icon: "◈",
    price: "$1.00",
    networks: [
      { id: "usdc-eth", name: "Ethereum (ERC20)", symbol: "USDC", address: generateWalletAddress(), fee: "5 USDC" },
      { id: "usdc-bep20", name: "BNB Smart Chain (BEP20)", symbol: "USDC", address: generateWalletAddress(), fee: "0.1 USDC" },
      { id: "usdc-sol", name: "Solana (SPL)", symbol: "USDC", address: "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2", fee: "0.01 USDC" },
      { id: "usdc-polygon", name: "Polygon", symbol: "USDC", address: generateWalletAddress(), fee: "0.01 USDC" },
      { id: "usdc-arb", name: "Arbitrum One", symbol: "USDC", address: generateWalletAddress(), fee: "0.1 USDC" },
      { id: "usdc-avax", name: "Avalanche C-Chain", symbol: "USDC", address: generateWalletAddress(), fee: "0.1 USDC" },
      { id: "usdc-tron", name: "Tron (TRC20)", symbol: "USDC", address: "TKFLmRxv1xqxs5xsqvs5xsqvs5xsqvs5xs", fee: "1 USDC" },
      { id: "usdc-base", name: "Base", symbol: "USDC", address: generateWalletAddress(), fee: "0.01 USDC" },
    ]
  },
];

// Generate mock chart data
const generateChartData = (isPositive: boolean) => {
  const data = [];
  let value = 100;
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - (isPositive ? 0.4 : 0.6)) * 10;
    value = Math.max(50, Math.min(150, value + change));
    data.push({ day: i, value });
  }
  return data;
};

export const AssetList = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState("1D");
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [showReceiveNetworkSelector, setShowReceiveNetworkSelector] = useState(false);
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);

  const timeframes = ["1H", "1D", "1W", "1M", "1Y", "ALL"];

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const handleSend = () => {
    if (!sendAddress || !sendAmount) {
      toast.error("Please enter address and amount");
      return;
    }
    toast.success(`Sending ${sendAmount} ${selectedAsset?.symbol} to ${sendAddress.slice(0, 10)}...`);
    setShowSendModal(false);
    setSendAddress("");
    setSendAmount("");
    setSelectedNetwork(null);
  };

  const handleOpenSend = () => {
    if (selectedAsset?.networks && selectedAsset.networks.length > 0) {
      setSelectedNetwork(selectedAsset.networks[0]);
    }
    setShowSendModal(true);
  };

  const handleOpenReceive = () => {
    if (selectedAsset?.networks && selectedAsset.networks.length > 0) {
      setSelectedNetwork(selectedAsset.networks[0]);
    }
    setShowReceiveModal(true);
  };

  if (selectedAsset) {
    const chartData = generateChartData(selectedAsset.change >= 0);
    const chartColor = selectedAsset.change >= 0 ? "#22c55e" : "#ef4444";

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedAsset(null)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
              {selectedAsset.icon}
            </div>
            <span className="font-semibold">{selectedAsset.name}</span>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Price Section */}
        <div className="p-6 text-center">
          <p className="text-4xl font-bold">{selectedAsset.price}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-lg font-medium ${selectedAsset.change >= 0 ? "text-success" : "text-destructive"}`}>
              {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change}%
            </span>
            {selectedAsset.change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 px-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={2}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Timeframe Selector */}
          <div className="flex justify-between mt-4 bg-muted/50 rounded-xl p-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTimeframe === tf 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Balance Section */}
        <div className="p-4 mx-4 bg-card rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Your Balance</span>
            <span className="font-bold text-lg">{selectedAsset.value}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{selectedAsset.symbol}</span>
            <span className="font-medium">{selectedAsset.balance}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <Button 
            className="flex-col h-auto py-4 gap-2"
            variant="outline"
            onClick={handleOpenSend}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm">Send</span>
          </Button>

          <Button 
            className="flex-col h-auto py-4 gap-2"
            variant="outline"
            onClick={handleOpenReceive}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm">Receive</span>
          </Button>

          <Button 
            className="flex-col h-auto py-4 gap-2"
            variant="outline"
            onClick={() => {
              console.log("Swap", selectedAsset.name);
              setSelectedAsset(null);
            }}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm">Swap</span>
          </Button>
        </div>

        {/* Send Modal */}
        <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                  {selectedAsset.icon}
                </div>
                Send {selectedAsset.symbol}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Network Selector */}
              {selectedAsset.networks && selectedAsset.networks.length > 1 && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Network</label>
                  <button
                    onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                    className="w-full p-3 bg-secondary rounded-xl flex items-center justify-between"
                  >
                    <span>{selectedNetwork?.name || "Select Network"}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showNetworkSelector ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showNetworkSelector && (
                    <div className="mt-2 bg-secondary rounded-xl overflow-hidden border border-border">
                      {selectedAsset.networks.map((network) => (
                        <button
                          key={network.id}
                          onClick={() => {
                            setSelectedNetwork(network);
                            setShowNetworkSelector(false);
                          }}
                          className={`w-full p-3 text-left hover:bg-muted transition-colors ${
                            selectedNetwork?.id === network.id ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="font-medium">{network.name}</div>
                          <div className="text-xs text-muted-foreground">Fee: {network.fee}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recipient Address */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Recipient Address</label>
                <Input
                  placeholder={`Enter ${selectedAsset.symbol} address`}
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                  className="bg-secondary"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="bg-secondary pr-20"
                  />
                  <button 
                    onClick={() => setSendAmount(selectedAsset.balance.replace(/,/g, ''))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {selectedAsset.balance} {selectedAsset.symbol}
                </p>
              </div>

              {/* Network Fee */}
              {selectedNetwork && (
                <div className="p-3 bg-muted rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span>{selectedNetwork.fee}</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-gradient-primary"
                onClick={handleSend}
                disabled={!sendAddress || !sendAmount}
              >
                Send {selectedAsset.symbol}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Receive Modal */}
        <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                  {selectedAsset.icon}
                </div>
                Receive {selectedAsset.symbol}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Network Selector */}
              {selectedAsset.networks && selectedAsset.networks.length > 1 && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Network</label>
                  <button
                    onClick={() => setShowReceiveNetworkSelector(!showReceiveNetworkSelector)}
                    className="w-full p-3 bg-secondary rounded-xl flex items-center justify-between"
                  >
                    <div className="text-left">
                      <div>{selectedNetwork?.name || "Select Network"}</div>
                      {selectedNetwork && (
                        <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                          {selectedNetwork.address.slice(0, 10)}...{selectedNetwork.address.slice(-8)}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showReceiveNetworkSelector ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showReceiveNetworkSelector && (
                    <div className="mt-2 bg-secondary rounded-xl overflow-hidden border border-border max-h-60 overflow-y-auto">
                      {selectedAsset.networks.map((network) => (
                        <button
                          key={network.id}
                          onClick={() => {
                            setSelectedNetwork(network);
                            setShowReceiveNetworkSelector(false);
                          }}
                          className={`w-full p-3 text-left hover:bg-muted transition-colors ${
                            selectedNetwork?.id === network.id ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="font-medium">{network.name}</div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {network.address.slice(0, 10)}...{network.address.slice(-8)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedNetwork && (
                <>
                  {/* QR Code Placeholder */}
                  <div className="flex flex-col items-center p-6 bg-white rounded-2xl">
                    <div className="h-48 w-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {selectedNetwork.name} Address
                    </label>
                    <div className="p-3 bg-secondary rounded-xl">
                      <p className="text-xs font-mono break-all mb-2">{selectedNetwork.address}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleCopyAddress(selectedNetwork.address)}
                      >
                        {copiedAddress ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Address
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Only send {selectedAsset.symbol} on the {selectedNetwork.name} network. Sending other assets may result in permanent loss.
                    </p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="px-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Assets</h3>
      </div>

      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="bg-card border border-border rounded-2xl p-4 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold shadow-glow">
                  {asset.icon}
                </div>
                <div>
                  <p className="font-semibold">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">{asset.value}</p>
                <div className="flex items-center gap-1 text-sm">
                  <p className={asset.change >= 0 ? "text-success" : "text-destructive"}>
                    {asset.change >= 0 ? "+" : ""}
                    {asset.change}%
                  </p>
                  {asset.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
