import { Moon, Wallet, SlidersHorizontal, Shield, MessageCircle, Users, DollarSign, Key } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      id: "dark-mode",
      icon: Moon,
      label: "Dark Mode",
      description: "Toggle dark mode theme",
      hasSwitch: true,
    },
    {
      id: "connect-wallet",
      icon: Wallet,
      label: "Connect Wallet",
      description: "Connect your crypto wallet",
      hasSwitch: false,
    },
    {
      id: "currency",
      icon: DollarSign,
      label: "Currency",
      description: "Choose your display currency",
      hasSwitch: false,
    },
    {
      id: "preference",
      icon: SlidersHorizontal,
      label: "Preference",
      description: "Manage your preferences",
      hasSwitch: false,
    },
    {
      id: "security",
      icon: Shield,
      label: "Security",
      description: "Security settings and 2FA",
      hasSwitch: false,
    },
    {
      id: "show-seed-phrase",
      icon: Key,
      label: "Show Seed Phrase",
      description: "View your recovery seed phrase",
      hasSwitch: false,
    },
    {
      id: "customer-care",
      icon: MessageCircle,
      label: "Chat with Customer Care",
      description: "Get help from our support team",
      hasSwitch: false,
    },
    {
      id: "referral",
      icon: Users,
      label: "Referral",
      description: "Invite friends and earn rewards",
      hasSwitch: false,
    },
  ];

  const handleSettingClick = (id: string) => {
    if (id === "dark-mode") {
      setDarkMode(!darkMode);
      toast.success(`Dark mode ${!darkMode ? "enabled" : "disabled"}`);
    } else if (id === "show-seed-phrase") {
      toast.info("Please verify your PIN to view seed phrase");
    } else if (id === "currency") {
      toast.info("Currency selection coming soon");
    } else {
      toast.info(`Opening ${id} settings...`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mb-6">
          Manage your account and preferences
        </p>

        <div className="space-y-3">
          {settingsSections.map((setting) => {
            const Icon = setting.icon;
            return (
              <Card
                key={setting.id}
                className="p-4 cursor-pointer hover:bg-card/80 transition-all border-border bg-card"
                onClick={() => !setting.hasSwitch && handleSettingClick(setting.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {setting.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  {setting.hasSwitch && (
                    <Switch
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        toast.success(`Dark mode ${checked ? "enabled" : "disabled"}`);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
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