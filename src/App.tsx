import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Fiat from "./pages/Fiat";
import Swap from "./pages/Swap";
import NFTMarket from "./pages/NFTMarket";
import DApps from "./pages/DApps";
import History from "./pages/History";
import Kimapre from "./pages/Kimapre";
import KimapreMarket from "./pages/KimapreMarket";
import ATMCard from "./pages/ATMCard";
import FlightTickets from "./pages/FlightTickets";
import UtilitiesBills from "./pages/UtilitiesBills";
import Settings from "./pages/Settings";
import StakeEarn from "./pages/StakeEarn";
import GovernmentBonds from "./pages/GovernmentBonds";
import SpinWin from "./pages/SpinWin";
import CopyTrading from "./pages/CopyTrading";
import Notifications from "./pages/Notifications";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Stocks from "./pages/Stocks";
import StockTradingGuide from "./pages/StockTradingGuide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/fiat" element={<Fiat />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/nft" element={<NFTMarket />} />
            <Route path="/dapps" element={<DApps />} />
            <Route path="/history" element={<History />} />
            <Route path="/kimapre" element={<Kimapre />} />
            <Route path="/kimapre/:id" element={<KimapreMarket />} />
            <Route path="/atm-card" element={<ATMCard />} />
            <Route path="/flight-tickets" element={<FlightTickets />} />
            <Route path="/utilities-bills" element={<UtilitiesBills />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/stake-earn" element={<StakeEarn />} />
            <Route path="/government-bonds" element={<GovernmentBonds />} />
            <Route path="/spin-win" element={<SpinWin />} />
            <Route path="/copy-trading" element={<CopyTrading />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/stocks/guide" element={<StockTradingGuide />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
