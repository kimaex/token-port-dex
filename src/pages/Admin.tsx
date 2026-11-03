import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Percent,
  Banknote,
  Layers,
  RotateCcw,
  Users,
  BarChart3,
  Coins,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { fmtNGN } from "@/lib/naira";
import {
  DEFAULT_ADMIN,
  FEATURE_LABELS,
  resetAdmin,
  saveAdmin,
  useAdmin,
  type AdminSettings,
} from "@/lib/adminSettings";

const Admin = () => {
  const navigate = useNavigate();
  const admin = useAdmin();
  const [draft, setDraft] = useState<Pick<AdminSettings, "swapFeePct" | "futuresFeePct" | "withdrawalFeeNGN" | "minTxNGN">>({
    swapFeePct: admin.swapFeePct,
    futuresFeePct: admin.futuresFeePct,
    withdrawalFeeNGN: admin.withdrawalFeeNGN,
    minTxNGN: admin.minTxNGN,
  });

  const setF = (k: string) => (on: boolean) => saveAdmin({ features: { [k]: on } });

  const saveFees = () => {
    const swapFeePct = Math.min(10, Math.max(0, Number(draft.swapFeePct) || 0));
    const futuresFeePct = Math.min(5, Math.max(0, Number(draft.futuresFeePct) || 0));
    const withdrawalFeeNGN = Math.max(0, Number(draft.withdrawalFeeNGN) || 0);
    const minTxNGN = Math.max(0, Number(draft.minTxNGN) || 0);
    saveAdmin({ swapFeePct, futuresFeePct, withdrawalFeeNGN, minTxNGN });
    setDraft({ swapFeePct, futuresFeePct, withdrawalFeeNGN, minTxNGN });
    toast.success("Settings saved — live across the app");
  };

  const stats = [
    { icon: Users, label: "Registered users", value: "12,480", delta: "+312 today" },
    { icon: BarChart3, label: "24h trading volume", value: fmtNGN(48_200_000, 0), delta: "+18.4%" },
    { icon: Coins, label: "Fees earned (24h)", value: fmtNGN(964_000, 0), delta: "+11.2%" },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              Admin Panel
              <ShieldCheck className="h-4 w-4 text-primary" />
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Edit fees, limits and features — changes apply instantly
            </p>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Overview */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Overview
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                      <p className="text-base font-bold tabular-nums">{s.value}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-success">{s.delta}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Fees & limits */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5" /> Fees &amp; Limits
            </h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              {(
                [
                  { key: "swapFeePct", label: "Swap fee (%)", hint: "Swap & Quick Swap" },
                  { key: "futuresFeePct", label: "Futures fee (%)", hint: "Per order, open + close" },
                  { key: "withdrawalFeeNGN", label: "Withdrawal fee (₦)", hint: "Fiat withdrawal flat fee" },
                  { key: "minTxNGN", label: "Minimum transaction (₦)", hint: "Platform-wide minimum" },
                ] as const
              ).map((f) => (
                <div key={f.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">{f.label}</label>
                    <span className="text-[11px] text-muted-foreground">{f.hint}</span>
                  </div>
                  <Input
                    inputMode="decimal"
                    value={String(draft[f.key])}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                    }
                    className="h-10 tabular-nums"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    resetAdmin();
                    setDraft({
                      swapFeePct: DEFAULT_ADMIN.swapFeePct,
                      futuresFeePct: DEFAULT_ADMIN.futuresFeePct,
                      withdrawalFeeNGN: DEFAULT_ADMIN.withdrawalFeeNGN,
                      minTxNGN: DEFAULT_ADMIN.minTxNGN,
                    });
                    toast.success("Reset to platform defaults");
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
                <Button className="flex-1" onClick={saveFees}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Features
            </h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {Object.keys(FEATURE_LABELS).map((k) => (
                <div key={k} className="flex items-center justify-between p-3.5">
                  <div>
                    <p className="text-sm font-medium">{FEATURE_LABELS[k]}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(admin.features[k] ?? true) ? "Visible to users" : "Hidden from users"}
                    </p>
                  </div>
                  <Switch
                    checked={admin.features[k] ?? true}
                    onCheckedChange={setF(k)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Payouts info */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" /> Next Payout
            </h2>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available balance</span>
                <span className="font-bold tabular-nums">{fmtNGN(7_842_500, 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="tabular-nums">Friday, weekly</span>
              </div>
            </div>
          </section>

          <p className="text-[11px] text-muted-foreground px-1">
            Admin settings live on this device. Sign in on another device to manage from there.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
