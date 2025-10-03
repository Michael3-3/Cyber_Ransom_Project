import React, { useState } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { apiService } from '../services/api';
import { AttackResult } from '../types/api';

interface AttackSimulationProps {
  onAttackComplete: (result: AttackResult) => void;
}

export const AttackSimulation: React.FC<AttackSimulationProps> = ({ onAttackComplete }) => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AttackResult | null>(null);

  const handleSimulateAttack = async () => {
    setLoading(true);
    try {
      const response = await apiService.simulateAttack();
      if (response.ok && response.result) {
        setLastResult(response.result);
        onAttackComplete(response.result);
      }
    } catch (error) {
      console.error('Attack simulation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Attack Simulation">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-medium">Ransomware Simulation</p>
            <p className="text-sm text-gray-400">
              Safe simulation of ransomware behavior for testing
            </p>
          </div>
        </div>

        {lastResult && (
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-medium">Last Attack Results:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Files Encrypted:</span>
                <span className="text-white ml-2">{lastResult.files_encrypted}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Size:</span>
                <span className="text-white ml-2">{(lastResult.total_size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <div className="pt-2">
              <span className="text-gray-400">Target:</span>
              <span className="text-white ml-2 font-mono text-xs">{lastResult.target_dir}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSimulateAttack}
          loading={loading}
          variant="danger"
          className="w-full"
        >
          <Zap className="h-4 w-4 mr-2" />
          Simulate Attack
        </Button>

        <div className="text-xs text-gray-500 bg-gray-800/50 p-3 rounded-lg">
          <strong>Note:</strong> This is a controlled simulation that creates temporary encrypted files for demonstration purposes only.
        </div>
      </div>
    </Card>
  );
};