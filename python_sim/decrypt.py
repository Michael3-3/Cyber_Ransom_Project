# decrypt.py - decrypts the fixed attack_target_fixed using session_key_fixed.key
import os, sys
from cryptography.fernet import Fernet

BASE = os.path.dirname(__file__)
TARGET_DIR = os.path.join(BASE, "attack_target_fixed")
KEY_FILE = os.path.join(BASE, "session_key_fixed.key")

# include the exact ransom filename you mentioned (plus some common alternatives)
RANSOM_NOTE_NAMES = ["_RANSOM_NOTE.txt", "_ransom_text.txt", "ransom_note.txt"]

def secure_delete(path):
    """
    Overwrite the file with zeros then remove it.
    Not guaranteed on all filesystems (SSD wear-leveling, journaling, etc.),
    but makes casual recovery harder.
    """
    try:
        if os.path.exists(path) and os.path.isfile(path):
            size = os.path.getsize(path)
            # open in binary read/write mode
            with open(path, "r+b") as fh:
                fh.seek(0)
                fh.write(b"\x00" * size)
                fh.flush()
                try:
                    os.fsync(fh.fileno())
                except Exception:
                    pass
            os.remove(path)
            print(f"Removed: {path}")
            return True
    except Exception as e:
        print(f"Failed to securely delete {path}: {e}")
    return False

def find_ransom_note_locations(base, target):
    candidates = []
    # check base dir
    for name in RANSOM_NOTE_NAMES:
        p = os.path.join(base, name)
        if os.path.exists(p):
            candidates.append(p)
    # check target dir (common place you said)
    if os.path.abspath(target) != os.path.abspath(base):
        for name in RANSOM_NOTE_NAMES:
            p = os.path.join(target, name)
            if os.path.exists(p):
                candidates.append(p)
    # dedupe while preserving order
    return list(dict.fromkeys(candidates))

def decrypt_folder(target_dir=None, key_file=None):
    target_dir = target_dir or TARGET_DIR
    key_file = key_file or KEY_FILE

    if not os.path.exists(target_dir):
        print("Target folder missing:", target_dir)
        return
    if not os.path.exists(key_file):
        print("Key file missing:", key_file)
        return

    with open(key_file, "rb") as kf:
        key = kf.read()
    f = Fernet(key)

    enc_files = []
    for root, dirs, files in os.walk(target_dir):
        for fn in files:
            if fn.endswith(".enc"):
                enc_files.append(os.path.join(root, fn))

    if not enc_files:
        print("No encrypted files found.")
        return

    total = len(enc_files)
    restored = 0
    for ef in enc_files:
        try:
            with open(ef, "rb") as fh:
                data = fh.read()
            plain = f.decrypt(data)
            out_path = ef[:-4]  # strip .enc
            with open(out_path, "wb") as of:
                of.write(plain)
            os.remove(ef)
            restored += 1
            print(f"[+] Decrypted: {ef} -> {out_path}")
        except Exception as e:
            print("Failed to decrypt", ef, e)

    print(f"[+] Restored {restored} of {total} file(s) in {target_dir}")

    # Only remove key and ransom note(s) if ALL were restored successfully
    if restored == total and total > 0:
        print("[*] All files restored successfully. Proceeding to delete key and ransom note(s).")
        # Delete ransom notes found
        ransom_locations = find_ransom_note_locations(BASE, target_dir)
        for rpath in ransom_locations:
            secure_delete(rpath)

        # Secure-delete the key file
        if secure_delete(key_file):
            print("[+] Key file securely deleted.")
        else:
            print("[!] Failed to securely delete key file; please remove it manually.")
    else:
        print("[!] Not all files were restored. Key and ransom note will NOT be deleted for recovery/debugging.")

if __name__ == "__main__":
    # Accept optional CLI args to be flexible
    # usage: python decrypt.py [target_dir] [key_file]
    if len(sys.argv) == 3:
        decrypt_folder(sys.argv[1], sys.argv[2])
    else:
        decrypt_folder()
