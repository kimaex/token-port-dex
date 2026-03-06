import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, X, Lock, Unlock, AlertTriangle, Eye, TrendingUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShieldResult {
  riskLevel: "safe" | "medium" | "dangerous";
  riskScore: number;
  liquidityLocked: boolean;
  liquidityLockDuration: string;
  devWalletHolding: number;
  sellTax: number;
  buyTax: number;
  honeypot: boolean;
  suspiciousTransactions: number;
  socialSentiment: "positive" | "neutral" | "negative";
  contractVerified: boolean;
  warnings: string[];
}

// Simulated risk data per token
const TOKEN_RISK_DATA: Record<string, ShieldResult> = {
  BTC: { riskLevel: "safe", riskScore: 95, liquidityLocked: true, liquidityLockDuration: "Permanent", devWalletHolding: 0, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 0, socialSentiment: "positive", contractVerified: true, warnings: [] },
  ETH: { riskLevel: "safe", riskScore: 97, liquidityLocked: true, liquidityLockDuration: "Permanent", devWalletHolding: 0, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 0, socialSentiment: "positive", contractVerified: true, warnings: [] },
  USDC: { riskLevel: "safe", riskScore: 99, liquidityLocked: true, liquidityLockDuration: "N/A - Stablecoin", devWalletHolding: 0, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 0, socialSentiment: "positive", contractVerified: true, warnings: [] },
  USDT: { riskLevel: "safe", riskScore: 93, liquidityLocked: true, liquidityLockDuration: "N/A - Stablecoin", devWalletHolding: 0, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 0, socialSentiment: "neutral", contractVerified: true, warnings: ["Centralized control by issuer"] },
  SOL: { riskLevel: "safe", riskScore: 88, liquidityLocked: true, liquidityLockDuration: "Permanent", devWalletHolding: 2, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 0, socialSentiment: "positive", contractVerified: true, warnings: [] },
  BNB: { riskLevel: "safe", riskScore: 85, liquidityLocked: true, liquidityLockDuration: "Permanent", devWalletHolding: 5, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 2, socialSentiment: "positive", contractVerified: true, warnings: ["Exchange-controlled token"] },
  XRP: { riskLevel: "medium", riskScore: 72, liquidityLocked: true, liquidityLockDuration: "Escrowed", devWalletHolding: 15, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 5, socialSentiment: "neutral", contractVerified: true, warnings: ["High developer/foundation holding", "Regulatory uncertainty"] },
  ADA: { riskLevel: "safe", riskScore: 82, liquidityLocked: true, liquidityLockDuration: "Permanent", devWalletHolding: 3, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 1, socialSentiment: "positive", contractVerified: true, warnings: [] },
  DOGE: { riskLevel: "medium", riskScore: 65, liquidityLocked: true, liquidityLockDuration: "Permanent", devWalletHolding: 0, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 8, socialSentiment: "neutral", contractVerified: true, warnings: ["High volatility", "Meme token - speculative", "Whale concentration detected"] },
  MATIC: { riskLevel: "safe", riskScore: 80, liquidityLocked: true, liquidityLockDuration: "Permanent", devWalletHolding: 4, sellTax: 0, buyTax: 0, honeypot: false, suspiciousTransactions: 1, socialSentiment: "positive", contractVerified: true, warnings: [] },
};

const DEFAULT_RISK: ShieldResult = {
  riskLevel: "dangerous", riskScore: 25, liquidityLocked: false, liquidityLockDuration: "None", devWalletHolding: 45, sellTax: 25, buyTax: 15, honeypot: true, suspiciousTransactions: 42, socialSentiment: "negative", contractVerified: false, warnings: ["High chance of rug pull", "Honeypot detected - cannot sell", "Unverified contract", "Dev wallet holds 45%", "Excessive sell tax: 25%"],
};

const SCAN_STEPS = [
  { label: "Analyzing smart contract", icon: Eye },
  { label: "Checking liquidity lock", icon: Lock },
  { label: "Detecting honeypot patterns", icon: AlertTriangle },
  { label: "Checking developer wallets", icon: TrendingUp },
  { label: "Monitoring transactions", icon: Shield },
  { label: "Scanning social sentiment", icon: MessageCircle },
];

interface KimaexShieldProps {
  tokenSymbol: string;
  tokenName: string;
  onClose: () => void;
  onProceed: () => void;
}

