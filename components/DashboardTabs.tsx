
import React, { useState } from 'react';
import { 
  ShoppingBag as Bag, 
  Users, 
  UserPlus, 
  Lock,
  Target,
  Crown,
  ChevronRight,
  MessageSquare,
  Zap,
  GraduationCap,
  Video,
  BookOpen,
  ArrowLeft,
  MessagesSquare,
  Shield,
  Mail,
  ArrowRight,
  ChevronDown,
  ArrowDownToLine
} from 'lucide-react';
import { UserProfile, RPASubmission, CoachingRequest, WithdrawalRequest, TabId, Wallet } from '../types.ts';
import { SectionTitle, GoldBorderCard, EliteBadge, GoldText, PrimaryButton, UpgradeGate, PurpleText } from './UI.tsx';
import { supabase } from '../services/supabase.ts';
import { AcademieMain } from './features/formation/AcademieMain.tsx';
import { RpaDashboard } from './features/rpa/RpaDashboard.tsx';
import { CoachingDashboard } from './features/coaching/CoachingDashboard.tsx';
import { ReferralDashboard } from './features/referral/ReferralDashboard.tsx';
import { GuidesTab as GuidesTabComponent } from './GuidesTab.tsx';
import { WithdrawalSystem } from './features/withdrawals/WithdrawalSystem.tsx';

type HubCategory = 'main' | 'business' | 'academy' | 'community';

