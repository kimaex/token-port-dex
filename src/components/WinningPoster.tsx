import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { fmtNGN } from "@/lib/naira";

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

const W = 720;
const H = 960;

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
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0B0B12");
    g.addColorStop(0.55, "#17102E");
    g.addColorStop(1, "#0B0B12");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // glow
    const rg = ctx.createRadialGradient(W / 2, 430, 20, W / 2, 430, 420);
    rg.addColorStop(0, win ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.28)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";

    // brand
    ctx.fillStyle = "#A855F7";
    ctx.font = "bold 44px system-ui, sans-serif";
    ctx.fillText("KIMAEX", W / 2, 110);
    ctx.fillStyle = "#A1A1AA";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText("FUTURES", W / 2, 148);

    // pair + side
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 54px system-ui, sans-serif";
    ctx.fillText(`${data.symbol}`, W / 2, 260);
    ctx.fillStyle = data.side === "long" ? "#22C55E" : "#EF4444";
    ctx.font = "600 30px system-ui, sans-serif";
    ctx.fillText(
      `${data.side === "long" ? "LONG" : "SHORT"} · ${data.leverage}x Leverage`,
      W / 2,
      308
    );

    // ROI
    ctx.fillStyle = win ? "#22C55E" : "#EF4444";
    ctx.font = "bold 128px system-ui, sans-serif";
    ctx.fillText(`${data.roi >= 0 ? "+" : ""}${data.roi.toFixed(2)}%`, W / 2, 470);

    ctx.font = "bold 62px system-ui, sans-serif";
    ctx.fillText(`${data.pnl >= 0 ? "+" : ""}${fmtNGN(data.pnl, 0)}`, W / 2, 560);

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "500 26px system-ui, sans-serif";
    ctx.fillText(win ? "Profit" : "Loss", W / 2, 604);

    // card
    ctx.strokeStyle = "#2A2A3D";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(70, 660, W - 140, 150, 24);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 28px system-ui, sans-serif";
    ctx.fillText("Trade Futures in Naira", W / 2, 715);
    ctx.fillStyle = "#A1A1AA";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText("kimaex.app", W / 2, 762);

    ctx.fillStyle = "#52525B";
    ctx.font = "400 20px system-ui, sans-serif";
    ctx.fillText(new Date().toLocaleDateString("en-NG"), W / 2, 900);

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
    const text = `Kimaex Futures · ${data.symbol} ${data.leverage}x — ${
      data.pnl >= 0 ? "+" : ""
    }${fmtNGN(data.pnl, 0)} (${data.roi >= 0 ? "+" : ""}${data.roi.toFixed(2)}% ROI)`;
    const file = blob
      ? new File([blob], "kimaex-trade.png", { type: "image/png" })
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
    a.download = "kimaex-trade.png";
    a.click();
    toast.success("Poster saved");
  };

  return (
    <Dialog open={!!data} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share your trade</DialogTitle>
          <DialogDescription>
            No account numbers or personal details are included.
          </DialogDescription>
        </DialogHeader>
        <canvas ref={canvasRef} width={W} height={H} className="hidden" />
        {url && (
          <img
            src={url}
            alt="Kimaex trading result poster"
            className="w-full rounded-xl border border-border"
          />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 h-11" onClick={download}>
            <Download className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button className="flex-1 h-11" onClick={share}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
