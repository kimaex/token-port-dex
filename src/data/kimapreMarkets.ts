export type MarketCategory =
  | "Crypto"
  | "Politics"
  | "Sports"
  | "Economy"
  | "Tech"
  | "Culture"
  | "Elections"
  | "World";

export interface Outcome {
  id: string;
  label: string;
  price: number; // 0-1
  volume: number;
}

export interface PricePoint {
  t: number; // timestamp
  p: number; // 0-1
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  side?: "YES" | "NO";
}

export interface OrderBookEntry {
  price: number; // cents
  shares: number;
  total: number;
}

export interface RecentTrade {
  id: string;
  user: string;
  side: "YES" | "NO" | "BUY" | "SELL";
  outcome?: string;
  shares: number;
  price: number;
  amount: number;
  time: string;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  type: "binary" | "multi";
  outcomes: Outcome[]; // for binary: [yes, no]
  yesPrice: number; // convenience (binary)
  volume: number;
  volume24h: number;
  liquidity: number;
  endsAt: string;
  endsAtTs: number;
  traders: number;
  trending?: boolean;
  isNew?: boolean;
  resolutionSource: string;
  rules: string;
  history: PricePoint[];
  comments: Comment[];
  orderBook: { bids: OrderBookEntry[]; asks: OrderBookEntry[] };
  recentTrades: RecentTrade[];
  image?: string;
}

const now = Date.now();
const days = (n: number) => now + n * 86400000;

const genHistory = (start: number, end: number, points = 30): PricePoint[] => {
  const out: PricePoint[] = [];
  let p = start;
  for (let i = 0; i < points; i++) {
    const drift = (end - start) / points;
    p = Math.max(0.02, Math.min(0.98, p + drift + (Math.random() - 0.5) * 0.06));
    out.push({ t: now - (points - i) * 86400000, p });
  }
  out[out.length - 1].p = end;
  return out;
};

const sampleComments: Comment[] = [
  {
    id: "c1",
    user: "0xAlpha",
    avatar: "🦊",
    text: "Strong macro tailwinds this quarter — adding to YES.",
    time: "2h",
    likes: 24,
    side: "YES",
  },
  {
    id: "c2",
    user: "PredictPro",
    avatar: "🧠",
    text: "Order book is thin above 70¢. Take profits.",
    time: "4h",
    likes: 12,
    side: "NO",
  },
  {
    id: "c3",
    user: "Chika.eth",
    avatar: "👑",
    text: "Resolution source is reliable. Betting big.",
    time: "6h",
    likes: 41,
    side: "YES",
  },
  {
    id: "c4",
    user: "WhaleWatch",
    avatar: "🐋",
    text: "Just saw $50K flow into NO shares.",
    time: "8h",
    likes: 8,
  },
];

const sampleOrderBook = (mid: number) => {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let cumB = 0;
  let cumA = 0;
  for (let i = 0; i < 6; i++) {
    const bp = Math.max(1, Math.round((mid - 0.01 - i * 0.01) * 100));
    const ap = Math.min(99, Math.round((mid + 0.01 + i * 0.01) * 100));
    const bs = Math.round(200 + Math.random() * 800);
    const as_ = Math.round(200 + Math.random() * 800);
    cumB += bs;
    cumA += as_;
    bids.push({ price: bp, shares: bs, total: cumB });
    asks.push({ price: ap, shares: as_, total: cumA });
  }
  return { bids, asks };
};

const sampleTrades = (): RecentTrade[] =>
  Array.from({ length: 8 }).map((_, i) => ({
    id: `t${i}`,
    user: ["Anon", "0x9f...2a", "Bola.eth", "CryptoNaija", "Solwhale"][i % 5],
    side: i % 2 === 0 ? "YES" : "NO",
    shares: Math.round(50 + Math.random() * 500),
    price: Math.round(20 + Math.random() * 60),
    amount: Math.round(20 + Math.random() * 400),
    time: `${i + 1}m ago`,
  }));

const binary = (yesPrice: number): Outcome[] => [
  { id: "yes", label: "Yes", price: yesPrice, volume: 0 },
  { id: "no", label: "No", price: 1 - yesPrice, volume: 0 },
];

const upDown = (upPrice: number): Outcome[] => [
  { id: "up", label: "Up", price: upPrice, volume: 0 },
  { id: "down", label: "Down", price: 1 - upPrice, volume: 0 },
];

