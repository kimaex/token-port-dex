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
}

export const STOCKS: Stock[] = [
  { ticker: "AAPL", name: "Apple", logo: "🍎", color: "#000000", price: 234.12, change: 1.42, marketCap: "$3.52T", peRatio: "36.4", volume: "48.2M", about: "Designs, manufactures, and markets smartphones, computers, wearables, and accessories worldwide." },
  { ticker: "GOOGL", name: "Google", logo: "G", color: "#4285F4", price: 188.21, change: 0.42, marketCap: "$2.30T", peRatio: "26.5", volume: "19.6M", about: "Provides online advertising services, cloud, devices, and other platforms worldwide via Google and Other Bets." },
  { ticker: "TSLA", name: "Tesla", logo: "T", color: "#E31937", price: 351.04, change: -2.13, marketCap: "$1.12T", peRatio: "92.2", volume: "98.4M", about: "Designs, develops, manufactures, and sells electric vehicles and energy generation systems." },
  { ticker: "SPACEX", name: "SpaceX", logo: "🚀", color: "#005288", price: 412.75, change: 4.85, marketCap: "$350B", peRatio: "—", volume: "5.2M", about: "Private aerospace manufacturer and space transportation company. Tokenized pre-IPO exposure on Kimaex." },
  { ticker: "NVDA", name: "NVIDIA", logo: "N", color: "#76B900", price: 142.55, change: 3.21, marketCap: "$3.48T", peRatio: "65.8", volume: "210.1M", about: "Provides graphics, compute, and networking solutions for gaming, data center, and AI markets." },
];
