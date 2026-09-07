import { useState } from "react";
import { ArrowLeft, Phone, Wifi, Zap, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";
import { TransactionPinDialog } from "@/components/TransactionPinDialog";

type BillTab = "airtime" | "data" | "electricity" | "card";

const AIRTIME_NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"];
const DATA_PLANS: Record<string, { label: string; price: number }[]> = {
  MTN: [
    { label: "1GB - 30 days", price: 2.5 },
    { label: "3GB - 30 days", price: 6 },
    { label: "10GB - 30 days", price: 15 },
  ],
  Airtel: [
    { label: "1.5GB - 30 days", price: 3 },
    { label: "6GB - 30 days", price: 8 },
    { label: "15GB - 30 days", price: 18 },
  ],
  Glo: [
    { label: "2GB - 30 days", price: 2.8 },
    { label: "7GB - 30 days", price: 7 },
    { label: "12GB - 30 days", price: 13 },
  ],
  "9mobile": [
    { label: "1GB - 30 days", price: 2.6 },
    { label: "4.5GB - 30 days", price: 7 },
    { label: "11GB - 30 days", price: 14 },
  ],
};
const DISCOS = [
  "Ikeja Electric (IKEDC)",
  "Eko Electric (EKEDC)",
  "Abuja Electric (AEDC)",
  "Port Harcourt Electric (PHEDC)",
  "Kano Electric (KEDCO)",
  "Ibadan Electric (IBEDC)",
];

export default function Bills() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<BillTab>("airtime");
  const [pinOpen, setPinOpen] = useState(false);

  // Airtime
  const [airNet, setAirNet] = useState("");
  const [airPhone, setAirPhone] = useState("");
  const [airAmount, setAirAmount] = useState("");

  // Data
  const [dataNet, setDataNet] = useState("");
  const [dataPlan, setDataPlan] = useState("");
  const [dataPhone, setDataPhone] = useState("");

  // Electricity
  const [disco, setDisco] = useState("");
  const [meterType, setMeterType] = useState("prepaid");
  const [meter, setMeter] = useState("");
  const [elecAmount, setElecAmount] = useState("");

  const pay = (label: string, amount: string | number) => {
    toast({
      title: "Payment Successful",
      description: `${label} purchase of $${amount} completed.`,
    });
  };

  const validate = (): boolean => {
    if (tab === "airtime") {
      if (!airNet || !airPhone || !airAmount) {
        toast({ title: "Missing Information", description: "Fill all fields", variant: "destructive" });
        return false;
      }
    } else if (tab === "data") {
      if (!dataNet || !dataPlan || !dataPhone) {
        toast({ title: "Missing Information", description: "Fill all fields", variant: "destructive" });
        return false;
      }
    } else {
      if (!disco || !meter || !elecAmount) {
        toast({ title: "Missing Information", description: "Fill all fields", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const runPayment = () => {
    if (tab === "airtime") {
      pay(`${airNet} airtime`, airAmount);
      setAirPhone(""); setAirAmount("");
    } else if (tab === "data") {
      const plan = DATA_PLANS[dataNet]?.find((p) => p.label === dataPlan);
      pay(`${dataNet} ${dataPlan}`, plan?.price ?? 0);
      setDataPhone("");
    } else {
      pay(`${disco} (${meterType})`, elecAmount);
      setMeter(""); setElecAmount("");
    }
  };

  const submit = () => {
    if (!validate()) return;
    setPinOpen(true);
  };

  const tabs: { id: BillTab; label: string; icon: typeof Phone }[] = [
    { id: "airtime", label: "Airtime", icon: Phone },
    { id: "data", label: "Data", icon: Wifi },
    { id: "electricity", label: "Electricity", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-foreground">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Bills & Top-up</h1>
        </div>

        <Card className="p-5 mb-6 bg-gradient-primary border-0 shadow-glow">
          <p className="text-primary-foreground font-semibold text-lg">Pay with Crypto</p>
          <p className="text-primary-foreground/90 text-sm">
            Buy airtime, data and pay electricity — instantly from your wallet.
          </p>
        </Card>

        <Tabs value={tab} onValueChange={(v) => setTab(v as BillTab)}>
          <TabsList className="grid grid-cols-3 w-full bg-secondary mb-4">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Icon className="h-4 w-4 mr-1.5" />
                  {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="airtime">
            <Card className="p-6 bg-card border-border space-y-4">
              <div>
                <Label className="text-foreground">Network</Label>
                <Select value={airNet} onValueChange={setAirNet}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select network" /></SelectTrigger>
                  <SelectContent>
                    {AIRTIME_NETWORKS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Phone Number</Label>
                <Input value={airPhone} onChange={(e) => setAirPhone(e.target.value)} placeholder="08012345678" className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-foreground">Amount (USD)</Label>
                <Input type="number" value={airAmount} onChange={(e) => setAirAmount(e.target.value)} placeholder="0.00" className="bg-background border-border" />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="p-6 bg-card border-border space-y-4">
              <div>
                <Label className="text-foreground">Network</Label>
                <Select value={dataNet} onValueChange={(v) => { setDataNet(v); setDataPlan(""); }}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select network" /></SelectTrigger>
                  <SelectContent>
                    {AIRTIME_NETWORKS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Data Plan</Label>
                <Select value={dataPlan} onValueChange={setDataPlan} disabled={!dataNet}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder={dataNet ? "Select plan" : "Pick network first"} /></SelectTrigger>
                  <SelectContent>
                    {(DATA_PLANS[dataNet] ?? []).map((p) => (
                      <SelectItem key={p.label} value={p.label}>{p.label} — ${p.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Phone Number</Label>
                <Input value={dataPhone} onChange={(e) => setDataPhone(e.target.value)} placeholder="08012345678" className="bg-background border-border" />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="electricity">
            <Card className="p-6 bg-card border-border space-y-4">
              <div>
                <Label className="text-foreground">Distribution Company</Label>
                <Select value={disco} onValueChange={setDisco}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {DISCOS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Meter Type</Label>
                <Select value={meterType} onValueChange={setMeterType}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="postpaid">Postpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Meter Number</Label>
                <Input value={meter} onChange={(e) => setMeter(e.target.value)} placeholder="Enter meter number" className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-foreground">Amount (USD)</Label>
                <Input type="number" value={elecAmount} onChange={(e) => setElecAmount(e.target.value)} placeholder="0.00" className="bg-background border-border" />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Button onClick={submit} className="w-full mt-6 bg-gradient-primary text-primary-foreground shadow-glow h-12 text-base font-semibold">
          Pay Now
        </Button>
      </div>
      <TransactionPinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSuccess={runPayment}
        title="Authorize Payment"
        description="Enter your 4-digit PIN to confirm this bill payment."
      />
      <BottomNav />
    </div>
  );
}
