
import React, { useState, useEffect, useCallback } from 'react';
import { Loader, RefreshCw } from 'lucide-react';
import { supabase } from './services/supabase.ts';
import { UserProfile, Wallet, TabId, Product } from './types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { DashboardLayout } from './components/DashboardLayout.tsx';
import { 
  GlobalView, 
  RevenueTab, 
  TeamTab, 
  RPADashboard, 
  CoachingTab, 
  FormationTab, 
  UpgradeTab, 
  SuggestionsTab,
  GuidesTab
} from './components/DashboardTabs.tsx';
import { RewardFeature } from './components/features/programme-recompense/RewardFeature.tsx';
import { AffiliationSystem } from './components/AffiliationSystem.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ProductSalesPage } from './components/ProductSalesPage.tsx';
import { EspacePrive } from './components/EspacePrive.tsx';
import { MZPlusFlashOfferOverlay } from './components/features/mz-plus-offer/MZPlusFlashOfferOverlay.tsx';
import { MZPlusPresentationOverlay } from './components/features/mz-plus-presentation/MZPlusPresentationOverlay.tsx';
import { LunaChatPage } from './components/LunaChatPage.tsx';
import { PrivateMessagingMain } from './components/features/messagerie-privee/PrivateMessagingMain.tsx';
import { PushDisplay } from './components/features/admin-push-notifications/PushDisplay.tsx';
import { AnnouncementOverlay } from './components/features/marketing-announcements/AnnouncementOverlay.tsx';
import { AffiliationGuide } from './components/guides/AffiliationGuide.tsx';
import { RPAGuide } from './components/guides/RPAGuide.tsx';
import { TeamGuide } from './components/guides/TeamGuide.tsx';
import { SlideNotificationAffiliation } from './components/features/SlideNotificationAffiliation.tsx';
import { PremiumPopup } from './components/PremiumPopup.tsx';
import { PremiumAccessGate } from './components/premium-access/PremiumAccessGate.tsx';
import { PWAInstallPrompt } from './components/PWAInstallPrompt.tsx';

