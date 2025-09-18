#!/usr/bin/env python3
"""
Robust detector:
- Polls processes for any python process running fake_ransom.py (fast kill).
- Watches the parent dir for creation/deletion of attack_target_fixed and attaches a watcher.
- Watches the target dir for .enc / modifications; restores from canonical source and snapshots.
- Logs to detector.log

Run in the same user as the attack scripts (or run as root if you want guaranteed ability to kill).
"""

import sys
print(">>> detector running under Python:", sys.executable, flush=True)


import os
import shutil
import time
import subprocess
import signal
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime

BASE = os.path.dirname(__file__)
TARGET_NAME = "attack_target_fixed"
TARGET_DIR = os.path.join(BASE, TARGET_NAME)
SRC_DIR = os.path.join(BASE, "test_files")
SNAP_BASE = os.path.join(BASE, "detector_snapshots")
LOG_PATH = os.path.join(BASE, "detector.log")

# process poll interval (seconds)
PROCESS_POLL_INTERVAL = 0.4
# how many suspicious process detections before kill (1 for immediate)
PROCESS_KILL_THRESHOLD = 1

# simple in-memory counters for pids
pid_counts = {}
pid_lock = threading.Lock()

def safe_log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_PATH, "a") as fh:
            fh.write(line + "\n")
    except Exception:
        pass

def create_snapshot():
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    snap_dir = os.path.join(SNAP_BASE, TARGET_NAME + "_" + ts)
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
    """Restore a single relative file from canonical source or snapshots"""
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
    """Recreate target dir from canonical source (safe)."""
    try:
        if os.path.exists(TARGET_DIR):
            shutil.rmtree(TARGET_DIR)
        shutil.copytree(SRC_DIR, TARGET_DIR)
        safe_log("Re-seeded attack_target_fixed from canonical source (test_files)")
    except Exception as e:
        safe_log(f"restore_all_from_source error: {e}")

def kill_pid(pid):
    try:
        os.kill(pid, signal.SIGKILL)
        safe_log(f"KILLED pid {pid}")
        return True
    except PermissionError:
        safe_log(f"Permission denied killing pid {pid} - run detector as same user or root")
    except Exception as e:
        safe_log(f"Failed to kill pid {pid}: {e}")
    return False

def lsof_offenders():
    """Return set of pids touching TARGET_DIR using lsof (may require lsof installed)."""
    pids = set()
    try:
        out = subprocess.check_output(["lsof", "+D", TARGET_DIR], stderr=subprocess.DEVNULL, text=True)
        for line in out.splitlines()[1:]:
            parts = line.split()
            if len(parts) >= 2:
                try:
                    pid = int(parts[1])
                    pids.add(pid)
                except:
                    pass
    except subprocess.CalledProcessError:
        pass
    except FileNotFoundError:
        safe_log("lsof not found; install with: sudo apt install lsof")
    return pids

def ps_offenders_by_name(name_substr):
    """Fallback: look for processes whose command line contains name_substr."""
    pids = set()
    try:
        out = subprocess.check_output(["ps", "aux"], text=True)
        for line in out.splitlines():
            if name_substr in line:
                parts = line.split()
                if len(parts) >= 2:
                    try:
                        pid = int(parts[1])
                        pids.add(pid)
                    except:
                        pass
    except Exception as e:
        safe_log(f"ps_offenders_by_name error: {e}")
    return pids

def process_poller(stop_event):
    """Thread: poll processes for 'fake_ransom.py' execution and kill quickly."""
    safe_log("Process poller thread started")
    while not stop_event.is_set():
        # check ps for fake_ransom.py
        offenders = ps_offenders_by_name("fake_ransom.py")
        if offenders:
            for pid in offenders:
                with pid_lock:
                    pid_counts[pid] = pid_counts.get(pid, 0) + 1
                    safe_log(f"Process poll detected fake_ransom.py pid {pid} count {pid_counts[pid]}")
                    if pid_counts[pid] >= PROCESS_KILL_THRESHOLD:
                        safe_log(f"Process poll threshold reached for pid {pid}. Attempting kill.")
                        killed = kill_pid(pid)
                        if killed:
                            # after kill, restore entire target to be safe
                            time.sleep(0.1)
                            restore_all_from_source()
                            # reset counts
                            pid_counts.pop(pid, None)
        # also check lsof for any pids touching target (extra safety)
        pids = lsof_offenders()
        if pids:
            for pid in pids:
                with pid_lock:
                    pid_counts[pid] = pid_counts.get(pid, 0) + 1
                    safe_log(f"lsof detected pid {pid} touching target count {pid_counts[pid]}")
                    if pid_counts[pid] >= PROCESS_KILL_THRESHOLD:
                        safe_log(f"lsof threshold reached for pid {pid}. Attempting kill.")
                        killed = kill_pid(pid)
                        if killed:
                            time.sleep(0.1)
                            restore_all_from_source()
                            pid_counts.pop(pid, None)
        time.sleep(PROCESS_POLL_INTERVAL)

