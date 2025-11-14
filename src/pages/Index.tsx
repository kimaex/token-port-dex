import { WalletHeader } from "@/components/WalletHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { AssetList } from "@/components/AssetList";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative">
        <WalletHeader />
        <ActionButtons />
        <AssetList />
        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
