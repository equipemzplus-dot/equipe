
import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { supabase } from '../services/supabase.ts';
import { UserProfile, Wallet, TabId, Product } from '../types.ts';
import { LandingPage } from './LandingPage.tsx';
import { DashboardLayout } from './DashboardLayout.tsx';
import { 
  GlobalView, 
  RevenueTab, 
  TeamTab, 
  RPADashboard, 
  CoachingTab, 
  FormationTab, 
  UpgradeTab, 
  SuggestionsTab
} from './DashboardTabs.tsx';
import { RewardFeature } from './features/programme-recompense/RewardFeature.tsx';
import { AffiliationSystem } from './AffiliationSystem.tsx';
import { AdminPanel } from './AdminPanel.tsx';
import { ProductSalesPage } from './ProductSalesPage.tsx';
import { Chatbot } from './Chatbot.tsx';
import { EspacePrive } from './EspacePrive.tsx';
import { MZPlusPresentationOverlay } from './features/mz-plus-presentation/MZPlusPresentationOverlay.tsx';
import { MZPlusFlashOfferOverlay } from './features/mz-plus-offer/MZPlusFlashOfferOverlay.tsx';
// Fix: Added missing LunaChatPage import
import { LunaChatPage } from './LunaChatPage.tsx';

const ADMIN_EMAILS = [
  'equipemzplus@gmail.com',
  'millionairezoneplus@gmail.com',
  'admin@mz.plus'
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [salesCount, setSalesCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProductChecked, setIsProductChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [lastUpdateSignal, setLastUpdateSignal] = useState<number>(Date.now());
  const [customerProduct, setCustomerProduct] = useState<Product | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'view' | 'processing' | 'success'>('view');

  useEffect(() => {
    if (!userProfile?.id) return;
    const sendHeartbeat = async () => {
      try {
        await supabase.rpc('mz_rewards_heartbeat', { p_user_id: userProfile.id });
      } catch (err) {}
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [userProfile?.id]);

  const fetchUserData = useCallback(async (userId: string, email?: string) => {
    try {
      const userEmail = email?.toLowerCase().trim() || "";
      const isHardcodedAdmin = ADMIN_EMAILS.includes(userEmail);
      
      let { data: profile } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      
      if (!profile) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const newRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const newProfileData = { 
            id: userId, full_name: authUser.user_metadata?.full_name || 'Ambassadeur', email: authUser.email, referral_code: newRefCode, rank_id: 1, is_admin: isHardcodedAdmin, user_level: 'standard'
          };
          const { data: upsertedProfile } = await supabase.from('users').upsert(newProfileData, { onConflict: 'id' }).select('*').single();
          profile = upsertedProfile || (newProfileData as any);
        }
      }

      const isAdminValue = isHardcodedAdmin || profile?.is_admin === true;
      const enrichedProfile: UserProfile = { 
        id: profile?.id || userId, full_name: profile?.full_name || 'Ambassadeur', referral_code: profile?.referral_code || '---', rank_id: profile?.rank_id || 1, email: profile?.email || userEmail, is_admin: isAdminValue, rpa_balance: Number(profile?.rpa_balance || 0), rpa_points: Number(profile?.rpa_points || 0), user_level: (profile?.user_level as 'standard' | 'niveau_mz_plus') || 'standard', created_at: profile?.created_at 
      };
      setUserProfile(enrichedProfile);

      const [commsCount, clickData, walletRes, teamRes] = await Promise.all([
        supabase.from('commissions').select('*', { count: 'exact', head: true }).match({ user_id: userId, status: 'approved' }),
        supabase.from('product_stats').select('clicks').eq('user_id', userId),
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('referral_code_used', enrichedProfile.referral_code)
      ]);

      setSalesCount(commsCount?.count || 0);
      setTotalClicks(clickData.data?.reduce((acc: number, s: any) => acc + (Number(s.clicks) || 0), 0) || 0);
      setWallet(walletRes.data || { id: 'initial', user_id: userId, balance: 0 });
      setTeamCount(teamRes?.count || 0);
    } catch (error) {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { 
      setSession(s); if (s) fetchUserData(s.user.id, s.user.email); else if (isProductChecked) setLoading(false); 
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => { 
      setSession(s); if (s) fetchUserData(s.user.id, s.user.email); else { setUserProfile(null); if (isProductChecked) setLoading(false); } 
    });
    return () => subscription.unsubscribe();
  }, [fetchUserData, isProductChecked]);

  useEffect(() => {
    const checkProduct = async () => {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('prod');
      if (prodId) {
        const { data: product } = await supabase.from('products').select('*').eq('id', prodId).maybeSingle();
        if (product) setCustomerProduct(product);
      }
      setIsProductChecked(true);
    };
    checkProduct();
  }, []);

  const triggerRefresh = () => { if (session?.user?.id) fetchUserData(session.user.id, session.user.email); };

  if (loading || !isProductChecked) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-yellow-500 font-black gap-4">
      <Loader className="animate-spin" size={48} />
      <span className="text-[10px] tracking-[0.3em] uppercase animate-pulse">Initialisation...</span>
    </div>
  );
  
  if (customerProduct) return (<ProductSalesPage product={customerProduct} onPurchase={() => {}} purchaseStep={purchaseStep} countdown={900} />);
  if (!session) return <LandingPage />;

  const isAdmin = userProfile?.is_admin === true;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} profile={userProfile}>
      {/* On n'affiche l'overlay automatique que si on n'est pas déjà sur l'onglet dédié */}
      {activeTab !== 'flash_offer' && <MZPlusFlashOfferOverlay profile={userProfile} onUpgrade={() => setActiveTab('flash_offer')} onClose={() => {}} />}
      
      {activeTab === 'flash_offer' && <MZPlusFlashOfferOverlay profile={userProfile} onUpgrade={() => setActiveTab('upgrade')} onClose={() => setActiveTab('dashboard')} isFullPage={true} />}
      {activeTab === 'dashboard' && <GlobalView profile={userProfile} wallet={wallet} salesCount={salesCount} totalClicks={totalClicks} teamCount={teamCount} onSwitchTab={setActiveTab} />}
      {activeTab === 'recompense' && <RewardFeature profile={userProfile} />}
      {activeTab === 'private_chat' && <EspacePrive profile={userProfile} />}
      {activeTab === 'revenus' && <RevenueTab profile={userProfile} wallet={wallet} onRefresh={triggerRefresh} />}
      {activeTab === 'affiliation' && <AffiliationSystem profile={userProfile} lastUpdateSignal={lastUpdateSignal} onSwitchTab={setActiveTab} />}
      {activeTab === 'team' && <TeamTab profile={userProfile} teamCount={teamCount} onSwitchTab={setActiveTab} />}
      {activeTab === 'coaching' && <CoachingTab profile={userProfile} onSwitchTab={setActiveTab} />}
      {activeTab === 'formation' && <FormationTab profile={userProfile} onSwitchTab={setActiveTab} />}
      {activeTab === 'rpa' && <RPADashboard profile={userProfile} onRefresh={triggerRefresh} onSwitchTab={setActiveTab} />}
      {activeTab === 'suggestions' && <SuggestionsTab profile={userProfile} />}
      {activeTab === 'upgrade' && <UpgradeTab />}
      {/* Fix: Render LunaChatPage tab content */}
      {activeTab === 'luna_chat' && <LunaChatPage profile={userProfile} onUpgrade={() => setActiveTab('flash_offer')} />}
      {activeTab === 'admin' && isAdmin && <AdminPanel adminProfile={userProfile} lastUpdateSignal={lastUpdateSignal} onRefresh={triggerRefresh} />}
      {/* Fix: Added missing onOpenLuna prop to Chatbot and excluded it from being shown on luna_chat tab */}
      {activeTab !== 'private_chat' && activeTab !== 'flash_offer' && activeTab !== 'luna_chat' && (
        <Chatbot profile={userProfile} onOpenLuna={() => setActiveTab('luna_chat')} />
      )}
    </DashboardLayout>
  );
};

export default App;
