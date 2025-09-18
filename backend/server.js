// server.js - controller for demo (safe, spawns local python scripts) - venv-aware
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Absolute paths - make sure these match your environment
const PY_DIR = path.join(__dirname, '..', 'python_sim');
const PY_VENV = '/home/kali/cyber_project/python_sim/venv/bin/python3'; // <- venv python absolute path

let detectorProc = null;
let lastAttackInfo = null;

// Helper: spawn a python script (uses venv python) and return promise with stdout
function runPython(script, args=[]) {
  return new Promise((resolve, reject) => {
    const p = spawn(PY_VENV, [path.join(PY_DIR, script), ...args], { cwd: PY_DIR });
    let out = '';
    let err = '';
    p.stdout.on('data', d => { out += d.toString(); });
    p.stderr.on('data', d => { err += d.toString(); });
    p.on('close', (code) => {
      if (code === 0) resolve({ out, err });
      else reject({ code, out, err });
    });
  });
}

// Start detector on given target dir (uses venv python)
app.post('/api/detector/start', (req, res) => {
  const { target } = req.body || {};
  if (!target) return res.status(400).json({ ok: false, msg: 'target required' });
  if (detectorProc) return res.json({ ok: false, msg: 'detector already running' });

  detectorProc = spawn(PY_VENV, [path.join(PY_DIR, 'detector.py'), target], { cwd: PY_DIR });

  detectorProc.stdout.on('data', d => console.log('[detector]', d.toString()));
  detectorProc.stderr.on('data', d => console.error('[detector-err]', d.toString()));
  detectorProc.on('close', (code) => {
    console.log('detector stopped', code);
    detectorProc = null;
  });

  res.json({ ok: true, msg: 'detector started', pid: detectorProc.pid });
});

app.post('/api/detector/stop', (req, res) => {
  if (!detectorProc) return res.json({ ok: false, msg: 'detector not running' });
  try {
    detectorProc.kill('SIGINT');
    detectorProc = null;
    res.json({ ok: true, msg: 'detector stopped' });
  } catch (e) {
    res.status(500).json({ ok: false, msg: String(e) });
  }
});

app.post('/api/simulate-attack', async (req, res) => {
  // run the python fake_ransom and capture its JSON output
  try {
    const { out } = await runPython('fake_ransom.py', []);
    // fake_ransom prints a json object at end
    let parsed = null;
    try { parsed = JSON.parse(out.trim().split('\n').slice(-1)[0]); } catch(e) {}
    lastAttackInfo = parsed || { raw: out };
    res.json({ ok: true, result: parsed || out });
  } catch (e) {
    res.status(500).json({ ok: false, e });
  }
});

app.post('/api/decrypt', async (req, res) => {
  // require: attack_target path and key_file
  const { target_dir, key_file } = req.body || {};
  if (!target_dir || !key_file) return res.status(400).json({ ok:false, msg: 'target_dir and key_file required' });
  try {
    await runPython('decrypt.py', [target_dir, key_file]);
    res.json({ ok: true, msg: 'decrypt invoked' });
  } catch (e) {
    res.status(500).json({ ok: false, e });
  }
});

app.get('/api/files', (req, res) => {
  // If lastAttackInfo known, list files in its target_dir else indicate none
  if (!lastAttackInfo || !lastAttackInfo.target_dir) return res.json({ ok: true, files: [] });
  const td = lastAttackInfo.target_dir;
  const files = [];
  function walk(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(i => {
      const p = path.join(dir, i);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else files.push({ path: path.relative(td, p), size: stat.size, encrypted: i.endsWith('.enc') || i === '__RANSOM_NOTE.txt' });
    });
  }
  try {
    walk(td);
  } catch (e) {
    return res.status(500).json({ ok: false, e: String(e) });
  }
  res.json({ ok: true, files, target_dir: td });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
