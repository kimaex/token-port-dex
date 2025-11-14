import { useState, useEffect } from "react";
import { WalletHeader } from "@/components/WalletHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { AssetList } from "@/components/AssetList";
import { BottomNav } from "@/components/BottomNav";
import { Onboarding } from "@/components/Onboarding";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
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
