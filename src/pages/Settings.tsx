import { Moon, Wallet, Shield, MessageCircle, Users, DollarSign, ChevronRight, ChevronDown, Check, Copy, Share2, Gift, X, ExternalLink, Eye, EyeOff, Lock, FileText, HelpCircle, Clock, CheckCircle, Send, Headphones, CreditCard, UserCheck, ShieldAlert, ArrowRight, TrendingUp, Award, Download, Link2, BarChart3, Wallet2, Banknote, ArrowRightLeft, User as UserIcon, Camera, IdCard, Globe, Languages } from "lucide-react";
import { AFRICAN_LANGUAGES } from "@/data/africanLanguages";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency, africanCurrencies } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Mock connected dApps data
const connectedDApps = [
  { id: 1, name: "Uniswap", icon: "🦄", url: "uniswap.org", connectedAt: "2 days ago" },
  { id: 2, name: "OpenSea", icon: "🌊", url: "opensea.io", connectedAt: "1 week ago" },
  { id: 3, name: "Aave", icon: "👻", url: "aave.com", connectedAt: "2 weeks ago" },
];

// Mock IB referral data (FXPro-style)
const referralData = {
  code: "KIMAEX2024",
  ibId: "IB-784512",
  tier: "Silver",
  nextTier: "Gold",
  progressToNext: 62,
  totalClicks: 1842,
  totalSignups: 47,
  activeTraders: 23,
  totalReferrals: 47,
  pendingRewards: 145.50,
  totalEarnings: 2347.85,
  thisMonthEarnings: 412.30,
  futuresVolume: 184250.75,
  fiatVolume: 92480.20,
  swapVolume: 67890.45,
  referralLink: "https://kimaex.app/ref/KIMAEX2024",
};

// FXPro-style IB tier table — % commission on Futures, Fiat & Swap
const ibTiers = [
  { tier: "Bronze", clients: "1-10", futuresPct: 15, fiatPct: 10, swapPct: 10 },
  { tier: "Silver", clients: "11-50", futuresPct: 25, fiatPct: 15, swapPct: 18, current: true },
  { tier: "Gold", clients: "51-100", futuresPct: 35, fiatPct: 20, swapPct: 25 },
  { tier: "Platinum", clients: "100+", futuresPct: 50, fiatPct: 30, swapPct: 35 },
];

