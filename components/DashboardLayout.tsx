
import React, { useState } from 'react';
import { 
  X, 
  LogOut, 
  ChevronRight, 
  GraduationCap, 
  Crown, 
  Trophy,
  Home,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Mail,
  Target,
  Menu,
  Coins,
  Briefcase,
  Zap,
  Settings,
  HelpCircle,
  Terminal
} from 'lucide-react';
import { GoldText, EliteBadge } from './UI.tsx';
import { TabId, UserProfile } from '../types.ts';
import { supabase } from '../services/supabase.ts';
import { CurrencySelector } from './ui/CurrencyDisplay.tsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isAdmin?: boolean;
  profile: UserProfile | null;
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isAdmin = false, 
  profile,
  isMenuOpen = false,
  setIsMenuOpen = (_open: boolean) => {}
}) => {
  const menuItems = [
    { id: 'dashboard' as TabId, label: 'Tableau de Bord', icon: Home },
    { id: 'revenus' as TabId, label: 'Trésorerie & Gains', icon: Coins },
    { id: 'recompense' as TabId, label: "L'Arène Élite", icon: Trophy },
    { id: 'luna_chat' as TabId, label: 'Luna AI', icon: Sparkles },
    { id: 'guides' as TabId, label: 'Guides & Aide', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex flex-col font-sans overflow-hidden">
      {/* HEADER FIXE PRESTIGE */}
      <header className="sticky top-0 z-[100] h-20 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center text-black shadow-lg">
            <Crown size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter text-white">MZ+</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <CurrencySelector />
          </div>
          <div className="hidden md:flex">
            <EliteBadge variant={profile?.user_level}>{profile?.user_level === 'niveau_mz_plus' ? 'MEMBRE PREMIUM' : 'AMBASSADEUR'}</EliteBadge>
          </div>
          <button 
            id="menu-button"
            onClick={() => setIsMenuOpen(true)}
            className="group flex items-center gap-3 px-5 h-11 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-full text-neutral-400 hover:text-white transition-all duration-500 active:scale-95 backdrop-blur-md"
          >
            <div className="relative flex flex-col gap-1 w-4">
              <span className="h-px w-full bg-current transition-all group-hover:w-3"></span>
              <span className="h-px w-full bg-current transition-all"></span>
              <span className="h-px w-full bg-current transition-all group-hover:w-3"></span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] pt-0.5">Menu</span>
          </button>
        </div>
      </header>

      {/* OVERLAY MENU MOBILE PLEIN ÉCRAN */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fade-in">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#080808] h-full border-r border-white/10 p-8 flex flex-col animate-slide-right shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-black">
                  <Crown size={28} fill="currentColor" />
                </div>
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Menu Elite</h2>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-3 text-neutral-500 hover:text-white transition-colors bg-white/5 rounded-full"><X size={28}/></button>
            </div>

            <div className="flex-1 space-y-2">
              {/* PREMIUM CTA - PASSEZ AU NIVEAU SUPÉRIEUR (TOP PLACEMENT FOR CONVERSION) */}
              {profile?.user_level !== 'niveau_mz_plus' && (
                <div className="mb-8">
                  <button
                    onClick={() => { setActiveTab('flash_offer'); setIsMenuOpen(false); }}
                    className={`group relative w-full flex flex-col items-center justify-center gap-3 p-8 rounded-[2.5rem] font-black uppercase tracking-[0.25em] transition-all overflow-hidden border-2 shadow-2xl animate-pulse-subtle backdrop-blur-xl ${
                      activeTab === 'flash_offer' 
                        ? 'bg-gradient-to-br from-purple-600/80 via-indigo-600/80 to-purple-700/80 text-white border-purple-400/50 shadow-purple-500/40' 
                        : 'bg-gradient-to-br from-purple-900/40 to-indigo-950/40 text-white border-purple-500/20 hover:border-purple-400/40 hover:shadow-purple-500/30'
                    }`}
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.15),transparent)] -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                    
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4 px-2 py-0.5 bg-yellow-500 text-black text-[7px] font-black rounded-md shadow-lg">
                      PREMIUM
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <Zap size={24} className="text-purple-200 animate-pulse" fill="currentColor" />
                      </div>
                      <div className="text-center">
                        <span className="text-[13px] md:text-[14px] block mb-1">PASSEZ AU NIVEAU SUPÉRIEUR</span>
                        <span className="text-[8px] tracking-[0.4em] text-purple-300/80 font-bold">ACCÈS ÉLITE ILLIMITÉ</span>
                      </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                  </button>
                </div>
              )}

              {menuItems.map((item) => (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                  className={`w-full flex items-center justify-between gap-4 p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
                    activeTab === item.id ? 'bg-yellow-600 text-black shadow-xl' : 'text-neutral-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <item.icon size={20} />
                    {item.label}
                  </span>
                  <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              {isAdmin && (
                <>
                  <button 
                    onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all mb-2 ${
                      activeTab === 'admin' ? 'bg-blue-600 text-white shadow-xl' : 'bg-blue-900/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    <ShieldCheck size={20} /> ESPACE ADMINISTRATION
                  </button>
                  <button 
                    onClick={() => { setActiveTab('sql_console'); setIsMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
                      activeTab === 'sql_console' ? 'bg-zinc-700 text-white shadow-xl' : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <Terminal size={20} /> CONSOLE SQL
                  </button>
                </>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest text-red-500 hover:bg-red-500/10 transition-all">
                <LogOut size={20} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-slide-right { animation: slide-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
      `}} />
    </div>
  );
};
