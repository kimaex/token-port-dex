import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletHeader } from "@/components/WalletHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { AssetList } from "@/components/AssetList";
import { BottomNav } from "@/components/BottomNav";
import { Onboarding } from "@/components/Onboarding";
import { Card } from "@/components/ui/card";
import { Gift, Share2 } from "lucide-react";
import { viralShare, getReferralLink } from "@/lib/viralShare";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    const hasAccount = localStorage.getItem("walletSeedPhrase");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else if (!hasAccount) {
      // After welcoming slides, send new members to login/register
      navigate("/auth");
    }
  }, [navigate]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
    // Send new visitors to login/register after seeing all welcome slides
    navigate("/auth");
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      toast.success("Referral link copied");
    } catch {
      toast.info(getReferralLink());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative pb-20">
        <WalletHeader />
        <ActionButtons />
        <AssetList />

        {/* Viral Loop — referral inside wallet */}
        <div className="px-6 pt-2">
          <Card className="p-3 flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Invite & earn</p>
              <p className="text-[11px] text-muted-foreground truncate">{getReferralLink()}</p>
            </div>
            <button
              onClick={copyLink}
              className="text-xs font-semibold text-primary px-2 py-1 rounded hover:bg-primary/10"
            >
              Copy
            </button>
            <button
              onClick={() => viralShare("I'm trading on Kimaex 🚀")}
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </Card>
        </div>

        <div className="px-6 py-4">
          <button 
            onClick={() => window.location.href = '/swap'} 
            className="w-full py-3 bg-gradient-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Manage Crypto
          </button>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
