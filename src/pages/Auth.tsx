import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound, Users, Shield, Lock, Fingerprint, ChevronRight, Copy, Eye, EyeOff, Check, Plus, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type AuthStep = "welcome" | "create" | "verify" | "import" | "referral" | "security";

const WORD_LIST = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
  "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
  "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
  "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
  "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
  "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
  "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
  "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
  "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
  "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest",
  "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset",
  "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction",
  "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake",
  "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge",
  "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain",
  "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become",
  "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit",
  "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology",
  "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless",
  "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body"
];

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AuthStep>("welcome");
  const [generatedSeedPhrase, setGeneratedSeedPhrase] = useState<string[]>([]);
  const [importSeedPhrase, setImportSeedPhrase] = useState<string[]>(Array(12).fill(""));
  const [verificationWords, setVerificationWords] = useState<{ index: number; word: string }[]>([]);
  const [userVerification, setUserVerification] = useState<{ [key: number]: string }>({});
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false);
  const [referralUsername, setReferralUsername] = useState("");
  
  // Security settings
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const generateSeedPhrase = () => {
    const phrase: string[] = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
      phrase.push(WORD_LIST[randomIndex]);
    }
    return phrase;
  };

  const handleCreateWallet = () => {
    const newPhrase = generateSeedPhrase();
    setGeneratedSeedPhrase(newPhrase);
    
    // Select 3 random words for verification
    const indices = [2, 5, 9]; // Words 3, 6, 10
    const verification = indices.map(i => ({ index: i, word: newPhrase[i] }));
    setVerificationWords(verification);
    setCurrentStep("create");
  };

  const handleCopySeedPhrase = () => {
    navigator.clipboard.writeText(generatedSeedPhrase.join(" "));
    setSeedPhraseCopied(true);
    toast.success("Seed phrase copied to clipboard");
    setTimeout(() => setSeedPhraseCopied(false), 3000);
  };

  const handleProceedToVerify = () => {
    setCurrentStep("verify");
  };

  const handleVerifySeedPhrase = () => {
    const isValid = verificationWords.every(
      ({ index, word }) => userVerification[index]?.toLowerCase() === word.toLowerCase()
    );

    if (isValid) {
      localStorage.setItem("walletSeedPhrase", generatedSeedPhrase.join(" "));
      toast.success("Wallet created successfully!");
      setCurrentStep("referral");
    } else {
      toast.error("Verification failed. Please check your seed phrase.");
    }
  };

  const handleImportWallet = () => {
    const phrase = importSeedPhrase.join(" ").trim();
    const words = phrase.split(" ").filter(w => w.length > 0);
    
    if (words.length !== 12) {
      toast.error("Please enter all 12 words");
      return;
    }

    localStorage.setItem("walletSeedPhrase", phrase);
    toast.success("Wallet imported successfully!");
    setCurrentStep("referral");
  };

  const handleImportWordChange = (index: number, value: string) => {
    const newPhrase = [...importSeedPhrase];
    newPhrase[index] = value.toLowerCase().trim();
    setImportSeedPhrase(newPhrase);
  };

  const handlePasteFullPhrase = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const words = text.trim().split(/\s+/).slice(0, 12);
      const newPhrase = [...Array(12).fill("")];
      words.forEach((word, i) => {
        if (i < 12) newPhrase[i] = word.toLowerCase();
      });
      setImportSeedPhrase(newPhrase);
      toast.success("Seed phrase pasted!");
    } catch {
      toast.error("Failed to paste from clipboard");
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
    
    toast.success("Wallet setup complete!");
    navigate("/");
  };

  // Welcome Step
  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <KeyRound className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Kimaex</CardTitle>
            <CardDescription>
              Your gateway to Web3. Secure, fast, and decentralized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleCreateWallet}
              className="w-full h-14 text-base"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Wallet
            </Button>
            <Button
              onClick={() => setCurrentStep("import")}
              variant="outline"
              className="w-full h-14 text-base"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Import Existing Wallet
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create Wallet - Show Seed Phrase
  if (currentStep === "create") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">Your Secret Recovery Phrase</CardTitle>
            <CardDescription className="text-center">
              Write down these 12 words in order and store them safely. Never share them with anyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-sm text-destructive text-center font-medium">
                ⚠️ Anyone with this phrase can access your wallet
              </p>
            </div>

            <div className="relative">
              <div className={`grid grid-cols-3 gap-2 ${!showSeedPhrase ? 'blur-md' : ''}`}>
                {generatedSeedPhrase.map((word, index) => (
                  <div
                    key={index}
                    className="bg-secondary/50 border border-border rounded-lg p-2 text-center"
                  >
                    <span className="text-xs text-muted-foreground">{index + 1}.</span>
                    <span className="ml-1 font-medium text-sm">{word}</span>
                  </div>
                ))}
              </div>
              {!showSeedPhrase && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowSeedPhrase(true)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Reveal Seed Phrase
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopySeedPhrase}
                className="flex-1"
                disabled={!showSeedPhrase}
              >
                {seedPhraseCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                className="flex-1"
              >
                {showSeedPhrase ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={handleProceedToVerify}
              className="w-full"
              size="lg"
              disabled={!showSeedPhrase}
            >
              I've Saved My Seed Phrase
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verify Seed Phrase
  if (currentStep === "verify") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">Verify Your Seed Phrase</CardTitle>
            <CardDescription className="text-center">
              Enter the words from your seed phrase to verify you've saved it correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {verificationWords.map(({ index }) => (
              <div key={index} className="space-y-2">
                <Label>Word #{index + 1}</Label>
                <Input
                  type="text"
                  placeholder={`Enter word #${index + 1}`}
                  value={userVerification[index] || ""}
                  onChange={(e) =>
                    setUserVerification({
                      ...userVerification,
                      [index]: e.target.value.toLowerCase(),
                    })
                  }
                  className="text-center"
                />
              </div>
            ))}

            <Button
              onClick={handleVerifySeedPhrase}
              className="w-full"
              size="lg"
              disabled={verificationWords.some(({ index }) => !userVerification[index])}
            >
              Verify & Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setCurrentStep("create")}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Import Wallet
  if (currentStep === "import") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">Import Your Wallet</CardTitle>
            <CardDescription className="text-center">
              Enter your 12-word recovery phrase to restore your wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handlePasteFullPhrase}
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Paste Full Phrase
            </Button>

            <div className="grid grid-cols-3 gap-2">
              {importSeedPhrase.map((word, index) => (
                <div key={index} className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {index + 1}.
                  </span>
                  <Input
                    type="text"
                    value={word}
                    onChange={(e) => handleImportWordChange(index, e.target.value)}
                    className="pl-6 text-sm h-10"
                    placeholder="..."
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleImportWallet}
              className="w-full"
              size="lg"
              disabled={importSeedPhrase.filter(w => w.length > 0).length !== 12}
            >
              Import Wallet
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setCurrentStep("welcome")}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Referral Step
  if (currentStep === "referral") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card border-border/50">
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
        <Card className="w-full max-w-md shadow-card border-border/50">
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

  return null;
};

export default Auth;