const ADMIN_EMAILS = [
  'equipemzplus@gmail.com',
  'millionairezoneplus@gmail.com',
  'admin@mz.plus'
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProductChecked, setIsProductChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [activeCategory, setActiveCategory] = useState<string>('main');
  const [lastUpdateSignal, setLastUpdateSignal] = useState<number>(Date.now());
  const [customerProduct, setCustomerProduct] = useState<Product | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'view' | 'processing' | 'success'>('view');
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [isRPAGuideActive, setIsRPAGuideActive] = useState(false);
  const [isTeamGuideActive, setIsTeamGuideActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || !isProductChecked || !authInitialized) {
        setShowDiagnostic(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [loading, isProductChecked, authInitialized]);

  useEffect(() => {
    console.log("App: Initialization states - loading:", loading, "isProductChecked:", isProductChecked, "authInitialized:", authInitialized);
  }, [loading, isProductChecked, authInitialized]);

  useEffect(() => {
    if (session && userProfile && !localStorage.getItem('mz_guide_completed')) {
      const timer = setTimeout(() => {
        setIsGuideActive(true);
        localStorage.setItem('mz_guide_completed', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session, userProfile]);

  const fetchUserData = useCallback(async (userId: string, email?: string, fullName?: string, retryCount = 0) => {
    if (!userId) return;
    
    try {
      const userEmail = email?.toLowerCase().trim() || "";
      const isHardcodedAdmin = ADMIN_EMAILS.includes(userEmail);
      
      let { data: profile, error: profileError } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      
      if (profileError) throw profileError;

      if (!profile) {
        const newRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newProfileData = { 
          id: userId, 
          full_name: fullName || 'Ambassadeur', 
          email: userEmail, 
          referral_code: newRefCode, 
          rank_id: 1, 
          is_admin: isHardcodedAdmin, 
          user_level: 'standard'
        };
        const { data: upsertedProfile, error: upsertError } = await supabase.from('users').upsert(newProfileData, { onConflict: 'id' }).select('*').single();
        if (upsertError) throw upsertError;
        profile = upsertedProfile || (newProfileData as any);
      }

      const isAdminValue = isHardcodedAdmin || profile?.is_admin === true || !!profile?.admin_role;
      const enrichedProfile: UserProfile = { 
        id: profile?.id || userId, 
        full_name: profile?.full_name || fullName || 'Ambassadeur', 
        referral_code: profile?.referral_code || '---', 
        rank_id: profile?.rank_id || 1, 
        email: profile?.email || userEmail, 
        is_admin: isAdminValue, 
        admin_role: profile?.admin_role || (isHardcodedAdmin ? 'super_admin' : null),
        rpa_balance: Number(profile?.rpa_balance || 0), 
        rpa_points: Number(profile?.rpa_points || 0), 
        user_level: (profile?.user_level as 'standard' | 'niveau_mz_plus') || 'standard', 
        created_at: profile?.created_at 
      };
      setUserProfile(enrichedProfile);

      const [walletRes, teamRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('referral_code_used', enrichedProfile.referral_code)
      ]);

      setWallet(walletRes.data || { id: 'initial', user_id: userId, balance: 0 });
      setTeamCount(teamRes?.count || 0);
    } catch (error: any) {
      console.error("Fetch data error:", error);
      if (retryCount < 2 && (error.message?.includes('fetch') || error.name === 'TypeError')) {
        console.log(`Retrying fetchUserData (${retryCount + 1})...`);
        setTimeout(() => fetchUserData(userId, email, fullName, retryCount + 1), 1500);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch dynamic platform identity (Icon)
    const fetchIcon = async () => {
      try {
        const { data } = await supabase.from('mz_home_config').select('platform_icon_url').eq('id', 'home-landing').maybeSingle();
        if (data?.platform_icon_url) {
          const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
          if (appleIcon) appleIcon.setAttribute('href', data.platform_icon_url);
          const favicon = document.querySelector('link[rel="icon"]');
          if (favicon) favicon.setAttribute('href', data.platform_icon_url);
        }
      } catch (err) {
        console.warn("Icon fetch error:", err);
      }
    };
    fetchIcon();
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log("App: Initializing Auth...");
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        console.log("App: Session fetched:", !!s);
        if (!mounted) return;
        
        setSession(s);
        if (s) {
          console.log("App: Fetching user data for session...");
          await fetchUserData(s.user.id, s.user.email, s.user.user_metadata?.full_name);
        } else {
          console.log("App: No session, stopping loading.");
          setLoading(false);
        }
        setAuthInitialized(true);
      } catch (error: any) {
        console.error("Initial session fetch error:", error);
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;
      
      setSession(s);
      
      if (s) {
        // On ne recharge les données que si l'ID utilisateur a changé ou si on n'a pas encore de profil
        // On utilise l'ID de la session directement pour éviter de dépendre de userProfile dans l'effet
        await fetchUserData(s.user.id, s.user.email, s.user.user_metadata?.full_name);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  useEffect(() => {
    const checkProduct = async (retryCount = 0) => {
      console.log("App: Checking product (retry:", retryCount, ")...");
      try {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('prod');
        const refCode = params.get('ref');

        if (prodId) {
          console.log("App: Product ID found:", prodId);
          const { data: product, error } = await supabase.from('products').select('*').eq('id', prodId).maybeSingle();
          if (error) throw error;
          if (product) {
            console.log("App: Product loaded:", product.name);
            setCustomerProduct(product);
          }
        }

        if (refCode) {
          console.log("App: Referrer code found:", refCode);
          const { data: referrer } = await supabase.from('users').select('id').eq('referral_code', refCode).maybeSingle();
          if (referrer && prodId) {
            setReferrerId(referrer.id);
            // Incrémenter le compteur de clics via RPC
            try {
              await supabase.rpc('mz_increment_product_clicks', { 
                p_user_id: referrer.id, 
                p_product_id: prodId 
              });
            } catch (err) {
              console.warn("Erreur incrémentation clics:", err);
            }
          }
        }

        setIsProductChecked(true);
      } catch (error: any) {
        console.error("Check product error:", error);
        if (retryCount < 2 && (error.message?.includes('fetch') || error.name === 'TypeError')) {
          setTimeout(() => checkProduct(retryCount + 1), 1000);
        } else {
          setIsProductChecked(true);
        }
      }
    };
    checkProduct();
  }, []);

  useEffect(() => {
    if (activeTab === 'rpa' && !localStorage.getItem('mz_rpa_guide_completed')) {
      const timer = setTimeout(() => {
        setIsRPAGuideActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
    if (activeTab === 'team' && !localStorage.getItem('mz_team_guide_completed')) {
      const timer = setTimeout(() => {
        setIsTeamGuideActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const triggerRefresh = () => { 
    if (session?.user?.id) {
      fetchUserData(session.user.id, session.user.email, session.user.user_metadata?.full_name); 
    }
  };

  // GLOBAL HEARTBEAT : Suivi du temps pour le programme de récompense
  useEffect(() => {
    if (!userProfile?.id) return;
    
    const sendHeartbeat = async () => {
      try {
        const { error } = await supabase.rpc('mz_rewards_heartbeat', { p_user_id: userProfile.id });
        if (error) console.warn("Global heartbeat error:", error.message);
      } catch (e) {
        console.warn("Global heartbeat RPC not available");
      }
    };

    // Premier appel immédiat
    sendHeartbeat();
    
    // Puis toutes les 60 secondes (1 minute = 1 point)
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [userProfile?.id]);

  const handlePurchase = useCallback(async () => {
    setPurchaseStep('processing');
    
    // Enregistrer la commission si un parrain est détecté
    if (referrerId && customerProduct) {
      try {
        const { error: commError } = await supabase.from('commissions').insert([{
          user_id: referrerId,
          product_id: customerProduct.id,
          amount: customerProduct.commission_amount,
          status: 'pending'
        }]);
        
        if (commError) {
          console.error("Erreur lors de l'enregistrement de la commission:", commError);
        } else {
          console.log("Commission enregistrée avec succès pour l'ambassadeur:", referrerId);
        }
      } catch (err) {
        console.error("Exception lors de l'enregistrement de la commission:", err);
      }
    }

    // Redirection vers le lien final du produit
    setTimeout(() => {
      if (customerProduct?.final_link) {
        window.location.href = customerProduct.final_link;
      } else {
        setPurchaseStep('view');
        alert("Lien de redirection manquant pour ce produit.");
      }
    }, 800); // Délai suffisant pour l'enregistrement et l'effet visuel
  }, [customerProduct, referrerId]);

  if (loading || !isProductChecked || !authInitialized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-yellow-500 font-black gap-6 p-6 text-center">
        <div className="relative">
          <Loader className="animate-spin text-yellow-600" size={56} strokeWidth={3} />
          <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-10 animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] tracking-[0.4em] uppercase animate-pulse">Initialisation MZ+ Élite</span>
          <span className="text-[8px] tracking-[0.2em] text-neutral-600 uppercase">Vérification des protocoles de sécurité...</span>
        </div>
        
        {showDiagnostic && (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed max-w-xs">
              Le démarrage prend plus de temps que prévu. <br/>
              Status: {loading ? "Chargement..." : "Prêt"} | {isProductChecked ? "Produit OK" : "Vérif Produit..."} | {authInitialized ? "Auth OK" : "Auth..."}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Rafraîchir la page
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="px-6 py-3 bg-red-600/10 border border-red-600/20 rounded-xl text-[10px] text-red-500 uppercase tracking-widest hover:bg-red-600/20 transition-all"
              >
                Réinitialiser le cache
              </button>
              <button 
                onClick={() => {
                  setLoading(false);
                  setIsProductChecked(true);
                  setAuthInitialized(true);
                }}
                className="text-[9px] text-neutral-600 underline underline-offset-4 hover:text-neutral-400"
              >
                Forcer le démarrage (Expert)
              </button>
            </div>
          </div>
        )}

        {!showDiagnostic && (
          <button 
            onClick={() => window.location.reload()}
            className="mt-12 px-6 py-2 border border-white/5 rounded-full text-[8px] text-neutral-700 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all"
          >
            Le chargement est trop long ? Rafraîchir
          </button>
        )}
      </div>
    );
  }

  const isAdmin = userProfile?.is_admin === true || !!userProfile?.admin_role;

  if (customerProduct) {
    return (
      <ProductSalesPage 
        product={customerProduct} 
        referrerId={referrerId} 
        purchaseStep={purchaseStep}
        onPurchase={handlePurchase}
        onSuccess={() => setPurchaseStep('success')}
        countdown={900}
        isLoggedIn={!!session}
      />
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-yellow-600/10 rounded-2xl flex items-center justify-center text-yellow-600 mb-6 border border-yellow-600/20">
          <RefreshCw className="animate-spin" size={32} />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Synchronisation du Profil</h2>
        <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-8 max-w-xs leading-relaxed">
          Nous récupérons vos accès ambassadeur. Cela peut prendre quelques secondes.
        </p>
        <button 
          onClick={() => session && fetchUserData(session.user.id, session.user.email, session.user.user_metadata?.full_name)}
          className="px-8 py-3 bg-white/5 text-white border border-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all"
        >
          Réessayer la synchronisation
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isAdmin={isAdmin} 
      profile={userProfile}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
    >
        <PremiumAccessGate />
        
        <PushDisplay profile={userProfile} />
        <PremiumPopup user={userProfile} />
        <MZPlusPresentationOverlay profile={userProfile} onUpgrade={() => setActiveTab('flash_offer')} />
        <AnnouncementOverlay profile={userProfile} onNavigate={(tab) => setActiveTab(tab as TabId)} />
        <SlideNotificationAffiliation activeTab={activeTab} onUpgrade={() => setActiveTab('flash_offer')} />

        {activeTab === 'flash_offer' && <MZPlusFlashOfferOverlay profile={userProfile} onUpgrade={() => setActiveTab('upgrade')} onClose={() => setActiveTab('dashboard')} isFullPage={true} />}
        {activeTab === 'dashboard' && (
          <GlobalView 
            profile={userProfile} 
            onSwitchTab={setActiveTab} 
            onStartGuide={() => {
              if (!localStorage.getItem('mz_guide_completed')) {
                setIsGuideActive(true);
                localStorage.setItem('mz_guide_completed', 'true');
              }
            }}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
        <AffiliationGuide 
          isActive={isGuideActive} 
          onComplete={() => setIsGuideActive(false)} 
          activeCategory={activeCategory}
          activeTab={activeTab}
        />
        <RPAGuide 
          isActive={isRPAGuideActive} 
          onComplete={() => setIsRPAGuideActive(false)} 
        />
        <TeamGuide 
          isActive={isTeamGuideActive} 
          onComplete={() => setIsTeamGuideActive(false)} 
        />
        {activeTab === 'recompense' && <RewardFeature profile={userProfile} onSwitchTab={setActiveTab} />}
        {activeTab === 'private_chat' && <EspacePrive profile={userProfile} />}
        {activeTab === 'private_messaging' && <PrivateMessagingMain profile={userProfile} />}
        {activeTab === 'revenus' && <RevenueTab profile={userProfile} wallet={wallet} />}
        {activeTab === 'affiliation' && <AffiliationSystem profile={userProfile} lastUpdateSignal={lastUpdateSignal} onSwitchTab={setActiveTab} />}
        {activeTab === 'team' && <TeamTab profile={userProfile} teamCount={teamCount} onSwitchTab={setActiveTab} />}
        {activeTab === 'coaching' && <CoachingTab profile={userProfile} onSwitchTab={setActiveTab} />}
        {activeTab === 'formation' && <FormationTab profile={userProfile} onSwitchTab={setActiveTab} />}
        {activeTab === 'rpa' && (
          <RPADashboard 
            profile={userProfile} 
            onRefresh={triggerRefresh} 
            onSwitchTab={setActiveTab} 
            onStartGuide={() => {
              localStorage.removeItem('mz_rpa_guide_completed');
              setIsRPAGuideActive(true);
            }}
          />
        )}
        {activeTab === 'suggestions' && <SuggestionsTab profile={userProfile} />}
        {activeTab === 'guides' && (
          <GuidesTab 
            onStartAffiliationGuide={() => {
              localStorage.removeItem('mz_guide_completed');
              setActiveTab('dashboard');
              setIsGuideActive(true);
            }}
            onStartRPAGuide={() => {
              localStorage.removeItem('mz_rpa_guide_completed');
              setActiveTab('rpa');
              setIsRPAGuideActive(true);
            }}
            onStartTeamGuide={() => {
              localStorage.removeItem('mz_team_guide_completed');
              setActiveTab('team');
              setIsTeamGuideActive(true);
            }}
          />
        )}
        {activeTab === 'upgrade' && <UpgradeTab />}
        {activeTab === 'luna_chat' && <LunaChatPage profile={userProfile} onUpgrade={() => setActiveTab('flash_offer')} />}
        {activeTab === 'admin' && isAdmin && <AdminPanel adminProfile={userProfile} lastUpdateSignal={lastUpdateSignal} onRefresh={triggerRefresh} />}
      <PWAInstallPrompt />
    </DashboardLayout>
  );
};

export default App;
