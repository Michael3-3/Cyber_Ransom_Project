const API_BASE = 'http://localhost:4000/api';

class ApiService {
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Detector methods
  async startDetector(target: string) {
    return this.post('/detector/start', { target });
  }

  async stopDetector() {
    return this.post('/detector/stop');
  }

  // Attack simulation
  async simulateAttack() {
    return this.post('/simulate-attack');
  }

  // Decryption
  async decrypt(targetDir: string, keyFile: string) {
    return this.post('/decrypt', { target_dir: targetDir, key_file: keyFile });
  }

  // File operations
  async getFiles() {
    return this.get('/files');
  }

  // Health check
  async getHealth() {
    return this.get('/health');
  }
}

export const apiService = new ApiService();