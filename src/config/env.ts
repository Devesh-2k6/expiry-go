/**
 * Public environment values available in the browser.
 * Server-only secrets must not use the NEXT_PUBLIC_ prefix.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Base URL for the FastAPI backend (e.g. http://localhost:8000 or https://api.yourdomain.com).
 * Automatically configured via NEXT_PUBLIC_API_URL, localStorage override, or host auto-detection.
 */
export const DEFAULT_LIVE_API_URL = "http://localhost:8000";

export function getPublicApiBaseUrl(): string {
  // 1. Check for manual local override in browser storage
  if (typeof window !== "undefined") {
    try {
      const override = localStorage.getItem("EXPIRYGO_API_OVERRIDE");
      if (override && override.trim()) {
        const clean = stripTrailingSlash(override.trim());
        // Auto-clean stale temporary cloudflare tunnels
        if (clean.includes("trycloudflare.com") || clean.includes("loca.lt")) {
          localStorage.removeItem("EXPIRYGO_API_OVERRIDE");
        } else {
          return clean;
        }
      }
    } catch {
      // Storage access blocked / SSR
    }
  }

  // 2. Check for custom build-time / runtime environment variable
  const rawEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (rawEnv && rawEnv !== "" && rawEnv !== "undefined") {
    const cleanEnv = stripTrailingSlash(rawEnv);
    if (!cleanEnv.includes("trycloudflare.com") && !cleanEnv.includes("loca.lt")) {
      return cleanEnv;
    }
  }

  // 3. Auto-detect based on current browser location
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const port = window.location.port;

    // Single-Port Unified Hosting (FastAPI serving Next.js on port 8000)
    if (port === "8000") {
      return `${protocol}//${hostname}:8000`;
    }

    // Localhost Development (Next.js on 3000 -> FastAPI on 8000)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }

    // Local Wi-Fi / LAN IP (e.g. 172.23.27.186, 192.168.x.x, 10.x.x.x)
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return `${protocol}//${hostname}:8000`;
    }

    // Single Cloudflare Tunnel / Reverse Proxy where backend is on same origin
    if (
      hostname.endsWith(".trycloudflare.com") ||
      hostname.endsWith(".loca.lt") ||
      hostname.endsWith(".ngrok-free.app") ||
      hostname.endsWith(".ngrok.io") ||
      hostname.endsWith(".railway.app") ||
      hostname.endsWith(".onrender.com")
    ) {
      return window.location.origin;
    }

    // On Vercel: Vercel does not host the backend.
    if (hostname.endsWith(".vercel.app")) {
      return "";
    }
  }

  return DEFAULT_LIVE_API_URL;
}

export function setPublicApiBaseUrl(url: string): void {
  if (typeof window !== "undefined") {
    const clean = stripTrailingSlash(url.trim());
    localStorage.setItem("EXPIRYGO_API_OVERRIDE", clean);
  }
}

export function resetPublicApiBaseUrl(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("EXPIRYGO_API_OVERRIDE");
  }
}

export async function testApiHealth(
  targetUrl: string
): Promise<{ success: boolean; latencyMs?: number; message: string }> {
  const clean = stripTrailingSlash(targetUrl.trim());
  if (!clean) {
    return { success: false, message: "URL is empty" };
  }
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${clean}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Bypass-Tunnel-Reminder": "true",
      },
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      return { success: true, latencyMs, message: `Connected (${latencyMs}ms)` };
    }
    return { success: false, message: `Server replied with HTTP ${res.status}` };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return { success: false, message: "Connection timed out (5s)" };
    }
    return { success: false, message: err.message || "Failed to reach server" };
  }
}
