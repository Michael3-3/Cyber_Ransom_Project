#!/usr/bin/env python3
"""
Robust detector (single-file):
- Polls processes for any python process running fake_ransom.py (fast kill).
- Watches the parent dir for creation/deletion of attack_target_fixed and attaches a watcher.
- Watches the target dir for .enc / modifications; restores from canonical source and snapshots.
- Logs to detector.log
- Added: when an offender PID is found, attempts to discover remote IP addresses the PID
  has connected to (lsof -> ss -> /proc mapping) and logs IPs + reverse DNS PTR (if any).
- Stores per-incident IP record files in ip_records directory.
"""

import sys
import os
import shutil
import time
import subprocess
import signal
import threading
import socket
import re
import binascii
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime

print(">>> detector running under Python:", sys.executable, flush=True)

# --- Configuration / paths ---
BASE = os.path.dirname(os.path.abspath(__file__))
TARGET_NAME = "attack_target_fixed"
TARGET_DIR = os.path.join(BASE, TARGET_NAME)
SRC_DIR = os.path.join(BASE, "test_files")
SNAP_BASE = os.path.join(BASE, "detector_snapshots")
LOG_PATH = os.path.join(BASE, "detector.log")
IP_RECORD_DIR = os.path.join(BASE, "ip_records")

os.makedirs(IP_RECORD_DIR, exist_ok=True)

# --- Process poll interval (seconds) ---
PROCESS_POLL_INTERVAL = 0.4
PROCESS_KILL_THRESHOLD = 1

# simple in-memory counters for pids
pid_counts = {}
pid_lock = threading.Lock()

# --- Logging helper ---
def safe_log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_PATH, "a") as fh:
            fh.write(line + "\n")
    except Exception:
        pass

# --- Snapshot / restore helpers ---
def _create_snapshot_impl(tag="manual"):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    snap_dir = os.path.join(SNAP_BASE, f"{TARGET_NAME}_{ts}_{tag}")
    try:
        if os.path.exists(snap_dir):
            shutil.rmtree(snap_dir)
        if os.path.exists(TARGET_DIR):
            shutil.copytree(TARGET_DIR, snap_dir)
            safe_log(f"Snapshot created at {snap_dir}")
            return snap_dir
        else:
            safe_log("Target does not exist; snapshot skipped")
            return None
    except Exception as e:
        safe_log(f"Snapshot creation failed: {e}")
        return None

def restore_file(rel_path):
    try:
        src = os.path.join(SRC_DIR, rel_path)
        dst = os.path.join(TARGET_DIR, rel_path)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            safe_log(f"Restored {rel_path} from canonical source")
            return True
        # fallback search snapshots
        if os.path.exists(SNAP_BASE):
            snaps = sorted(os.listdir(SNAP_BASE), reverse=True)
            for s in snaps:
                cand = os.path.join(SNAP_BASE, s, rel_path)
                if os.path.exists(cand):
                    shutil.copy2(cand, dst)
                    safe_log(f"Restored {rel_path} from snapshot {s}")
                    return True
    except Exception as e:
        safe_log(f"restore_file error for {rel_path}: {e}")
    return False

def restore_all_from_source():
    try:
        if os.path.exists(TARGET_DIR):
            shutil.rmtree(TARGET_DIR)
        shutil.copytree(SRC_DIR, TARGET_DIR)
        safe_log("Re-seeded attack_target_fixed from canonical source (test_files)")
    except Exception as e:
        safe_log(f"restore_all_from_source error: {e}")

# --- PID / process helpers ---
def kill_pid(pid):
    try:
        os.kill(pid, signal.SIGKILL)
        safe_log(f"KILLED pid {pid}")
        return True
    except PermissionError:
        safe_log(f"Permission denied killing pid {pid} - run detector as same user or root")
    except ProcessLookupError:
        safe_log(f"Process {pid} not found when attempting to kill")
    except Exception as e:
        safe_log(f"Failed to kill pid {pid}: {e}")
    return False

def lsof_offenders():
    pids = set()
    if not os.path.exists(TARGET_DIR):
        return pids
    try:
        out = subprocess.check_output(["lsof", "+D", TARGET_DIR], stderr=subprocess.DEVNULL, text=True)
        for line in out.splitlines()[1:]:
            parts = line.split()
            if len(parts) >= 2:
                try:
                    pids.add(int(parts[1]))
                except:
                    continue
    except FileNotFoundError:
        safe_log("lsof not found; install with: sudo apt install lsof")
    except subprocess.CalledProcessError:
        pass
    except Exception as e:
        safe_log(f"lsof_offenders error: {e}")
    return pids

def ps_offenders_by_name(name_substr):
    pids = set()
    try:
        out = subprocess.check_output(["ps", "aux"], text=True)
        for line in out.splitlines():
            if name_substr in line:
                parts = line.split()
                if len(parts) >= 2:
                    try:
                        pids.add(int(parts[1]))
                    except:
                        pass
    except Exception as e:
        safe_log(f"ps_offenders_by_name error: {e}")
    return pids

# --- Network helpers ---
def get_remote_ips_for_pid(pid):
    ips = set()
    try:
        out = subprocess.check_output(["lsof", "-Pan", "-p", str(pid), "-i"], stderr=subprocess.DEVNULL, text=True)
        for line in out.splitlines()[1:]:
            m = re.search(r"->([\d\.]+):\d+", line)
            if m:
                ips.add(m.group(1))
    except Exception:
        pass
    return ips

