import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  ShieldAlert, 
  Activity, 
  FileText, 
  Play, 
  Square, 
  Key,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download
} from "lucide-react";

interface FileInfo {
  path: string;
  size: number;
  encrypted: boolean;
}

interface FilesResponse {
  ok: boolean;
  files: FileInfo[];
  target_dir?: string;
}

const Dashboard = () => {
  const [detectorRunning, setDetectorRunning] = useState(false);
  const [targetDir, setTargetDir] = useState("/tmp/demo_target");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [targetDirForDecrypt, setTargetDirForDecrypt] = useState("");
  const [keyFile, setKeyFile] = useState("");
  const [stats, setStats] = useState({
    totalFiles: 0,
    encryptedFiles: 0,
    cleanFiles: 0
  });
  const { toast } = useToast();

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/files');
      const data: FilesResponse = await response.json();
      
      if (data.ok) {
        setFiles(data.files);
        setTargetDirForDecrypt(data.target_dir || "");
        
        // Update stats
        const total = data.files.length;
        const encrypted = data.files.filter(f => f.encrypted).length;
        setStats({
          totalFiles: total,
          encryptedFiles: encrypted,
          cleanFiles: total - encrypted
        });
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const startDetector = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/detector/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetDir })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        setDetectorRunning(true);
        toast({
          title: "Detector Started",
          description: `Monitoring ${targetDir} for suspicious activity`,
        });
      } else {
        toast({
          title: "Error",
          description: result.msg,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to security service",
        variant: "destructive"
      });
    }
  };

  const stopDetector = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/detector/stop', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.ok) {
        setDetectorRunning(false);
        toast({
          title: "Detector Stopped",
          description: "Monitoring has been disabled",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop detector",
        variant: "destructive"
      });
    }
  };

  const decryptFiles = async () => {
    if (!targetDirForDecrypt || !keyFile) {
      toast({
        title: "Missing Information",
        description: "Please provide both target directory and key file path",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_dir: targetDirForDecrypt, 
          key_file: keyFile 
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: "Decryption Started",
          description: "Files are being decrypted...",
        });
        // Refresh file list after a moment
        setTimeout(fetchFiles, 2000);
      } else {
        toast({
          title: "Decryption Failed",
          description: result.msg,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start decryption process",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchFiles();
    // Refresh files every 5 seconds
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">CyberGuard Pro</h1>
                <p className="text-sm text-muted-foreground">Advanced Ransomware Protection Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={detectorRunning ? "default" : "secondary"}>
                {detectorRunning ? "PROTECTED" : "OFFLINE"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Protection Status</p>
                  <p className="text-2xl font-bold">
                    {detectorRunning ? "ACTIVE" : "INACTIVE"}
                  </p>
                </div>
                {detectorRunning ? (
                  <Shield className="h-8 w-8 text-green-600" />
                ) : (
                  <ShieldAlert className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Encrypted Files</p>
                  <p className="text-2xl font-bold text-red-600">{stats.encryptedFiles}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clean Files</p>
                  <p className="text-2xl font-bold text-green-600">{stats.cleanFiles}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detector Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Real-time Protection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target-dir">Target Directory</Label>
                <Input
                  id="target-dir"
                  value={targetDir}
                  onChange={(e) => setTargetDir(e.target.value)}
                  placeholder="/path/to/monitor"
                />
              </div>
              
              <div className="flex space-x-2">
                {!detectorRunning ? (
                  <Button onClick={startDetector} className="flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Start Protection</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={stopDetector} 
                    variant="destructive"
                    className="flex items-center space-x-2"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop Protection</span>
                  </Button>
                )}
                
                <Button onClick={fetchFiles} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>File Recovery</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="decrypt-target">Target Directory</Label>
                <Input
                  id="decrypt-target"
                  value={targetDirForDecrypt}
                  onChange={(e) => setTargetDirForDecrypt(e.target.value)}
                  placeholder="/path/to/encrypted/files"
                />
              </div>
              
              <div>
                <Label htmlFor="key-file">Decryption Key File</Label>
                <Input
                  id="key-file"
                  value={keyFile}
                  onChange={(e) => setKeyFile(e.target.value)}
                  placeholder="/path/to/decryption.key"
                />
              </div>
              
              <Button 
                onClick={decryptFiles}
                className="w-full flex items-center space-x-2"
                disabled={!targetDirForDecrypt || !keyFile}
              >
                <Download className="h-4 w-4" />
                <span>Decrypt Files</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* File Monitor */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>File Monitor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files being monitored</p>
                <p className="text-sm">Start the detector to begin monitoring files</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((file, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      file.encrypted 
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
                        : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {file.encrypted ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{file.path}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={file.encrypted ? "destructive" : "default"}>
                      {file.encrypted ? "ENCRYPTED" : "CLEAN"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;