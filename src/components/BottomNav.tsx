import { Wallet, Repeat, Clock, User } from "lucide-react";
import { useState } from "react";

export const BottomNav = () => {
  const [active, setActive] = useState("wallet");

  const navItems = [
    { id: "wallet", icon: Wallet, label: "Wallet" },
    { id: "swap", icon: Repeat, label: "Swap" },
    { id: "activity", icon: Clock, label: "Activity" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="max-w-md mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "drop-shadow-glow" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
