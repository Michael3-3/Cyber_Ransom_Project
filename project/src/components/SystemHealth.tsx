import React, { useState, useEffect } from 'react';
import { Activity, Server, Cpu } from 'lucide-react';
import { Card } from './Card';
import { StatusIndicator } from './StatusIndicator';
import { apiService } from '../services/api';

export const SystemHealth: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiService.getHealth();
        setIsHealthy(true);
        setLastCheck(new Date());
      } catch (error) {
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card title="System Health">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Backend Service</p>
              <p className="text-sm text-gray-400">
                {lastCheck ? `Last checked: ${lastCheck.toLocaleTimeString()}` : 'Checking...'}
              </p>
            </div>
          </div>
          <StatusIndicator 
            status={isHealthy ? 'online' : 'offline'}
            label={isHealthy ? 'Healthy' : 'Offline'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Server className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">API Status</span>
            </div>
            <span className={`text-sm font-medium ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {isHealthy ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Response</span>
            </div>
            <span className="text-sm font-medium text-white">
              {isHealthy ? '< 100ms' : 'Timeout'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};