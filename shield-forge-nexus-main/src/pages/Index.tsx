import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, Briefcase, Eye, Lock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Cybersecurity Demo Platform</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Educational demonstration of ransomware attacks and cybersecurity protection
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Fake Job App Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-6 w-6 text-red-600" />
                  <span>Malicious Website Demo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Experience a fake job application website with malicious ads and popups that trigger ransomware attacks.
                </p>
                <div className="flex items-center space-x-2 mb-4 text-sm text-red-600">
                  <Eye className="h-4 w-4" />
                  <span>⚠️ For educational purposes only</span>
                </div>
                <Link to="/job-app">
                  <Button variant="outline" className="w-full border-red-200 hover:bg-red-50">
                    Visit Fake Job Site
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Dashboard Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span>Security Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Professional cybersecurity dashboard with real-time protection, file monitoring, and recovery tools.
                </p>
                <div className="flex items-center space-x-2 mb-4 text-sm text-blue-600">
                  <Lock className="h-4 w-4" />
                  <span>✓ Safe cybersecurity tools</span>
                </div>
                <Link to="/dashboard">
                  <Button className="w-full">
                    Open Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Educational Notice
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              This platform is designed for cybersecurity education and awareness. The "malicious" components are safe simulations 
              that help users understand ransomware attack vectors and protection strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
