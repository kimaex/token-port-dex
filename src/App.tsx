import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Fiat from "./pages/Fiat";
import Swap from "./pages/Swap";
import NFTMarket from "./pages/NFTMarket";
import DApps from "./pages/DApps";
import History from "./pages/History";
import More from "./pages/More";
import ATMCard from "./pages/ATMCard";
import FlightTickets from "./pages/FlightTickets";
import UtilitiesBills from "./pages/UtilitiesBills";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/more" element={<More />} />
          <Route path="/atm-card" element={<ATMCard />} />
          <Route path="/flight-tickets" element={<FlightTickets />} />
          <Route path="/utilities-bills" element={<UtilitiesBills />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
