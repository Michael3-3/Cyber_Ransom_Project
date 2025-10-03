import React, { useState } from 'react';
import { Key, Unlock } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { apiService } from '../services/api';

interface DecryptionPanelProps {
  onDecryptionComplete: () => void;
}

export const DecryptionPanel: React.FC<DecryptionPanelProps> = ({ onDecryptionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [targetDir, setTargetDir] = useState('');
  const [keyFile, setKeyFile] = useState('');

  const handleDecrypt = async () => {
    if (!targetDir.trim() || !keyFile.trim()) return;
    
    setLoading(true);
    try {
      await apiService.decrypt(targetDir, keyFile);
      onDecryptionComplete();
    } catch (error) {
      console.error('Decryption failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="File Decryption">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Key className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium">Decrypt Files</p>
            <p className="text-sm text-gray-400">
              Restore encrypted files using the decryption key
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Directory
          </label>
          <input
            type="text"
            value={targetDir}
            onChange={(e) => setTargetDir(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="/path/to/encrypted/files"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Key File Path
          </label>
          <input
            type="text"
            value={keyFile}
            onChange={(e) => setKeyFile(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="/path/to/decryption.key"
          />
        </div>

        <Button
          onClick={handleDecrypt}
          loading={loading}
          variant="success"
          className="w-full"
          disabled={!targetDir.trim() || !keyFile.trim()}
        >
          <Unlock className="h-4 w-4 mr-2" />
          Start Decryption
        </Button>

        <div className="text-xs text-gray-500 bg-gray-800/50 p-3 rounded-lg">
          <strong>Tip:</strong> The key file is typically generated during the attack simulation and saved in the target directory.
        </div>
      </div>
    </Card>
  );
};