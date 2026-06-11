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
  { ticker: "AAPL", name: "Apple Inc.", logo: "", color: "#A2AAAD", price: 234.12, change: 1.42, marketCap: "$3.52T", peRatio: "36.4", volume: "48.2M", about: "Designs, manufactures, and markets smartphones, computers, wearables, and accessories worldwide." },
  { ticker: "MSFT", name: "Microsoft Corp.", logo: "", color: "#00A4EF", price: 432.88, change: 0.86, marketCap: "$3.21T", peRatio: "37.1", volume: "21.5M", about: "Develops, licenses, and supports software, services, devices, and solutions worldwide." },
  { ticker: "NVDA", name: "NVIDIA Corp.", logo: "", color: "#76B900", price: 142.55, change: 3.21, marketCap: "$3.48T", peRatio: "65.8", volume: "210.1M", about: "Provides graphics, compute, and networking solutions for gaming, data center, and AI markets." },
  { ticker: "TSLA", name: "Tesla, Inc.", logo: "", color: "#E31937", price: 351.04, change: -2.13, marketCap: "$1.12T", peRatio: "92.2", volume: "98.4M", about: "Designs, develops, manufactures, and sells electric vehicles and energy generation systems." },
  { ticker: "AMZN", name: "Amazon.com, Inc.", logo: "", color: "#FF9900", price: 224.92, change: 1.05, marketCap: "$2.37T", peRatio: "47.6", volume: "33.8M", about: "Engages in the retail sale of consumer products, advertising, and subscription services through online and physical stores." },
  { ticker: "GOOGL", name: "Alphabet Inc.", logo: "", color: "#4285F4", price: 188.21, change: 0.42, marketCap: "$2.30T", peRatio: "26.5", volume: "19.6M", about: "Provides online advertising services, cloud, devices, and other platforms worldwide via Google and Other Bets." },
  { ticker: "META", name: "Meta Platforms", logo: "", color: "#1877F2", price: 612.55, change: -0.78, marketCap: "$1.55T", peRatio: "29.1", volume: "12.4M", about: "Builds technologies that help people connect through Facebook, Instagram, WhatsApp, and Reality Labs." },
  { ticker: "NFLX", name: "Netflix, Inc.", logo: "", color: "#E50914", price: 902.45, change: 2.55, marketCap: "$386B", peRatio: "47.3", volume: "4.1M", about: "Provides entertainment services with TV series, documentaries, feature films, and games across genres." },
];
