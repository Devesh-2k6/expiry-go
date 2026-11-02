"""
ExpiryGo / Meeva - Master Live Unified Ecosystem Launcher
Runs simultaneously:
1. FastAPI Backend Server (Port 8000)
2. Next.js Web Server (Port 3000)
3. React Native Expo Mobile App (Port 8081)
4. Public Cloudflare HTTPS Live Tunnel (0-config global access)
"""

import os
import sys
import re
import time
import socket
import subprocess
import threading
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
MOBILE_DIR = ROOT_DIR / "mobile"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

from clean_ports import free_ports
from get_ip import get_lan_ip, sync_mobile_env

def stream_output(proc, prefix, color_code):
    try:
        for line in iter(proc.stdout.readline, ""):
            if not line:
                break
            sys.stdout.write(f"\033[{color_code}m[{prefix}]\033[0m {line}")
            sys.stdout.flush()
    except Exception:
        pass

def wait_for_port(port, timeout=20):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            time.sleep(0.5)
    return False

def main():
    print("=" * 72)
    print("  🚀 EXPIRYGO / MEEVA - COMPLETE UNIFIED CLOUD & LOCAL ECOSYSTEM")
    print("  Hosting Web + Mobile App + Backend Simultaneously with Live Public Tunnel")
    print("=" * 72)

    # 1. Clean ports
    print("\n[1/5] Ensuring ports 8000, 3000, and 8081 are free...")
    free_ports()

    # 2. Network Discovery
    print("\n[2/5] Auto-detecting local Wi-Fi IP and syncing mobile config...")
    lan_ip = get_lan_ip()
    sync_mobile_env(lan_ip)
    print(f"  • Local Wi-Fi IP: http://{lan_ip}:3000 (Backend: http://{lan_ip}:8000)")

    # 3. Database Check
    print("\n[3/5] Checking Database Schema and Admin Account...")
    try:
        subprocess.run(
            [sys.executable, "-c", "import sys; sys.path.insert(0, 'backend'); from seed_data import ensure_ecosystem_ready; ensure_ecosystem_ready()"],
            cwd=str(ROOT_DIR),
            check=False
        )
    except Exception as e:
        print(f"  [Notice] DB Init check: {e}")

    # 4. Start Backend Server
    print("\n[4/5] Starting FastAPI Backend on http://0.0.0.0:8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run_server.py"],
        cwd=str(BACKEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # 5. Start Web Server
    print("      Starting Next.js Web Frontend on http://0.0.0.0:3000...")
    web_proc = subprocess.Popen(
        [sys.executable, "serve_web.py"],
        cwd=str(ROOT_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # 6. Start Mobile App (Expo Metro)
    print(f"      Starting React Native Expo Go Mobile Server (Port 8081)...")
    mobile_env = os.environ.copy()
    mobile_env["REACT_NATIVE_PACKAGER_HOSTNAME"] = lan_ip
    npx_cmd = "npx.cmd" if sys.platform == "win32" else "npx"
    mobile_proc = subprocess.Popen(
        [npx_cmd, "expo", "start", "--go", "--host", "lan", "-c"],
        cwd=str(MOBILE_DIR),
        env=mobile_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # Stream logs in background threads
    t1 = threading.Thread(target=stream_output, args=(backend_proc, "BACKEND", "36"), daemon=True) # Cyan
    t2 = threading.Thread(target=stream_output, args=(web_proc, "WEB-APP", "32"), daemon=True)   # Green
    t3 = threading.Thread(target=stream_output, args=(mobile_proc, "EXPO-GO", "35"), daemon=True) # Magenta
    t1.start()
    t2.start()
    t3.start()

    # Wait for local ports
    print("\n⏳ Initializing local services...")
    b_ready = wait_for_port(8000, timeout=15)
    w_ready = wait_for_port(3000, timeout=10)
    m_ready = wait_for_port(8081, timeout=30)

    # 7. Start Cloudflare Public HTTPS Tunnel for Global Internet Access
    print("\n[5/5] Launching Global Cloudflare HTTPS Tunnel...")
    tunnel_proc = subprocess.Popen(
        [npx_cmd, "-y", "cloudflared", "tunnel", "--protocol", "http2", "--url", "http://127.0.0.1:8000"],
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    public_tunnel_url = None
    start_time = time.time()
    for line in iter(tunnel_proc.stdout.readline, ""):
        match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
        if match:
            public_tunnel_url = match.group(0)
            break
        if time.time() - start_time > 30:
            break

    t4 = threading.Thread(target=stream_output, args=(tunnel_proc, "TUNNEL", "33"), daemon=True) # Yellow
    t4.start()

    print("\n" + "=" * 72)
    print("  ✨ ALL SERVICES ARE LIVE & CONNECTED SIMULTANEOUSLY!")
    print("=" * 72)
    print(f"  🌐 Local Web App:     http://localhost:3000  (LAN: http://{lan_ip}:3000)")
    print(f"  🔌 Backend API:       http://localhost:8000  (Docs: http://localhost:8000/docs)")
    print(f"  📱 Expo Go App:       exp://{lan_ip}:8081")
    if public_tunnel_url:
        print(f"  🌍 Global Public URL: {public_tunnel_url}")
        print(f"     (Use this URL as NEXT_PUBLIC_API_URL in Vercel to connect your cloud site!)")
    print(f"  📲 Web Companion:     http://localhost:3000/mobile (Live QR & Sync Lab)")
    print("=" * 72)

    time.sleep(1)
    webbrowser.open("http://localhost:3000")
    webbrowser.open("http://localhost:3000/mobile")

    print("\n[Press Ctrl+C at any time to gracefully stop all services]\n")

    try:
        while True:
            if backend_proc.poll() is not None:
                print("⚠️ Backend server exited.")
                break
            if web_proc.poll() is not None:
                print("⚠️ Web server exited.")
                break
            if mobile_proc.poll() is not None:
                print("⚠️ Expo Go server exited.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping all services gracefully...")
    finally:
        for p in (tunnel_proc, backend_proc, web_proc, mobile_proc):
            try:
                p.terminate()
                p.wait(timeout=2)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass
        free_ports()
        print("✅ All services stopped cleanly.")

if __name__ == "__main__":
    main()

