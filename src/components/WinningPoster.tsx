import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { fmtNGN } from "@/lib/naira";
import { sharePosterToKimaOut } from "@/lib/kimaout";

export interface PosterData {
  symbol: string;
  side: "long" | "short";
  leverage: number;
  pnl: number;
  roi: number;
}

interface Props {
  data: PosterData | null;
  onOpenChange: (open: boolean) => void;
}

// Bybit-style PnL share card: 9:16 dark canvas, amber accent, big PnL block.
const W = 750;
const H = 1000;

const AMBER = "#F7A600";
const WIN = "#20BC76";
const LOSS = "#EF454A";
const INK = "#17181E";
const CARD = "#1E2126";
const GREY = "#7A7F87";

export function WinningPoster({ data, onOpenChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (!data) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const win = data.pnl >= 0;
    const accent = win ? WIN : LOSS;

    // Background
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);

    // Top amber brand bar
    ctx.fillStyle = AMBER;
    ctx.fillRect(0, 0, W, 8);

    // Header brand row
    ctx.textAlign = "left";
    ctx.fillStyle = AMBER;
    ctx.font = "bold 34px system-ui, sans-serif";
    ctx.fillText("KIMAEX", 48, 88);
    ctx.fillStyle = GREY;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("FUTURES  ·  PNL SHARE", 48, 122);

    // Pair + side chip row
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 46px system-ui, sans-serif";
    ctx.fillText(data.symbol, 48, 208);

    // side chip
    const chipW = 168;
    ctx.fillStyle = data.side === "long" ? WIN : LOSS;
    ctx.beginPath();
    ctx.roundRect(48, 238, chipW, 46, 10);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillText(data.side === "long" ? "LONG" : "SHORT", 48 + 24, 270);
    // leverage chip
    ctx.fillStyle = CARD;
    ctx.beginPath();
    ctx.roundRect(48 + chipW + 12, 238, 150, 46, 10);
    ctx.fill();
    ctx.fillStyle = "#EAECEF";
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(`${data.leverage}x`, 48 + chipW + 12 + 24, 270);

    // Profit tag
    ctx.fillStyle = accent;
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(win ? "PROFIT" : "LOSS", 48, 344);

    // Big PnL number
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 96px system-ui, sans-serif";
    ctx.fillText(
      `${data.pnl >= 0 ? "+" : "-"}${fmtNGN(Math.abs(data.pnl), 2)}`,
      48,
      448
    );

    // ROI pill row
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(48, 486, 210, 60, 14);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px system-ui, sans-serif";
    ctx.fillText(
      `ROI ${data.roi >= 0 ? "+" : ""}${data.roi.toFixed(2)}%`,
      48 + 20,
      526
    );

    // Stats card
    const rows: [string, string][] = [
      ["Direction", `${data.side === "long" ? "Long" : "Short"} · ${data.leverage}x`],
      ["Pair", `${data.symbol} PERP`],
      ["Settled in", "Naira (₦)"],
      ["Platform", "Kimaex Futures · 0.09% fee"],
    ];
    const cardY = 600;
    ctx.fillStyle = CARD;
    ctx.beginPath();
    ctx.roundRect(48, cardY, W - 96, 250, 20);
    ctx.fill();
    rows.forEach(([k, v], i) => {
      const y = cardY + 58 + i * 56;
      ctx.textAlign = "left";
      ctx.fillStyle = GREY;
      ctx.font = "500 24px system-ui, sans-serif";
      ctx.fillText(k, 84, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "#EAECEF";
      ctx.font = "600 24px system-ui, sans-serif";
      ctx.fillText(v, W - 84, y);
    });
    ctx.textAlign = "left";

    // Footer
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.roundRect(48, 896, W - 96, 2, 2);
    ctx.fill();
    ctx.fillStyle = GREY;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Trade futures in Naira on Kimaex", 48, 948);
    ctx.textAlign = "right";
    ctx.fillStyle = GREY;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("kimaex.app", W - 48, 948);
    ctx.textAlign = "left";

    setUrl(c.toDataURL("image/png"));
  }, [data]);

  const toBlob = async (): Promise<Blob | null> => {
    const c = canvasRef.current;
    if (!c) return null;
    return await new Promise((res) => c.toBlob((b) => res(b), "image/png"));
  };

  const share = async () => {
    if (!data) return;
    const blob = await toBlob();
    const text = `Kimaex Futures · ${data.symbol} ${
      data.side === "long" ? "LONG" : "SHORT"
    } ${data.leverage}x — ${data.pnl >= 0 ? "+" : ""}${fmtNGN(
      data.pnl,
      0
    )} (${data.roi >= 0 ? "+" : ""}${data.roi.toFixed(2)}% ROI)`;
    const file = blob
      ? new File([blob], "kimaex-pnl.png", { type: "image/png" })
      : null;
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (file && nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text, title: "Kimaex Futures" });
        return;
      } catch {
        return;
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ text, title: "Kimaex Futures" });
        return;
      } catch {
        return;
      }
    }
    download();
  };

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "kimaex-pnl.png";
    a.click();
    toast.success("Poster saved");
  };

  const postToKimaOut = () => {
    if (!data) return;
    sharePosterToKimaOut(data.symbol, data.side, data.leverage, data.pnl, data.roi);
    toast.success("📣 Shared to KimaOut");
  };

  return (
    <Dialog open={!!data} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share your winning trade</DialogTitle>
          <DialogDescription>
            No account numbers or personal details are included.
          </DialogDescription>
        </DialogHeader>
        <canvas ref={canvasRef} width={W} height={H} className="hidden" />
        {url && (
          <img
            src={url}
            alt="Kimaex futures PnL share card"
            className="w-full rounded-xl border border-border"
          />
        )}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" className="h-11" onClick={download}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="secondary" className="h-11" onClick={postToKimaOut}>
            <Megaphone className="h-4 w-4" />
          </Button>
          <Button className="h-11" onClick={share}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
