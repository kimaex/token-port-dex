import { useState } from "react";
import { ArrowLeft, TrendingUp, Clock, Shield, ChevronRight, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StakingAsset {
  symbol: string;
  name: string;
  icon: string;
  balance: string;
  apy: number;
  minStake: number;
  lockPeriods: { days: number; bonus: number }[];
  totalStaked: string;
  stakers: number;
}

const stakingAssets: StakingAsset[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "◈",
    balance: "5,234.56",
    apy: 12.5,
    minStake: 10,
    lockPeriods: [
      { days: 30, bonus: 0 },
      { days: 60, bonus: 2 },
      { days: 90, bonus: 5 },
      { days: 120, bonus: 8 },
    ],
    totalStaked: "45.2M",
    stakers: 12543,
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "◇",
    balance: "12.34",
    apy: 8.2,
    minStake: 0.1,
    lockPeriods: [
      { days: 30, bonus: 0 },
      { days: 60, bonus: 1.5 },
      { days: 90, bonus: 3 },
      { days: 120, bonus: 5 },
    ],
    totalStaked: "2.1M",
    stakers: 8921,
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    balance: "45.67",
    apy: 6.8,
    minStake: 0.5,
    lockPeriods: [
      { days: 30, bonus: 0 },
      { days: 60, bonus: 1 },
      { days: 90, bonus: 2.5 },
      { days: 120, bonus: 4 },
    ],
    totalStaked: "8.5M",
    stakers: 15678,
  },
];

export default function StakeEarn() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<StakingAsset | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState("");
  const [showStakeModal, setShowStakeModal] = useState(false);

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    if (selectedAsset && parseFloat(stakeAmount) < selectedAsset.minStake) {
      toast.error(`Minimum stake is ${selectedAsset.minStake} ${selectedAsset.symbol}`);
      return;
    }
    const period = selectedAsset?.lockPeriods[selectedPeriod];
    const totalApy = (selectedAsset?.apy || 0) + (period?.bonus || 0);
    toast.success(
      `Successfully staked ${stakeAmount} ${selectedAsset?.symbol} for ${period?.days} days at ${totalApy}% APY`
    );
    setShowStakeModal(false);
    setStakeAmount("");
    setSelectedAsset(null);
  };

  const openStakeModal = (asset: StakingAsset) => {
    setSelectedAsset(asset);
    setSelectedPeriod(0);
    setStakeAmount("");
    setShowStakeModal(true);
  };

  const calculateRewards = () => {
    if (!stakeAmount || !selectedAsset) return 0;
    const period = selectedAsset.lockPeriods[selectedPeriod];
    const totalApy = selectedAsset.apy + period.bonus;
    const amount = parseFloat(stakeAmount);
    return (amount * totalApy * (period.days / 365)) / 100;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Stake & Earn</h1>
              <p className="text-sm text-muted-foreground">Earn passive income on your crypto</p>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Staked</p>
              <p className="text-lg font-bold text-primary">$55.8M</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg. APY</p>
              <p className="text-lg font-bold text-green-500">9.17%</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Active Stakers</p>
              <p className="text-lg font-bold">37.1K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Assets */}
      <div className="max-w-md mx-auto px-4 space-y-4">
        <h2 className="text-lg font-semibold">Available for Staking</h2>
        
        {stakingAssets.map((asset) => (
          <div
            key={asset.symbol}
            className="bg-card border border-border rounded-2xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {asset.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{asset.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{asset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-500">{asset.apy}%</p>
                <p className="text-xs text-muted-foreground">Base APY</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-secondary/30 rounded-xl p-3">
              <div>
                <p className="text-xs text-muted-foreground">Your Balance</p>
                <p className="font-semibold text-sm">{asset.balance}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Staked</p>
                <p className="font-semibold text-sm">${asset.totalStaked}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stakers</p>
                <p className="font-semibold text-sm">{asset.stakers.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secured</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>30-120 days lock</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Up to +{asset.lockPeriods[asset.lockPeriods.length - 1].bonus}% bonus</span>
              </div>
            </div>

            <Button
              onClick={() => openStakeModal(asset)}
              className="w-full"
            >
              Stake {asset.symbol}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ))}

        {/* My Staking Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">My Staking</h2>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Coins className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No active stakes yet</p>
            <p className="text-sm text-muted-foreground">
              Start staking to earn passive rewards
            </p>
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      {showStakeModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-end justify-center sm:items-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {selectedAsset.icon}
                </div>
                <div>
                  <h2 className="font-semibold">Stake {selectedAsset.symbol}</h2>
                  <p className="text-sm text-muted-foreground">{selectedAsset.name}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowStakeModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* Lock Period Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Lock Period</label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedAsset.lockPeriods.map((period, index) => {
                    const totalApy = selectedAsset.apy + period.bonus;
                    return (
                      <button
                        key={period.days}
                        onClick={() => setSelectedPeriod(index)}
                        className={`p-3 rounded-xl border transition-all ${
                          selectedPeriod === index
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary/30 hover:border-primary/50"
                        }`}
                      >
                        <p className="font-bold text-sm">{period.days}D</p>
                        <p className="text-green-500 text-xs font-medium">{totalApy}%</p>
                        {period.bonus > 0 && (
                          <p className="text-xs text-amber-500">+{period.bonus}%</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Amount to Stake</label>
                  <span className="text-sm text-muted-foreground">
                    Available: {selectedAsset.balance} {selectedAsset.symbol}
                  </span>
                </div>
                <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="flex-1 text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStakeAmount(selectedAsset.balance.replace(",", ""))}
                    >
                      MAX
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min: {selectedAsset.minStake} {selectedAsset.symbol}
                  </p>
                </div>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => {
                        const balance = parseFloat(selectedAsset.balance.replace(",", ""));
                        setStakeAmount(((balance * percent) / 100).toFixed(4));
                      }}
                      className="flex-1 py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Estimate */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Estimated Rewards</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">After {selectedAsset.lockPeriods[selectedPeriod].days} days</span>
                  <span className="text-xl font-bold text-green-500">
                    +{calculateRewards().toFixed(4)} {selectedAsset.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">APY</span>
                  <span className="font-medium text-green-500">
                    {selectedAsset.apy + selectedAsset.lockPeriods[selectedPeriod].bonus}%
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Your tokens will be locked for the selected period</p>
                  <p>• Rewards are distributed daily to your wallet</p>
                  <p>• A 2% service fee applies on staking</p>
                </div>
              </div>

              {/* Stake Button */}
              <Button
                onClick={handleStake}
                className="w-full h-14 text-lg font-semibold"
                disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
              >
                Stake {stakeAmount || "0"} {selectedAsset.symbol}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Coins = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);