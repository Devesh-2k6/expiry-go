"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ExpiryGo UI Error Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-gray-950">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-purple-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Something unexpected happened
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We caught a transient display error and protected your session. You can reload this view or head back safely.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-lg shadow-purple-500/25 active:scale-95"
          >
            <RefreshCw size={15} /> Try Again
          </button>
          <Link
            href="/deals"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition active:scale-95"
          >
            <Home size={15} /> Go to Deals
          </Link>
        </div>
      </div>
    </div>
  );
}

