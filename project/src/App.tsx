import React, { useState } from 'react';
import { Shield, Terminal } from 'lucide-react';
import { DetectorPanel } from './components/DetectorPanel';
import { AttackSimulation } from './components/AttackSimulation';
import { FileBrowser } from './components/FileBrowser';
import { DecryptionPanel } from './components/DecryptionPanel';
import { SystemHealth } from './components/SystemHealth';
import { AttackResult } from './types/api';

function App() {
  const [detectorRunning, setDetectorRunning] = useState(false);
  const [lastAttack, setLastAttack] = useState<AttackResult | null>(null);

  const handleAttackComplete = (result: AttackResult) => {
    setLastAttack(result);
    // Auto-refresh file browser by updating a key or calling a callback
  };

  const handleDecryptionComplete = () => {
    // Refresh file browser after decryption
    window.location.reload(); // Simple refresh for demo
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CyberGuard</h1>
                <p className="text-sm text-gray-400">Ransomware Detection & Recovery Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* System Health - Full width on mobile, spans 2 cols on xl */}
          <div className="lg:col-span-2 xl:col-span-1">
            <SystemHealth />
          </div>

          {/* Detector Panel */}
          <div className="lg:col-span-1 xl:col-span-1">
            <DetectorPanel 
              isRunning={detectorRunning}
              onStatusChange={setDetectorRunning}
            />
          </div>

          {/* Attack Simulation */}
          <div className="lg:col-span-1 xl:col-span-1">
            <AttackSimulation onAttackComplete={handleAttackComplete} />
          </div>

          {/* File Browser - Spans 2 columns on lg and xl */}
          <div className="lg:col-span-2 xl:col-span-2">
            <FileBrowser />
          </div>

          {/* Decryption Panel */}
          <div className="lg:col-span-1 xl:col-span-1">
            <DecryptionPanel onDecryptionComplete={handleDecryptionComplete} />
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">System Status:</span>
              <span className={`text-sm font-medium ${detectorRunning ? 'text-green-400' : 'text-gray-400'}`}>
                {detectorRunning ? 'Protected' : 'Unprotected'}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Ready for operations • Backend: localhost:4000
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;