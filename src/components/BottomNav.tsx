import { Wallet, Repeat, Grid3X3, TrendingUp, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "wallet", icon: Wallet, label: "Wallet", path: "/" },
    { id: "swap", icon: Repeat, label: "Swap", path: "/swap" },
    { id: "dapps", icon: Grid3X3, label: "DApps", path: "/dapps" },
    { id: "futures", icon: TrendingUp, label: "Futures", path: "/futures" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-md mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
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
