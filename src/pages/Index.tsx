import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletHeader } from "@/components/WalletHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { AssetList } from "@/components/AssetList";
import { BottomNav } from "@/components/BottomNav";
import { Onboarding } from "@/components/Onboarding";

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


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative pb-20">
        <WalletHeader />
        <ActionButtons />
        <AssetList />

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
