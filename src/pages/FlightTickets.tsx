import { useState } from "react";
import { ArrowLeft, Plane, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";

export default function FlightTickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [passengers, setPassengers] = useState<string>("1");

  const handleSearch = () => {
    if (!from || !to || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all flight details",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Searching Flights",
      description: "Finding the best flights for your journey...",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/more")}
            className="text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Flight Tickets</h1>
        </div>

        <Card className="p-6 mb-6 bg-gradient-primary border-0">
          <div className="flex items-center gap-3 mb-2">
            <Plane className="h-6 w-6 text-primary-foreground" />
            <span className="text-primary-foreground font-semibold text-lg">Book with Crypto</span>
          </div>
          <p className="text-primary-foreground text-sm opacity-90">
            Pay for flights using your crypto balance
          </p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Search Flights</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="from" className="text-foreground">From</Label>
              <Input
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Departure city"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="to" className="text-foreground">To</Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Destination city"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="date" className="text-foreground">Departure Date</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="passengers" className="text-foreground">Passengers</Label>
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Passenger</SelectItem>
                  <SelectItem value="2">2 Passengers</SelectItem>
                  <SelectItem value="3">3 Passengers</SelectItem>
                  <SelectItem value="4">4 Passengers</SelectItem>
                  <SelectItem value="5">5+ Passengers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Search Flights
            </Button>
          </div>
        </Card>

        <Card className="p-4 mt-6 bg-card border-border">
          <h3 className="font-semibold mb-2 text-foreground">Why Book with Us?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Pay directly with cryptocurrency</li>
            <li>• Competitive prices from major airlines</li>
            <li>• Instant booking confirmation</li>
            <li>• 24/7 customer support</li>
          </ul>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
