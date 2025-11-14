import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Search, TrendingUp } from "lucide-react";

const NFTMarket = () => {
  const nfts = [
    { id: 1, name: "Crypto Punk #1234", price: "2.5 ETH", image: "🎨", trending: true },
    { id: 2, name: "Bored Ape #5678", price: "3.2 ETH", image: "🐵" },
    { id: 3, name: "Cool Cat #9012", price: "1.8 ETH", image: "😺", trending: true },
    { id: 4, name: "Doodle #3456", price: "2.1 ETH", image: "✏️" },
    { id: 5, name: "Art Block #7890", price: "4.5 ETH", image: "🎭" },
    { id: 6, name: "Moonbird #2345", price: "3.7 ETH", image: "🦉", trending: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Image className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">NFT Marketplace</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search NFTs..." className="pl-10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden hover:shadow-glow transition-shadow cursor-pointer">
              <CardHeader className="p-0">
                <div className="aspect-square bg-gradient-card flex items-center justify-center text-6xl relative">
                  {nft.image}
                  {nft.trending && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <CardTitle className="text-sm mb-1 truncate">{nft.name}</CardTitle>
                <CardDescription className="text-xs font-semibold text-primary">{nft.price}</CardDescription>
                <Button size="sm" className="w-full mt-2">
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTMarket;
