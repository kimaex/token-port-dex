import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, Wallet, Zap } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your keys, your crypto. Full control with bank-level security.",
    },
    {
      icon: Wallet,
      title: "Multi-Chain Support",
      description: "Manage Bitcoin, Ethereum, and thousands of other cryptocurrencies in one place.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant swaps, NFT trading, and DApp access. Your gateway to Web3.",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const CurrentIcon = slides[currentSlide].icon;

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