export default function KimaexShield({ tokenSymbol, tokenName, onClose, onProceed }: KimaexShieldProps) {
  const [scanning, setScanning] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<ShieldResult | null>(null);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= SCAN_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setResult(TOKEN_RISK_DATA[tokenSymbol] || DEFAULT_RISK);
            setScanning(false);
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [scanning, tokenSymbol]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "safe": return "text-green-400";
      case "medium": return "text-amber-400";
      case "dangerous": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "safe": return "bg-green-500/10 border-green-500/30";
      case "medium": return "bg-amber-500/10 border-amber-500/30";
      case "dangerous": return "bg-red-500/10 border-red-500/30";
      default: return "bg-secondary/30 border-border";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "safe": return <ShieldCheck className="h-10 w-10 text-green-400" />;
      case "medium": return <ShieldAlert className="h-10 w-10 text-amber-400" />;
      case "dangerous": return <ShieldX className="h-10 w-10 text-red-400" />;
      default: return <Shield className="h-10 w-10" />;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "safe": return "Safe ✅";
      case "medium": return "Medium Risk ⚠️";
      case "dangerous": return "Dangerous 🚨";
      default: return "Unknown";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Kimaex Shield 🛡️</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Token Info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Scanning token</p>
            <p className="text-xl font-bold mt-1">{tokenName} ({tokenSymbol})</p>
          </div>

          {scanning ? (
            /* Scanning Animation */
            <div className="space-y-3 py-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Shield className="h-16 w-16 text-primary animate-pulse" />
                  <div className="absolute inset-0 h-16 w-16 border-2 border-primary/30 rounded-full animate-ping" />
                </div>
              </div>
              {SCAN_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive ? "bg-primary/10 border border-primary/30" : isDone ? "opacity-60" : "opacity-30"
                    }`}
                  >
                    <StepIcon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary animate-spin" : isDone ? "text-green-400" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {isDone && <ShieldCheck className="h-4 w-4 text-green-400 ml-auto" />}
                  </div>
                );
              })}
            </div>
          ) : result ? (
            /* Results */
            <div className="space-y-3">
              {/* Risk Badge */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${getRiskBg(result.riskLevel)}`}>
                {getRiskIcon(result.riskLevel)}
                <div>
                  <p className={`text-lg font-bold ${getRiskColor(result.riskLevel)}`}>
                    {getRiskLabel(result.riskLevel)}
                  </p>
                  <p className="text-sm text-muted-foreground">Risk Assessment Complete</p>
                </div>
              </div>

              {/* Score Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={`font-bold ${getScoreColor(result.riskScore)}`}>{result.riskScore}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${getScoreBarColor(result.riskScore)}`}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="bg-secondary/30 rounded-xl p-3 space-y-2 text-sm max-h-[200px] overflow-y-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    {result.liquidityLocked ? <Lock className="h-3 w-3 text-green-400" /> : <Unlock className="h-3 w-3 text-red-400" />}
                    Liquidity Locked
                  </span>
                  <span className={result.liquidityLocked ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {result.liquidityLocked ? `Yes (${result.liquidityLockDuration})` : "No ❌"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dev Wallet Holding</span>
                  <span className={result.devWalletHolding > 20 ? "text-red-400 font-medium" : result.devWalletHolding > 10 ? "text-amber-400 font-medium" : "text-green-400 font-medium"}>
                    {result.devWalletHolding}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sell Tax</span>
                  <span className={result.sellTax > 10 ? "text-red-400 font-medium" : result.sellTax > 5 ? "text-amber-400 font-medium" : "text-green-400 font-medium"}>
                    {result.sellTax}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy Tax</span>
                  <span className={result.buyTax > 10 ? "text-red-400 font-medium" : result.buyTax > 5 ? "text-amber-400 font-medium" : "text-green-400 font-medium"}>
                    {result.buyTax}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Honeypot</span>
                  <span className={result.honeypot ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
                    {result.honeypot ? "Yes 🚨" : "No ✅"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Verified</span>
                  <span className={result.contractVerified ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {result.contractVerified ? "Yes ✅" : "No ❌"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suspicious Txns</span>
                  <span className={result.suspiciousTransactions > 10 ? "text-red-400 font-medium" : result.suspiciousTransactions > 3 ? "text-amber-400 font-medium" : "text-green-400 font-medium"}>
                    {result.suspiciousTransactions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Social Sentiment</span>
                  <span className={result.socialSentiment === "positive" ? "text-green-400 font-medium" : result.socialSentiment === "neutral" ? "text-amber-400 font-medium" : "text-red-400 font-medium"}>
                    {result.socialSentiment === "positive" ? "Positive 📈" : result.socialSentiment === "neutral" ? "Neutral ➡️" : "Negative 📉"}
                  </span>
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="space-y-1.5">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-amber-300">{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={onProceed}
                  className={`flex-1 ${result.riskLevel === "dangerous" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                >
                  {result.riskLevel === "dangerous" ? "Proceed Anyway" : "Continue"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
