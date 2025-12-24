import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { KeyRound, Users, Shield, Lock, Fingerprint, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type AuthStep = "auth" | "referral" | "security";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [currentStep, setCurrentStep] = useState<AuthStep>("auth");
  const [referralUsername, setReferralUsername] = useState("");
  
  // Security settings
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSeedPhraseAuth = async (type: "import" | "create") => {
    setLoading(true);
    try {
      if (type === "create") {
        const newSeedPhrase = generateSeedPhrase();
        setSeedPhrase(newSeedPhrase);
        toast.success("Seed phrase generated! Please save it securely.");
      } else {
        if (!seedPhrase.trim()) {
          toast.error("Please enter your seed phrase");
          setLoading(false);
          return;
        }
        toast.success("Wallet imported successfully!");
        setCurrentStep("referral");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReferralSubmit = () => {
    if (referralUsername.trim()) {
      localStorage.setItem("referredBy", referralUsername.trim());
      toast.success("Referral code applied!");
    }
    setCurrentStep("security");
  };

  const handleSkipReferral = () => {
    setCurrentStep("security");
  };

  const handleSecuritySubmit = () => {
    if (pin && pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    
    if (pin) {
      localStorage.setItem("walletPin", pin);
    }
    localStorage.setItem("biometricEnabled", String(biometricEnabled));
    localStorage.setItem("twoFactorEnabled", String(twoFactorEnabled));
    
    toast.success("Security settings saved!");
    navigate("/");
  };

  const generateSeedPhrase = () => {
    const words = ["wallet", "secure", "crypto", "blockchain", "token", "digital", "asset", "trade", "network", "protocol", "ledger", "exchange"];
    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
  };

  // Referral Step
  if (currentStep === "referral") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="space-y-1">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Referral Code</CardTitle>
            <CardDescription className="text-center">
              Enter a referral username to get bonus rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="referral">Referral Username (Optional)</Label>
              <Input
                id="referral"
                type="text"
                placeholder="Enter referral username"
                value={referralUsername}
                onChange={(e) => setReferralUsername(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Button onClick={handleReferralSubmit} className="w-full" size="lg">
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={handleSkipReferral} variant="ghost" className="w-full" size="lg">
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Security Step
  if (currentStep === "security") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="space-y-1">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Secure Your Wallet</CardTitle>
            <CardDescription className="text-center">
              Set up security to protect your assets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PIN Setup */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <Lock className="w-5 h-5 text-primary" />
                <span className="font-medium">Set PIN Code</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Create 6-digit PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="••••••"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  placeholder="••••••"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            {/* Biometric */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Biometric Login</p>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                </div>
              </div>
              <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Two-Factor Auth</p>
                  <p className="text-sm text-muted-foreground">Extra security layer</p>
                </div>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>

            <Button onClick={handleSecuritySubmit} className="w-full" size="lg">
              Complete Setup
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth Step (default) - Only Seed Phrase
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="space-y-1">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome to kimaex</CardTitle>
          <CardDescription className="text-center">Import or create a wallet using your seed phrase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seedPhrase">12-Word Seed Phrase</Label>
            <Textarea
              id="seedPhrase"
              placeholder="Enter your 12-word seed phrase separated by spaces"
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => handleSeedPhraseAuth("import")}
              disabled={loading}
              className="w-full"
            >
              Import Wallet
            </Button>
            <Button
              onClick={() => handleSeedPhraseAuth("create")}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Generate New Seed Phrase
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;