export const UPDOWN_MARKETS: Market[] = [
  {
    id: "btc-updown-24h",
    title: "Will Bitcoin (BTC) close higher in the next 24h?",
    description: "Resolves UP if BTC closes above its current spot price 24 hours from now.",
    category: "Crypto",
    type: "binary",
    outcomes: upDown(0.58),
    yesPrice: 0.58,
    volume: 842300,
    volume24h: 312400,
    liquidity: 220000,
    endsAt: "in 24h",
    endsAtTs: now + 86400000,
    traders: 3120,
    trending: true,
    resolutionSource: "Coinbase BTC/USD spot",
    rules: "Resolves UP if BTC/USD spot is higher than the snapshot at market open after 24h, else DOWN.",
    history: genHistory(0.5, 0.58),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.58),
    recentTrades: sampleTrades(),
  },
  {
    id: "sol-updown-24h",
    title: "Will Solana (SOL) close higher in the next 24h?",
    description: "Resolves UP if SOL closes above its current spot price 24 hours from now.",
    category: "Crypto",
    type: "binary",
    outcomes: upDown(0.52),
    yesPrice: 0.52,
    volume: 412800,
    volume24h: 168000,
    liquidity: 110000,
    endsAt: "in 24h",
    endsAtTs: now + 86400000,
    traders: 1820,
    trending: true,
    resolutionSource: "Coinbase SOL/USD spot",
    rules: "Resolves UP if SOL/USD spot is higher than the snapshot at market open after 24h, else DOWN.",
    history: genHistory(0.46, 0.52),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.52),
    recentTrades: sampleTrades(),
  },
  {
    id: "eth-updown-24h",
    title: "Will Ethereum (ETH) close higher in the next 24h?",
    description: "Resolves UP if ETH closes above its current spot price 24 hours from now.",
    category: "Crypto",
    type: "binary",
    outcomes: upDown(0.55),
    yesPrice: 0.55,
    volume: 624100,
    volume24h: 241000,
    liquidity: 160000,
    endsAt: "in 24h",
    endsAtTs: now + 86400000,
    traders: 2410,
    trending: true,
    resolutionSource: "Coinbase ETH/USD spot",
    rules: "Resolves UP if ETH/USD spot is higher than the snapshot at market open after 24h, else DOWN.",
    history: genHistory(0.48, 0.55),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.55),
    recentTrades: sampleTrades(),
  },
];

