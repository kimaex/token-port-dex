import { Eye, EyeOff, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export const WalletHeader = () => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="p-6 pb-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
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
