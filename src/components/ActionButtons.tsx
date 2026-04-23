import { Send, Download, CreditCard, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const ActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-4 gap-2">
        <Button 
          className="flex flex-col h-auto py-3 bg-card hover:bg-card/80 border border-border"
          variant="ghost"
          onClick={() => navigate("/send")}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center mb-1.5 shadow-glow">
            <Send className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium">Send</span>
        </Button>

        <Button 
          className="flex flex-col h-auto py-3 bg-card hover:bg-card/80 border border-border"
          variant="ghost"
          onClick={() => navigate("/receive")}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center mb-1.5 shadow-glow">
            <Download className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium">Receive</span>
        </Button>

        <Button 
          className="flex flex-col h-auto py-3 bg-card hover:bg-card/80 border border-border"
          variant="ghost"
          onClick={() => navigate("/fiat")}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center mb-1.5 shadow-glow">
            <CreditCard className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium">Fiat</span>
        </Button>

        <Button 
          className="flex flex-col h-auto py-3 bg-card hover:bg-card/80 border border-border"
          variant="ghost"
          onClick={() => navigate("/stake-earn")}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center mb-1.5 shadow-glow">
            <Coins className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium">Stake</span>
        </Button>
      </div>
    </div>
  );
};