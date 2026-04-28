import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Users, Shield, Lock, Fingerprint, ChevronRight, Copy, Eye, EyeOff, Check, Plus, Download, Wallet, Globe, ArrowRight, Mail, Smartphone, ScanFace } from "lucide-react";
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
    const indices = [2, 5, 9];
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
      if (referralUsername.trim()) {
        localStorage.setItem("referredBy", referralUsername.trim());
      }
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
    if (referralUsername.trim()) {
      localStorage.setItem("referredBy", referralUsername.trim());
    }
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

  // Welcome Step - Binance-style Login / Register tabs
  if (currentStep === "welcome") {
    return <BinanceWelcome onLogin={() => setCurrentStep("import")} onRegister={handleCreateWallet} />;
  }

  // Create Wallet - Show Seed Phrase
  if (currentStep === "create") {
    return (
      <div className="min-h-screen bg-background flex flex-col p-5 relative">
        <div className="absolute top-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[100px]" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
          <div className="text-center mb-6 pt-6">
            <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-glow)]">
              <KeyRound className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Secret Recovery Phrase</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Write down these 12 words and store them safely
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
            <p className="text-xs text-destructive text-center font-medium">
              ⚠️ Anyone with this phrase can access your wallet
            </p>
          </div>

          <div className="relative flex-1">
            <div className={`grid grid-cols-3 gap-2 ${!showSeedPhrase ? 'blur-md' : ''}`}>
              {generatedSeedPhrase.map((word, index) => (
                <div
                  key={index}
                  className="bg-secondary border border-border rounded-xl p-2.5 text-center"
                >
                  <span className="text-[10px] text-muted-foreground">{index + 1}.</span>
                  <span className="ml-1 font-medium text-sm text-foreground">{word}</span>
                </div>
              ))}
            </div>
            {!showSeedPhrase && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="secondary" onClick={() => setShowSeedPhrase(true)} className="gap-2 rounded-xl">
                  <Eye className="h-4 w-4" /> Reveal Phrase
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleCopySeedPhrase} className="flex-1 rounded-xl" disabled={!showSeedPhrase}>
              {seedPhraseCopied ? <><Check className="mr-1.5 h-4 w-4 text-success" /> Copied</> : <><Copy className="mr-1.5 h-4 w-4" /> Copy</>}
            </Button>
            <Button variant="outline" onClick={() => setShowSeedPhrase(!showSeedPhrase)} className="flex-1 rounded-xl">
              {showSeedPhrase ? <><EyeOff className="mr-1.5 h-4 w-4" /> Hide</> : <><Eye className="mr-1.5 h-4 w-4" /> Show</>}
            </Button>
          </div>

          {/* Inline referral code */}
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="referral-create" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Referral Code (Optional)
            </Label>
            <Input
              id="referral-create"
              type="text"
              placeholder="Enter referrer's username"
              value={referralUsername}
              onChange={(e) => setReferralUsername(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button onClick={handleProceedToVerify} className="w-full mt-4 h-13 rounded-xl font-semibold" size="lg" disabled={!showSeedPhrase}>
            I've Saved It <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Verify Seed Phrase
  if (currentStep === "verify") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-glow)]">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Verify Your Phrase</h1>
            <p className="text-sm text-muted-foreground mt-1">Confirm you've saved it correctly</p>
          </div>

          <div className="space-y-4">
            {verificationWords.map(({ index }) => (
              <div key={index} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Word #{index + 1}</Label>
                <Input
                  type="text"
                  placeholder={`Enter word #${index + 1}`}
                  value={userVerification[index] || ""}
                  onChange={(e) => setUserVerification({ ...userVerification, [index]: e.target.value.toLowerCase() })}
                  className="text-center rounded-xl h-12"
                />
              </div>
            ))}
          </div>

          <Button onClick={handleVerifySeedPhrase} className="w-full h-13 rounded-xl font-semibold" size="lg" disabled={verificationWords.some(({ index }) => !userVerification[index])}>
            Verify & Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="ghost" onClick={() => setCurrentStep("create")} className="w-full">Go Back</Button>
        </div>
      </div>
    );
  }

  // Import Wallet
  if (currentStep === "import") {
    return (
      <div className="min-h-screen bg-background flex flex-col p-5 relative">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[100px]" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
          <div className="text-center mb-6 pt-6">
            <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-glow)]">
              <Download className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Import Wallet</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your 12-word recovery phrase</p>
          </div>

          <Button variant="outline" onClick={handlePasteFullPhrase} className="w-full mb-4 rounded-xl h-11 gap-2">
            <Copy className="h-4 w-4" /> Paste Full Phrase
          </Button>

          <div className="grid grid-cols-3 gap-2 flex-1">
            {importSeedPhrase.map((word, index) => (
              <div key={index} className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{index + 1}.</span>
                <Input
                  type="text"
                  value={word}
                  onChange={(e) => handleImportWordChange(index, e.target.value)}
                  className="pl-7 text-sm h-11 rounded-xl"
                  placeholder="..."
                />
              </div>
            ))}
          </div>

          {/* Inline referral code */}
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="referral-import" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Referral Code (Optional)
            </Label>
            <Input
              id="referral-import"
              type="text"
              placeholder="Enter referrer's username"
              value={referralUsername}
              onChange={(e) => setReferralUsername(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button onClick={handleImportWallet} className="w-full mt-4 h-13 rounded-xl font-semibold" size="lg" disabled={importSeedPhrase.filter(w => w.length > 0).length !== 12}>
            Import Wallet <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="ghost" onClick={() => setCurrentStep("welcome")} className="w-full mt-2">Go Back</Button>
        </div>
      </div>
    );
  }

  // Referral Step
  if (currentStep === "referral") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[100px]" />
        
        <div className="max-w-md w-full space-y-6 relative z-10">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-glow)]">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Referral Code</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter a code to get bonus rewards</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral" className="text-xs text-muted-foreground">Referral Username (Optional)</Label>
            <Input
              id="referral"
              type="text"
              placeholder="Enter referral username"
              value={referralUsername}
              onChange={(e) => setReferralUsername(e.target.value)}
              className="rounded-xl h-12"
            />
          </div>

          <div className="space-y-3">
            <Button onClick={handleReferralSubmit} className="w-full h-13 rounded-xl font-semibold" size="lg">
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={handleSkipReferral} variant="ghost" className="w-full">Skip for now</Button>
          </div>
        </div>
      </div>
    );
  }

  // Security Step
  if (currentStep === "security") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative">
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[100px]" />
        
        <div className="max-w-md w-full space-y-5 relative z-10">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-glow)]">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Secure Your Wallet</h1>
            <p className="text-sm text-muted-foreground mt-1">Set up security to protect your assets</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-xs text-muted-foreground">Create 6-digit PIN</Label>
              <Input id="pin" type="password" placeholder="••••••" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="rounded-xl h-12 text-center tracking-[0.5em]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPin" className="text-xs text-muted-foreground">Confirm PIN</Label>
              <Input id="confirmPin" type="password" placeholder="••••••" maxLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} className="rounded-xl h-12 text-center tracking-[0.5em]" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Biometric Login</p>
                  <p className="text-xs text-muted-foreground">Fingerprint or Face ID</p>
                </div>
              </div>
              <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Two-Factor Auth</p>
                  <p className="text-xs text-muted-foreground">Extra security layer</p>
                </div>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>
          </div>

          <Button onClick={handleSecuritySubmit} className="w-full h-13 rounded-xl font-semibold" size="lg">
            Complete Setup <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default Auth;
