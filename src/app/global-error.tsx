"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ExpiryGo Global Root Error Caught]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              ExpiryGo Recovered
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              An application view error occurred, but your data is safe. Click below to reload or return to the main deals page.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-lg shadow-purple-500/25 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={15} /> Reload View
            </button>
            <a
              href="/deals"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition active:scale-95 cursor-pointer"
            >
              <Home size={15} /> Go to Deals
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

