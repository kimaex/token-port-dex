import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, ChevronDown, Settings, Star, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNav } from '@/components/BottomNav';

interface TradingPair {
  pair: string;
  price: string;
  change: number;
  volume: string;
  leverage: string;
  high24h: string;
  low24h: string;
  markPrice: string;
  indexPrice: string;
  fundingRate: string;
}

const tradingPairs: TradingPair[] = [
  { pair: 'BTCUSDT', price: '43,250.50', change: 2.45, volume: '1.2B', leverage: '100x', high24h: '44,100.00', low24h: '42,100.00', markPrice: '43,248.30', indexPrice: '43,252.10', fundingRate: '0.0100%' },
  { pair: 'ETHUSDT', price: '2,285.30', change: -1.23, volume: '890M', leverage: '100x', high24h: '2,350.00', low24h: '2,250.00', markPrice: '2,284.90', indexPrice: '2,285.50', fundingRate: '0.0085%' },
  { pair: 'SOLUSDT', price: '98.45', change: 5.67, volume: '456M', leverage: '50x', high24h: '102.00', low24h: '92.00', markPrice: '98.42', indexPrice: '98.48', fundingRate: '0.0120%' },
  { pair: 'BNBUSDT', price: '312.80', change: 0.89, volume: '234M', leverage: '50x', high24h: '318.00', low24h: '308.00', markPrice: '312.75', indexPrice: '312.85', fundingRate: '0.0050%' },
  { pair: 'XRPUSDT', price: '0.6234', change: -2.15, volume: '178M', leverage: '50x', high24h: '0.6500', low24h: '0.6100', markPrice: '0.6232', indexPrice: '0.6236', fundingRate: '0.0075%' },
  { pair: 'DOGEUSDT', price: '0.0892', change: 3.45, volume: '145M', leverage: '25x', high24h: '0.0920', low24h: '0.0860', markPrice: '0.0891', indexPrice: '0.0893', fundingRate: '0.0200%' },
  { pair: 'ADAUSDT', price: '0.5678', change: 1.23, volume: '98M', leverage: '50x', high24h: '0.5800', low24h: '0.5500', markPrice: '0.5676', indexPrice: '0.5680', fundingRate: '0.0065%' },
  { pair: 'MATICUSDT', price: '0.8912', change: -0.56, volume: '87M', leverage: '50x', high24h: '0.9100', low24h: '0.8700', markPrice: '0.8910', indexPrice: '0.8914', fundingRate: '0.0045%' },
];

// Generate order book data
const generateOrderBook = (basePrice: number) => {
  const asks = Array.from({ length: 8 }, (_, i) => ({
    price: (basePrice * (1 + 0.0002 * (8 - i))).toFixed(2),
    amount: (Math.random() * 5 + 0.1).toFixed(4),
    total: (Math.random() * 50000 + 10000).toFixed(0),
  }));
  const bids = Array.from({ length: 8 }, (_, i) => ({
    price: (basePrice * (1 - 0.0002 * (i + 1))).toFixed(2),
    amount: (Math.random() * 5 + 0.1).toFixed(4),
    total: (Math.random() * 50000 + 10000).toFixed(0),
  }));
  return { asks, bids };
};

