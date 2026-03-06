import { CreditCard, Plane, Receipt, TrendingUp, Landmark, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";

export default function More() {
  const navigate = useNavigate();

  const services = [
    {
      id: "atm-card",
      icon: CreditCard,
      label: "ATM Card",
      description: "Get a virtual or physical card",
      path: "/atm-card",
    },
    {
      id: "flights",
      icon: Plane,
      label: "Flight Tickets",
      description: "Book flights with crypto",
      path: "/flight-tickets",
    },
    {
      id: "utilities",
      icon: Receipt,
      label: "Utilities Bills",
      description: "Pay bills using your balance",
      path: "/utilities-bills",
    },
    {
      id: "stake",
      icon: TrendingUp,
      label: "Stake and Earn Crypto",
      description: "Stake your crypto and earn rewards",
      path: "/stake-earn",
    },
    {
      id: "bonds",
      icon: Landmark,
      label: "Buy Government Bond",
      description: "Invest in government bonds",
      path: "/government-bonds",
    },
    {
      id: "spin",
      icon: Sparkles,
      label: "Spin and Win USDT",
      description: "Try your luck and win USDT",
      path: "/spin-win",
    },
    {
      id: "copy-trading",
      icon: Users,
      label: "Copy Trading",
      description: "Replicate top trader strategies",
      path: "/copy-trading",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          More Services
        </h1>
        <p className="text-muted-foreground mb-6">
          Use your crypto balance for everyday needs
        </p>

        <div className="space-y-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                className="p-6 cursor-pointer hover:bg-card/80 transition-all border-border bg-card"
                onClick={() => navigate(service.path)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">
                      {service.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
