import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Search, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Network {
  id: string;
  name: string;
  address: string;
  fee: string;
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  networks: Network[];
}

const generateAddress = () => {
  const chars = "0123456789abcdef";
  let a = "0x";
  for (let i = 0; i < 40; i++) a += chars[Math.floor(Math.random() * chars.length)];
  return a;
};

const assets: Asset[] = [
  {
    id: "1", name: "Bitcoin", symbol: "BTC", icon: "₿",
    networks: [
      { id: "btc-main", name: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", fee: "0.0001 BTC" },
      { id: "btc-bep20", name: "BNB Smart Chain (BEP20)", address: generateAddress(), fee: "0.000005 BNB" },
    ],
  },
  {
    id: "2", name: "Ethereum", symbol: "ETH", icon: "Ξ",
    networks: [
      { id: "eth-main", name: "Ethereum (ERC20)", address: generateAddress(), fee: "0.001 ETH" },
      { id: "eth-bep20", name: "BNB Smart Chain (BEP20)", address: generateAddress(), fee: "0.000005 BNB" },
      { id: "eth-arb", name: "Arbitrum One", address: generateAddress(), fee: "0.0001 ETH" },
    ],
  },
  {
    id: "3", name: "Solana", symbol: "SOL", icon: "◎",
    networks: [{ id: "sol-main", name: "Solana", address: "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2", fee: "0.000005 SOL" }],
  },
  {
    id: "5", name: "USD Coin", symbol: "USDC", icon: "◈",
    networks: [
      { id: "usdc-eth", name: "Ethereum (ERC20)", address: generateAddress(), fee: "5 USDC" },
      { id: "usdc-bep20", name: "BNB Smart Chain (BEP20)", address: generateAddress(), fee: "0.1 USDC" },
      { id: "usdc-sol", name: "Solana (SPL)", address: "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2", fee: "0.01 USDC" },
      { id: "usdc-polygon", name: "Polygon", address: generateAddress(), fee: "0.01 USDC" },
      { id: "usdc-arb", name: "Arbitrum One", address: generateAddress(), fee: "0.1 USDC" },
      { id: "usdc-avax", name: "Avalanche C-Chain", address: generateAddress(), fee: "0.1 USDC" },
      { id: "usdc-tron", name: "Tron (TRC20)", address: "TKFLmRxv1xqxs5xsqvs5xsqvs5xs", fee: "1 USDC" },
      { id: "usdc-base", name: "Base", address: generateAddress(), fee: "0.01 USDC" },
    ],
  },
];

const Receive = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(assets[0].networks[0]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedNetwork.address);
      setCopied(true);
      toast.success("Address copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(selectedNetwork.address)}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Receive Crypto</h1>
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
                <div className="text-xs text-muted-foreground">{selectedAsset.symbol}</div>
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

        {/* QR + Address */}
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-4">
          <div className="bg-white p-3 rounded-xl">
            <img src={qrUrl} alt="QR code" className="h-48 w-48" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Your {selectedAsset.symbol} address ({selectedNetwork.name})
            </p>
            <p className="text-sm font-mono break-all px-2">{selectedNetwork.address}</p>
          </div>
          <Button onClick={handleCopy} variant="outline" className="w-full gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Address"}
          </Button>
        </div>

        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            ⚠ Only send {selectedAsset.symbol} via {selectedNetwork.name} to this address. Other assets or networks will be lost permanently.
          </p>
        </div>
      </div>

      {/* Asset picker */}
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
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card/80 transition text-left"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold">
                  {a.icon}
                </div>
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.symbol}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Network picker */}
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

export default Receive;
