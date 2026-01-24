import { Eye, EyeOff, ScanLine, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";

export const WalletHeader = () => {
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="p-6 pb-8">
      <div className="flex items-center justify-between mb-8">
        <WalletSelector />
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/scan")}>
            <ScanLine className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? (
              <Eye className="h-4 w-4 text-muted-foreground" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        {showBalance ? (
          <>
            <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              $24,582.50
            </h2>
            <p className="text-sm text-success flex items-center justify-center gap-1">
              +$1,245.20 (5.3%) <span className="text-muted-foreground">today</span>
            </p>
          </>
        ) : (
          <h2 className="text-5xl font-bold">••••••</h2>
        )}
      </div>
    </div>
  );
};
