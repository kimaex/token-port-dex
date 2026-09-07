import { Send, Download, ArrowDownToLine, Receipt } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const ActionButtons = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "Add", icon: ArrowDownToLine, path: "/fiat" },
    { label: "Send", icon: Send, path: "/send" },
    { label: "Receive", icon: Download, path: "/receive" },
    { label: "Bills", icon: Receipt, path: "/bills" },
  ];

  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-5 gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Button
              key={a.label}
              className="flex flex-col h-auto py-3 px-1 bg-card hover:bg-card/80 border border-border"
              variant="ghost"
              onClick={() => navigate(a.path)}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center mb-1.5 shadow-glow">
                <Icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium">{a.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
