import React, { useState } from 'react';
import { Shield, ShieldOff, Play, Square } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { StatusIndicator } from './StatusIndicator';
import { apiService } from '../services/api';

interface DetectorPanelProps {
  isRunning: boolean;
  onStatusChange: (running: boolean) => void;
}

export const DetectorPanel: React.FC<DetectorPanelProps> = ({ isRunning, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [targetPath, setTargetPath] = useState('/tmp/demo_target');

  const handleStart = async () => {
    if (!targetPath.trim()) return;
    
    setLoading(true);
    try {
      await apiService.startDetector(targetPath);
      onStatusChange(true);
    } catch (error) {
      console.error('Failed to start detector:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await apiService.stopDetector();
      onStatusChange(false);
    } catch (error) {
      console.error('Failed to stop detector:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Ransomware Detector" headerAction={
      <StatusIndicator 
        status={isRunning ? 'online' : 'offline'}
        label={isRunning ? 'Active' : 'Inactive'}
      />
    }>
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          {isRunning ? (
            <Shield className="h-8 w-8 text-green-400" />
          ) : (
            <ShieldOff className="h-8 w-8 text-gray-400" />
          )}
          <div>
            <p className="text-white font-medium">
              {isRunning ? 'Protection Active' : 'Protection Inactive'}
            </p>
            <p className="text-sm text-gray-400">
              {isRunning ? 'Monitoring file system for threats' : 'Start detector to monitor threats'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Directory
          </label>
          <input
            type="text"
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="/path/to/monitor"
            disabled={isRunning}
          />
        </div>

        <div className="flex space-x-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              loading={loading}
              variant="success"
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Detector
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              loading={loading}
              variant="danger"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Detector
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};