const FutureTrading = () => {
  const navigate = useNavigate();
  const [selectedPair, setSelectedPair] = useState<TradingPair>(tradingPairs[0]);
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [tradeDirection, setTradeDirection] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState('20');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('position');

  const basePrice = parseFloat(selectedPair.price.replace(',', ''));
  const orderBook = generateOrderBook(basePrice);

  // Pair Selector Modal
  if (showPairSelector) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
            <button onClick={() => setShowPairSelector(false)} className="p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Select Contract</h1>
          </div>
          
          <div className="p-3">
            <Input 
              placeholder="Search contracts..." 
              className="bg-muted border-border"
            />
          </div>

          <div className="divide-y divide-border">
            {tradingPairs.map((pair) => (
              <button
                key={pair.pair}
                onClick={() => {
                  setSelectedPair(pair);
                  setShowPairSelector(false);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{pair.pair}</p>
                    <p className="text-xs text-muted-foreground">Perpetual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">${pair.price}</p>
                  <p className={`text-xs ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {pair.change >= 0 ? '+' : ''}{pair.change}%
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header with pair selector */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-card">
          <button 
            onClick={() => setShowPairSelector(true)}
            className="flex items-center gap-2"
          >
            <span className="text-lg font-bold text-foreground">{selectedPair.pair}</span>
            <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">Perp</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Price Info Bar */}
        <div className="flex items-center justify-between p-3 bg-card border-b border-border">
          <div>
            <p className={`text-2xl font-bold ${selectedPair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${selectedPair.price}
            </p>
            <p className={`text-sm ${selectedPair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change}%
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Mark</span>
              <span className="text-foreground">${selectedPair.markPrice}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Index</span>
              <span className="text-foreground">${selectedPair.indexPrice}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">24h High</span>
              <span className="text-foreground">${selectedPair.high24h}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">24h Low</span>
              <span className="text-foreground">${selectedPair.low24h}</span>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="h-48 bg-card border-b border-border flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">TradingView Chart</p>
          </div>
        </div>

        {/* Order Book & Trade Panel Side by Side */}
        <div className="flex border-b border-border">
          {/* Order Book */}
          <div className="w-1/2 p-2 border-r border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Order Book</span>
              <span className="text-xs text-muted-foreground">0.01</span>
            </div>
            
            {/* Asks (Sell orders) */}
            <div className="space-y-0.5 mb-1">
              {orderBook.asks.slice(0, 5).map((order, i) => (
                <div key={`ask-${i}`} className="flex justify-between text-xs relative">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-red-500/10" 
                    style={{ width: `${Math.min(parseInt(order.total) / 500, 100)}%` }}
                  />
                  <span className="text-red-500 relative z-10">{order.price}</span>
                  <span className="text-muted-foreground relative z-10">{order.amount}</span>
                </div>
              ))}
            </div>

            {/* Current Price */}
            <div className="py-1 border-y border-border my-1">
              <span className={`text-sm font-bold ${selectedPair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${selectedPair.price}
              </span>
            </div>

            {/* Bids (Buy orders) */}
            <div className="space-y-0.5">
              {orderBook.bids.slice(0, 5).map((order, i) => (
                <div key={`bid-${i}`} className="flex justify-between text-xs relative">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-green-500/10" 
                    style={{ width: `${Math.min(parseInt(order.total) / 500, 100)}%` }}
                  />
                  <span className="text-green-500 relative z-10">{order.price}</span>
                  <span className="text-muted-foreground relative z-10">{order.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Panel */}
          <div className="w-1/2 p-2 bg-card">
            {/* Long/Short Toggle */}
            <div className="grid grid-cols-2 gap-1 mb-3">
              <button
                onClick={() => setTradeDirection('long')}
                className={`py-2 text-sm font-semibold rounded transition-colors ${
                  tradeDirection === 'long' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Long
              </button>
              <button
                onClick={() => setTradeDirection('short')}
                className={`py-2 text-sm font-semibold rounded transition-colors ${
                  tradeDirection === 'short' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Short
              </button>
            </div>

            {/* Leverage Selector */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">Leverage</span>
              <div className="flex-1 flex items-center gap-1">
                {['5', '10', '20', '50', '100'].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`flex-1 py-1 text-xs rounded ${
                      leverage === lev 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Order Type */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setOrderType('limit')}
                className={`text-xs px-2 py-1 rounded ${
                  orderType === 'limit' 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                Limit
              </button>
              <button
                onClick={() => setOrderType('market')}
                className={`text-xs px-2 py-1 rounded ${
                  orderType === 'market' 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                Market
              </button>
            </div>

            {/* Price Input */}
            {orderType === 'limit' && (
              <div className="mb-2">
                <Input
                  type="text"
                  placeholder="Price (USDT)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-8 text-sm bg-muted border-border"
                />
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-2">
              <Input
                type="text"
                placeholder="Amount (Contracts)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-8 text-sm bg-muted border-border"
              />
            </div>

            {/* Amount Shortcuts */}
            <div className="flex gap-1 mb-3">
              {['25%', '50%', '75%', '100%'].map((pct) => (
                <button
                  key={pct}
                  className="flex-1 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
                >
                  {pct}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              className={`w-full font-semibold ${
                tradeDirection === 'long'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {tradeDirection === 'long' ? (
                <>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Open Long
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Open Short
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Position Tabs */}
        <div className="bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
              <TabsTrigger 
                value="position" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Position(0)
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Orders(0)
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                History
              </TabsTrigger>
              <TabsTrigger 
                value="assets" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Assets
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Empty State */}
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No {activeTab} data</p>
          </div>
        </div>

        {/* Funding Rate Bar */}
        <div className="flex items-center justify-between p-3 bg-card border-t border-border text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Funding Rate: </span>
              <span className="text-green-500">{selectedPair.fundingRate}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Countdown: </span>
              <span className="text-foreground">07:59:32</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Vol 24h: </span>
            <span className="text-foreground">{selectedPair.volume}</span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default FutureTrading;
