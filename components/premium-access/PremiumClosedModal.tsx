import React from 'react';
import { X, Rocket, Lock, Crown, Sparkles, Timer, ShieldAlert, Diamond } from 'lucide-react';

interface PremiumClosedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reopeningDate: string;
}

const GoldText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-block ${className}`} style={{ background: 'linear-gradient(to right, #fef08a, #ca8a04, #fef08a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{children}</span>
);

const PurpleText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-block ${className}`} style={{ background: 'linear-gradient(to right, #e879f9, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{children}</span>
);

export const PremiumClosedModal: React.FC<PremiumClosedModalProps> = ({ 
  isOpen, 
  onClose, 
  reopeningDate 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
      {/* Backdrop with intense blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500"
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] bg-[#050505] border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] overflow-y-auto shadow-[0_0_120px_rgba(168,85,247,0.2)] custom-scrollbar animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-600/5 blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white rounded-full transition-all z-30 border border-white/5"
        >
          <X size={20} />
        </button>

        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.4);
          }
        `}} />

        <div className="relative p-6 sm:p-8 md:p-14 space-y-6 sm:space-y-10">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full animate-in slide-in-from-top-4 duration-500 delay-200">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Accès Temporairement Suspendu</span>
            </div>
          </div>

          {/* Icon Header */}
          <div className="flex justify-center">
            <div className="relative animate-in zoom-in duration-500 delay-300">
              <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl">
                <Lock size={44} className="text-purple-500" />
                <div className="absolute -top-2 -right-2 animate-[spin_8s_linear_infinite]">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic animate-in slide-in-from-bottom-4 duration-500 delay-400">
                🚫 Trop tard pour <GoldText>aujourd’hui…</GoldText>
              </h2>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto animate-in fade-in duration-1000 delay-600" />
            </div>

            <div className="space-y-4 text-neutral-400 font-medium leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-500">
              <p className="text-lg md:text-xl text-white font-bold italic opacity-90">
                L’accès à <PurpleText>MZ+ Premium</PurpleText> vient d’être fermé.
              </p>
              <p className="text-sm md:text-base uppercase tracking-widest font-black opacity-60">
                Les places ont été complétées plus rapidement que prévu.
              </p>
            </div>

            {/* Reopening Info Box */}
            <div className="bg-white/[0.08] border border-white/20 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 space-y-5 sm:space-y-8 relative overflow-hidden group shadow-2xl animate-in slide-in-from-bottom-8 duration-500 delay-700">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Timer size={80} className="text-white" />
              </div>

              <div className="flex flex-col items-center gap-6 relative z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 text-purple-300">
                    <Rocket size={24} className="animate-bounce" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
                      Prochaine ouverture
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black">
                    <GoldText>{reopeningDate}</GoldText>
                  </div>
                </div>
                
                <div className="w-full flex items-center gap-4 px-5 py-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/30 backdrop-blur-md">
                  <ShieldAlert size={24} className="text-yellow-400 shrink-0" />
                  <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-yellow-400 leading-tight text-left">
                    Attention : Les places sont extrêmement limitées et s'épuisent en quelques minutes.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.4em] pt-4 flex items-center justify-center gap-3 animate-in fade-in duration-500 delay-900">
              <Diamond size={12} className="text-purple-500" />
              Réserve ta place pour dimanche
              <Diamond size={12} className="text-purple-500" />
            </p>
          </div>

          {/* Action Button */}
          <button 
            onClick={onClose}
            className="group relative w-full py-6 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 delay-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            J'ai compris <Lock size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-purple-600 to-transparent opacity-50" />
      </div>
    </div>
  );
};
