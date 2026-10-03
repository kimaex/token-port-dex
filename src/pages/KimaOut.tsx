import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Share2, Plus, Flame, Trophy, Clock, Lock, UserPlus, UserCheck, TrendingUp, TrendingDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { viralShare } from "@/lib/viralShare";
import { Switch } from "@/components/ui/switch";
import { Settings as Cog, Bell } from "lucide-react";
import { getSettings, saveSettings, getSubs, setSubs, getNotifs, saveNotifs, shouldNotify, traderAutoShare, type KimaOutSettings, type NotifKind } from "@/lib/kimaout";

type CallType = "MEME" | "LONG" | "SHORT";
interface Comment { user: string; text: string; ts: number }
interface Call {
  id: string; user: string; type: CallType; token: string;
  entry: number; target: number; stop: number; leverage: number;
  note: string; createdAt: number; likes: string[]; comments: Comment[]; shares: number;
  auto?: "swap" | "futures"; ngn?: boolean; route?: string;
}

const ME = "you";
const KEY = "kimaout_calls_v1";
const FKEY = "kimaout_follows_v1";

// Mock reference prices (USD) used as the original entry at call time
const PRICES: Record<string, number> = {
  BONK: 0.0000234, WIF: 2.41, POPCAT: 0.92, MEW: 0.0081, BOME: 0.0109,
  BTC: 67200, ETH: 3450, SOL: 172, BNB: 590, XRP: 0.62,
};
const MEMES = ["BONK", "WIF", "POPCAT", "MEW", "BOME"];
const PERPS = ["BTC", "ETH", "SOL", "BNB", "XRP"];

const hash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

// Deterministic simulated live price derived from the immutable entry + elapsed time
const livePrice = (c: Call) => {
  const mins = (Date.now() - c.createdAt) / 60000;
  const seed = hash(c.id);
  const vol = c.type === "MEME" ? 0.35 : 0.06;
  const drift = Math.sin(mins / 40 + seed) * vol * Math.min(1, mins / 120 + 0.15) + ((seed % 7) - 3) / 100;
  return c.entry * (1 + drift);
};

const perf = (c: Call) => {
  const p = livePrice(c);
  const dir = c.type === "SHORT" ? -1 : 1;
  const hitTarget = dir === 1 ? p >= c.target : p <= c.target;
  const hitStop = dir === 1 ? p <= c.stop : p >= c.stop;
  const exit = hitTarget ? c.target : hitStop ? c.stop : p;
  const roi = ((exit - c.entry) / c.entry) * dir * c.leverage * 100;
  return { price: p, roi, status: hitTarget ? "Target Hit" : hitStop ? "Stopped" : "Live" };
};

