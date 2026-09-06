import { useState, useEffect } from "react";
import { ChevronDown, Plus, Check, Copy, Wallet, Trash2, Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface WalletData {
  id: string;
  name: string;
  address: string;
  balance: string;
  color: string;
}

const WALLET_COLORS = [
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-blue-500 to-cyan-500",
  "bg-gradient-to-r from-green-500 to-emerald-500",
  "bg-gradient-to-r from-orange-500 to-yellow-500",
  "bg-gradient-to-r from-red-500 to-rose-500",
];

const generateWalletAddress = () => {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

const getDefaultWallets = (): WalletData[] => [
  {
    id: "1",
    name: "Main Wallet",
    address: generateWalletAddress(),
    balance: "₦38,840,350.00",
    color: WALLET_COLORS[0],
  },
];

export const WalletSelector = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [editingWallet, setEditingWallet] = useState<WalletData | null>(null);
  const [createMode, setCreateMode] = useState<"create" | "import">("create");
  const [importSeedPhrase, setImportSeedPhrase] = useState("");

  useEffect(() => {
    const savedWallets = localStorage.getItem("kimaex_wallets");
    const savedActiveId = localStorage.getItem("kimaex_active_wallet");
    
    if (savedWallets) {
      const parsed = JSON.parse(savedWallets);
      setWallets(parsed);
      setActiveWalletId(savedActiveId || parsed[0]?.id || "");
    } else {
      const defaultWallets = getDefaultWallets();
      setWallets(defaultWallets);
      setActiveWalletId(defaultWallets[0].id);
      localStorage.setItem("kimaex_wallets", JSON.stringify(defaultWallets));
      localStorage.setItem("kimaex_active_wallet", defaultWallets[0].id);
    }
  }, []);

  const activeWallet = wallets.find((w) => w.id === activeWalletId);

  const handleSelectWallet = (walletId: string) => {
    setActiveWalletId(walletId);
    localStorage.setItem("kimaex_active_wallet", walletId);
    toast.success("Wallet switched");
  };

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) {
      toast.error("Please enter a wallet name");
      return;
    }

    if (createMode === "import" && importSeedPhrase.split(" ").length !== 12) {
      toast.error("Please enter a valid 12-word seed phrase");
      return;
    }

    const newWallet: WalletData = {
      id: Date.now().toString(),
      name: newWalletName,
      address: generateWalletAddress(),
      balance: "₦0.00",
      color: WALLET_COLORS[wallets.length % WALLET_COLORS.length],
    };

    const updatedWallets = [...wallets, newWallet];
    setWallets(updatedWallets);
    setActiveWalletId(newWallet.id);
    localStorage.setItem("kimaex_wallets", JSON.stringify(updatedWallets));
    localStorage.setItem("kimaex_active_wallet", newWallet.id);

    setNewWalletName("");
    setImportSeedPhrase("");
    setShowCreateModal(false);
    toast.success(createMode === "create" ? "Wallet created" : "Wallet imported");
  };

  const handleEditWallet = () => {
    if (!editingWallet || !newWalletName.trim()) return;

    const updatedWallets = wallets.map((w) =>
      w.id === editingWallet.id ? { ...w, name: newWalletName } : w
    );
    setWallets(updatedWallets);
    localStorage.setItem("kimaex_wallets", JSON.stringify(updatedWallets));

    setEditingWallet(null);
    setNewWalletName("");
    setShowEditModal(false);
    toast.success("Wallet renamed");
  };

  const handleDeleteWallet = (walletId: string) => {
    if (wallets.length <= 1) {
      toast.error("You must have at least one wallet");
      return;
    }

    const updatedWallets = wallets.filter((w) => w.id !== walletId);
    setWallets(updatedWallets);
    localStorage.setItem("kimaex_wallets", JSON.stringify(updatedWallets));

    if (activeWalletId === walletId) {
      setActiveWalletId(updatedWallets[0].id);
      localStorage.setItem("kimaex_active_wallet", updatedWallets[0].id);
    }

    toast.success("Wallet deleted");
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  const openEditModal = (wallet: WalletData) => {
    setEditingWallet(wallet);
    setNewWalletName(wallet.name);
    setShowEditModal(true);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-0 hover:bg-transparent">
            <div className={`h-8 w-8 rounded-full ${activeWallet?.color || WALLET_COLORS[0]} flex items-center justify-center`}>
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{activeWallet?.name || "Wallet"}</p>
              <p className="text-xs text-muted-foreground">
                {activeWallet ? shortenAddress(activeWallet.address) : ""}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 bg-card border-border">
          <div className="p-2">
            <p className="text-xs text-muted-foreground mb-2">My Wallets</p>
          </div>
          
          {wallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet.id}
              className="flex items-center justify-between p-3 cursor-pointer"
              onClick={() => handleSelectWallet(wallet.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${wallet.color} flex items-center justify-center`}>
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{wallet.name}</p>
                  <p className="text-xs text-muted-foreground">{shortenAddress(wallet.address)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {wallet.id === activeWalletId && (
                  <Check className="h-4 w-4 text-success" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyAddress(wallet.address);
                  }}
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(wallet);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                {wallets.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWallet(wallet.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="p-3 cursor-pointer"
            onClick={() => {
              setCreateMode("create");
              setShowCreateModal(true);
            }}
          >
            <Plus className="h-5 w-5 mr-3 text-primary" />
            <span>Create New Wallet</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="p-3 cursor-pointer"
            onClick={() => {
              setCreateMode("import");
              setShowCreateModal(true);
            }}
          >
            <Wallet className="h-5 w-5 mr-3 text-primary" />
            <span>Import Wallet</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create/Import Wallet Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {createMode === "create" ? "Create New Wallet" : "Import Wallet"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Wallet Name
              </label>
              <Input
                placeholder="Enter wallet name"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {createMode === "import" && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Seed Phrase
                </label>
                <textarea
                  placeholder="Enter your 12-word seed phrase"
                  value={importSeedPhrase}
                  onChange={(e) => setImportSeedPhrase(e.target.value)}
                  className="w-full h-24 p-3 rounded-lg bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <Button
              className="w-full bg-gradient-primary text-primary-foreground"
              onClick={handleCreateWallet}
            >
              {createMode === "create" ? "Create Wallet" : "Import Wallet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Wallet Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Wallet</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Wallet Name
              </label>
              <Input
                placeholder="Enter wallet name"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <Button
              className="w-full bg-gradient-primary text-primary-foreground"
              onClick={handleEditWallet}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
