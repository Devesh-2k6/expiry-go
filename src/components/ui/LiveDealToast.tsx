"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, ArrowRight } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSound } from "@/hooks/useSound";
import type { ApiProduct } from "@/types/product";

export function LiveDealToast() {
  const router = useRouter();
  const { lastDeal } = useWebSocket();
  const { playPopSound } = useSound();
  const [deal, setDeal] = useState<ApiProduct | null>(null);

  useEffect(() => {
    if (lastDeal) {
      setDeal(lastDeal);
      playPopSound();
      
      // Auto-dismiss after 10 seconds
      const t = setTimeout(() => {
        setDeal(null);
      }, 10000);
      
      return () => clearTimeout(t);
    }
  }, [lastDeal, playPopSound]);

  const handleNavigateToDeals = () => {
    setDeal(null);
    router.push("/deals");
  };

  return (
    <AnimatePresence>
      {deal && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
        >
          <div className="bg-[#120F24]/95 backdrop-blur-xl border border-purple-500/30 shadow-[0_10px_40px_rgba(124,58,237,0.25)] rounded-2xl overflow-hidden p-4 relative">
            <button 
              onClick={() => setDeal(null)} 
              className="absolute top-3 right-3 text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/20 text-purple-400 p-2.5 rounded-xl animate-pulse">
                <Zap size={20} />
              </div>
              <div className="flex-1 pr-6">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Live Drop!</p>
                <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{deal.shop?.name || "A local shop"} just posted:</h4>
                <p className="text-purple-100/90 text-sm font-medium mb-3 line-clamp-1">{deal.name} at ₹{Number(deal.current_price ?? deal.discount_price ?? 0).toFixed(2)}</p>
                <button 
                  onClick={handleNavigateToDeals} 
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-purple-600/30"
                >
                  Grab it <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