# Watchdog handlers
class ParentHandler(FileSystemEventHandler):
    def __init__(self, observer):
        super().__init__()
        self.observer = observer

    def on_created(self, event):
        if event.is_directory and os.path.basename(event.src_path) == TARGET_NAME:
            safe_log(f"ParentHandler: detected creation of {TARGET_NAME}. Re-attaching target watcher and reseeding.")
            # re-seed from canonical in case attacker created corrupted files
            restore_all_from_source()
            create_snapshot()
            attach_target_watcher(self.observer)

    def on_deleted(self, event):
        if event.is_directory and os.path.basename(event.src_path) == TARGET_NAME:
            safe_log("ParentHandler: target was deleted")

class TargetHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()

    def on_created(self, event):
        if event.is_directory:
            return
        path = event.src_path
        # if .enc or ransom note appears, try to find offender and kill + restore
        if path.lower().endswith(".enc") or os.path.basename(path) == "__RANSOM_NOTE.txt":
            rel = os.path.relpath(path, TARGET_DIR)
            safe_log(f"TargetHandler: detected encryption artifact {rel}")
            # try to find offender pids via lsof then ps fallback
            pids = lsof_offenders()
            if not pids:
                pids = ps_offenders_by_name("fake_ransom.py")
            if pids:
                for pid in pids:
                    safe_log(f"TargetHandler: candidate offender pid {pid} - attempting kill")
                    if kill_pid(pid):
                        # remove .enc if exists and restore file
                        try:
                            if os.path.exists(path):
                                os.remove(path)
                        except:
                            pass
                        restore_file(rel[:-4])
                        safe_log("TargetHandler: restored after kill")
                        return
            else:
                # no offender found: just remove .enc and restore from canonical
                safe_log("TargetHandler: no offender pids found; cleaning artifact and restoring")
                try:
                    if os.path.exists(path):
                        os.remove(path)
                except:
                    pass
                restore_file(rel[:-4])

    def on_modified(self, event):
        if event.is_directory:
            return
        path = event.src_path
        rel = os.path.relpath(path, TARGET_DIR)
        # compare sizes with canonical source; if different, restore and try to kill offenders
        src = os.path.join(SRC_DIR, rel)
        if os.path.exists(src) and os.path.exists(path):
            try:
                if os.path.getsize(src) != os.path.getsize(path):
                    safe_log(f"TargetHandler: detected modified file {rel}, sizes differ -> restoring and trying to kill offenders")
                    pids = lsof_offenders() or ps_offenders_by_name("fake_ransom.py")
                    for pid in pids:
                        if kill_pid(pid):
                            restore_file(rel)
                            return
                    restore_file(rel)
            except Exception as e:
                safe_log(f"TargetHandler on_modified error: {e}")

# dynamic attach/detach for target watcher
target_observer = None
target_watch_attached = False
target_watch_lock = threading.Lock()

def attach_target_watcher(observer):
    global target_observer, target_watch_attached
    with target_watch_lock:
        if not os.path.exists(TARGET_DIR):
            safe_log("attach_target_watcher: target directory does not exist; will not attach")
            return
        if target_watch_attached:
            safe_log("attach_target_watcher: already attached")
            return
        handler = TargetHandler()
        observer.schedule(handler, path=TARGET_DIR, recursive=True)
        target_watch_attached = True
        safe_log("attach_target_watcher: attached to target dir")

def create_snapshot():
    # wrapper to call the earlier create_snapshot function name collision handled
    return _create_snapshot_impl()

def _create_snapshot_impl():
    # same as earlier create_snapshot but avoids nested definitions
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    snap_dir = os.path.join(SNAP_BASE, TARGET_NAME + "_" + ts)
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

def run_detector_forever():
    if not os.path.exists(SRC_DIR):
        safe_log(f"Canonical source {SRC_DIR} missing — cannot protect.")
        return
    # ensure target exists
    if not os.path.exists(TARGET_DIR):
        safe_log("Target missing at startup; creating from canonical source")
        restore_all_from_source()
    os.makedirs(SNAP_BASE, exist_ok=True)
    # initial snapshot
    _create_snapshot_impl()

    # start process poller thread
    stop_event = threading.Event()
    t = threading.Thread(target=process_poller, args=(stop_event,), daemon=True)
    t.start()

    # start watchdog observer on parent dir and attach target watcher
    observer = Observer()
    parent_handler = ParentHandler(observer)
    observer.schedule(parent_handler, path=BASE, recursive=False)
    attach_target_watcher(observer)
    observer.start()
    safe_log("Detector main: started watchdog and process poller. Protecting target.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        safe_log("Detector main: stopping")
        stop_event.set()
        observer.stop()
        observer.join()

if __name__ == "__main__":
    run_detector_forever()
