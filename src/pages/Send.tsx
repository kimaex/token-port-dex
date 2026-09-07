import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Network {
  id: string;
  name: string;
  fee: string;
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
  icon: string;
  price: string;
  networks: Network[];
}

const assets: Asset[] = [
  {
    id: "1", name: "Bitcoin", symbol: "BTC", balance: "0.5432", value: "₦37,061,712.40", icon: "₿", price: "₦68,280,758.60",
    networks: [
      { id: "btc-main", name: "Bitcoin", fee: "0.0001 BTC" },
      { id: "btc-bep20", name: "BNB Smart Chain (BEP20)", fee: "0.000005 BNB" },
    ],
  },
  {
    id: "2", name: "Ethereum", symbol: "ETH", balance: "3.2145", value: "₦13,010,510.00", icon: "Ξ", price: "₦4,046,743.40",
    networks: [
      { id: "eth-main", name: "Ethereum (ERC20)", fee: "0.001 ETH" },
      { id: "eth-bep20", name: "BNB Smart Chain (BEP20)", fee: "0.000005 BNB" },
      { id: "eth-arb", name: "Arbitrum One", fee: "0.0001 ETH" },
    ],
  },
  {
    id: "3", name: "Solana", symbol: "SOL", balance: "125.50", value: "₦8,972,662.00", icon: "◎", price: "₦71,495.00",
    networks: [{ id: "sol-main", name: "Solana", fee: "0.000005 SOL" }],
  },
  {
    id: "5", name: "USD Coin", symbol: "USDC", balance: "5,234.56", value: "₦8,270,604.80", icon: "◈", price: "₦1,580.00",
    networks: [
      { id: "usdc-eth", name: "Ethereum (ERC20)", fee: "₦7900.00" },
      { id: "usdc-bep20", name: "BNB Smart Chain (BEP20)", fee: "₦158.00" },
      { id: "usdc-sol", name: "Solana (SPL)", fee: "₦15.80" },
      { id: "usdc-polygon", name: "Polygon", fee: "₦15.80" },
      { id: "usdc-arb", name: "Arbitrum One", fee: "₦158.00" },
      { id: "usdc-avax", name: "Avalanche C-Chain", fee: "₦158.00" },
      { id: "usdc-tron", name: "Tron (TRC20)", fee: "₦1580.00" },
      { id: "usdc-base", name: "Base", fee: "₦15.80" },
    ],
  },
];

const Send = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(assets[0].networks[0]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!address || !amount) {
      toast.error("Please enter address and amount");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount");
      return;
    }
    toast.success(`Sending ${amount} ${selectedAsset.symbol} to ${address.slice(0, 10)}...`);
    setAddress("");
    setAmount("");
  };

  const handleMax = () => setAmount(selectedAsset.balance.replace(/,/g, ""));

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Send Crypto</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Asset selector */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Asset</Label>
          <button
            onClick={() => setShowAssetPicker(true)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-card/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold">
                {selectedAsset.icon}
              </div>
              <div className="text-left">
                <div className="font-semibold">{selectedAsset.name}</div>
                <div className="text-xs text-muted-foreground">
                  Balance: {selectedAsset.balance} {selectedAsset.symbol}
                </div>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Network selector */}
        {selectedAsset.networks.length > 1 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Network</Label>
            <button
              onClick={() => setShowNetworkPicker(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-card/80 transition"
            >
              <div className="text-left">
                <div className="text-sm font-medium">{selectedNetwork.name}</div>
                <div className="text-xs text-muted-foreground">Fee: {selectedNetwork.fee}</div>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Recipient */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Recipient Address</Label>
          <Input
            placeholder={`Enter ${selectedAsset.symbol} address`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Amount</Label>
            <button onClick={handleMax} className="text-xs font-semibold text-primary hover:underline">
              MAX
            </button>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 text-2xl pr-20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
              {selectedAsset.symbol}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Min: ₦500 • 2% service fee applies</p>
        </div>

        <Button onClick={handleSend} className="w-full h-12 text-base font-semibold bg-gradient-primary shadow-glow">
          Send {selectedAsset.symbol}
        </Button>
      </div>

      {/* Asset picker dialog */}
      <Dialog open={showAssetPicker} onOpenChange={setShowAssetPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Asset</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crypto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filteredAssets.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedAsset(a);
                  setSelectedNetwork(a.networks[0]);
                  setShowAssetPicker(false);
                  setSearch("");
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-card/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold">
                    {a.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{a.balance}</div>
                  <div className="text-xs text-muted-foreground">{a.value}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Network picker dialog */}
      <Dialog open={showNetworkPicker} onOpenChange={setShowNetworkPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Network</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {selectedAsset.networks.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setSelectedNetwork(n);
                  setShowNetworkPicker(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-card/80 transition ${
                  selectedNetwork.id === n.id ? "bg-card border border-primary/40" : ""
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{n.name}</div>
                  <div className="text-xs text-muted-foreground">Fee: {n.fee}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Send;