export const GlobalView: React.FC<any> = ({ 
  profile, 
  onSwitchTab, 
  onStartGuide,
  activeCategory,
  setActiveCategory
}) => {
  const isMzPlus = profile?.user_level === 'niveau_mz_plus';

  const scrollToHub = () => {
    const element = document.getElementById('hub-navigation');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    }
    if (onStartGuide) onStartGuide();
  };

  const renderMainHub = () => (
    <div id="hub-navigation" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up pb-10">
      <div id="pillar-business">
        <PillarCard 
          id="business" 
          title="Business" 
          desc="Générez vos revenus & commissions" 
          icon={Target} 
          color="gold" 
          onClick={() => setActiveCategory('business')} 
        />
      </div>
      <PillarCard 
        id="academy" 
        title="Académie" 
        desc="Apprenez les secrets du succès" 
        icon={GraduationCap} 
        color="purple" 
        onClick={() => setActiveCategory('academy')} 
      />
      <PillarCard 
        id="community" 
        title="Communauté" 
        desc="Échangez avec l'élite du réseau" 
        icon={Users} 
        color="emerald" 
        onClick={() => setActiveCategory('community')} 
      />
    </div>
  );

  const renderCategoryDetails = () => {
    switch(activeCategory) {
      case 'business':
        return (
          <div id="business-services-container" className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
             <div id="subservice-affiliation" className="w-full">
               <SubServiceCard title="Affiliation" desc="Catalogue & Liens" icon={Bag} onClick={() => onSwitchTab('affiliation')} />
             </div>
             <SubServiceCard title="RPA Vidéo" desc="Monétisez vos réseaux" icon={Video} locked={!isMzPlus} onClick={() => onSwitchTab('rpa')} />
             <SubServiceCard title="Parrainage" desc="Mentorat & Équipe" icon={UserPlus} onClick={() => onSwitchTab('team')} />
          </div>
        );
      case 'academy':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
             <SubServiceCard title="Formations MZ+" desc="Le savoir Millionnaire" icon={BookOpen} locked={!isMzPlus} onClick={() => onSwitchTab('formation')} />
             <SubServiceCard title="Coaching Élite" desc="Diagnostic Personnalisé" icon={Target} locked={!isMzPlus} onClick={() => onSwitchTab('coaching')} />
          </div>
        );
      case 'community':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
             <SubServiceCard title="Cercle Privé" desc="Discussion de groupe" icon={MessagesSquare} onClick={() => onSwitchTab('private_chat')} />
             <SubServiceCard title="Messagerie" desc="Échanges P2P" icon={Mail} onClick={() => onSwitchTab('private_messaging')} />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 pt-4 relative bg-[#050505] min-h-screen">
      
      {/* 1. HEADER ROYAL ULTRA-CENTRE (SANS SOLDE) */}
      <header className="flex flex-col items-center text-center px-4 min-h-[75vh] justify-center space-y-12">
        <div className="space-y-10 max-w-4xl">
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-yellow-600/5 border border-yellow-600/10 rounded-full animate-fade-in">
               <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse"></div>
               <p className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.5em]">Terminal Ambassadeur Certifié</p>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] italic animate-slide-down">
              Bienvenue dans <GoldText>MZ+</GoldText>
            </h2>
          </div>
          
          <div className="space-y-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="text-neutral-400 text-base md:text-xl font-medium tracking-tight uppercase max-w-3xl mx-auto leading-relaxed italic opacity-80">
              {isMzPlus ? (
                <div className="space-y-2">
                  <p className="text-white text-2xl md:text-3xl font-black mb-4">🎉 Félicitations à toi {profile?.full_name?.split(' ')[0]} !</p>
                  <p>Tu viens officiellement d’accéder à <GoldText>MZ+ Premium</GoldText>. 👑</p>
                  <p className="text-sm md:text-base normal-case not-italic opacity-70">
                    Tu fais maintenant partie des ambassadeurs qui ont décidé de passer au niveau supérieur et d’appliquer les stratégies qui génèrent des résultats. 🚀
                  </p>
                </div>
              ) : (
                <p>Félicitations, tu viens de rejoindre la zone des millionnaires. 🚀</p>
              )}
            </div>
            
            <div className="flex justify-center pt-4">
              <button 
                onClick={scrollToHub}
                className="group relative px-12 py-6 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
              >
                Commencer <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* INDICATEUR DE SCROLL DORÉ */}
          {activeCategory === 'main' && (
            <div className="pt-20 flex flex-col items-center gap-5 animate-bounce opacity-40">
               <div className="w-12 h-12 rounded-full border border-yellow-600/20 flex items-center justify-center text-yellow-600 bg-yellow-600/5">
                  <ChevronDown size={24} strokeWidth={2.5} />
               </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. NAVIGATION PAR PILIERS */}
      <main className="px-6 space-y-16 pt-10">
        {activeCategory !== 'main' && (
          <button 
            onClick={() => setActiveCategory('main')}
            className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest italic animate-fade-in mb-10"
          >
            <ArrowLeft size={16} /> Retour au Hub Central
          </button>
        )}

        {activeCategory === 'main' ? renderMainHub() : (
          <div className="space-y-8 pb-20">
             <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                  Pôle {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                </h3>
                <div className="h-px flex-1 bg-white/5"></div>
             </div>
             {renderCategoryDetails()}
          </div>
        )}
      </main>

      <footer className="pt-24 text-center opacity-10 flex flex-col items-center gap-6">
         <div className="h-px w-20 bg-neutral-800"></div>
         <Shield size={32} className="text-neutral-500" />
         <p className="text-[9px] font-black uppercase text-neutral-700 tracking-[0.8em]">MILLIONAIRE ZONE PLUS ELITE SYSTEM</p>
      </footer>
    </div>
  );
};

