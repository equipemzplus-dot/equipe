import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, Lock, ChevronRight } from 'lucide-react';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface SlideNotificationAffiliationProps {
  activeTab: string;
  onUpgrade: () => void;
}

/**
 * SlideNotificationAffiliation - A premium notification for the Affiliation section.
 * Appears on the second visit or more to the affiliation tab.
 */
export const SlideNotificationAffiliation: React.FC<SlideNotificationAffiliationProps> = ({ activeTab, onUpgrade }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosedInSession, setHasBeenClosedInSession] = useState(false);

  useEffect(() => {
    // Logic to count entries to the affiliation tab
    if (activeTab === 'affiliation') {
      const sessionEntryKey = 'mz_affiliation_session_entry_active';
      const isAlreadyCountedThisEntry = sessionStorage.getItem(sessionEntryKey);

      if (!isAlreadyCountedThisEntry) {
        const visitCountKey = 'mz_affiliation_visits';
        const currentVisits = parseInt(localStorage.getItem(visitCountKey) || '0');
        const newCount = currentVisits + 1;
        localStorage.setItem(visitCountKey, newCount.toString());
        sessionStorage.setItem(sessionEntryKey, 'true');
      }
    } else {
      // Reset the entry flag when leaving the tab
      sessionStorage.removeItem('mz_affiliation_session_entry_active');
    }
  }, [activeTab]);

  useEffect(() => {
    // Logic to show/hide the notification based on visit count
    if (activeTab === 'affiliation' && !hasBeenClosedInSession) {
      const visitCountKey = 'mz_affiliation_visits';
      const count = parseInt(localStorage.getItem(visitCountKey) || '0');
      
      if (count >= 2) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 10000); // 10s delay as requested
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [activeTab, hasBeenClosedInSession]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenClosedInSession(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0, transition: { duration: 0.3 } }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.5 }
          }}
          className="fixed top-24 left-4 z-[100] max-w-[380px] w-[calc(100%-2rem)]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.8)] shadow-violet-900/20 backdrop-blur-md">
            {/* Royal Dark Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-black pointer-events-none" />
            
            {/* Content Container */}
            <div className="relative p-5 flex flex-col gap-4">
              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="absolute top-3 right-3 p-1 text-gray-500 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-all"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>

              {/* Header with Icon */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-700 to-violet-900 flex items-center justify-center border border-[#D4AF37]/30 shadow-lg shadow-violet-900/50">
                  <Lightbulb size={20} className="text-[#D4AF37] animate-pulse" />
                </div>
                <div className="flex-1 pr-4">
                  <p className="text-white text-[13px] leading-relaxed font-semibold">
                    Tu peux faire beaucoup plus avec l’affiliation.
                  </p>
                  <p className="text-gray-400 text-[12px] mt-1">
                    Certains ambassadeurs ont généré plus de <span className="text-[#D4AF37] font-bold"><CurrencyDisplay amount={100000} inline /></span> avec la bonne stratégie.
                  </p>
                </div>
              </div>

              {/* Call to Action Text */}
              <div className="flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                  <Lock size={10} className="text-[#D4AF37]" />
                </div>
                <span className="text-violet-300 text-[11px] font-bold uppercase tracking-wider">
                  Passe au niveau supérieur pour découvrir comment.
                </span>
              </div>

              {/* Premium Button - Dark & Gold Version with Pulse Animation */}
              <motion.button
                onClick={() => {
                  onUpgrade();
                  handleClose();
                }}
                animate={{ 
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    "0 10px 25px -3px rgba(139, 92, 246, 0.3)",
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full py-3 rounded-xl bg-violet-900 hover:bg-violet-800 border border-[#D4AF37]/60 text-white font-bold text-sm transition-all duration-500 flex items-center justify-center gap-2 overflow-hidden shadow-xl"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                <span className="relative z-10">Passez au niveau supérieur</span>
                <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300 text-[#D4AF37]" />
              </motion.button>
            </div>

            {/* Elegant Gold Metallic Bottom Border */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
