import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning';
  label: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bg: 'bg-green-400/10',
          border: 'border-green-400/20'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10',
          border: 'border-yellow-400/20'
        };
      case 'offline':
      default:
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          border: 'border-red-400/20'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`p-1 rounded-full ${config.bg} ${config.border} border`}>
        <IconComponent className={`h-4 w-4 ${config.color}`} />
      </div>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </div>
  );
};