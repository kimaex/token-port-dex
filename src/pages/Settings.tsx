import { Moon, Wallet, SlidersHorizontal, Shield, MessageCircle, Users, DollarSign, Key, ChevronRight, Check, Copy, Share2, Gift, X, ExternalLink, Eye, EyeOff, Lock, FileText, HelpCircle, Clock, CheckCircle, Send, Headphones, CreditCard, UserCheck, ShieldAlert, ArrowRight, TrendingUp, Award, Download, Link2, BarChart3, Wallet2, Banknote } from "lucide-react";
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

// Mock connected dApps data
const connectedDApps = [
  { id: 1, name: "Uniswap", icon: "🦄", url: "uniswap.org", connectedAt: "2 days ago" },
  { id: 2, name: "OpenSea", icon: "🌊", url: "opensea.io", connectedAt: "1 week ago" },
  { id: 3, name: "Aave", icon: "👻", url: "aave.com", connectedAt: "2 weeks ago" },
];

// Mock referral data
const referralData = {
  code: "KIMAEX2024",
  totalReferrals: 12,
  pendingRewards: 45.50,
  totalEarnings: 234.75,
  referralLink: "https://kimaex.app/ref/KIMAEX2024",
};

// Mock referral earnings history
const referralEarnings = [
  { id: 1, date: "2024-01-15", username: "user***42", amount: 45.20, contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD35" },
  { id: 2, date: "2024-01-12", username: "trad***89", amount: 32.50, contractAddress: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72" },
  { id: 3, date: "2024-01-10", username: "cry***21", amount: 28.75, contractAddress: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" },
  { id: 4, date: "2024-01-08", username: "dex***55", amount: 52.30, contractAddress: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec" },
  { id: 5, date: "2024-01-05", username: "kim***33", amount: 76.00, contractAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" },
];

export default function Settings() {
  const { currency, setCurrency } = useCurrency();
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showConnectedWallets, setShowConnectedWallets] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false);
  const [seedPhraseStep, setSeedPhraseStep] = useState<'password' | 'reveal'>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [seedPhraseRevealed, setSeedPhraseRevealed] = useState(false);
  const [connectedApps, setConnectedApps] = useState(connectedDApps);
  const [showCustomerCareModal, setShowCustomerCareModal] = useState(false);

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

  // Mock seed phrase - in real app this would be retrieved from secure storage
  const mockSeedPhrase = "abandon ability able about above absent absorb abstract absurd abuse access accident";

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
      toggleDarkMode(!darkMode);
    } else if (id === "show-seed-phrase") {
      setShowSeedPhraseModal(true);
      setSeedPhraseStep('password');
      setPassword('');
      setSeedPhraseRevealed(false);
    } else if (id === "currency") {
      setShowCurrencyModal(true);
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

  const handlePasswordSubmit = () => {
    // Mock password validation - in real app would verify against stored password
    if (password.length >= 6) {
      setSeedPhraseStep('reveal');
      toast.success("Password verified");
    } else {
      toast.error("Invalid password. Please try again.");
    }
  };

  const handleCopySeedPhrase = () => {
    navigator.clipboard.writeText(mockSeedPhrase);
    toast.success("Seed phrase copied to clipboard");
  };

  const handleCloseSeedPhraseModal = () => {
    setShowSeedPhraseModal(false);
    setSeedPhraseStep('password');
    setPassword('');
    setSeedPhraseRevealed(false);
    setShowPassword(false);
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
                        toggleDarkMode(checked);
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

      {/* Referral Modal - Ravenbank Style */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="max-w-md bg-background border-border p-0 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-primary p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground">
              Invite Friends & Earn
            </h2>
            <p className="text-primary-foreground/80 mt-2 text-sm">
              Earn USDC for every friend that signs up and trades
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Referral Code */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Your Referral Code</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-4 rounded-xl bg-muted border-2 border-dashed border-primary/30 text-center">
                  <span className="text-xl font-bold text-primary tracking-wider">
                    {referralData.code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 border-border"
                  onClick={copyReferralCode}
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-bold text-foreground">{referralData.totalReferrals}</p>
                <p className="text-xs text-muted-foreground mt-1">Referrals</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-bold text-primary">${referralData.pendingRewards.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-bold text-green-500">${referralData.totalEarnings.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </div>
            </div>

            {/* Referral Earnings Table */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-center font-medium text-foreground">
                  Refer your families and friends to Kimaex and earn <span className="text-primary font-bold">30% fees</span> when they trade
                </p>
              </div>

              <ScrollArea className="h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-right text-muted-foreground">Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralEarnings.map((earning) => (
                      <TableRow key={earning.id} className="border-border">
                        <TableCell className="text-foreground text-xs">{earning.date}</TableCell>
                        <TableCell className="text-foreground text-xs">{earning.username}</TableCell>
                        <TableCell className="text-right text-green-500 font-medium text-xs">${earning.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Total Earnings */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="text-xl font-bold text-green-500">${referralData.totalEarnings.toFixed(2)}</span>
                </div>
              </div>

              {/* Smart Contract Addresses */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Smart Contract Addresses</span>
                </div>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-2">
                    {referralEarnings.map((earning) => (
                      <div key={earning.id} className="p-2 rounded-lg bg-muted/50 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{earning.contractAddress}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(earning.contractAddress);
                            toast.success("Contract address copied!");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* How it works */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">How it works</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Share your referral code with friends</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">They sign up and complete first trade</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">You both earn $5 USDC bonus!</p>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 border-border"
                onClick={copyReferralLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                className="h-12 bg-gradient-primary hover:opacity-90"
                onClick={shareReferral}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
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

      {/* Seed Phrase Modal - Phantom Style */}
      <Dialog open={showSeedPhraseModal} onOpenChange={handleCloseSeedPhraseModal}>
        <DialogContent className="max-w-md bg-background border-border p-0 overflow-hidden">
          {seedPhraseStep === 'password' ? (
            <>
              {/* Password Verification Step */}
              <div className="p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Enter Your Password
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  To protect your wallet, please enter your password to view your seed phrase
                </p>

                <div className="relative mb-6">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-center text-lg bg-muted border-border pr-12"
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <Button
                  className="w-full h-12 bg-gradient-primary hover:opacity-90"
                  onClick={handlePasswordSubmit}
                  disabled={password.length < 1}
                >
                  Unlock
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Seed Phrase Reveal Step */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Warning</p>
                    <p className="text-xs text-muted-foreground">
                      Never share your seed phrase with anyone. Store it securely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Your Seed Phrase
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Write down these 12 words in order and store them safely
                  </p>
                </div>

                {/* Seed Phrase Grid with Blur Effect */}
                <div className="relative">
                  <div className={`grid grid-cols-3 gap-2 p-4 rounded-xl bg-muted border border-border transition-all duration-300 ${!seedPhraseRevealed ? 'blur-md select-none' : ''}`}>
                    {mockSeedPhrase.split(' ').map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border"
                      >
                        <span className="text-xs text-muted-foreground font-medium w-5">{index + 1}.</span>
                        <span className="text-sm font-medium text-foreground">{word}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reveal Overlay */}
                  {!seedPhraseRevealed && (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => setSeedPhraseRevealed(true)}
                    >
                      <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                        <Eye className="h-7 w-7 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Tap to reveal</p>
                      <p className="text-xs text-muted-foreground mt-1">Make sure no one is watching</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {seedPhraseRevealed && (
                  <div className="space-y-3 mt-4">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-border"
                      onClick={handleCopySeedPhrase}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button
                      className="w-full h-12 bg-gradient-primary hover:opacity-90"
                      onClick={handleCloseSeedPhraseModal}
                    >
                      Done
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}