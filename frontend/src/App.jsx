import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FileTable from './components/FileTable';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [detectorRunning, setDetectorRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  // fetch files
  const fetchFiles = async () => {
    try {
      const res = await axios.get('/api/files');
      if (res.data.ok) {
        setFiles(res.data.files);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // trigger attack
  const simulateAttack = async () => {
    setLoading(true);
    try {
      await axios.post('/api/simulate-attack');
      await fetchFiles();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // decrypt files
  const decryptFiles = async () => {
    setLoading(true);
    try {
      // update target_dir/key_file to match your last attack
      await axios.post('/api/decrypt', {
        target_dir: '/home/kali/cyber_project/python_sim/attack_target_fixed',
        key_file: '/home/kali/cyber_project/python_sim/session_key_fixed.key'
      });
      await fetchFiles();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // start detector
  const startDetector = async () => {
    try {
      await axios.post('/api/detector/start', {
        target: '/home/kali/cyber_project/python_sim/attack_target_fixed'
      });
      setDetectorRunning(true);
    } catch (err) { console.error(err); }
  };

  // stop detector
  const stopDetector = async () => {
    try {
      await axios.post('/api/detector/stop');
      setDetectorRunning(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 2000); // auto-refresh every 2s
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="dashboard">
    <h1 className="title">Ransomware Simulation Dashboard</h1>

    <div className="controls">
      <button onClick={simulateAttack} disabled={loading}>Simulate Attack</button>
      <button onClick={decryptFiles} disabled={loading}>Decrypt Files</button>
      <button onClick={startDetector} disabled={detectorRunning}>Start Detector</button>
      <button onClick={stopDetector} disabled={!detectorRunning}>Stop Detector</button>
    </div>

    <FileTable files={files} />
  </div>
  )
}

export default App;