def reverse_dns_for_ip(ip):
    try:
        return socket.gethostbyaddr(ip)[0]
    except:
        return None

def write_ip_record_file(pid, ips, ptrs, snapshot_path, action):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    ip_str = "_".join(ips) if ips else "no_ip"
    filename = f"{ts}_pid{pid}_{ip_str}.txt"
    full_path = os.path.join(IP_RECORD_DIR, filename)
    try:
        with open(full_path, "w") as f:
            f.write(f"timestamp: {datetime.now().isoformat()}\n")
            f.write(f"pid: {pid}\n")
            f.write(f"ips: {','.join(ips)}\n")
            f.write(f"ptrs: {','.join(ptrs)}\n")
            f.write(f"snapshot_path: {snapshot_path}\n")
            f.write(f"action: {action}\n")
    except Exception as e:
        safe_log(f"Error writing IP record: {e}")
    return full_path

def pretty_console_notify(pid, ips, ptrs, snap_path, action):
    print("=== INCIDENT DETECTED ===")
    print(f"pid: {pid}")
    print(f"ips: {','.join(ips)}")
    print(f"ptrs: {','.join(ptrs)}")
    print(f"snapshot: {snap_path}")
    print(f"action: {action}")
    print("=========================")

def create_snapshot_background(tag, incident_meta):
    """
    Snapshot in background and record IPs only if PID/IP exist
    """
    def worker():
        try:
            snap_path = _create_snapshot_impl(tag)
            pid = incident_meta.get("pid", "")
            ips = incident_meta.get("ips", [])
            ptrs = incident_meta.get("ptrs", [])
            action = incident_meta.get("action", "")
            if pid or ips:
                rec_path = write_ip_record_file(pid, ips, ptrs, snap_path, action)
                pretty_console_notify(pid, ips, ptrs, rec_path, action)
        except Exception as e:
            safe_log(f"create_snapshot_background worker error: {e}")
    t = threading.Thread(target=worker, daemon=True)
    t.start()
    return t

# --- Process poller thread ---
def process_poller(stop_event):
    safe_log("Process poller started")
    while not stop_event.is_set():
        offenders = ps_offenders_by_name("fake_ransom.py") | lsof_offenders()
        for pid in offenders:
            with pid_lock:
                pid_counts[pid] = pid_counts.get(pid, 0) + 1
                if pid_counts[pid] >= PROCESS_KILL_THRESHOLD:
                    safe_log(f"Threshold reached for pid {pid}, attempting kill")
                    ips = get_remote_ips_for_pid(pid)
                    ptrs = [reverse_dns_for_ip(ip) or "n/a" for ip in ips]
                    # create snapshot & record IPs
                    create_snapshot_background("incident", {"pid": pid, "ips": list(ips), "ptrs": ptrs, "action": "kill"})
                    kill_pid(pid)
                    restore_all_from_source()
                    pid_counts.pop(pid, None)
        time.sleep(PROCESS_POLL_INTERVAL)

# --- Watchdog handlers ---
class ParentHandler(FileSystemEventHandler):
    def __init__(self, observer=None):
        super().__init__()
        self.observer = observer

    def on_created(self, event):
        if event.is_directory and os.path.basename(event.src_path) == TARGET_NAME:
            safe_log(f"ParentHandler: detected creation of {TARGET_NAME}")
            restore_all_from_source()
            _create_snapshot_impl("parent_created")

    def on_deleted(self, event):
        if event.is_directory and os.path.basename(event.src_path) == TARGET_NAME:
            safe_log("ParentHandler: target deleted")

class TargetHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        path = event.src_path
        if path.lower().endswith(".enc") or os.path.basename(path) == "__RANSOM_NOTE.txt":
            rel = os.path.relpath(path, TARGET_DIR)
            safe_log(f"TargetHandler: detected encryption artifact {rel}")
            offenders = lsof_offenders() | ps_offenders_by_name("fake_ransom.py")
            for pid in offenders:
                ips = get_remote_ips_for_pid(pid)
                ptrs = [reverse_dns_for_ip(ip) or "n/a" for ip in ips]
                create_snapshot_background("target_incident", {"pid": pid, "ips": list(ips), "ptrs": ptrs, "action": "kill"})
                kill_pid(pid)
                try:
                    os.remove(path)
                except: pass
                restore_file(rel[:-4] if rel.lower().endswith(".enc") else rel)

# --- Main loop ---
def attach_target_watcher(observer):
    if not os.path.exists(TARGET_DIR):
        return
    handler = TargetHandler()
    observer.schedule(handler, path=TARGET_DIR, recursive=True)

def run_detector_forever():
    if not os.path.exists(SRC_DIR):
        safe_log(f"Canonical source {SRC_DIR} missing")
        return
    if not os.path.exists(TARGET_DIR):
        restore_all_from_source()
    os.makedirs(SNAP_BASE, exist_ok=True)
    _create_snapshot_impl("initial_startup")

    stop_event = threading.Event()
    t = threading.Thread(target=process_poller, args=(stop_event,), daemon=True)
    t.start()

    observer = Observer()
    parent_handler = ParentHandler(observer)
    observer.schedule(parent_handler, path=BASE, recursive=False)
    attach_target_watcher(observer)
    observer.start()
    safe_log("Detector started")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        safe_log("Stopping detector")
        stop_event.set()
        observer.stop()
        observer.join()

if __name__ == "__main__":
    run_detector_forever()
