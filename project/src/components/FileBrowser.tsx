import React, { useState, useEffect } from 'react';
import { File, Folder, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { apiService } from '../services/api';
import { FileInfo } from '../types/api';

export const FileBrowser: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [targetDir, setTargetDir] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getFiles();
      if (response.ok) {
        setFiles(response.files || []);
        setTargetDir(response.target_dir || '');
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card title="File Browser" headerAction={
      <Button onClick={loadFiles} size="sm" variant="secondary" loading={loading}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    }>
      <div className="space-y-4">
        {targetDir && (
          <div className="bg-gray-700/30 rounded-lg p-3">
            <span className="text-gray-400 text-sm">Target Directory:</span>
            <p className="text-white font-mono text-sm mt-1">{targetDir}</p>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No files to display</p>
              <p className="text-xs">Simulate an attack to see encrypted files</p>
            </div>
          ) : (
            files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4 text-gray-400" />
                    {file.encrypted ? (
                      <Lock className="h-3 w-3 text-red-400" />
                    ) : (
                      <Unlock className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{file.path}</p>
                    <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    file.encrypted 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {file.encrypted ? 'Encrypted' : 'Normal'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {files.some(f => f.encrypted) && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                {files.filter(f => f.encrypted).length} encrypted files
              </span>
              <span className="text-gray-400">
                {files.filter(f => !f.encrypted).length} normal files
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};