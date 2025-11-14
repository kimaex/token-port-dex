import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Mail } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");

  const handleEmailAuth = async (type: "login" | "signup") => {
    setLoading(true);
    try {
      if (type === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedPhraseAuth = async (type: "import" | "create") => {
    setLoading(true);
    try {
      if (type === "create") {
        const newSeedPhrase = generateSeedPhrase();
        setSeedPhrase(newSeedPhrase);
        toast.success("Seed phrase generated! Please save it securely.");
      } else {
        if (!seedPhrase.trim()) {
          toast.error("Please enter your seed phrase");
          return;
        }
        toast.success("Wallet imported successfully!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSeedPhrase = () => {
    const words = ["wallet", "secure", "crypto", "blockchain", "token", "digital", "asset", "trade", "network", "protocol", "ledger", "exchange"];
    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to CryptoVault</CardTitle>
          <CardDescription className="text-center">Sign in or create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="seed">
                <KeyRound className="w-4 h-4 mr-2" />
                Seed Phrase
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => handleEmailAuth("login")}
                  disabled={loading}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleEmailAuth("signup")}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="seed" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seedPhrase">12-Word Seed Phrase</Label>
                <Textarea
                  id="seedPhrase"
                  placeholder="Enter your 12-word seed phrase separated by spaces"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => handleSeedPhraseAuth("import")}
                  disabled={loading}
                  className="w-full"
                >
                  Import Wallet
                </Button>
                <Button
                  onClick={() => handleSeedPhraseAuth("create")}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Generate New Seed Phrase
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