const PillarCard = ({ title, desc, icon: Icon, color, onClick }: any) => {
  const isGold = color === 'gold';
  const isPurple = color === 'purple';
  return (
    <button 
      onClick={onClick}
      className="group relative h-80 md:h-[500px] w-full rounded-[3.5rem] overflow-hidden border-2 border-white/5 bg-[#0a0a0a] transition-all hover:scale-[1.02] active:scale-95 duration-700 shadow-2xl hover:border-white/10"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 ${isGold ? 'bg-yellow-600' : isPurple ? 'bg-purple-600' : 'bg-emerald-600'}`}></div>
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
        <Icon size={280} className={isGold ? 'text-yellow-600' : isPurple ? 'text-purple-600' : 'text-emerald-600'} />
      </div>
      <div className="relative h-full p-12 flex flex-col justify-between items-start text-left z-10">
        <div className={`p-5 rounded-3xl border transition-all duration-700 ${isGold ? 'bg-yellow-600/10 border-yellow-600/20 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-black' : isPurple ? 'bg-purple-600/10 border-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white' : 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'}`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
        <div className="space-y-4">
           <div>
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic group-hover:translate-x-2 transition-transform duration-700">{title}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mt-2 leading-relaxed max-w-[200px]">{desc}</p>
           </div>
           <div className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 ${isGold ? 'text-yellow-600' : isPurple ? 'text-purple-500' : 'text-emerald-500'}`}>
              Ouvrir le pôle <ArrowRight size={12} />
           </div>
        </div>
      </div>
    </button>
  );
};

const SubServiceCard = ({ title, desc, icon: Icon, onClick, locked }: any) => (
  <button onClick={onClick} className="group relative w-full p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 transition-all hover:bg-neutral-900 active:scale-95 flex items-center justify-between shadow-xl">
    <div className="flex items-center gap-6">
       <div className="p-4 bg-white/5 rounded-2xl text-neutral-400 group-hover:text-white group-hover:bg-yellow-600/10 transition-all border border-transparent group-hover:border-yellow-600/20">
          <Icon size={24} />
       </div>
       <div className="text-left">
          <h4 className="text-sm font-black uppercase text-white tracking-widest">{title}</h4>
          <p className="text-[9px] font-bold text-neutral-600 uppercase mt-1 tracking-widest">{desc}</p>
       </div>
    </div>
    {locked ? <div className="p-2 bg-black/40 rounded-xl text-neutral-700 border border-white/5"><Lock size={14} /></div> : <div className="p-2 text-neutral-800 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all"><ChevronRight size={20} /></div>}
  </button>
);

export const RevenueTab: React.FC<any> = ({ profile, wallet, onRefresh }) => {
  return (
    <WithdrawalSystem 
      profile={profile} 
      wallet={wallet} 
      onRefresh={onRefresh} 
    />
  );
};

export const TeamTab: React.FC<any> = ({ profile, teamCount }) => (
  <ReferralDashboard profile={profile} teamCount={teamCount} />
);

export const RPADashboard: React.FC<any> = ({ profile, onRefresh, onSwitchTab }) => (
  <RpaDashboard profile={profile} onRefresh={onRefresh} onSwitchTab={onSwitchTab} />
);

export const CoachingTab: React.FC<any> = ({ profile, onSwitchTab }) => (
  <CoachingDashboard profile={profile} onSwitchTab={onSwitchTab} />
);

export const FormationTab: React.FC<any> = ({ profile, onSwitchTab }) => (<AcademieMain profile={profile} onSwitchTab={onSwitchTab} />);

export const SuggestionsTab: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await supabase.from('user_suggestions').insert([{ user_id: profile?.id, suggestion, type: 'suggestion' }]);
      setSuggestion(''); alert("Merci pour votre idée !");
    } catch (e: any) { alert(e.message); } finally { setIsSending(false); }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in pb-20 pt-10">
      <SectionTitle title="Suggestions" subtitle="Aidez-nous à améliorer MZ+." />
      <GoldBorderCard className="p-10 bg-black/40 border-white/5">
        <form onSubmit={handleSubmit} className="space-y-8">
           <textarea required rows={5} placeholder="Votre idée..." className="w-full bg-black border border-white/10 rounded-xl p-6 text-sm text-white resize-none" value={suggestion} onChange={e => setSuggestion(e.target.value)} />
           <PrimaryButton fullWidth isLoading={isSending} type="submit">Envoyer mon message</PrimaryButton>
        </form>
      </GoldBorderCard>
    </div>
  );
};

export const UpgradeTab: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in pt-20">
    <div className="w-20 h-20 bg-yellow-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-yellow-600/20 shadow-2xl">
      <Crown className="text-yellow-600 animate-pulse" size={32} />
    </div>
    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white leading-tight max-w-2xl">
      L'accès <GoldText>MZ+ Premium</GoldText> est maintenant <GoldText>OUVERT</GoldText>. <br/> Profitez de l'offre flash pour débloquer tout le système.
    </h3>
    <div className="mt-12 p-8 border border-dashed border-white/5 rounded-[3rem] opacity-30">
      <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.5em] leading-relaxed">
        Propulsé par Millionaire Zone Plus Neural Network v6.5
      </p>
    </div>
  </div>
);

export const GuidesTab: React.FC<any> = ({ onStartAffiliationGuide, onStartRPAGuide, onStartTeamGuide }) => (
  <GuidesTabComponent 
    onStartAffiliationGuide={onStartAffiliationGuide} 
    onStartRPAGuide={onStartRPAGuide} 
    onStartTeamGuide={onStartTeamGuide} 
  />
);
