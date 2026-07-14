import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Delete } from "lucide-react";
import { toast } from "sonner";

const PIN_KEY = "kimaex_txn_pin";
const PIN_LENGTH = 4;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function TransactionPinDialog({ open, onOpenChange, onSuccess, title, description }: Props) {
  const savedPin = typeof window !== "undefined" ? localStorage.getItem(PIN_KEY) : null;
  const isSetup = !savedPin;

  const [stage, setStage] = useState<"enter" | "confirm">("enter");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");

  useEffect(() => {
    if (open) {
      setStage("enter");
      setPin("");
      setFirstPin("");
    }
  }, [open]);

  const submit = (full: string) => {
    if (isSetup) {
      if (stage === "enter") {
        setFirstPin(full);
        setPin("");
        setStage("confirm");
        return;
      }
      if (full !== firstPin) {
        toast.error("PINs do not match. Try again.");
        setStage("enter");
        setFirstPin("");
        setPin("");
        return;
      }
      localStorage.setItem(PIN_KEY, full);
      toast.success("Transaction PIN set");
      onOpenChange(false);
      onSuccess();
      return;
    }
    if (full !== savedPin) {
      toast.error("Incorrect PIN");
      setPin("");
      return;
    }
    onOpenChange(false);
    onSuccess();
  };

  const press = (d: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => submit(next), 120);
    }
  };

  const back = () => setPin((p) => p.slice(0, -1));

  const heading =
    title ?? (isSetup ? (stage === "enter" ? "Set Transaction PIN" : "Confirm PIN") : "Enter Transaction PIN");
  const subtitle =
    description ??
    (isSetup
      ? stage === "enter"
        ? "Create a 4-digit PIN to authorize withdrawals & bill payments."
        : "Re-enter your PIN to confirm."
      : "Enter your 4-digit PIN to authorize this transaction.");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-foreground">{heading}</DialogTitle>
          <DialogDescription className="text-center">{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-3 my-4">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 ${
                pin.length > i ? "bg-primary border-primary" : "border-border"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <Button key={d} variant="secondary" className="h-14 text-xl font-semibold" onClick={() => press(d)}>
              {d}
            </Button>
          ))}
          <div />
          <Button variant="secondary" className="h-14 text-xl font-semibold" onClick={() => press("0")}>
            0
          </Button>
          <Button variant="ghost" className="h-14" onClick={back} aria-label="Delete">
            <Delete className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