export const MARKETS: Market[] = [
  ...UPDOWN_MARKETS,
  {
    id: "btc-150k",
    title: "Will Bitcoin reach $150,000 before end of 2026?",
    description:
      "This market resolves YES if BTC trades at or above $150,000 on any major exchange (Coinbase, Binance, Kraken) before Dec 31, 2026 23:59 UTC.",
    category: "Crypto",
    type: "binary",
    outcomes: binary(0.62),
    yesPrice: 0.62,
    volume: 1284500,
    volume24h: 184200,
    liquidity: 320000,
    endsAt: "Dec 31, 2026",
    endsAtTs: days(420),
    traders: 4821,
    trending: true,
    resolutionSource: "Coinbase, Binance, Kraken (median)",
    rules:
      "Resolves YES if BTC trades at or above $150,000 USD on at least 2 of the 3 reference exchanges for any continuous 1-minute window before the deadline.",
    history: genHistory(0.4, 0.62),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.62),
    recentTrades: sampleTrades(),
  },
  {
    id: "us-election-2028",
    title: "Who will win the 2028 US Presidential Election?",
    description: "Multi-outcome market on the next US presidential winner.",
    category: "Elections",
    type: "multi",
    outcomes: [
      { id: "dem", label: "Democratic nominee", price: 0.46, volume: 480000 },
      { id: "rep", label: "Republican nominee", price: 0.49, volume: 510000 },
      { id: "ind", label: "Independent", price: 0.04, volume: 22000 },
      { id: "other", label: "Other", price: 0.01, volume: 5000 },
    ],
    yesPrice: 0.49,
    volume: 1017000,
    volume24h: 84000,
    liquidity: 240000,
    endsAt: "Nov 7, 2028",
    endsAtTs: days(900),
    traders: 8412,
    trending: true,
    resolutionSource: "Associated Press call",
    rules: "Resolves to the candidate declared winner by AP after Electoral College certification.",
    history: genHistory(0.45, 0.49),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.49),
    recentTrades: sampleTrades(),
  },
  {
    id: "eth-flip",
    title: "Will ETH flip BTC in market cap by 2027?",
    description: "Resolves YES if ETH market cap > BTC market cap on CoinGecko at any point before Jan 1, 2027.",
    category: "Crypto",
    type: "binary",
    outcomes: binary(0.08),
    yesPrice: 0.08,
    volume: 540200,
    volume24h: 32100,
    liquidity: 120000,
    endsAt: "Jan 1, 2027",
    endsAtTs: days(440),
    traders: 1932,
    resolutionSource: "CoinGecko",
    rules: "ETH market cap must exceed BTC for at least one continuous hour on CoinGecko data.",
    history: genHistory(0.12, 0.08),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.08),
    recentTrades: sampleTrades(),
  },
  {
    id: "fed-cut-may",
    title: "Will the Fed cut rates in May 2026?",
    description: "Resolves YES if the FOMC reduces the federal funds target rate at the May 2026 meeting.",
    category: "Economy",
    type: "binary",
    outcomes: binary(0.74),
    yesPrice: 0.74,
    volume: 982300,
    volume24h: 142000,
    liquidity: 410000,
    endsAt: "May 31, 2026",
    endsAtTs: days(20),
    traders: 3210,
    trending: true,
    resolutionSource: "Federal Reserve official statement",
    rules: "Any rate cut (25bps or more) at the May FOMC meeting resolves YES.",
    history: genHistory(0.55, 0.74),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.74),
    recentTrades: sampleTrades(),
  },
  {
    id: "afcon-winner",
    title: "Will Nigeria win AFCON 2026?",
    description: "Resolves YES if Nigeria wins the 2026 Africa Cup of Nations.",
    category: "Sports",
    type: "binary",
    outcomes: binary(0.31),
    yesPrice: 0.31,
    volume: 412800,
    volume24h: 21000,
    liquidity: 95000,
    endsAt: "Feb 15, 2026",
    endsAtTs: days(10),
    traders: 2715,
    resolutionSource: "CAF official",
    rules: "Resolves to the team awarded the AFCON 2026 trophy.",
    history: genHistory(0.25, 0.31),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.31),
    recentTrades: sampleTrades(),
  },
  {
    id: "openai-ipo",
    title: "Will OpenAI IPO before 2027?",
    description: "Resolves YES if OpenAI shares list on a public exchange before Jan 1, 2027.",
    category: "Tech",
    type: "binary",
    outcomes: binary(0.22),
    yesPrice: 0.22,
    volume: 678400,
    volume24h: 41000,
    liquidity: 180000,
    endsAt: "Dec 31, 2026",
    endsAtTs: days(420),
    traders: 1840,
    isNew: true,
    resolutionSource: "SEC filings",
    rules: "Confirmed S-1 effective with first day of trading before deadline.",
    history: genHistory(0.18, 0.22),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.22),
    recentTrades: sampleTrades(),
  },
  {
    id: "sol-300",
    title: "Will Solana hit $300 in 2026?",
    description: "Resolves YES if SOL trades at or above $300 in 2026.",
    category: "Crypto",
    type: "binary",
    outcomes: binary(0.45),
    yesPrice: 0.45,
    volume: 524100,
    volume24h: 62000,
    liquidity: 140000,
    endsAt: "Dec 31, 2026",
    endsAtTs: days(420),
    traders: 2401,
    isNew: true,
    resolutionSource: "Coinbase, Binance",
    rules: "Median price ≥ $300 on at least 2 reference exchanges for any continuous 1m window.",
    history: genHistory(0.35, 0.45),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.45),
    recentTrades: sampleTrades(),
  },
  {
    id: "ng-election",
    title: "Will turnout exceed 40% in next Nigerian election?",
    description: "Resolves YES if INEC reports voter turnout above 40%.",
    category: "Politics",
    type: "binary",
    outcomes: binary(0.38),
    yesPrice: 0.38,
    volume: 215400,
    volume24h: 8200,
    liquidity: 60000,
    endsAt: "Feb 25, 2027",
    endsAtTs: days(700),
    traders: 894,
    resolutionSource: "INEC official report",
    rules: "Final certified turnout must exceed 40.00%.",
    history: genHistory(0.42, 0.38),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.38),
    recentTrades: sampleTrades(),
  },
  {
    id: "tesla-1t",
    title: "Will Tesla reach $1T market cap by Q4 2026?",
    description: "Resolves YES if TSLA market cap ≥ $1T at any market close in Q4 2026.",
    category: "Tech",
    type: "binary",
    outcomes: binary(0.51),
    yesPrice: 0.51,
    volume: 386200,
    volume24h: 18000,
    liquidity: 110000,
    endsAt: "Dec 31, 2026",
    endsAtTs: days(420),
    traders: 1602,
    resolutionSource: "Nasdaq close, shares outstanding from 10-Q",
    rules: "Closing market cap ≥ $1,000,000,000,000 on any trading day in Q4 2026.",
    history: genHistory(0.43, 0.51),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.51),
    recentTrades: sampleTrades(),
  },
  {
    id: "world-cup-2026",
    title: "Who will win the FIFA World Cup 2026?",
    description: "Multi-outcome market on the 2026 World Cup winner.",
    category: "Sports",
    type: "multi",
    outcomes: [
      { id: "arg", label: "Argentina", price: 0.18, volume: 220000 },
      { id: "fra", label: "France", price: 0.15, volume: 190000 },
      { id: "bra", label: "Brazil", price: 0.14, volume: 180000 },
      { id: "eng", label: "England", price: 0.12, volume: 160000 },
      { id: "esp", label: "Spain", price: 0.11, volume: 140000 },
      { id: "ger", label: "Germany", price: 0.08, volume: 95000 },
      { id: "other", label: "Other", price: 0.22, volume: 240000 },
    ],
    yesPrice: 0.18,
    volume: 1225000,
    volume24h: 96000,
    liquidity: 300000,
    endsAt: "Jul 19, 2026",
    endsAtTs: days(70),
    traders: 6230,
    trending: true,
    resolutionSource: "FIFA official",
    rules: "Resolves to the winning national team of the 2026 FIFA World Cup final.",
    history: genHistory(0.14, 0.18),
    comments: sampleComments,
    orderBook: sampleOrderBook(0.18),
    recentTrades: sampleTrades(),
  },
];

