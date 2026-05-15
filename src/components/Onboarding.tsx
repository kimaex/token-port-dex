import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, Wallet, Zap, Banknote, Fingerprint, ScanFace, Lock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OnboardingProps {
  onComplete: () => void;
}

type OnboardingStep = "slides" | "pin-setup" | "biometric-setup";

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [step, setStep] = useState<OnboardingStep>("slides");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [pinError, setPinError] = useState("");

  const slides = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your keys, your crypto. Full control with bank-level security.",
    },
    {
      icon: Wallet,
      title: "Your Solana Wallet",
      description: "Built for memecoins and prediction markets. Trade, swap, and bet on Solana — all in one place.",
    },
    {
      icon: Banknote,
      title: "Fiat Access",
      description: "Buy and sell crypto with local currencies. Mobile money, bank transfers, and cards supported across Africa.",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // After welcome slides, send user to register/login first.
      // PIN & biometric setup happens after registration in the Auth flow.
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePinChange = (value: string) => {
    setPinError("");
    if (isConfirming) {
      setConfirmPin(value);
      if (value.length === 6) {
        if (value === pin) {
          // PIN confirmed, move to biometric setup
          setStep("biometric-setup");
        } else {
          setPinError("PINs don't match. Try again.");
          setConfirmPin("");
        }
      }
    } else {
      setPin(value);
      if (value.length === 6) {
        setIsConfirming(true);
      }
    }
  };

  const handleBiometricChoice = (choice: "face" | "fingerprint" | "skip") => {
    // Save the choice (in real app, would enable biometric auth)
    console.log("Biometric choice:", choice);
    onComplete();
  };

  const CurrentIcon = slides[currentSlide]?.icon;

  // PIN Setup Screen
  if (step === "pin-setup") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Lock className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              {isConfirming ? "Confirm Your PIN" : "Create Security PIN"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isConfirming 
                ? "Enter your 6-digit PIN again to confirm" 
                : "Set up a 6-digit PIN to secure your wallet"}
            </p>
          </div>

          <div className="flex justify-center py-8">
            <InputOTP
              maxLength={6}
              value={isConfirming ? confirmPin : pin}
              onChange={handlePinChange}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-14 text-xl border-border" />
                <InputOTPSlot index={1} className="w-12 h-14 text-xl border-border" />
                <InputOTPSlot index={2} className="w-12 h-14 text-xl border-border" />
                <InputOTPSlot index={3} className="w-12 h-14 text-xl border-border" />
                <InputOTPSlot index={4} className="w-12 h-14 text-xl border-border" />
                <InputOTPSlot index={5} className="w-12 h-14 text-xl border-border" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {pinError && (
            <p className="text-center text-destructive text-sm">{pinError}</p>
          )}

          <div className="flex justify-center gap-2 py-4">
            <div className={`h-2 rounded-full transition-all ${!isConfirming ? "w-8 bg-primary" : "w-2 bg-muted"}`} />
            <div className={`h-2 rounded-full transition-all ${isConfirming ? "w-8 bg-primary" : "w-2 bg-muted"}`} />
          </div>
        </div>
      </div>
    );
  }

  // Biometric Setup Screen
  if (step === "biometric-setup") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Fingerprint className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Biometric Security</h1>
            <p className="text-lg text-muted-foreground">
              Enable quick and secure access with biometric authentication
            </p>
          </div>

          <div className="space-y-3 pt-8">
            <Button 
              onClick={() => handleBiometricChoice("face")} 
              variant="outline"
              className="w-full h-16 justify-start gap-4 text-left"
              size="lg"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ScanFace className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Face ID</p>
                <p className="text-sm text-muted-foreground">Use facial recognition</p>
              </div>
            </Button>

            <Button 
              onClick={() => handleBiometricChoice("fingerprint")} 
              variant="outline"
              className="w-full h-16 justify-start gap-4 text-left"
              size="lg"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Fingerprint</p>
                <p className="text-sm text-muted-foreground">Use fingerprint scanner</p>
              </div>
            </Button>

            <Button 
              onClick={() => handleBiometricChoice("skip")} 
              variant="ghost"
              className="w-full mt-4"
              size="lg"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Slides Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <CurrentIcon className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{slides[currentSlide].title}</h1>
          <p className="text-lg text-muted-foreground">{slides[currentSlide].description}</p>
        </div>

        <div className="flex justify-center gap-2 py-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="space-y-3 pt-4">
          <Button onClick={handleNext} className="w-full" size="lg">
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          {currentSlide < slides.length - 1 && (
            <Button onClick={handleSkip} variant="ghost" className="w-full" size="lg">
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
