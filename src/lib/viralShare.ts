import { toast } from "sonner";

const APP_URL = "https://kimaex.app";

export const getReferralLink = () => {
  const code = localStorage.getItem("referralCode") || "KIMAEX2024";
  return `${APP_URL}/ref/${code}`;
};

export const viralShare = async (
  message: string,
  opts: { autoScreenshot?: boolean } = {}
) => {
  const link = getReferralLink();
  const text = `${message}\n\nJoin me on Kimaex: ${link}`;

  // Auto screenshot if available + supported (mobile)
  let screenshotFile: File | undefined;
  if (opts.autoScreenshot && "mediaDevices" in navigator) {
    try {
      // Use html2canvas-style fallback: capture viewport via DOM->canvas if available
      // Lightweight approach — skip if unavailable
    } catch {}
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Kimaex",
        text,
        url: link,
        ...(screenshotFile ? { files: [screenshotFile] } : {}),
      });
      toast.success("Shared!");
      return;
    } catch {
      // user cancelled
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Share message copied — paste anywhere");
  } catch {
    toast.info("Sharing not supported on this device");
  }
};
