export interface StockNews {
  title: string;
  source: string;
  time: string;
}

export interface Stock {
  ticker: string;
  name: string;
  logo: string;
  color: string;
  price: number;
  change: number;
  marketCap: string;
  peRatio: string;
  volume: string;
  about: string;
  dividendYield: string; // "0.44%" or "—"
  dividendPerShare: string; // "$1.00" or "—"
  exDividendDate: string; // "Nov 10, 2025" or "—"
  news: StockNews[];
}

export interface IPO {
  ticker: string;
  name: string;
  logo: string;
  color: string;
  priceRange: string;
  expectedDate: string;
  valuation: string;
  status: "upcoming" | "live" | "recent";
  about: string;
}

export const STOCKS: Stock[] = [
  {
    ticker: "AAPL", name: "Apple", logo: "🍎", color: "#000000",
    price: 234.12, change: 1.42, marketCap: "$3.52T", peRatio: "36.4", volume: "48.2M",
    about: "Designs, manufactures, and markets smartphones, computers, wearables, and accessories worldwide.",
    dividendYield: "0.44%", dividendPerShare: "$1.04", exDividendDate: "Nov 10, 2025",
    news: [
      { title: "Apple unveils new AI features across iPhone lineup", source: "Reuters", time: "2h ago" },
      { title: "iPhone 17 sales beat street estimates in Q4", source: "Bloomberg", time: "6h ago" },
      { title: "Analysts raise price target following services growth", source: "CNBC", time: "1d ago" },
    ],
  },
  {
    ticker: "GOOGL", name: "Google", logo: "G", color: "#4285F4",
    price: 188.21, change: 0.42, marketCap: "$2.30T", peRatio: "26.5", volume: "19.6M",
    about: "Provides online advertising services, cloud, devices, and other platforms worldwide via Google and Other Bets.",
    dividendYield: "0.42%", dividendPerShare: "$0.80", exDividendDate: "Dec 9, 2025",
    news: [
      { title: "Alphabet's Gemini 3 launches with major AI upgrades", source: "The Verge", time: "1h ago" },
      { title: "Google Cloud revenue jumps 34% year over year", source: "WSJ", time: "5h ago" },
      { title: "YouTube ad revenue tops estimates", source: "Reuters", time: "1d ago" },
    ],
  },
  {
    ticker: "TSLA", name: "Tesla", logo: "T", color: "#E31937",
    price: 351.04, change: -2.13, marketCap: "$1.12T", peRatio: "92.2", volume: "98.4M",
    about: "Designs, develops, manufactures, and sells electric vehicles and energy generation systems.",
    dividendYield: "—", dividendPerShare: "—", exDividendDate: "—",
    news: [
      { title: "Tesla robotaxi expansion delayed in Europe", source: "Bloomberg", time: "3h ago" },
      { title: "Cybertruck deliveries hit new monthly record", source: "Electrek", time: "8h ago" },
      { title: "Musk unveils affordable Model 2 production timeline", source: "Reuters", time: "1d ago" },
    ],
  },
  {
    ticker: "SPACEX", name: "SpaceX", logo: "🚀", color: "#005288",
    price: 412.75, change: 4.85, marketCap: "$350B", peRatio: "—", volume: "5.2M",
    about: "Private aerospace manufacturer and space transportation company. Tokenized pre-IPO exposure on Kimaex.",
    dividendYield: "—", dividendPerShare: "—", exDividendDate: "—",
    news: [
      { title: "Starship completes 12th successful orbital test", source: "SpaceNews", time: "4h ago" },
      { title: "Starlink surpasses 8 million active subscribers", source: "Reuters", time: "10h ago" },
      { title: "SpaceX secures $2B NASA lunar contract", source: "Ars Technica", time: "2d ago" },
    ],
  },
  {
    ticker: "NVDA", name: "NVIDIA", logo: "N", color: "#76B900",
    price: 142.55, change: 3.21, marketCap: "$3.48T", peRatio: "65.8", volume: "210.1M",
    about: "Provides graphics, compute, and networking solutions for gaming, data center, and AI markets.",
    dividendYield: "0.03%", dividendPerShare: "$0.04", exDividendDate: "Dec 5, 2025",
    news: [
      { title: "NVIDIA Blackwell chips sold out through 2026", source: "Tom's Hardware", time: "2h ago" },
      { title: "Data center revenue rises 94% year over year", source: "CNBC", time: "7h ago" },
      { title: "Jensen Huang: 'AI infrastructure is the new electricity'", source: "Bloomberg", time: "1d ago" },
    ],
  },
];

export const IPOS: IPO[] = [
  {
    ticker: "STRP", name: "Stripe", logo: "S", color: "#635BFF",
    priceRange: "$62 – $68", expectedDate: "Q1 2026", valuation: "$95B", status: "upcoming",
    about: "Global payments infrastructure powering millions of businesses online.",
  },
  {
    ticker: "DBRK", name: "Databricks", logo: "D", color: "#FF3621",
    priceRange: "$85 – $95", expectedDate: "Feb 12, 2026", valuation: "$62B", status: "upcoming",
    about: "Data + AI platform unifying analytics, warehousing, and machine learning.",
  },
  {
    ticker: "CHIME", name: "Chime", logo: "C", color: "#00D48F",
    priceRange: "$32 – $38", expectedDate: "Live now", valuation: "$25B", status: "live",
    about: "Digital neobank providing fee-free checking and savings to millions.",
  },
  {
    ticker: "KLNA", name: "Klarna", logo: "K", color: "#FFA8CD",
    priceRange: "$40 – $46", expectedDate: "Jan 22, 2026", valuation: "$14B", status: "upcoming",
    about: "Buy-now-pay-later fintech serving 150M+ shoppers worldwide.",
  },
  {
    ticker: "RDDT2", name: "Reddit AI", logo: "R", color: "#FF4500",
    priceRange: "$28 – $34", expectedDate: "Recently listed", valuation: "$8B", status: "recent",
    about: "Reddit's AI data-licensing spinout powering LLM training pipelines.",
  },
];
