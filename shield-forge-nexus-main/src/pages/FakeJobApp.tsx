import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { X, Gift, Zap, TrendingUp, DollarSign } from "lucide-react";

const FakeJobApp = () => {
  const [showPopup1, setShowPopup1] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [showPopup3, setShowPopup3] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Show annoying popups at intervals
    const timer1 = setTimeout(() => setShowPopup1(true), 3000);
    const timer2 = setTimeout(() => setShowPopup2(true), 8000);
    const timer3 = setTimeout(() => setShowPopup3(true), 15000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const redirectToDataCollection = () => {
    navigate('/data-collection');
  };

  const MaliciousAd = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div 
      className={`border-2 border-red-500 bg-gradient-to-r from-red-100 to-yellow-100 p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform animate-pulse ${className}`}
      onClick={redirectToDataCollection}
    >
      {children}
    </div>
  );

  const Popup = ({ show, onClose, children }: { show: boolean, onClose: () => void, children: React.ReactNode }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md relative animate-bounce">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 right-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with fake company branding */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">TechCorp Solutions - Career Portal</h1>
          <p className="text-sm opacity-90">Join the fastest growing tech company!</p>
        </div>
      </header>

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with malicious ads */}
        <div className="lg:col-span-1 space-y-4">
          <MaliciousAd>
            <div className="text-center">
              <Gift className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <h3 className="font-bold text-red-600">FREE GIFT!</h3>
              <p className="text-sm">Click here to claim your $1000 Amazon gift card!</p>
            </div>
          </MaliciousAd>

          <MaliciousAd>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <h3 className="font-bold text-yellow-600">URGENT!</h3>
              <p className="text-sm">Your computer is at risk! Download our security scanner now!</p>
            </div>
          </MaliciousAd>

          <MaliciousAd>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-bold text-green-600">CRYPTO BOOM!</h3>
              <p className="text-sm">Earn $5000 daily with this secret crypto method!</p>
            </div>
          </MaliciousAd>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Senior Software Engineer Position</CardTitle>
              <p className="text-muted-foreground">Remote • Full-time • $120k-180k</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter your phone number" />
              </div>
              
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input id="experience" placeholder="e.g., 5 years" />
              </div>
              
              <div>
                <Label htmlFor="cover">Cover Letter</Label>
                <Textarea 
                  id="cover" 
                  placeholder="Tell us why you're perfect for this role..."
                  rows={4}
                />
              </div>
              
              <Button onClick={redirectToDataCollection} className="w-full bg-green-600 hover:bg-green-700">
                Submit Application
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar with more ads */}
        <div className="lg:col-span-1 space-y-4">
          <MaliciousAd>
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-bold text-green-600">MAKE MONEY FAST!</h3>
              <p className="text-sm">Work from home and earn $300/day! No experience needed!</p>
            </div>
          </MaliciousAd>

          <MaliciousAd>
            <div className="text-center p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
              <h3 className="font-bold">🔥 HOT DEALS 🔥</h3>
              <p className="text-sm">Limited time offer! Click now or miss out forever!</p>
            </div>
          </MaliciousAd>

          <MaliciousAd>
            <div className="text-center p-2 bg-red-600 text-white rounded animate-pulse">
              <h3 className="font-bold">⚠️ VIRUS ALERT ⚠️</h3>
              <p className="text-sm">Your PC is infected! Click to scan now!</p>
            </div>
          </MaliciousAd>
        </div>
      </div>

      {/* Annoying Popups */}
      <Popup show={showPopup1} onClose={() => setShowPopup1(false)}>
        <div className="text-center" onClick={redirectToDataCollection}>
          <h2 className="text-xl font-bold text-red-600 mb-4">🎉 CONGRATULATIONS! 🎉</h2>
          <p className="mb-4">You've been selected as our 1000th visitor today!</p>
          <p className="mb-4">Click here to claim your FREE iPhone 15 Pro!</p>
          <Button className="bg-red-600 hover:bg-red-700">CLAIM NOW!</Button>
        </div>
      </Popup>

      <Popup show={showPopup2} onClose={() => setShowPopup2(false)}>
        <div className="text-center" onClick={redirectToDataCollection}>
          <h2 className="text-xl font-bold text-orange-600 mb-4">🚨 SECURITY WARNING 🚨</h2>
          <p className="mb-4">Your computer has been compromised!</p>
          <p className="mb-4">Download our antivirus software immediately!</p>
          <Button className="bg-orange-600 hover:bg-orange-700">DOWNLOAD NOW!</Button>
        </div>
      </Popup>

      <Popup show={showPopup3} onClose={() => setShowPopup3(false)}>
        <div className="text-center" onClick={redirectToDataCollection}>
          <h2 className="text-xl font-bold text-green-600 mb-4">💰 EXCLUSIVE OFFER 💰</h2>
          <p className="mb-4">Join our exclusive crypto trading group!</p>
          <p className="mb-4">Limited spots available - Act fast!</p>
          <Button className="bg-green-600 hover:bg-green-700">JOIN NOW!</Button>
        </div>
      </Popup>

      {/* Floating malicious ads */}
      <div className="fixed bottom-4 right-4 z-40">
        <MaliciousAd className="max-w-xs">
          <div className="text-center">
            <h3 className="font-bold text-blue-600">New Message!</h3>
            <p className="text-sm">You have 1 unread message from your bank. Click to view!</p>
          </div>
        </MaliciousAd>
      </div>
    </div>
  );
};

export default FakeJobApp;