
import React, { useState, useEffect } from 'react';
import { ChevronRight, Lock, ShieldCheck, Crown, Star, X, Zap } from 'lucide-react';

export const GoldText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span 
    className={`inline-block ${className}`}
    style={{ 
      background: 'linear-gradient(to right, #fef08a, #ca8a04, #fef08a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {children}
  </span>
);

export const PurpleText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span 
    className={`inline-block ${className}`}
    style={{ 
      background: 'linear-gradient(to right, #e879f9, #a855f7, #6366f1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {children}
  </span>
);

export const GoldBorderCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = "", ...props }, ref) => (
    <div 
      ref={ref}
      {...props}
      className={`relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 hover:border-yellow-600/20 transition-all duration-500 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
);

export const EliteBadge: React.FC<{ children: React.ReactNode; variant?: 'standard' | 'niveau_mz_plus' }> = ({ children, variant = 'standard' }) => {
  const isMzPlus = variant === 'niveau_mz_plus';
  
  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 backdrop-blur-xl transition-all duration-700 shadow-xl ${
      isMzPlus 
        ? 'bg-purple-900/30 border-purple-500/40 text-purple-300 shadow-purple-500/10' 
        : 'bg-yellow-900/10 border-yellow-600/30 text-yellow-500 shadow-yellow-500/10'
    }`}>
      <div className="relative flex items-center justify-center">
        {isMzPlus ? (
          <>
            <Crown size={14} fill="currentColor" className="relative z-10 animate-pulse text-purple-400" />
            <div className="absolute inset-0 bg-purple-400 blur-md opacity-30 animate-pulse"></div>
          </>
        ) : (
          <ShieldCheck size={14} className="relative z-10 text-yellow-600" />
        )}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </span>
    </div>
  );
};

export const PremiumUpgradeButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button 
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }
    }}
    className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl overflow-hidden transition-all active:scale-95 shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:shadow-[0_0_30px_rgba(202,138,4,0.5)]"
  >
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite] pointer-events-none"></div>
    <div className="bg-black/20 p-1.5 rounded-lg">
      <Crown size={14} className="text-black animate-bounce" />
    </div>
    <span className="text-black text-[10px] font-black uppercase tracking-[0.15em]">Accéder à MZ+ Premium</span>
    <ChevronRight size={12} className="text-black group-hover:translate-x-1 transition-transform" />
  </button>
);