// Earnings history with source (Futures / Fiat / Swap) and commission %
const referralEarnings = [
  { id: 1, date: "2024-01-15", username: "user***42", amount: 45.20, source: "Futures", pct: 25, contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD35" },
  { id: 2, date: "2024-01-12", username: "trad***89", amount: 32.50, source: "Fiat", pct: 15, contractAddress: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72" },
  { id: 3, date: "2024-01-11", username: "swp***07", amount: 18.40, source: "Swap", pct: 18, contractAddress: "0x9F8e6b51A2e09F4d3c2A8C4b21fE99e3D9aA1b22" },
  { id: 4, date: "2024-01-10", username: "cry***21", amount: 28.75, source: "Futures", pct: 25, contractAddress: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" },
  { id: 5, date: "2024-01-08", username: "dex***55", amount: 52.30, source: "Futures", pct: 25, contractAddress: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec" },
  { id: 6, date: "2024-01-06", username: "swp***14", amount: 22.10, source: "Swap", pct: 18, contractAddress: "0x3aE5c1B8f7Da4e0917b6c8FfE1aD5bC30E22dE91" },
  { id: 7, date: "2024-01-05", username: "kim***33", amount: 76.00, source: "Fiat", pct: 15, contractAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" },
];

// Kimaex Partners Benefit Program — volume milestones & rewards
const benefitMilestones = [
  { volume: "200K", reward: "Partner badge & merchandise", icon: "🎖️" },
  { volume: "200M", reward: "Digital gift cards for ₦316,000", icon: "🎁" },
  { volume: "500M", reward: "₦1,106,000 in Cash", icon: "💵" },
  { volume: "1B", reward: "Top Model Phone", icon: "📱" },
  { volume: "2B", reward: "₦3,160,000 in Cash", icon: "💰" },
  { volume: "5B", reward: "₦6,320,000 in Cash", icon: "💰" },
  { volume: "10B", reward: "Luxury trip for 2 people", icon: "✈️" },
  { volume: "20B", reward: "₦23,700,000 in Cash", icon: "💎" },
  { volume: "50B", reward: "Luxury Watch", icon: "⌚" },
  { volume: "100B", reward: "₦63,200,000 in Cash", icon: "🏆" },
  { volume: "200B", reward: "₦126,400,000 in Cash", icon: "👑" },
  { volume: "400B", reward: "Premium Sports Car", icon: "🏎️" },
];

// Current achieved milestone index (mock — Silver tier user just joined)
const currentMilestoneIndex = 0;

// FXPro IB-style promo materials
const promoMaterials = [
  { id: 1, name: "Banner 728x90", type: "Image", size: "45 KB" },
  { id: 2, name: "Banner 300x250", type: "Image", size: "32 KB" },
  { id: 3, name: "Landing Page Kit", type: "HTML", size: "180 KB" },
  { id: 4, name: "Social Media Pack", type: "Bundle", size: "2.4 MB" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showConnectedWallets, setShowConnectedWallets] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [connectedApps, setConnectedApps] = useState(connectedDApps);
  const [showCustomerCareModal, setShowCustomerCareModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState<string>(() => localStorage.getItem("kimaex_language") || "EN");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) => setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  // Profile / KYC state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("userProfile");
      return saved ? JSON.parse(saved) : { firstName: "", lastName: "", dob: "", idType: "NIN", idNumber: "", photo: "", kycStatus: "unverified" };
    } catch {
      return { firstName: "", lastName: "", dob: "", idType: "NIN", idNumber: "", photo: "", kycStatus: "unverified" };
    }
  });

  // Customer care help categories
  const helpCategories = [
    { id: "transactions", icon: CreditCard, label: "Transactions", description: "Help with deposits, withdrawals & trades" },
    { id: "verification", icon: UserCheck, label: "Verification", description: "KYC and identity verification issues" },
    { id: "security", icon: ShieldAlert, label: "Security", description: "Account security and 2FA support" },
    { id: "general", icon: HelpCircle, label: "General", description: "Other questions and inquiries" },
  ];

  // FAQ articles
  const faqArticles = [
    { id: 1, title: "How to deposit funds", views: "2.3k" },
    { id: 2, title: "Why is my withdrawal pending?", views: "1.8k" },
    { id: 3, title: "How to enable 2FA", views: "1.5k" },
    { id: 4, title: "Trading fees explained", views: "1.2k" },
  ];


  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast.success(`Dark mode ${enabled ? "enabled" : "disabled"}`);
  };

  const settingsSections = [
    {
      id: "profile",
      icon: UserIcon,
      label: "Profile & KYC",
      description: profile.kycStatus === "verified"
        ? `Verified • ${profile.firstName || "You"}`
        : profile.firstName
          ? "Complete identity verification"
          : "Add your name, DOB & verify ID",
      hasSwitch: false,
    },
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
      label: "Connected dApps",
      description: `${connectedApps.length} apps connected`,
      hasSwitch: false,
    },
    {
      id: "currency",
      icon: DollarSign,
      label: "Currency",
      description: `Current: ${currency.symbol} ${currency.code}`,
      hasSwitch: false,
    },
    {
      id: "language",
      icon: Languages,
      label: "Language",
      description: `Current: ${(AFRICAN_LANGUAGES.find(l => l.code === language)?.native) || "English"}`,
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
      toggleDarkMode(!darkMode);
    } else if (id === "profile") {
      setShowProfileModal(true);
    } else if (id === "currency") {
      setShowCurrencyModal(true);
    } else if (id === "language") {
      setShowLanguageModal(true);
    } else if (id === "connect-wallet") {
      setShowConnectedWallets(true);
    } else if (id === "referral") {
      setShowReferralModal(true);
    } else if (id === "customer-care") {
      setShowCustomerCareModal(true);
    } else {
      toast.info(`Opening ${id} settings...`);
    }
  };

  const handleStartChat = () => {
    toast.success("Connecting to a support agent...");
    setShowCustomerCareModal(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    toast.info(`Opening ${categoryId} support...`);
  };

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfile({ ...profile, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }
    if (!profile.dob) {
      toast.error("Please enter your date of birth");
      return;
    }
    const idDigits = (profile.idNumber || "").replace(/\D/g, "");
    if (profile.idType === "NIN" && idDigits.length !== 11) {
      toast.error("NIN must be 11 digits");
      return;
    }
    if (profile.idType === "BVN" && idDigits.length !== 11) {
      toast.error("BVN must be 11 digits");
      return;
    }
    if (!profile.photo) {
      toast.error("Please take or upload a profile photo");
      return;
    }
    const updated = { ...profile, kycStatus: "pending" };
    setProfile(updated);
    localStorage.setItem("userProfile", JSON.stringify(updated));
    toast.success("KYC submitted — verification in progress");
    setShowProfileModal(false);
  };

  const handleCurrencySelect = (curr: typeof africanCurrencies[0]) => {
    setCurrency(curr);
    setShowCurrencyModal(false);
    toast.success(`Currency changed to ${curr.code} (${curr.symbol})`);
  };

  const handleDisconnectApp = (appId: number) => {
    setConnectedApps(connectedApps.filter(app => app.id !== appId));
    toast.success("dApp disconnected successfully");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.code);
    toast.success("Referral code copied!");
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    toast.success("Referral link copied!");
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Kimaex",
          text: `Use my referral code ${referralData.code} to sign up on Kimaex and earn rewards!`,
          url: referralData.referralLink,
        });
      } catch (error) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const username = "jibkid";
  const displayFullName = (profile.firstName && profile.lastName)
    ? `${profile.firstName} ${profile.lastName}`
    : "Jibrin Ibrahim";
  const displayDob = profile.dob || "//2010";
  const displayEmail = "i***@gmail.com";

  const personalInfo = [
    { label: "Full Name", value: displayFullName },
    { label: "Nickname", value: username },
    { label: "Gender", value: "Male" },
    { label: "Date of Birth", value: displayDob },
    { label: "Email", value: displayEmail },
  ];

  const comingSoon = (name: string) => toast.info(`${name} — coming soon`);

  const groups: {
    title: string;
    items: { icon: any; label: string; hint?: string; onClick: () => void; switch?: boolean }[];
  }[] = [
    {
      title: "Security",
      items: [
        { icon: Lock, label: "Change Password", onClick: () => comingSoon("Change Password") },
        { icon: Shield, label: "Biometric Login", onClick: () => comingSoon("Biometric Login") },
        { icon: ShieldAlert, label: "Two-Factor Authentication (2FA)", onClick: () => comingSoon("2FA") },
        { icon: Eye, label: "Recovery Phrase Backup", onClick: () => comingSoon("Recovery Phrase Backup") },
      ],
    },
    {
      title: "Verification",
      items: [
        { icon: CheckCircle, label: "KYC Status", hint: profile.kycStatus === "verified" ? "Verified" : profile.kycStatus === "pending" ? "Pending" : "Unverified", onClick: () => setShowProfileModal(true) },
        { icon: IdCard, label: "Identity Verification", onClick: () => setShowProfileModal(true) },
      ],
    },
    {
      title: "Wallet Settings",
      items: [
        { icon: Wallet2, label: "Manage Wallets", onClick: () => comingSoon("Manage Wallets") },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Languages, label: "Language", hint: (AFRICAN_LANGUAGES.find(l => l.code === language)?.native) || "English", onClick: () => setShowLanguageModal(true) },
        { icon: DollarSign, label: "Currency", hint: `${currency.symbol} ${currency.code}`, onClick: () => setShowCurrencyModal(true) },
        { icon: Moon, label: "Theme", hint: darkMode ? "Dark" : "Light", switch: true, onClick: () => toggleDarkMode(!darkMode) },
        { icon: MessageCircle, label: "Notifications", onClick: () => navigate("/notifications") },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", onClick: () => setShowCustomerCareModal(true) },
        { icon: Headphones, label: "Contact Support", onClick: () => setShowCustomerCareModal(true) },
        { icon: FileText, label: "Terms & Conditions", onClick: () => comingSoon("Terms & Conditions") },
        { icon: Shield, label: "Privacy Policy", onClick: () => comingSoon("Privacy Policy") },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-5 space-y-5">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Profile Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-card border-border">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden shadow-glow ring-4 ring-background">
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-12 w-12 text-primary-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer ring-2 ring-background hover:scale-105 transition-transform">
                <Camera className="h-4 w-4 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
              </label>
            </div>
            <h2 className="mt-3 text-lg font-bold text-foreground">{username}</h2>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">Tier 3 Verified</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full px-5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => setShowProfileModal(true)}
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Personal Information Card */}
        <Card className="overflow-hidden border-border bg-card">

          <button
            onClick={() => toggleSection("personal")}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/40 transition-colors"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personal Information</h3>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections["personal"] ? "rotate-180" : ""}`} />
          </button>
          {expandedSections["personal"] && (
            <div className="divide-y divide-border border-t border-border">
              {personalInfo.map((row) => (
                <button
                  key={row.label}
                  onClick={() => setShowProfileModal(true)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors text-left"
                >
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{row.value}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Grouped Setting Sections */}
        {groups.map((group) => {
          const isSupport = group.title === "Support";
          const expanded = isSupport ? true : !!expandedSections[group.title];
          return (
            <Card key={group.title} className="overflow-hidden border-border bg-card">
              {isSupport ? (
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h3>
                </div>
              ) : (
                <button
                  onClick={() => toggleSection(group.title)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/40 transition-colors"
                >
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h3>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
              )}
              {expanded && (
                <div className={`divide-y divide-border ${isSupport ? "" : "border-t border-border"}`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors text-left"
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                        </div>
                        {item.switch ? (
                          <Switch
                            checked={darkMode}
                            onCheckedChange={(checked) => toggleDarkMode(checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            {item.hint && (
                              <span className="text-xs text-muted-foreground truncate max-w-[110px]">{item.hint}</span>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}


        {/* Referral (unchanged behavior) */}
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rewards</h3>
          <Card
            className="p-4 cursor-pointer hover:bg-card/80 transition-all border-border bg-card"
            onClick={() => setShowReferralModal(true)}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Referral</h3>
                <p className="text-sm text-muted-foreground">Invite friends and earn rewards</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Logout (unchanged) */}
        <div className="mt-8 flex justify-end">
          <Button
            variant="outline"
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={async () => {
              try {
                await supabase.auth.signOut();
              } catch {}
              localStorage.removeItem("walletSeedPhrase");
              localStorage.removeItem("walletType");
              localStorage.removeItem("kimaex_authenticated");
              toast.success("Logged out");
              navigate("/auth", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
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
              {africanCurrencies.map((curr) => (
                <div
                  key={curr.code}
                  onClick={() => handleCurrencySelect(curr)}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    currency.code === curr.code
                      ? "bg-primary/20 border border-primary"
                      : "bg-card hover:bg-card/80 border border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {curr.symbol}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{curr.code}</p>
                      <p className="text-sm text-muted-foreground">{curr.country}</p>
                    </div>
                  </div>
                  {currency.code === curr.code && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Language Selection Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Select Language
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-2">
              {AFRICAN_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    localStorage.setItem("kimaex_language", lang.code);
                    setShowLanguageModal(false);
                    toast.success(`Language set to ${lang.native}`);
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    language === lang.code
                      ? "bg-primary/20 border border-primary"
                      : "bg-card hover:bg-card/80 border border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{lang.native}</p>
                      <p className="text-sm text-muted-foreground">{lang.name} · {lang.code}</p>
                    </div>
                  </div>
                  {language === lang.code && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>


      {/* Connected dApps Modal */}
      <Dialog open={showConnectedWallets} onOpenChange={setShowConnectedWallets}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Connected dApps
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {connectedApps.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No dApps connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect to dApps to see them here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-3">
                  {connectedApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-card border border-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                          {app.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{app.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            <span>{app.url}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Connected {app.connectedAt}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDisconnectApp(app.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Referral Modal — FXPro IB Style */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="max-w-md bg-background border-border p-0 overflow-hidden max-h-[92vh]">
          {/* Header */}
          <div className="bg-gradient-primary p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary-foreground">Introducing Broker</h2>
                  <p className="text-primary-foreground/80 text-xs">IB ID: {referralData.ibId}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-primary-foreground">
                  {referralData.tier} Tier
                </div>
              </div>
            </div>

            {/* Tier progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-primary-foreground/90">
                <span>Progress to {referralData.nextTier}</span>
                <span>{referralData.progressToNext}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-primary-foreground rounded-full transition-all"
                  style={{ width: `${referralData.progressToNext}%` }}
                />
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[68vh]">
            <div className="p-5 space-y-5">
              {/* IB Link */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Your IB Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-foreground truncate font-mono">{referralData.referralLink}</p>
                  </div>
                  <Button variant="outline" size="icon" className="h-11 w-11 border-border flex-shrink-0" onClick={copyReferralLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="h-11 w-11 bg-gradient-primary flex-shrink-0" onClick={shareReferral}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Referral code</span>
                  <button onClick={copyReferralCode} className="flex items-center gap-2 text-sm font-bold text-primary tracking-wider">
                    {referralData.code} <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* IB Dashboard Stats — 2x2 grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <BarChart3 className="h-3 w-3" /> Clicks
                  </div>
                  <p className="text-lg font-bold text-foreground">{referralData.totalClicks.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Users className="h-3 w-3" /> Sign-ups
                  </div>
                  <p className="text-lg font-bold text-foreground">{referralData.totalSignups}</p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <UserCheck className="h-3 w-3" /> Active Traders
                  </div>
                  <p className="text-lg font-bold text-foreground">{referralData.activeTraders}</p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="h-3 w-3" /> This Month
                  </div>
                  <p className="text-lg font-bold text-green-500">${referralData.thisMonthEarnings.toFixed(2)}</p>
                </div>
              </div>

              {/* Volume cards by source */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <TrendingUp className="h-3 w-3" /> Futures
                  </div>
                  <p className="text-sm font-bold text-foreground">${(referralData.futuresVolume / 1000).toFixed(1)}K</p>
                  <p className="text-[10px] text-primary mt-0.5">25% comm.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <Banknote className="h-3 w-3" /> Fiat
                  </div>
                  <p className="text-sm font-bold text-foreground">${(referralData.fiatVolume / 1000).toFixed(1)}K</p>
                  <p className="text-[10px] text-primary mt-0.5">15% comm.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <ArrowRightLeft className="h-3 w-3" /> Swap
                  </div>
                  <p className="text-sm font-bold text-foreground">${(referralData.swapVolume / 1000).toFixed(1)}K</p>
                  <p className="text-[10px] text-primary mt-0.5">18% comm.</p>
                </div>
              </div>

              {/* Commission Tier Table — FXPro style */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" /> Commission Tiers
                </h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-muted-foreground text-[10px] h-9 px-2">Tier</TableHead>
                        <TableHead className="text-muted-foreground text-[10px] h-9 px-2">Clients</TableHead>
                        <TableHead className="text-right text-muted-foreground text-[10px] h-9 px-2">Futures</TableHead>
                        <TableHead className="text-right text-muted-foreground text-[10px] h-9 px-2">Fiat</TableHead>
                        <TableHead className="text-right text-muted-foreground text-[10px] h-9 px-2">Swap</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ibTiers.map((t) => (
                        <TableRow
                          key={t.tier}
                          className={`border-border ${t.current ? "bg-primary/10 hover:bg-primary/15" : ""}`}
                        >
                          <TableCell className="text-[11px] font-medium text-foreground py-2 px-2">
                            <div className="flex items-center gap-1">
                              {t.tier}
                              {t.current && <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary text-primary-foreground">YOU</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground py-2 px-2">{t.clients}</TableCell>
                          <TableCell className="text-right text-[11px] font-semibold text-primary py-2 px-2">{t.futuresPct}%</TableCell>
                          <TableCell className="text-right text-[11px] font-semibold text-primary py-2 px-2">{t.fiatPct}%</TableCell>
                          <TableCell className="text-right text-[11px] font-semibold text-primary py-2 px-2">{t.swapPct}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Earn % of trading fees from every client you refer — paid in Naira. Tier upgrades unlock automatically.
                </p>
              </div>

              {/* Kimaex Partners Benefit Program */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Kimaex Partners Benefit Program</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Welcome to our Partner Benefit Program, created to reward our most dedicated partners.
                    Earn rewards based on the total trading volume generated by your clients.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-base">🙌</div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">29 Jul 2024</p>
                    <p className="text-xs font-semibold text-foreground">You joined the Program</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gradient-primary">
                  <p className="text-[10px] font-medium text-primary-foreground/80 uppercase tracking-wide mb-1">Next benefit</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary-foreground">{benefitMilestones[currentMilestoneIndex].reward}</p>
                    <span className="text-lg font-black text-primary-foreground">{benefitMilestones[currentMilestoneIndex].volume}</span>
                  </div>
                </div>

                <div className="relative pl-6 space-y-2.5">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                  {benefitMilestones.map((m, idx) => {
                    const isNext = idx === currentMilestoneIndex;
                    const isAchieved = idx < currentMilestoneIndex;
                    return (
                      <div key={m.volume} className="relative flex items-center gap-3">
                        <div
                          className={`absolute -left-6 h-[22px] w-[22px] rounded-full flex items-center justify-center text-[10px] border-2 ${
                            isAchieved
                              ? "bg-green-500 border-green-500 text-white"
                              : isNext
                              ? "bg-primary border-primary text-primary-foreground animate-pulse"
                              : "bg-card border-border text-muted-foreground"
                          }`}
                        >
                          {isAchieved ? <Check className="h-3 w-3" /> : <span>{m.icon}</span>}
                        </div>
                        <div className={`flex-1 flex items-center justify-between p-2 rounded-md ${isNext ? "bg-primary/10 border border-primary/30" : "bg-card/50"}`}>
                          <p className={`text-[11px] ${isNext ? "font-semibold text-foreground" : "text-foreground/80"}`}>{m.reward}</p>
                          <span className={`text-[11px] font-bold ${isNext ? "text-primary" : "text-muted-foreground"}`}>{m.volume}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Reached all goals?</p>
                  <p className="text-sm font-bold text-foreground">Get extra <span className="text-primary">$100k</span></p>
                  <p className="text-[10px] text-muted-foreground">for every 500 bln in volume</p>
                </div>
              </div>

              {/* Earnings History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Recent Earnings</h3>
                  <span className="text-xs text-muted-foreground">Total: <span className="text-green-500 font-bold">${referralData.totalEarnings.toFixed(2)}</span></span>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-muted-foreground text-xs h-9">Date</TableHead>
                        <TableHead className="text-muted-foreground text-xs h-9">Source</TableHead>
                        <TableHead className="text-right text-muted-foreground text-xs h-9">Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referralEarnings.map((e) => (
                        <TableRow key={e.id} className="border-border">
                          <TableCell className="text-xs text-foreground py-2">{e.date}</TableCell>
                          <TableCell className="text-xs py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${e.source === "Futures" ? "bg-primary/15 text-primary" : e.source === "Swap" ? "bg-green-500/15 text-green-500" : "bg-muted text-foreground"}`}>
                              {e.source} • {e.pct}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-green-500 py-2">${e.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Promo Materials */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-primary" /> Promo Materials
                </h3>
                <div className="space-y-1.5">
                  {promoMaterials.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.type} • {m.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => toast.success(`${m.name} downloaded`)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Customer Care Modal - Roqqu Style */}
      <Dialog open={showCustomerCareModal} onOpenChange={setShowCustomerCareModal}>
        <DialogContent className="max-w-md bg-background border-border p-0 overflow-hidden max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-foreground">Help Center</h2>
                  <p className="text-primary-foreground/80 text-sm">We're here to help</p>
                </div>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 w-fit">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-primary-foreground">All systems operational</span>
            </div>
          </div>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 space-y-6">
              {/* Live Chat Card */}
              <div 
                className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
                onClick={handleStartChat}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Chat with us</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Typically replies in under 10 minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Send className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* Help Categories */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">How can we help?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {helpCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className="p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-all"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-medium text-foreground text-sm">{category.label}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Articles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Popular Articles</h3>
                  <button className="text-sm text-primary hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {faqArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-all"
                      onClick={() => toast.info(`Opening: ${article.title}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-foreground">{article.title}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Hours */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Support Hours</p>
                    <p className="text-xs text-muted-foreground">Monday - Sunday, 6:00 AM - 7:00 PM (WAT)</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Profile & KYC Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md bg-background border-border p-0 overflow-hidden max-h-[92vh]">
          <div className="bg-gradient-primary p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary-foreground">Profile & KYC</h2>
                <p className="text-primary-foreground/80 text-xs">
                  Status: <span className="font-semibold capitalize">{profile.kycStatus}</span>
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[72vh]">
            <div className="p-5 space-y-4">
              {/* Photo capture */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="relative h-24 w-24 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {profile.photo ? (
                    <img src={profile.photo} alt="ID selfie" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleProfilePhoto}
                  />
                  <span className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    {profile.photo ? "Retake Selfie" : "Snap Selfie"}
                  </span>
                </label>
                <p className="text-[11px] text-muted-foreground text-center">
                  Take a clear, front-facing photo for identity verification
                </p>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">First Name</label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value.slice(0, 50) })}
                    placeholder="John"
                    className="h-11 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Last Name</label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value.slice(0, 50) })}
                    placeholder="Doe"
                    className="h-11 mt-1"
                  />
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="text-xs text-muted-foreground">Date of Birth</label>
                <Input
                  type="date"
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  className="h-11 mt-1"
                />
              </div>

              {/* ID Type toggle */}
              <div>
                <label className="text-xs text-muted-foreground">ID Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {(["NIN", "BVN"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setProfile({ ...profile, idType: t })}
                      className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
                        profile.idType === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-foreground border-border"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Number */}
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5" />
                  {profile.idType} Number
                </label>
                <Input
                  inputMode="numeric"
                  value={profile.idNumber}
                  onChange={(e) =>
                    setProfile({ ...profile, idNumber: e.target.value.replace(/\D/g, "").slice(0, 11) })
                  }
                  placeholder={`Enter your 11-digit ${profile.idType}`}
                  className="h-11 mt-1 font-mono tracking-wider"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Used to verify your identity with the National Identity authority
                </p>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex gap-2">
                <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your data is encrypted and only used to comply with KYC/AML regulations.
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                className="w-full h-12 bg-gradient-primary font-semibold"
              >
                Submit for Verification
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}