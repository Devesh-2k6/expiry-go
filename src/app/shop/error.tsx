"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Store } from "lucide-react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ExpiryGo Merchant Portal Error Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Store size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Merchant Dashboard Notice
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            A temporary view refresh is needed. Your inventory and store settings are preserved.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <RefreshCw size={14} /> Refresh Deals
          </button>
          <Link
            href="/shop"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold text-xs transition"
          >
            Store Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

