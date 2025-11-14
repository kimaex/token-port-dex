import { ArrowDownToLine, ArrowUpFromLine, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const ActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-3 gap-4">
        <Button 
          className="flex flex-col h-auto py-4 bg-card hover:bg-card/80 border border-border"
          variant="ghost"
          onClick={() => navigate("/fiat")}
        >
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center mb-2 shadow-glow">
            <ArrowDownToLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">Deposit</span>
        </Button>

        <Button 
          className="flex flex-col h-auto py-4 bg-card hover:bg-card/80 border border-border"
          variant="ghost"
          onClick={() => navigate("/fiat")}
        >
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center mb-2 shadow-glow">
            <ArrowUpFromLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">Withdraw</span>
        </Button>

        <Button 
          className="flex flex-col h-auto py-4 bg-card hover:bg-card/80 border border-border"
          variant="ghost"
          onClick={() => navigate("/fiat")}
        >
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center mb-2 shadow-glow">
            <CreditCard className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">Fiat</span>
        </Button>
      </div>
    </div>
  );
};
