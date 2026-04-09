
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a short delay if not already dismissed this session
      if (!sessionStorage.getItem('pwa_prompt_dismissed')) {
        setTimeout(() => setIsVisible(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt manually since beforeinstallprompt isn't supported
    if (isIOSDevice && !sessionStorage.getItem('pwa_prompt_dismissed')) {
      setTimeout(() => setIsVisible(true), 8000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const dismissPrompt = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[9999] md:left-auto md:right-8 md:bottom-8 md:w-80"
        >
          <div className="bg-[#0a0a0a] border border-yellow-600/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(202,138,4,0.15)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent"></div>
            
            <button 
              onClick={dismissPrompt}
              className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center flex-shrink-0">
                <img 
                  src="https://storage.googleapis.com/static.antigravity.dev/applets/7uh5mtashjcrpvg5aiawes/c9222452-32b5-4720-835c-204126130f14.png" 
                  alt="MZ+ Elite" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-black uppercase text-[11px] tracking-wider mb-1">Installer MZ+ Elite</h3>
                <p className="text-neutral-400 text-[9px] font-medium leading-relaxed uppercase tracking-widest">
                  {isIOS 
                    ? "Appuyez sur 'Partager' puis 'Sur l'écran d'accueil' pour installer l'application."
                    : "Ajoutez MZ+ à votre écran d'accueil pour une expérience fluide et rapide."}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {isIOS ? (
                <div className="w-full py-2.5 px-4 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center gap-2 text-neutral-300 text-[9px] font-black uppercase tracking-widest">
                  <Share size={14} className="text-blue-400" /> Suivre les instructions
                </div>
              ) : (
                <button 
                  onClick={handleInstall}
                  className="flex-1 py-2.5 px-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <Download size={14} /> Installer maintenant
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