export const ConversionModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onUpgrade?: () => void;
  title?: string;
  description?: string;
  variant?: 'gold' | 'premium';
}> = ({ isOpen, onClose, onUpgrade, title, description, variant = 'gold' }) => {
  if (!isOpen) return null;

  const isPremium = variant === 'premium';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 h-[100dvh] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-[340px] animate-slide-down pointer-events-auto">
        <div className={`absolute -inset-4 rounded-[3rem] blur-3xl opacity-30 ${isPremium ? 'bg-purple-600' : 'bg-yellow-600'}`}></div>
        
        <div className={`relative bg-[#080808] border rounded-[2.5rem] p-6 text-center shadow-2xl ${isPremium ? 'border-purple-500/30 shadow-purple-900/20' : 'border-white/10'}`}>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors p-1"
          >
            <X size={18}/>
          </button>
          
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border mb-4 transition-all duration-700 ${
            isPremium 
              ? 'bg-purple-600/10 text-purple-500 border-purple-500/30' 
              : 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20'
          }`}>
            <Crown size={24} className="animate-pulse" />
          </div>
          
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-black uppercase tracking-tighter text-white leading-tight px-2">
              {title || (isPremium ? <>Accès <PurpleText>MZ+ Premium</PurpleText></> : <>Accès <GoldText>MZ+</GoldText> requis</>)}
            </h3>
            <p className="text-[10px] text-neutral-400 leading-relaxed font-bold uppercase tracking-widest italic px-1">
              {description || "Activez votre accès Élite pour débloquer toutes les fonctionnalités."}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
             <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onUpgrade) onUpgrade();
                onClose();
              }}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.15em] text-[9px] md:text-[10px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2.5 border ${
                isPremium 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/30' 
                  : 'bg-yellow-600 text-black border-yellow-500'
              }`}
             >
               <Zap size={14} fill="currentColor" /> {isPremium ? 'DEVENIR MEMBRE MZ+ PREMIUM' : 'Voir les avantages'}
             </button>
             <button 
               onClick={onClose} 
               className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 hover:text-neutral-400 transition-colors py-1"
             >
               Peut-être plus tard
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UpgradeGate: React.FC<{ 
  level: string; 
  children: React.ReactNode; 
  onUpgrade?: () => void;
  title?: string;
  description?: string;
  variant?: 'gold' | 'premium';
}> = ({ level, children, onUpgrade, title, description, variant = 'gold' }) => {
  const [showPopup, setShowPopup] = useState(false);
  
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { 
      document.body.style.overflow = '';
    };
  }, [showPopup]);

  if (level === 'niveau_mz_plus') return <>{children}</>;

  return (
    <>
      <div className="relative group overflow-hidden rounded-[2.5rem] h-full flex flex-col bg-[#050505] border border-white/5">
        <div className="transition-all duration-700 h-full relative">
          {children}
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-[2px] pointer-events-none z-10"></div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 flex flex-col items-center justify-end">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPopup(true);
            }}
            className={`w-full py-3.5 rounded-xl font-black uppercase text-[9px] tracking-[0.15em] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
              variant === 'premium' 
                ? 'bg-purple-600 text-white hover:bg-purple-500' 
                : 'bg-yellow-600 text-black hover:bg-yellow-500'
            }`}
          >
            <Lock size={12} /> Débloquer l'accès
          </button>
        </div>
      </div>

      <ConversionModal 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        onUpgrade={onUpgrade} 
        title={title}
        description={description}
        variant={variant}
      />
    </>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-6 h-[1px] bg-yellow-600/50"></div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
    </div>
    {subtitle && <p className="text-neutral-500 font-medium text-[9px] uppercase tracking-widest leading-relaxed max-w-lg">{subtitle}</p>}
  </div>
);

export const PrimaryButton: React.FC<any> = ({ children, onClick, fullWidth, isLoading, type = "button", size = "md", disabled }) => (
  <button 
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }
    }}
    type={type}
    disabled={isLoading || disabled}
    className={`${fullWidth ? 'w-full' : ''} ${size === 'lg' ? 'py-4' : 'py-3'} px-6 bg-yellow-600 text-black font-black uppercase text-[9px] tracking-[0.15em] hover:bg-yellow-500 transition-all rounded-xl disabled:opacity-50 active:scale-95 shadow-lg shadow-yellow-900/10`}
  >
    <span className="flex items-center justify-center gap-2">
      {isLoading ? "Sync..." : <>{children} <ChevronRight size={12} /> </>}
    </span>
  </button>
);

export const InputField: React.FC<any> = ({ icon: Icon, type, placeholder, value, onChange, required = true }) => (
  <div className="relative mb-3">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700"><Icon size={14} /></div>
    <input 
      type={type} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      required={required} 
      className="w-full bg-neutral-900/30 border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-yellow-600/30 outline-none transition-all placeholder:text-neutral-700 text-xs" 
    />
  </div>
);

export const SelectField: React.FC<any> = ({ icon: Icon, options, value, onChange, placeholder, required = true }) => (
  <div className="relative mb-3">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700"><Icon size={14} /></div>
    <select 
      value={value} 
      onChange={onChange} 
      required={required} 
      className="w-full bg-neutral-900/30 border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-yellow-600/30 outline-none transition-all appearance-none text-xs"
    >
      <option value="" disabled className="bg-neutral-900">{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value} className="bg-neutral-900">
          {opt.label}
        </option>
      ))}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-700">
      <ChevronRight size={12} className="rotate-90" />
    </div>
  </div>
);