export const TOP_TRADERS = [
  { rank: 1, name: "0xWhale", avatar: "🐋", pnl: 184320, volume: 2400000, winRate: 71 },
  { rank: 2, name: "PredictPro", avatar: "🧠", pnl: 92140, volume: 1280000, winRate: 68 },
  { rank: 3, name: "Chika.eth", avatar: "👑", pnl: 78420, volume: 980000, winRate: 64 },
  { rank: 4, name: "Solwhale", avatar: "🦅", pnl: 51230, volume: 720000, winRate: 62 },
  { rank: 5, name: "CryptoNaija", avatar: "🦁", pnl: 41020, volume: 610000, winRate: 60 },
  { rank: 6, name: "0xAlpha", avatar: "🦊", pnl: 32400, volume: 510000, winRate: 58 },
  { rank: 7, name: "Bola.eth", avatar: "🌟", pnl: 24210, volume: 410000, winRate: 56 },
  { rank: 8, name: "Anon", avatar: "🎭", pnl: 18120, volume: 320000, winRate: 54 },
];

export const ACTIVITY_FEED = [
  { id: "a1", user: "0xWhale", action: "bought", side: "YES", market: "btc-150k", marketTitle: "BTC reach $150,000?", shares: 5000, price: 62, amount: 3100, time: "2m ago" },
  { id: "a2", user: "Chika.eth", action: "bought", side: "NO", market: "afcon-winner", marketTitle: "Nigeria win AFCON 2026?", shares: 1200, price: 69, amount: 828, time: "5m ago" },
  { id: "a3", user: "PredictPro", action: "sold", side: "YES", market: "fed-cut-may", marketTitle: "Fed cut rates May?", shares: 800, price: 74, amount: 592, time: "8m ago" },
  { id: "a4", user: "Solwhale", action: "bought", side: "YES", market: "world-cup-2026", marketTitle: "World Cup 2026 winner", shares: 2200, price: 18, amount: 396, time: "12m ago" },
  { id: "a5", user: "CryptoNaija", action: "bought", side: "YES", market: "sol-300", marketTitle: "SOL hit $300 in 2026?", shares: 3000, price: 45, amount: 1350, time: "18m ago" },
  { id: "a6", user: "0xAlpha", action: "sold", side: "NO", market: "openai-ipo", marketTitle: "OpenAI IPO before 2027?", shares: 600, price: 78, amount: 468, time: "25m ago" },
  { id: "a7", user: "Bola.eth", action: "bought", side: "YES", market: "tesla-1t", marketTitle: "Tesla $1T market cap?", shares: 900, price: 51, amount: 459, time: "32m ago" },
  { id: "a8", user: "Anon", action: "bought", side: "NO", market: "eth-flip", marketTitle: "ETH flip BTC by 2027?", shares: 5000, price: 92, amount: 4600, time: "44m ago" },
];
