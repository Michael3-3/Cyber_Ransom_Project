🧠 Intelligent Ransomware Prevention & Detection System

⚠️ Warning — Do NOT run on production systems.
This repository is a controlled educational simulation of ransomware + detector + decryptor.
It is meant for learning, demonstrations, and defensive research only.
Always run inside an isolated VM (snapshot), offline or on an isolated network.

📘 Overview

This repository is a compact, self-contained ransomware simulation lab that includes three main components:

fake_ransom.py — A demo ransomware that:

Encrypts files in a target folder using symmetric (Fernet) encryption

Drops a ransom note

Saves a session key

decrypt.py — A rescuer script that:

Uses the saved key to decrypt .enc files

Securely removes ransom artifacts

detector.py — A real-time watcher and responder that:

Monitors the target folder for malicious activity using watchdog

Polls processes and uses lsof / ps to find suspicious ones

Kills offending processes (SIGKILL) when detected

Restores files from a canonical test_files source or timestamped snapshots

Logs activity to detector.log

This project is for learning defensive techniques — to understand how ransomware behaves and how endpoint protectors can detect and mitigate it.

🛠️ Technologies Used

Python 3.8+

cryptography (Fernet) — for symmetric encryption/decryption

watchdog — for real-time folder monitoring

lsof / ps — for process and file access detection

subprocess / signal / threading — for process control and concurrency

shutil / os / time / datetime / json — for filesystem and logging operations

👩‍💻 Contributors

Vallela Supritha

Pottella Mikhel

G Chandrasekhar

📦 Prerequisites
Requirements

Python 3.8+ (recommended)

Virtual environment (recommended)

Required Python packages (install using pip):

pip install -r requirements.txt


requirements.txt should include:

cryptography
watchdog
psutil


Note: Install lsof on Linux if missing:

sudo apt install lsof

🧰 Safe Setup (Recommended)

Create a disposable VM (VirtualBox / VMware / Cloud) and take a snapshot.

Clone this repository inside the VM.

Create a safe folder test_files/ containing sample files (text, images, documents).

Ensure no personal or shared data exists in the VM.

Confirm you have a snapshot to roll back.

🚀 Quick Demo (Safe Order)
Step 1 — Run the Detector
python detector.py

Step 2 — Simulate Ransomware (in another terminal)
python fake_ransom.py


Watch the detector’s output and check the detector.log.
You’ll notice it:

Detects .enc files or suspicious processes

Identifies the offending PID (ps / lsof)

Kills the ransomware process

Restores files from snapshots or test_files/

Step 3 — Manual Decryption (Optional)

If you have the key file, you can manually decrypt files:

python decrypt.py

📁 Project Layout
/ (repo root)
├─ fake_ransom.py        # demo ransomware (encrypts files)
├─ decrypt.py            # decryptor using saved session key
├─ detector.py           # real-time watcher and auto-restorer
├─ test_files/           # clean source files
├─ attack_target_fixed/  # target folder under attack
├─ detector_snapshots/   # backup snapshots
├─ session_key_fixed.key # generated encryption key
├─ detector.log          # detector runtime logs
└─ README.md

💡 Key Concepts / Talking Points

Symmetric Encryption:
Uses Fernet (AES + HMAC). One key for both encryption and decryption — must be protected.

Behavioral Detection:
Detector works by monitoring unusual behavior (rapid .enc creation, file access spikes) — not signatures.

Snapshots & Backups:
Enables quick recovery and forensics; in real-world cases, offline backups are crucial.

Limitations:
Secure deletion is not guaranteed on SSDs or journaled filesystems.
Detector needs proper privileges to terminate higher-privilege processes.

⚖️ Safety & Ethics (Must Read)

This repository is for research, defense, and education only.

Do not use it to harm or disrupt systems you don’t own or manage.

Follow your organization’s policies and local laws during any security testing.

🧩 Troubleshooting
Issue	Solution
lsof not found	Install via sudo apt install lsof
Permission denied when killing process	Run detector with admin/root privileges
Decryptor fails	Keep .key and .enc files; debug manually
📜 License

Choose an appropriate open-source license (e.g., MIT) and include a disclaimer on intended educational use.

Made with ❤️ for learning.
Contributors: Vallela Supritha • Pottella Mikhel • G Chandrasekhar
