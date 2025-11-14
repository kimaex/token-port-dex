import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Search, Star, TrendingUp, Zap } from "lucide-react";

const DApps = () => {
  const dapps = [
    { id: 1, name: "UniSwap", category: "DeFi", users: "2.5M", icon: "🦄", featured: true },
    { id: 2, name: "OpenSea", category: "NFT", users: "1.8M", icon: "🌊", featured: true },
    { id: 3, name: "Aave", category: "Lending", users: "900K", icon: "👻" },
    { id: 4, name: "Compound", category: "DeFi", users: "1.2M", icon: "🏛️" },
    { id: 5, name: "ENS", category: "Identity", users: "750K", icon: "🏷️" },
    { id: 6, name: "Curve", category: "DEX", users: "650K", icon: "📈" },
  ];

  const categories = [
    { name: "All", icon: Globe },
    { name: "DeFi", icon: TrendingUp },
    { name: "NFT", icon: Star },
    { name: "Gaming", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">DApp Browser</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search DApps..." className="pl-10" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button key={cat.name} variant="outline" size="sm" className="whitespace-nowrap">
                <Icon className="w-4 h-4 mr-1" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        <div className="space-y-3">
          {dapps.map((dapp) => (
            <Card key={dapp.id} className="hover:shadow-glow transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-card flex items-center justify-center text-2xl flex-shrink-0">
                    {dapp.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base truncate">{dapp.name}</CardTitle>
                      {dapp.featured && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {dapp.category} • {dapp.users} users
                    </CardDescription>
                  </div>
                  <Button size="sm">Open</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DApps;
