import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Building2,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomNav } from "@/components/BottomNav";
import { TransactionPinDialog } from "@/components/TransactionPinDialog";
import { toast } from "sonner";
import {
  Beneficiary,
  NIGERIAN_BANKS,
  WITHDRAWAL_FEE_NGN,
  fmtNGN,
  getBeneficiaries,
  removeBeneficiary,
  saveBeneficiary,
  useNaira,
} from "@/lib/naira";

const DEPOSIT_ACCOUNT = {
  accountName: "Kimaex / Jibrin Khakima",
  bankName: "Providus Bank",
  accountNumber: "9902457183",
};

const Fiat = () => {
  const navigate = useNavigate();
  const { balance, debit } = useNaira();
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [copied, setCopied] = useState<string | null>(null);

  // Sell state
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [saveBene, setSaveBene] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(getBeneficiaries);
  const [review, setReview] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [success, setSuccess] = useState<null | { amount: number; to: string }>(null);

  const amt = parseFloat(amount) || 0;
  const receive = Math.max(0, amt - WITHDRAWAL_FEE_NGN);

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 1500);
  };

  const canReview = useMemo(
    () =>
      bank.length > 0 &&
      accountNumber.length === 10 &&
      accountName.trim().length > 2 &&
      amt > WITHDRAWAL_FEE_NGN,
    [bank, accountNumber, accountName, amt]
  );

  const startWithdrawal = () => {
    if (amt > balance) {
      toast.error("Amount is more than your balance");
      return;
    }
    setReview(true);
  };

  const completeWithdrawal = () => {
    debit(amt);
    if (saveBene) {
      const b: Beneficiary = {
        id: "B-" + Date.now().toString(36),
        bank,
        accountNumber,
        accountName,
      };
      saveBeneficiary(b);
      setBeneficiaries(getBeneficiaries());
    }
    setReview(false);
    setSuccess({ amount: amt, to: `${accountName} · ${bank}` });
    setAmount("");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-5">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold">Transfer successful</h1>
        <p className="text-3xl font-bold mt-3 tabular-nums">
          {fmtNGN(success.amount - WITHDRAWAL_FEE_NGN)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">sent to {success.to}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Fee {fmtNGN(WITHDRAWAL_FEE_NGN)} · arrives within minutes
        </p>
        <div className="w-full max-w-sm space-y-2 mt-8">
          <Button className="w-full h-12" onClick={() => setSuccess(null)}>
            Make another transfer
          </Button>
          <Button
            variant="secondary"
            className="w-full h-12"
            onClick={() => navigate("/")}
          >
            Back to wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Add & withdraw money</h1>
        </div>

        {/* Balance */}
        <div className="px-4">
          <div className="rounded-2xl bg-gradient-primary p-5 shadow-glow">
            <p className="text-xs text-primary-foreground/80">Wallet balance</p>
            <p className="text-3xl font-bold text-primary-foreground tabular-nums mt-1">
              {fmtNGN(balance)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
            {(["buy", "sell"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                  tab === t
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground"
                }`}
              >
                {t === "buy" ? "Add money" : "Withdraw"}
              </button>
            ))}
          </div>
        </div>

        {tab === "buy" ? (
          <div className="px-4 pt-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Transfer to this account</p>
              </div>

              {[
                { label: "Your Name", value: DEPOSIT_ACCOUNT.accountName },
                { label: "Bank Name", value: DEPOSIT_ACCOUNT.bankName },
                { label: "Account Number", value: DEPOSIT_ACCOUNT.accountNumber },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{row.label}</p>
                    <p className="text-base font-semibold truncate">{row.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(row.label, row.value)}
                  >
                    {copied === row.label ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center px-4">
              Send any amount from your bank app to the account above. Your Kimaex
              balance updates automatically, usually in under a minute.
            </p>

            <Button
              className="w-full h-12"
              onClick={() =>
                toast.success("We'll credit your balance as soon as the transfer lands")
              }
            >
              I have sent the money
            </Button>
          </div>
        ) : (
          <div className="px-4 pt-4 space-y-4">
            {beneficiaries.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Saved accounts</p>
                <div className="space-y-2">
                  {beneficiaries.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <button
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                        onClick={() => {
                          setBank(b.bank);
                          setAccountNumber(b.accountNumber);
                          setAccountName(b.accountName);
                        }}
                      >
                        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                          {b.accountName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {b.accountName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {b.bank} · {b.accountNumber}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          removeBeneficiary(b.id);
                          setBeneficiaries(getBeneficiaries());
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Bank Name</label>
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger className="h-12 mt-1">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {NIGERIAN_BANKS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Account Number</label>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="0123456789"
                  className="h-12 mt-1 text-base tracking-wider"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Account Name</label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Jibrin Khakima"
                  className="h-12 mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Amount (₦)</label>
                  <button
                    className="text-xs text-primary font-semibold"
                    onClick={() => setAmount(balance.toFixed(2))}
                  >
                    Use all · {fmtNGN(balance, 0)}
                  </button>
                </div>
                <Input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 mt-1 text-2xl font-bold"
                />
                <div className="flex gap-2 mt-2">
                  {[1000, 5000, 10000, 50000].map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      className="flex-1 text-[11px] py-2 rounded-lg bg-muted text-muted-foreground"
                    >
                      {fmtNGN(q, 0)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="flex items-center gap-2 text-xs text-muted-foreground"
                onClick={() => setSaveBene((s) => !s)}
              >
                <span
                  className={`h-4 w-4 rounded border flex items-center justify-center ${
                    saveBene ? "bg-primary border-primary" : "border-border"
                  }`}
                >
                  {saveBene && <Check className="h-3 w-3 text-primary-foreground" />}
                </span>
                Save as beneficiary
              </button>
            </div>

            <Button
              className="w-full h-12"
              disabled={!canReview}
              onClick={startWithdrawal}
            >
              Continue
            </Button>
          </div>
        )}

        <BottomNav />
      </div>

      {/* Review sheet */}
      {review && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Confirm transfer</h2>
              <p className="text-xs text-muted-foreground">
                {accountName} · {bank} · {accountNumber}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount to Sell</span>
                <span className="font-semibold tabular-nums">{fmtNGN(amt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-semibold tabular-nums">
                  {fmtNGN(WITHDRAWAL_FEE_NGN)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">You Receive</span>
                <span className="text-lg font-bold tabular-nums">
                  {fmtNGN(receive)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 h-12"
                onClick={() => setReview(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 h-12" onClick={() => setPinOpen(true)}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      <TransactionPinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSuccess={completeWithdrawal}
        title="Confirm withdrawal"
        description={`Enter your PIN to send ${fmtNGN(receive)} to ${accountName || "your bank"}.`}
      />

      {/* keep icon import used */}
      <span className="hidden">
        <Plus />
      </span>
    </div>
  );
};

export default Fiat;
