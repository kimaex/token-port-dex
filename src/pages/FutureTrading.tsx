import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, TrendingDown, ChevronDown, Settings, Star, BarChart3, 
  Link2, AlertCircle, Shield, Check, X, Info, Wallet, RefreshCw, Minus, Plus,
  ChevronRight, Calculator, Clock, ArrowDownUp, ArrowUpRight, ArrowDownRight, Copy
} from 'lucide-react';
import MiniPriceChart from "@/components/MiniPriceChart";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';

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
  openInterest: string;
  contractAddress: string;
}

interface Position {
  id: string;
  pair: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlPercent: number;
  leverage: string;
  margin: string;
  liquidationPrice: string;
  tp?: string;
  sl?: string;
}

interface Order {
  id: string;
  pair: string;
  side: 'long' | 'short';
  type: 'limit' | 'market' | 'conditional';
  price: string;
  amount: string;
  filled: string;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  time: string;
  tp?: string;
  sl?: string;
}

const tradingPairs: TradingPair[] = [
  { pair: 'BTCUSDT', price: '43,250.50', change: 2.45, volume: '1.2B', leverage: '100x', high24h: '44,100.00', low24h: '42,100.00', markPrice: '43,248.30', indexPrice: '43,252.10', fundingRate: '0.0100%', openInterest: '2.4B', contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
  { pair: 'ETHUSDT', price: '2,285.30', change: -1.23, volume: '890M', leverage: '100x', high24h: '2,350.00', low24h: '2,250.00', markPrice: '2,284.90', indexPrice: '2,285.50', fundingRate: '0.0085%', openInterest: '1.8B', contractAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },
  { pair: 'SOLUSDT', price: '98.45', change: 5.67, volume: '456M', leverage: '50x', high24h: '102.00', low24h: '92.00', markPrice: '98.42', indexPrice: '98.48', fundingRate: '0.0120%', openInterest: '650M', contractAddress: '0x570a5d26f7765ecb712c0924e4de545b89fd43df' },
  { pair: 'BNBUSDT', price: '312.80', change: 0.89, volume: '234M', leverage: '50x', high24h: '318.00', low24h: '308.00', markPrice: '312.75', indexPrice: '312.85', fundingRate: '0.0050%', openInterest: '420M', contractAddress: '0xb8c77482e45f1f44de1745f52c74426c631bdd52' },
  { pair: 'XRPUSDT', price: '0.6234', change: -2.15, volume: '178M', leverage: '50x', high24h: '0.6500', low24h: '0.6100', markPrice: '0.6232', indexPrice: '0.6236', fundingRate: '0.0075%', openInterest: '280M', contractAddress: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe' },
  { pair: 'DOGEUSDT', price: '0.0892', change: 3.45, volume: '145M', leverage: '25x', high24h: '0.0920', low24h: '0.0860', markPrice: '0.0891', indexPrice: '0.0893', fundingRate: '0.0200%', openInterest: '180M', contractAddress: '0xba2ae424d960c26247dd6c32edc70b295c744c43' },
  { pair: 'ADAUSDT', price: '0.5678', change: 1.23, volume: '98M', leverage: '50x', high24h: '0.5800', low24h: '0.5500', markPrice: '0.5676', indexPrice: '0.5680', fundingRate: '0.0065%', openInterest: '150M', contractAddress: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47' },
  { pair: 'MATICUSDT', price: '0.8912', change: -0.56, volume: '87M', leverage: '50x', high24h: '0.9100', low24h: '0.8700', markPrice: '0.8910', indexPrice: '0.8914', fundingRate: '0.0045%', openInterest: '120M', contractAddress: '0xcc42724c6683b7e57334c4e856f4c9965ed682bd' },
];

// Mock positions
const mockPositions: Position[] = [
  {
    id: '1',
    pair: 'BTCUSDT',
    side: 'long',
    size: '0.5',
    entryPrice: '42,500.00',
    markPrice: '43,250.50',
    pnl: '+375.25',
    pnlPercent: 8.83,
    leverage: '20x',
    margin: '1,062.50',
    liquidationPrice: '38,250.00',
    tp: '45,000.00',
    sl: '41,000.00'
  }
];

// Mock orders
const mockOrders: Order[] = [
  {
    id: '1',
    pair: 'ETHUSDT',
    side: 'long',
    type: 'limit',
    price: '2,200.00',
    amount: '2.5',
    filled: '0',
    status: 'open',
    time: '2024-01-15 14:32:05',
    tp: '2,500.00',
    sl: '2,100.00'
  }
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
  const { formatPrice, currency } = useCurrency();
  const [selectedPair, setSelectedPair] = useState<TradingPair>(tradingPairs[0]);
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showTPSLModal, setShowTPSLModal] = useState(false);
  const [showPositionDetails, setShowPositionDetails] = useState<Position | null>(null);
  const [showMarginModeModal, setShowMarginModeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState('');
  
  // Auto-connected state (no manual connection needed)
  const [isConnected, setIsConnected] = useState(true);
  
  // Auto-connect on mount
  useEffect(() => {
    setIsConnected(true);
  }, []);
  
  // Wallet balances
  const [mainWalletUSDC, setMainWalletUSDC] = useState(5000.00);
  const [futuresWalletUSDC, setFuturesWalletUSDC] = useState(10000.00);
  
  // Trading state
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'conditional'>('limit');
  const [tradeDirection, setTradeDirection] = useState<'long' | 'short'>('long');
  const [marginMode, setMarginMode] = useState<'cross' | 'isolated'>('cross');
  const [leverage, setLeverage] = useState(20);
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('position');
  
  // TP/SL state
  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [tpType, setTpType] = useState<'mark' | 'last'>('last');
  const [slType, setSlType] = useState<'mark' | 'last'>('last');
  
  // Conditional order state
  const [triggerPrice, setTriggerPrice] = useState('');
  const [triggerType, setTriggerType] = useState<'mark' | 'last' | 'index'>('last');
  
  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Hyperliquid contract address for USDC
  const hlUSDCContract = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7";

  const basePrice = parseFloat(selectedPair.price.replace(',', ''));
  const orderBook = generateOrderBook(basePrice);

  // Connection is automatic - no manual steps needed

  const handleTransfer = () => {
    const transferValue = parseFloat(transferAmount);
    if (!transferValue || transferValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (transferValue < 0.5) {
      toast.error('Minimum transfer amount is $0.50');
      return;
    }
    
    if (transferType === 'deposit') {
      if (transferValue > mainWalletUSDC) {
        toast.error('Insufficient USDC in main wallet');
        return;
      }
      setMainWalletUSDC(prev => prev - transferValue);
      setFuturesWalletUSDC(prev => prev + transferValue);
      toast.success(`Deposited ${transferValue.toFixed(2)} USDC to Futures wallet`);
    } else {
      if (transferValue > futuresWalletUSDC) {
        toast.error('Insufficient USDC in futures wallet');
        return;
      }
      setFuturesWalletUSDC(prev => prev - transferValue);
      setMainWalletUSDC(prev => prev + transferValue);
      toast.success(`Withdrawn ${transferValue.toFixed(2)} USDC to Main wallet`);
    }
    
    setTransferAmount('');
    setShowTransferModal(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  const handleOpenPosition = () => {
    if (!amount) {
      toast.error('Please enter amount');
      return;
    }
    if (parseFloat(amount) < 0.5) {
      toast.error('Minimum trade amount is $0.50');
      return;
    }
    
    if (orderType === 'limit' && !price) {
      toast.error('Please enter price');
      return;
    }
    
    if (orderType === 'conditional' && !triggerPrice) {
      toast.error('Please enter trigger price');
      return;
    }

    toast.success(`${tradeDirection === 'long' ? 'Long' : 'Short'} position opened successfully!`);
  };

  // Helper to format USD price to local currency
  const formatUSDToLocal = (usdPrice: string) => {
    const numericPrice = parseFloat(usdPrice.replace(/,/g, ''));
    if (isNaN(numericPrice)) return usdPrice;
    return formatPrice(numericPrice);
  };

  const calculateTPSLPercent = (type: 'tp' | 'sl', targetPrice: string) => {
    const entry = orderType === 'market' ? basePrice : parseFloat(price || String(basePrice));
    const target = parseFloat(targetPrice);
    if (!entry || !target) return 0;
    
    const percent = ((target - entry) / entry) * 100;
    return type === 'tp' ? (tradeDirection === 'long' ? percent : -percent) : (tradeDirection === 'long' ? -percent : percent);
  };

  // Transfer Modal (Deposit/Withdraw)
  if (showTransferModal) {
    const availableBalance = transferType === 'deposit' ? mainWalletUSDC : futuresWalletUSDC;
    
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
            <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-muted rounded-lg">
              <X className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Transfer USDC</h1>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Transfer Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setTransferType('deposit')}
                className={`py-3 text-sm font-semibold rounded-md transition-colors ${
                  transferType === 'deposit' 
                    ? 'bg-green-500 text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 inline mr-2" />
                Deposit to Futures
              </button>
              <button
                onClick={() => setTransferType('withdraw')}
                className={`py-3 text-sm font-semibold rounded-md transition-colors ${
                  transferType === 'withdraw' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 inline mr-2" />
                Withdraw to Main
              </button>
            </div>

            {/* Transfer Flow Visual */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Main Wallet</p>
                  <p className="text-sm font-bold text-foreground">{mainWalletUSDC.toFixed(2)} USDC</p>
                </div>
                
                <div className="flex-shrink-0 px-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transferType === 'deposit' ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    <ArrowDownUp className={`w-5 h-5 ${
                      transferType === 'deposit' ? 'text-green-500 rotate-180' : 'text-orange-500'
                    }`} />
                  </div>
                </div>
                
                <div className="text-center flex-1">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Futures Wallet</p>
                  <p className="text-sm font-bold text-foreground">{futuresWalletUSDC.toFixed(2)} USDC</p>
                </div>
              </div>
            </div>

            {/* Network Badge */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-400">HL</span>
              </div>
              <span className="text-sm text-emerald-400 font-medium">Hyperliquid Network</span>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Amount</label>
                <span className="text-xs text-muted-foreground">
                  Available: <span className="text-foreground font-medium">{availableBalance.toFixed(2)} USDC</span>
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="pr-24 text-lg font-bold bg-muted border-border h-14"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    onClick={() => setTransferAmount(availableBalance.toString())}
                    className="text-xs text-primary font-medium hover:text-primary/80"
                  >
                    MAX
                  </button>
                  <span className="text-sm text-muted-foreground">USDC</span>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTransferAmount((availableBalance * pct / 100).toFixed(2))}
                  className="py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Fee Info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee (2%)</span>
                <span className="text-foreground">{(parseFloat(transferAmount || "0") * 0.02).toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleTransfer}
              disabled={!transferAmount || parseFloat(transferAmount) <= 0}
              className={`w-full h-12 text-lg font-semibold ${
                transferType === 'deposit' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {transferType === 'deposit' ? 'Deposit to Futures' : 'Withdraw to Main Wallet'}
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Leverage Modal
  if (showLeverageModal) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
            <button onClick={() => setShowLeverageModal(false)} className="p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Adjust Leverage</h1>
          </div>
          
          <div className="p-4 space-y-6">
            <div className="text-center">
              <span className="text-5xl font-bold text-primary">{leverage}x</span>
              <p className="text-sm text-muted-foreground mt-2">Current Leverage</p>
            </div>

            <div className="px-4">
              <Slider
                value={[leverage]}
                onValueChange={(value) => setLeverage(value[0])}
                max={parseInt(selectedPair.leverage)}
                min={1}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1x</span>
                <span>{selectedPair.leverage}</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 5, 10, 25, 50, 75, 100].filter(l => l <= parseInt(selectedPair.leverage)).map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    leverage === lev 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Position Size</span>
                <span className="text-foreground">{(100000 / leverage).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Initial Margin</span>
                <span className="text-foreground">{(100 / leverage).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Maintenance Margin</span>
                <span className="text-foreground">{(50 / leverage).toFixed(2)}%</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Higher leverage increases both potential profit and risk of liquidation. Trade responsibly.
              </p>
            </div>

            <Button onClick={() => setShowLeverageModal(false)} className="w-full">
              Confirm Leverage
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // TP/SL Modal
  if (showTPSLModal) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
            <button onClick={() => setShowTPSLModal(false)} className="p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Take Profit / Stop Loss</h1>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Take Profit Section */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-foreground">Take Profit</span>
                </div>
                <Switch checked={!!tpPrice} onCheckedChange={(checked) => !checked && setTpPrice('')} />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">TP Trigger Price</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter price"
                      value={tpPrice}
                      onChange={(e) => setTpPrice(e.target.value)}
                      className="pr-16 bg-muted border-border"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USDT</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {['+5%', '+10%', '+25%', '+50%', '+100%'].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        const percent = parseFloat(pct) / 100;
                        const entry = orderType === 'market' ? basePrice : parseFloat(price || String(basePrice));
                        const targetPrice = tradeDirection === 'long' 
                          ? entry * (1 + percent)
                          : entry * (1 - percent);
                        setTpPrice(targetPrice.toFixed(2));
                      }}
                      className="flex-1 py-1.5 text-xs bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"
                    >
                      {pct}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTpType('last')}
                    className={`flex-1 py-1.5 text-xs rounded ${tpType === 'last' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    Last Price
                  </button>
                  <button 
                    onClick={() => setTpType('mark')}
                    className={`flex-1 py-1.5 text-xs rounded ${tpType === 'mark' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    Mark Price
                  </button>
                </div>
                
                {tpPrice && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Est. Profit</span>
                    <span className="text-green-500">+{calculateTPSLPercent('tp', tpPrice).toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stop Loss Section */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-foreground">Stop Loss</span>
                </div>
                <Switch checked={!!slPrice} onCheckedChange={(checked) => !checked && setSlPrice('')} />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">SL Trigger Price</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter price"
                      value={slPrice}
                      onChange={(e) => setSlPrice(e.target.value)}
                      className="pr-16 bg-muted border-border"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USDT</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {['-5%', '-10%', '-25%', '-50%', '-75%'].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        const percent = Math.abs(parseFloat(pct)) / 100;
                        const entry = orderType === 'market' ? basePrice : parseFloat(price || String(basePrice));
                        const targetPrice = tradeDirection === 'long' 
                          ? entry * (1 - percent)
                          : entry * (1 + percent);
                        setSlPrice(targetPrice.toFixed(2));
                      }}
                      className="flex-1 py-1.5 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                    >
                      {pct}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSlType('last')}
                    className={`flex-1 py-1.5 text-xs rounded ${slType === 'last' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    Last Price
                  </button>
                  <button 
                    onClick={() => setSlType('mark')}
                    className={`flex-1 py-1.5 text-xs rounded ${slType === 'mark' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    Mark Price
                  </button>
                </div>
                
                {slPrice && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Max Loss</span>
                    <span className="text-red-500">{calculateTPSLPercent('sl', slPrice).toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={() => {
              setTpslEnabled(true);
              setShowTPSLModal(false);
            }} className="w-full">
              Confirm TP/SL
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Position Details Modal
  if (showPositionDetails) {
    const position = showPositionDetails;
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
            <button onClick={() => setShowPositionDetails(null)} className="p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Position Details</h1>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-bold text-lg text-foreground">{position.pair}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded ${position.side === 'long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {position.side.toUpperCase()} {position.leverage}
                  </span>
                </div>
                <div className={`text-right ${position.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <p className="font-bold">{position.pnl} USDT</p>
                  <p className="text-sm">{position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="text-foreground font-medium">{position.size} {position.pair.replace('USDT', '')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Margin</p>
                  <p className="text-foreground font-medium">{position.margin} USDT</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entry Price</p>
                  <p className="text-foreground font-medium">${position.entryPrice}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mark Price</p>
                  <p className="text-foreground font-medium">${position.markPrice}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Liq. Price</p>
                  <p className="text-red-500 font-medium">${position.liquidationPrice}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Leverage</p>
                  <p className="text-foreground font-medium">{position.leverage}</p>
                </div>
              </div>
            </div>

            {/* TP/SL Info */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3">TP/SL Orders</h3>
              <div className="space-y-2">
                {position.tp && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Take Profit</span>
                    </div>
                    <span className="text-green-500 font-medium">${position.tp}</span>
                  </div>
                )}
                {position.sl && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">Stop Loss</span>
                    </div>
                    <span className="text-red-500 font-medium">${position.sl}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                Add Margin
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Set TP/SL
              </Button>
            </div>

            <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
              Close Position
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

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
                    <p className="text-xs text-muted-foreground">Perpetual • {pair.leverage}</p>
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
            {/* Connection Status - Always connected */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400">
              <Link2 className="w-3 h-3" />
              Hyperliquid
            </div>
            <button className="p-2 hover:bg-muted rounded-lg">
              <Calculator className="w-5 h-5 text-muted-foreground" />
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
            {/* Margin Mode & Leverage */}
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => setMarginMode(marginMode === 'cross' ? 'isolated' : 'cross')}
                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
              >
                {marginMode === 'cross' ? 'Cross' : 'Isolated'}
              </button>
              <button 
                onClick={() => setShowLeverageModal(true)}
                className="px-2 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30"
              >
                {leverage}x
              </button>
            </div>

            {/* Long/Short Toggle */}
            <div className="grid grid-cols-2 gap-1 mb-2">
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

            {/* Order Type */}
            <div className="flex gap-1 mb-2">
              {(['limit', 'market', 'conditional'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`text-xs px-2 py-1 rounded capitalize ${
                    orderType === type 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Conditional Trigger Price */}
            {orderType === 'conditional' && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Trigger Price</label>
                  <select 
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as any)}
                    className="text-xs bg-transparent text-muted-foreground"
                  >
                    <option value="last">Last</option>
                    <option value="mark">Mark</option>
                    <option value="index">Index</option>
                  </select>
                </div>
                <Input
                  type="text"
                  placeholder="Trigger price"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  className="h-8 text-sm bg-muted border-border"
                />
              </div>
            )}

            {/* Price Input */}
            {(orderType === 'limit' || orderType === 'conditional') && (
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
            <div className="flex gap-1 mb-2">
              {['25%', '50%', '75%', '100%'].map((pct) => (
                <button
                  key={pct}
                  className="flex-1 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
                >
                  {pct}
                </button>
              ))}
            </div>

            {/* TP/SL Toggle */}
            <button 
              onClick={() => setShowTPSLModal(true)}
              className="w-full flex items-center justify-between p-2 mb-2 bg-muted rounded-lg hover:bg-muted/80"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">TP/SL</span>
                {(tpPrice || slPrice) && (
                  <span className="text-xs text-green-500">Active</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Submit Button */}
            <Button
              onClick={handleOpenPosition}
              className={`w-full font-semibold ${
                tradeDirection === 'long'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {!isConnected ? (
                <>
                  <Link2 className="w-4 h-4 mr-1" />
                  Connect to Trade
                </>
              ) : tradeDirection === 'long' ? (
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
                Position({mockPositions.length})
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Orders({mockOrders.length})
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

            <TabsContent value="position" className="mt-0">
              {mockPositions.length > 0 ? (
                <div className="divide-y divide-border">
                  {mockPositions.map((position) => (
                    <button
                      key={position.id}
                      onClick={() => setShowPositionDetails(position)}
                      className="w-full p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{position.pair}</span>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${position.side === 'long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {position.side.toUpperCase()} {position.leverage}
                          </span>
                        </div>
                        <div className={`text-right ${position.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <span className="font-medium">{position.pnl}</span>
                          <span className="text-xs ml-1">({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%)</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Size: {position.size}</span>
                        <span>Entry: ${position.entryPrice}</span>
                        <span>Mark: ${position.markPrice}</span>
                      </div>
                      {(position.tp || position.sl) && (
                        <div className="flex gap-4 mt-2 text-xs">
                          {position.tp && <span className="text-green-500">TP: ${position.tp}</span>}
                          {position.sl && <span className="text-red-500">SL: ${position.sl}</span>}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">No open positions</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              {mockOrders.length > 0 ? (
                <div className="divide-y divide-border">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{order.pair}</span>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${order.side === 'long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {order.side.toUpperCase()}
                          </span>
                          <span className="px-1.5 py-0.5 text-xs bg-muted rounded capitalize">{order.type}</span>
                        </div>
                        <button className="text-red-500 text-xs">Cancel</button>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Price: ${order.price}</span>
                        <span>Amount: {order.amount}</span>
                        <span>Filled: {order.filled}</span>
                      </div>
                      {(order.tp || order.sl) && (
                        <div className="flex gap-4 mt-2 text-xs">
                          {order.tp && <span className="text-green-500">TP: ${order.tp}</span>}
                          {order.sl && <span className="text-red-500">SL: ${order.sl}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">No open orders</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No trade history</p>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="mt-0">
              <div className="p-4 space-y-4">
                {/* Hyperliquid Network Badge */}
                <div className="flex items-center justify-center gap-2 py-2 bg-emerald-500/10 rounded-lg">
                  <div className="w-5 h-5 bg-emerald-500/30 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-400">HL</span>
                  </div>
                  <span className="text-sm text-emerald-400 font-medium">Hyperliquid Network</span>
                </div>

                {/* Main Wallet Balance */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Main Wallet (USDC)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-foreground">{mainWalletUSDC.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">USDC</span>
                  </div>
                </div>

                {/* Futures Wallet Balance */}
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-foreground">Futures Wallet (USDC)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-400">{futuresWalletUSDC.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">USDC</span>
                  </div>
                </div>

                {/* Balance Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Available Balance</span>
                    <span className="text-foreground">{(futuresWalletUSDC - 1062.50).toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Used Margin</span>
                    <span className="text-foreground">1,062.50 USDC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Unrealized PnL</span>
                    <span className="text-green-500">+375.25 USDC</span>
                  </div>
                </div>

                {/* Transfer Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    onClick={() => {
                      setTransferType('deposit');
                      setShowTransferModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={!isConnected}
                  >
                    <ArrowDownRight className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                  <Button 
                    onClick={() => {
                      setTransferType('withdraw');
                      setShowTransferModal(true);
                    }}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                    disabled={!isConnected}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </div>

                {!isConnected && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Connect to Hyperliquid network to deposit/withdraw USDC
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
            <span className="text-muted-foreground">OI: </span>
            <span className="text-foreground">{selectedPair.openInterest}</span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default FutureTrading;