const fmtN = (n: number) => `₦${n < 1 ? n.toPrecision(3) : n.toLocaleString(undefined, { maximumFractionDigits: n < 100 ? 2 : 0 })}`;
const fmt = (n: number) => n < 0.01 ? `$${n.toPrecision(3)}` : `$${n.toLocaleString(undefined, { maximumFractionDigits: n < 10 ? 4 : 2 })}`;
const ago = (t: number) => { const s = (Date.now() - t) / 1000; if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`; };

const seedCalls = (): Call[] => {
  const now = Date.now();
  const mk = (i: number, user: string, type: CallType, token: string, tMul: number, sMul: number, lev: number, note: string, hrs: number, likes: number): Call => {
    const entry = PRICES[token];
    return { id: `seed${i}`, user, type, token, entry, target: entry * tMul, stop: entry * sMul, leverage: lev, note, createdAt: now - hrs * 3600000, likes: Array.from({ length: likes }, (_, k) => `u${k}`), comments: [{ user: "naijawhale", text: "Following this 🔥", ts: now - hrs * 1800000 }], shares: likes % 13 };
  };
  return [
    mk(1, "lagoswhale", "LONG", "SOL", 1.12, 0.95, 20, "SOL reclaiming 170 support. Breakout loading.", 3, 142),
    mk(2, "memeQueen", "MEME", "WIF", 1.8, 0.8, 1, "WIF dog szn returning 🐶", 6, 98),
    mk(3, "abujaTrader", "SHORT", "ETH", 0.92, 1.04, 10, "Bearish divergence on 4h.", 10, 61),
    mk(4, "kanoKing", "MEME", "BONK", 2, 0.75, 1, "BONK volume exploding.", 20, 210),
    mk(5, "lagoswhale", "LONG", "BTC", 1.06, 0.97, 50, "Weekly close above 66k.", 30, 175),
    mk(6, "accraApe", "MEME", "POPCAT", 1.5, 0.85, 1, "Cat coins next.", 2, 44),
  ];
};

const load = (): Call[] => { try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch {} const s = seedCalls(); localStorage.setItem(KEY, JSON.stringify(s)); return s; };

export default function KimaOut() {
  const navigate = useNavigate();
  const { handle } = useParams();
  const [calls, setCalls] = useState<Call[]>(load);
  const [follows, setFollows] = useState<string[]>(() => JSON.parse(localStorage.getItem(FKEY) || "[]"));
  const [tab, setTab] = useState<"feed" | "trending" | "top">("feed");
  const [openCreate, setOpenCreate] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [, tick] = useState(0);

  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 5000); return () => clearInterval(t); }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(calls)); }, [calls]);
  useEffect(() => { localStorage.setItem(FKEY, JSON.stringify(follows)); }, [follows]);

  // Only social fields are mutable; entry/target/stop/createdAt are never edited.
  const updateSocial = (id: string, fn: (c: Call) => Partial<Pick<Call, "likes" | "comments" | "shares">>) =>
    setCalls((cs) => cs.map((c) => (c.id === id ? { ...c, ...fn(c) } : c)));

  const toggleLike = (c: Call) => updateSocial(c.id, (x) => ({ likes: x.likes.includes(ME) ? x.likes.filter((u) => u !== ME) : [...x.likes, ME] }));
  const toggleFollow = (u: string) => setFollows((f) => (f.includes(u) ? f.filter((x) => x !== u) : [...f, u]));
  const share = (c: Call) => { updateSocial(c.id, (x) => ({ shares: x.shares + 1 })); viralShare(`📣 KimaOut: ${c.type} $${c.token} @ ${fmt(c.entry)} → target ${fmt(c.target)} by @${c.user}`); };
  const tradeNow = (c: Call) => navigate(c.route || (c.type === "MEME" ? "/swap" : "/futures"));
  const [subs, setSubsState] = useState<string[]>(getSubs);
  const [settings, setSettingsState] = useState<KimaOutSettings>(getSettings);
  const updSettings = (s: KimaOutSettings) => { setSettingsState(s); saveSettings(s); };
  const toggleSub = (u: string) => { const n = subs.includes(u) ? subs.filter((x) => x !== u) : [...subs, u]; setSubsState(n); setSubs(n); };
  // Simulated activity from followed traders: notify only if trader Auto Share ON AND follower follows + Trade Notifications ON.
  useEffect(() => {
    const t = setInterval(() => {
      const pool = follows.filter((u) => u !== ME);
      if (!pool.length) return;
      const u = pool[Math.floor(Math.random() * pool.length)];
      if (!traderAutoShare(u)) return;
      const fut = Math.random() < 0.5; const kind: NotifKind = fut ? "futures" : "swap";
      const token = fut ? PERPS[Math.floor(Math.random() * 3)] : MEMES[Math.floor(Math.random() * MEMES.length)];
      const long = Math.random() < 0.6; const entry = PRICES[token] * 1550; const lev = fut ? [5, 10, 20][Math.floor(Math.random() * 3)] : 1;
      const c: Call = { id: `auto${Date.now()}`, user: u, type: fut ? (long ? "LONG" : "SHORT") : "MEME", token, entry, target: entry * (fut ? (long ? 1.1 : 0.9) : 1.5), stop: entry * (fut ? (long ? 0.95 : 1.05) : 0.7), leverage: lev, note: fut ? `opened a ${long ? "LONG" : "SHORT"} · ${token}/NGN PERP` : `swapped into $${token}`, createdAt: Date.now(), likes: [], comments: [], shares: 0, auto: kind, ngn: true, route: fut ? "/futures" : "/swap" };
      setCalls((cs) => [c, ...cs]);
      const s = getSettings();
      if (shouldNotify(true, true, getSubs().includes(u), s, kind)) {
        const text = fut ? `Opened a ${long ? "LONG" : "SHORT"} on ${token}/NGN PERP at ${fmtN(entry)}.` : `Bought $${token} at ${fmtN(entry)}.`;
        saveNotifs([{ id: c.id, user: u, kind, text, callId: c.id, route: c.route!, ts: Date.now(), read: false }, ...getNotifs()]);
        toast(`📣 @${u} KimaOut`, { description: text, action: { label: "Trade", onClick: () => navigate(c.route!) } });
      }
    }, 45000);
    return () => clearInterval(t);
  }, [follows]);

  const callers = useMemo(() => {
    const m: Record<string, { user: string; calls: number; wins: number; avg: number }> = {};
    calls.forEach((c) => { const p = perf(c); const r = (m[c.user] ||= { user: c.user, calls: 0, wins: 0, avg: 0 }); r.calls++; if (p.roi > 0) r.wins++; r.avg += p.roi; });
    return Object.values(m).map((r) => ({ ...r, avg: r.avg / r.calls, winRate: (r.wins / r.calls) * 100 })).sort((a, b) => b.avg - a.avg);
  }, [calls, tick]);

  const sorted = [...calls].sort((a, b) => b.createdAt - a.createdAt);
  const trending = [...calls].sort((a, b) => (b.likes.length + b.comments.length * 2 + b.shares * 3) / Math.max(1, (Date.now() - b.createdAt) / 3.6e6) ** 0.5 - (a.likes.length + a.comments.length * 2 + a.shares * 3) / Math.max(1, (Date.now() - a.createdAt) / 3.6e6) ** 0.5);

  const CallCard = ({ c }: { c: Call }) => {
    const p = perf(c);
    const F = c.ngn ? fmtN : fmt;
    const up = p.roi >= 0;
    return (
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate(`/kimaout/u/${c.user}`)}>
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{c.user[0].toUpperCase()}</div>
            <div className="text-left">
              <p className="font-semibold text-sm">@{c.user}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{ago(c.createdAt)} · {new Date(c.createdAt).toLocaleString()}</p>
            </div>
          </button>
          {c.user !== ME && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleFollow(c.user)}>
              {follows.includes(c.user) ? <><UserCheck className="h-3 w-3 mr-1" />Following</> : <><UserPlus className="h-3 w-3 mr-1" />Follow</>}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${c.type === "SHORT" ? "bg-destructive/15 text-destructive" : c.type === "LONG" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>
            {c.type === "MEME" ? "🐸 MEME" : c.type}
          </span>
          <span className="font-bold">${c.token}{c.type !== "MEME" && <span className="text-muted-foreground text-xs font-normal"> PERP · {c.leverage}x</span>}</span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${p.status === "Target Hit" ? "bg-success/15 text-success" : p.status === "Stopped" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
        </div>
        {c.auto ? <p className="text-sm"><span className="text-primary font-semibold">📣 @{c.user}</span> {c.note}{c.type !== "MEME" && <> · {c.leverage}x</>}</p> : c.note && <p className="text-sm">{c.note}</p>}
        <div className="grid grid-cols-4 gap-2 text-center bg-muted/40 rounded-xl p-2">
          {(c.auto ? [["Entry", F(c.entry)], ["Time", new Date(c.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })], ["Lev", `${c.leverage}x`], ["Now", F(p.price)]] : [["Entry", F(c.entry)], ["Target", F(c.target)], ["Stop", F(c.stop)], ["Now", F(p.price)]]).map(([l, v]) => (
            <div key={l}><p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">{l === "Entry" && <Lock className="h-2.5 w-2.5" />}{l}</p><p className="text-xs font-semibold">{v}</p></div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1 font-bold ${up ? "text-success" : "text-destructive"}`}>
            {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{up ? "+" : ""}{p.roi.toFixed(2)}% ROI
          </span>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow h-8" onClick={() => tradeNow(c)}>{c.auto === "swap" ? `Trade $${c.token}` : c.auto === "futures" ? "Trade Futures" : "Trade Now"}</Button>
        </div>
        <div className="flex items-center gap-5 text-muted-foreground text-sm border-t border-border pt-2">
          <button className={`flex items-center gap-1 ${c.likes.includes(ME) ? "text-destructive" : ""}`} onClick={() => toggleLike(c)}><Heart className={`h-4 w-4 ${c.likes.includes(ME) ? "fill-current" : ""}`} />{c.likes.length}</button>
          <button className="flex items-center gap-1" onClick={() => setOpenComments(c.id)}><MessageCircle className="h-4 w-4" />{c.comments.length}</button>
          <button className="flex items-center gap-1" onClick={() => share(c)}><Share2 className="h-4 w-4" />{c.shares}</button>
        </div>
      </div>
    );
  };

  const commentCall = calls.find((c) => c.id === openComments);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto pb-28">
        <div className="flex items-center gap-3 p-4 sticky top-0 bg-background/90 backdrop-blur z-10">
          <Button variant="ghost" size="icon" onClick={() => (handle ? navigate("/kimaout") : navigate("/"))}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-xl font-bold flex-1">KimaOut 📣</h1>
          <Button variant="ghost" size="icon" aria-label="KimaOut settings" onClick={() => navigate(`/kimaout/u/${ME}`)}><Cog className="h-5 w-5" /></Button>
        </div>

        {handle ? (
          <Profile handle={handle} calls={sorted.filter((c) => c.user === handle)} stats={callers.find((r) => r.user === handle)} following={follows.includes(handle)} onFollow={() => toggleFollow(handle)} subscribed={subs.includes(handle)} onSub={() => toggleSub(handle)} settings={settings} onSettings={updSettings} render={(c) => <CallCard key={c.id} c={c} />} />
        ) : (
          <>
            <div className="flex gap-2 px-4 mb-4">
              {([["feed", "Feed", MessageCircle], ["trending", "Trending", Flame], ["top", "Top Callers", Trophy]] as const).map(([k, l, I]) => (
                <button key={k} onClick={() => setTab(k)} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium ${tab === k ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground"}`}><I className="h-4 w-4" />{l}</button>
              ))}
            </div>
            <div className="px-4 space-y-3">
              {tab === "feed" && sorted.map((c) => <CallCard key={c.id} c={c} />)}
              {tab === "trending" && trending.slice(0, 10).map((c) => <CallCard key={c.id} c={c} />)}
              {tab === "top" && callers.map((r, i) => (
                <button key={r.user} onClick={() => navigate(`/kimaout/u/${r.user}`)} className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-3 text-left">
                  <span className="w-6 text-center font-bold text-muted-foreground">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
                  <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">{r.user[0].toUpperCase()}</div>
                  <div className="flex-1"><p className="font-semibold text-sm">@{r.user}</p><p className="text-xs text-muted-foreground">{r.calls} calls · {r.winRate.toFixed(0)}% win</p></div>
                  <span className={`font-bold text-sm ${r.avg >= 0 ? "text-success" : "text-destructive"}`}>{r.avg >= 0 ? "+" : ""}{r.avg.toFixed(1)}%</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button onClick={() => setOpenCreate(true)} className="fixed bottom-24 right-1/2 translate-x-[180px] h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground shadow-glow flex items-center justify-center z-40" aria-label="Create KimaOut">
          <Plus className="h-6 w-6" />
        </button>

        <CreateDialog open={openCreate} onOpenChange={setOpenCreate} onCreate={(c) => { setCalls((cs) => [c, ...cs]); setTab("feed"); toast.success("KimaOut posted 📣 Entry price locked"); }} />

        <Dialog open={!!commentCall} onOpenChange={(o) => !o && setOpenComments(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Comments</DialogTitle></DialogHeader>
            {commentCall && <Comments call={commentCall} onAdd={(text) => updateSocial(commentCall.id, (x) => ({ comments: [...x.comments, { user: ME, text, ts: Date.now() }] }))} />}
          </DialogContent>
        </Dialog>
        <BottomNav />
      </div>
    </div>
  );
}

function Comments({ call, onAdd }: { call: Call; onAdd: (t: string) => void }) {
  const [t, setT] = useState("");
  return (
    <div className="space-y-3">
      <div className="max-h-64 overflow-y-auto space-y-2">
        {call.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        {call.comments.map((c, i) => <div key={i} className="bg-muted/40 rounded-lg p-2"><p className="text-xs font-semibold">@{c.user} <span className="text-muted-foreground font-normal">{ago(c.ts)}</span></p><p className="text-sm">{c.text}</p></div>)}
      </div>
      <div className="flex gap-2">
        <Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Add a comment" maxLength={280} />
        <Button size="icon" className="bg-gradient-primary text-primary-foreground" onClick={() => { if (t.trim()) { onAdd(t.trim()); setT(""); } }}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function CreateDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (c: Call) => void }) {
  const [type, setType] = useState<CallType>("MEME");
  const [token, setToken] = useState("WIF");
  const [target, setTarget] = useState("");
  const [stop, setStop] = useState("");
  const [lev, setLev] = useState(10);
  const [note, setNote] = useState("");
  const list = type === "MEME" ? MEMES : PERPS;
  const entry = PRICES[token] ?? 0;

  useEffect(() => { if (!list.includes(token)) setToken(list[0]); }, [type]);

  const submit = () => {
    const t = parseFloat(target), s = parseFloat(stop);
    if (!t || !s) return toast.error("Enter target and stop-loss");
    const long = type !== "SHORT";
    if (long ? !(t > entry && s < entry) : !(t < entry && s > entry)) return toast.error(long ? "Target must be above entry, stop below" : "Target must be below entry, stop above");
    onCreate(Object.freeze({ id: `k${Date.now()}`, user: ME, type, token, entry, target: t, stop: s, leverage: type === "MEME" ? 1 : lev, note: note.slice(0, 280), createdAt: Date.now(), likes: [], comments: [], shares: 0 }) as Call);
    setTarget(""); setStop(""); setNote(""); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Create KimaOut 📣</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["MEME", "LONG", "SHORT"] as CallType[]).map((k) => (
              <button key={k} onClick={() => setType(k)} className={`py-2 rounded-lg text-sm font-semibold border ${type === k ? (k === "SHORT" ? "bg-destructive text-destructive-foreground border-destructive" : k === "LONG" ? "bg-success text-primary-foreground border-success" : "bg-gradient-primary text-primary-foreground border-primary") : "border-border text-muted-foreground"}`}>{k === "MEME" ? "Meme" : k}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {list.map((t) => <button key={t} onClick={() => setToken(t)} className={`px-3 py-1 rounded-full text-xs border ${token === t ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>${t}</button>)}
          </div>
          <div className="bg-muted/40 rounded-lg p-2 text-sm flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" />Entry (locked at post)</span><span className="font-semibold">{fmt(entry)}</span></div>
          <Input type="number" placeholder={`Target price (${type === "SHORT" ? "below" : "above"} entry)`} value={target} onChange={(e) => setTarget(e.target.value)} />
          <Input type="number" placeholder={`Stop-loss (${type === "SHORT" ? "above" : "below"} entry)`} value={stop} onChange={(e) => setStop(e.target.value)} />
          {type !== "MEME" && (
            <div><p className="text-xs text-muted-foreground mb-1">Leverage: {lev}x</p><input type="range" min={1} max={500} value={lev} onChange={(e) => setLev(+e.target.value)} className="w-full accent-primary" /></div>
          )}
          <Input placeholder="Why this call? (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} />
          <p className="text-[11px] text-muted-foreground">Timestamp and entry price are permanent and can't be edited after posting.</p>
          <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow" onClick={submit}>Post KimaOut</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Profile({ handle, calls, stats, following, onFollow, subscribed, onSub, settings, onSettings, render }: { handle: string; calls: Call[]; stats?: { calls: number; winRate: number; avg: number }; following: boolean; onFollow: () => void; subscribed: boolean; onSub: () => void; settings: KimaOutSettings; onSettings: (s: KimaOutSettings) => void; render: (c: Call) => JSX.Element }) {
  const kinds: [NotifKind, string][] = [["swap", "Token swaps"], ["futures", "Futures positions"], ["closed", "Position closed"], ["tp", "Take-profit reached"], ["sl", "Stop-loss reached"]];
  const followers = (hash(handle) % 5000) + (following ? 1 : 0);
  return (
    <div className="px-4 space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-glow">{handle[0].toUpperCase()}</div>
        <p className="font-bold text-lg mt-2">@{handle}</p>
        <p className="text-xs text-muted-foreground">{followers.toLocaleString()} followers</p>
        {handle !== ME && <Button size="sm" className="mt-3 bg-gradient-primary text-primary-foreground" onClick={onFollow}>{following ? "Following" : "Follow"}</Button>}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div><p className="font-bold">{stats?.calls ?? 0}</p><p className="text-xs text-muted-foreground">Calls</p></div>
          <div><p className="font-bold">{(stats?.winRate ?? 0).toFixed(0)}%</p><p className="text-xs text-muted-foreground">Win rate</p></div>
          <div><p className={`font-bold ${(stats?.avg ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>{(stats?.avg ?? 0).toFixed(1)}%</p><p className="text-xs text-muted-foreground">Avg ROI</p></div>
        </div>
      </div>
      {handle === ME ? (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-semibold text-sm">📣 Auto Share to KimaOut</p><p className="text-xs text-muted-foreground">{settings.autoShare ? "Swaps & futures positions post automatically" : "Off — you can still share trades manually"}</p></div>
            <Switch checked={settings.autoShare} onCheckedChange={(v) => { onSettings({ ...settings, autoShare: v }); toast.success(v ? "Auto Share ON" : "Auto Share OFF"); }} />
          </div>
          <p className="text-[11px] text-muted-foreground flex gap-1"><Lock className="h-3 w-3 mt-0.5 shrink-0" />Only token, side, entry price, leverage and time are posted. Balances, amounts, bank details and portfolio value are never shared.</p>
          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-1"><Bell className="h-4 w-4" />Notifications I receive</p>
            {kinds.map(([k, l]) => (
              <label key={k} className={`flex items-center gap-2 text-sm ${settings.muteAll ? "opacity-50" : ""}`}>
                <input type="checkbox" className="accent-primary h-4 w-4" disabled={settings.muteAll} checked={settings.kinds[k]} onChange={(e) => onSettings({ ...settings, kinds: { ...settings.kinds, [k]: e.target.checked } })} />{l}
              </label>
            ))}
            <div className="flex items-center justify-between pt-2"><span className="text-sm">Mute KimaOut Notifications</span><Switch checked={settings.muteAll} onCheckedChange={(v) => onSettings({ ...settings, muteAll: v })} /></div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div><p className="font-semibold text-sm">🔔 Trade Notifications</p><p className="text-xs text-muted-foreground">{!following ? "Follow to enable" : !traderAutoShare(handle) ? "This trader has Auto Share off" : "Get alerted when they trade"}</p></div>
          <Switch disabled={!following} checked={following && subscribed} onCheckedChange={onSub} />
        </div>
      )}
      <h2 className="font-semibold">Call history</h2>
      {calls.length === 0 ? <p className="text-sm text-muted-foreground">No calls yet.</p> : <div className="space-y-3">{calls.map(render)}</div>}
    </div>
  );
}
