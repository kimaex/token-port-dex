import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletHeader } from "@/components/WalletHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { QuickSwap } from "@/components/QuickSwap";
import { AssetList } from "@/components/AssetList";
import { BottomNav } from "@/components/BottomNav";
import { Onboarding } from "@/components/Onboarding";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      const hasAccount = localStorage.getItem("walletSeedPhrase");
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        setChecking(false);
        return;
      }

      if (!session || !hasAccount) {
        navigate("/auth", { replace: true });
        return;
      }
      setChecking(false);
    };
    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && localStorage.getItem("hasSeenOnboarding")) {
        navigate("/auth", { replace: true });
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
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

  if (checking) {
    return <div className="min-h-screen bg-background" />;
  }



  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative pb-20">
        <WalletHeader />
        <ActionButtons />
        <QuickSwap />
        <AssetList />

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
