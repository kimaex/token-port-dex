import { Moon, Wallet, SlidersHorizontal, Shield, MessageCircle, Users, DollarSign, Key, ChevronRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const africanCurrencies = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "Nigeria" },
  { code: "ZAR", symbol: "R", name: "South African Rand", country: "South Africa" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", country: "Egypt" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", country: "Kenya" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", country: "Ghana" },
  { code: "MAD", symbol: "MAD", name: "Moroccan Dirham", country: "Morocco" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", country: "Tanzania" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", country: "Uganda" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", country: "Ethiopia" },
  { code: "XOF", symbol: "CFA", name: "West African CFA Franc", country: "West Africa" },
  { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc", country: "Central Africa" },
  { code: "DZD", symbol: "DA", name: "Algerian Dinar", country: "Algeria" },
  { code: "TND", symbol: "DT", name: "Tunisian Dinar", country: "Tunisia" },
  { code: "LYD", symbol: "LD", name: "Libyan Dinar", country: "Libya" },
  { code: "SDG", symbol: "SDG", name: "Sudanese Pound", country: "Sudan" },
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", country: "Angola" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", country: "Zambia" },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha", country: "Malawi" },
  { code: "BWP", symbol: "P", name: "Botswanan Pula", country: "Botswana" },
  { code: "NAD", symbol: "N$", name: "Namibian Dollar", country: "Namibia" },
  { code: "MZN", symbol: "MT", name: "Mozambican Metical", country: "Mozambique" },
  { code: "RWF", symbol: "FRw", name: "Rwandan Franc", country: "Rwanda" },
  { code: "BIF", symbol: "FBu", name: "Burundian Franc", country: "Burundi" },
  { code: "CDF", symbol: "FC", name: "Congolese Franc", country: "DR Congo" },
  { code: "SZL", symbol: "E", name: "Swazi Lilangeni", country: "Eswatini" },
  { code: "LSL", symbol: "L", name: "Lesotho Loti", country: "Lesotho" },
  { code: "GMD", symbol: "D", name: "Gambian Dalasi", country: "Gambia" },
  { code: "SLL", symbol: "Le", name: "Sierra Leonean Leone", country: "Sierra Leone" },
  { code: "LRD", symbol: "L$", name: "Liberian Dollar", country: "Liberia" },
  { code: "GNF", symbol: "FG", name: "Guinean Franc", country: "Guinea" },
  { code: "MRU", symbol: "UM", name: "Mauritanian Ouguiya", country: "Mauritania" },
  { code: "CVE", symbol: "Esc", name: "Cape Verdean Escudo", country: "Cape Verde" },
  { code: "STN", symbol: "Db", name: "São Tomé Dobra", country: "São Tomé" },
  { code: "SCR", symbol: "SR", name: "Seychellois Rupee", country: "Seychelles" },
  { code: "MUR", symbol: "Rs", name: "Mauritian Rupee", country: "Mauritius" },
  { code: "MGA", symbol: "Ar", name: "Malagasy Ariary", country: "Madagascar" },
  { code: "KMF", symbol: "CF", name: "Comorian Franc", country: "Comoros" },
  { code: "DJF", symbol: "Fdj", name: "Djiboutian Franc", country: "Djibouti" },
  { code: "ERN", symbol: "Nfk", name: "Eritrean Nakfa", country: "Eritrea" },
  { code: "SOS", symbol: "Sh.So.", name: "Somali Shilling", country: "Somalia" },
  { code: "SSP", symbol: "SSP", name: "South Sudanese Pound", country: "South Sudan" },
  { code: "ZWL", symbol: "Z$", name: "Zimbabwean Dollar", country: "Zimbabwe" },
];

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(africanCurrencies[0]);

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
      description: `Current: ${selectedCurrency.symbol} ${selectedCurrency.code}`,
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
      setShowCurrencyModal(true);
    } else {
      toast.info(`Opening ${id} settings...`);
    }
  };

  const handleCurrencySelect = (currency: typeof africanCurrencies[0]) => {
    setSelectedCurrency(currency);
    setShowCurrencyModal(false);
    toast.success(`Currency changed to ${currency.code} (${currency.symbol})`);
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
                  {setting.hasSwitch ? (
                    <Switch
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        toast.success(`Dark mode ${checked ? "enabled" : "disabled"}`);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Currency Selection Modal */}
      <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Select Currency
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {africanCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency)}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    selectedCurrency.code === currency.code
                      ? "bg-primary/20 border border-primary"
                      : "bg-card hover:bg-card/80 border border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {currency.symbol}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{currency.code}</p>
                      <p className="text-sm text-muted-foreground">{currency.country}</p>
                    </div>
                  </div>
                  {selectedCurrency.code === currency.code && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
