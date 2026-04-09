import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShoppingBag as Bag, 
  Globe as Web, 
  Clock as Time, 
  History as Hist, 
  XCircle, 
  CheckCircle as Check, 
  Copy as CopyIcon, 
  Search,
  CheckCircle2,
  TrendingUp,
  X,
  Crown,
  Sparkles,
  Edit3,
  Trash2,
  Zap,
  ArrowUpRight,
  Share2,
  BookOpen,
  RefreshCw,
  Coins,
  GraduationCap,
  Plus,
  Loader2,
  Calendar,
  MousePointer2 as Cursor,
  Activity,
  AlertCircle,
  Layers,
  Check as CheckIcon,
  X as XIcon,
  User,
  Image as ImageIcon,
  Save,
  ExternalLink,
  ArrowLeft,
  Shield,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../services/supabase.ts';
import { Product, Commission, UserProfile, ProductStat, TabId } from '../types.ts';
import { GoldBorderCard, PrimaryButton, SectionTitle, GoldText } from './UI.tsx';
import { CurrencyDisplay } from './ui/CurrencyDisplay.tsx';

import { SlideNotificationAffiliation } from './features/SlideNotificationAffiliation.tsx';

interface AffiliationSystemProps {
  profile: UserProfile | null;
  isAdminView?: boolean;
  lastUpdateSignal?: number;
  showValidations?: boolean;
  showCatalog?: boolean;
  onSwitchTab?: (tab: TabId) => void;
}

export const AffiliationSystem: React.FC<AffiliationSystemProps> = ({ 
  profile, 
  isAdminView = false, 
  lastUpdateSignal,
  showValidations = true,
  showCatalog = true,
  onSwitchTab
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isCatalogVisible, setIsCatalogVisible] = useState(false);
  const productsRef = useRef<HTMLElement>(null);

  const scrollToProducts = () => {
    setIsCatalogVisible(true);
    // Use a small timeout to allow the DOM to update before scrolling
    setTimeout(() => {
      if (productsRef.current) {
        productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // États Admin Produit
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: 0,
    commission_amount: 0,
    image_url: '',
    final_link: ''
  });

  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      setError(null);
      if (retryCount === 0) setLoading(true);

      const { data: prods, error: prodsError } = await supabase.from('products').select('*');
      
      if (prodsError) throw prodsError;
      
      setProducts(prods || []);

      if (isAdminView) {
        const { data: comms, error: commsError } = await supabase
          .from('commissions')
          .select(`*, products(*), users:user_id(full_name, email)`)
          .order('created_at', { ascending: false });
        if (commsError) throw commsError;
        setCommissions(comms || []);
      } else if (profile?.id) {
        const [commsRes, statsRes] = await Promise.all([
          supabase.from('commissions').select('*, products(*)').eq('user_id', profile.id).order('created_at', { ascending: false }),
          supabase.from('product_stats').select('product_id, clicks').eq('user_id', profile.id)
        ]);
        
        if (commsRes.error) throw commsRes.error;
        if (statsRes.error) throw statsRes.error;
        
        setCommissions(commsRes.data || []);
        setProductStats(statsRes.data || []);
      }
    } catch (e: any) { 
      console.error("Affiliation Fetch Error:", e);
      if (retryCount < 3 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        const delay = 1000 * (retryCount + 1);
        console.log(`Retrying affiliation fetch in ${delay}ms...`);
        setTimeout(() => fetchData(retryCount + 1), delay);
        return;
      }
      setError("Erreur de connexion. Veuillez vérifier votre réseau.");
      setProducts([]);
    } finally { 
      setLoading(false); 
    }
  }, [isAdminView, profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, lastUpdateSignal]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { error } = await supabase.from('commissions').update({ status }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (e: any) { alert("Erreur validation : " + e.message); } finally { setProcessingId(null); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productFormData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productFormData]);
        if (error) throw error;
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ name: '', description: '', price: 0, commission_amount: 0, image_url: '', final_link: '' });
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setIsSavingProduct(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit du catalogue ?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      commission_amount: product.commission_amount || 0,
      image_url: product.image_url || '',
      final_link: product.final_link || ''
    });
    setShowProductForm(true);
  };

  // --- RENDU ADMIN : GESTION DES VENTES ---
  if (isAdminView && showValidations) {
    const pending = commissions.filter(c => c.status === 'pending');
    const history = commissions.filter(c => c.status !== 'pending');
    
    const totalVolume = commissions.filter(c => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0);

    return (
      <div className="space-y-10 animate-fade-in">
        {/* Résumé des Ventes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">Volume Total</p>
            <CurrencyDisplay 
              amount={totalVolume} 
              className="text-xl font-black text-yellow-500 font-mono"
              secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
            />
          </div>
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">Ventes Approuvées</p>
            <p className="text-xl font-black text-white font-mono">{commissions.filter(c => c.status === 'approved').length}</p>
          </div>
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">En attente</p>
            <p className="text-xl font-black text-orange-500 font-mono">{pending.length}</p>
          </div>
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">Taux de Validation</p>
            <p className="text-xl font-black text-emerald-500 font-mono">
              {commissions.length > 0 ? Math.round((commissions.filter(c => c.status === 'approved').length / commissions.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Ventes en attente */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 px-2"><AlertCircle size={20} /> Ventes à valider</h3>
          
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden px-2">
            {pending.length === 0 ? (
              <div className="p-10 text-center opacity-30 text-[10px] uppercase border border-dashed border-white/10 rounded-2xl">Aucune vente en attente</div>
            ) : (
              pending.map(c => (
                <div key={c.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black uppercase text-sm">{(c as any).users?.full_name || 'Inconnu'}</div>
                      <div className="text-[10px] font-bold text-neutral-300 mt-1">{c.products?.name}</div>
                    </div>
                    <div className="font-mono text-yellow-500 text-xs font-black">
                      <CurrencyDisplay 
                        amount={c.amount} 
                        className="font-mono text-yellow-500 text-xs font-black"
                        secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[8px] text-neutral-600 font-mono">{new Date(c.created_at).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(c.id, 'rejected')} className="p-2.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl"><XIcon size={16}/></button>
                      <button onClick={() => handleUpdateStatus(c.id, 'approved')} className="p-2.5 bg-emerald-600 rounded-xl"><CheckIcon size={16}/></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="p-6">Date</th>
                    <th className="p-6">Ambassadeur</th>
                    <th className="p-6">Produit</th>
                    <th className="p-6">Commission</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {pending.length === 0 ? (<tr><td colSpan={5} className="p-20 text-center opacity-30 text-[10px] uppercase">Aucune vente en attente</td></tr>) : 
                    pending.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 text-neutral-500 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="p-6"><div className="font-black uppercase">{(c as any).users?.full_name || 'Inconnu'}</div></td>
                        <td className="p-6 font-bold text-neutral-300">{c.products?.name}</td>
                        <td className="p-6 font-mono text-yellow-500">
                          <CurrencyDisplay 
                            amount={c.amount} 
                            className="font-mono text-yellow-500"
                            secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                          />
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdateStatus(c.id, 'rejected')} className="p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XIcon size={16}/></button>
                            <button onClick={() => handleUpdateStatus(c.id, 'approved')} className="p-2 bg-emerald-600 rounded-xl hover:scale-105 transition-all"><CheckIcon size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
             </table>
          </div>
        </div>

        {/* Historique des Ventes */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-neutral-500 flex items-center gap-3 px-2"><Hist size={20} /> Historique des ventes</h3>
          
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="p-6">Date</th>
                    <th className="p-6">Ambassadeur</th>
                    <th className="p-6">Produit</th>
                    <th className="p-6">Montant</th>
                    <th className="p-6 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {history.length === 0 ? (<tr><td colSpan={5} className="p-20 text-center opacity-30 text-[10px] uppercase">Aucun historique</td></tr>) : 
                    history.slice(0, 20).map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-6 text-neutral-600 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="p-6">
                          <div className="font-bold uppercase text-neutral-400">{(c as any).users?.full_name || 'Inconnu'}</div>
                        </td>
                        <td className="p-6 text-neutral-500">{c.products?.name}</td>
                        <td className="p-6 font-mono text-neutral-400">
                          <CurrencyDisplay 
                            amount={c.amount} 
                            className="font-mono text-neutral-400"
                            secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                          />
                        </td>
                        <td className="p-6 text-right">
                          <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
                            c.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {c.status === 'approved' ? 'Validé' : 'Refusé'}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
             </table>
             {history.length > 20 && (
               <div className="p-4 text-center border-t border-white/5">
                 <p className="text-[8px] font-black uppercase text-neutral-600">Affichage des 20 dernières ventes</p>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU ADMIN : GESTION DU CATALOGUE (CRUD) ---
  if (isAdminView && showCatalog) {
    return (
      <div className="space-y-8 animate-fade-in">
        {showProductForm && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowProductForm(false)}></div>
            <GoldBorderCard className="relative w-full max-w-xl bg-[#080808] border-white/10 p-6 md:p-8 shadow-2xl animate-slide-down">
               <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-black uppercase">{editingProduct ? 'Modifier' : 'Créer'} <GoldText>Produit</GoldText></h3>
                  <button onClick={() => setShowProductForm(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24}/></button>
               </div>
               <form onSubmit={handleSaveProduct} className="space-y-4">
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Nom du produit" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} />
                  <textarea required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white h-24" placeholder="Description courte" value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="number" className="bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Prix Public" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: parseInt(e.target.value)})} />
                    <input required type="number" className="bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Com. Ambassadeur" value={productFormData.commission_amount} onChange={e => setProductFormData({...productFormData, commission_amount: parseInt(e.target.value)})} />
                  </div>
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="URL Image" value={productFormData.image_url} onChange={e => setProductFormData({...productFormData, image_url: e.target.value})} />
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Lien de livraison final" value={productFormData.final_link} onChange={e => setProductFormData({...productFormData, final_link: e.target.value})} />
                  <PrimaryButton type="submit" fullWidth isLoading={isSavingProduct}>Enregistrer le produit</PrimaryButton>
               </form>
            </GoldBorderCard>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
           <h3 className="text-xl font-black uppercase text-yellow-500 flex items-center gap-3"><Bag /> Gestion Catalogue</h3>
           <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-yellow-600 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 shadow-xl transition-all"><Plus size={16}/> Ajouter un service</button>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden px-2">
          {products.length === 0 ? (
            <div className="p-10 text-center opacity-30 text-[10px] uppercase">Catalogue vide</div>
          ) : (
            products.map(p => (
              <div key={p.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 overflow-hidden flex-shrink-0">
                    <img src={p.image_url} className="w-full h-full object-cover opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black uppercase text-white text-sm truncate">{p.name}</div>
                    <div className="flex gap-3 mt-1">
                      <CurrencyDisplay 
                        amount={p.price} 
                        className="text-[10px] font-mono text-neutral-400"
                        secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                      />
                      <CurrencyDisplay 
                        amount={p.commission_amount} 
                        className="text-[10px] font-mono text-yellow-500 font-bold"
                        secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                  <button onClick={() => openEditProduct(p)} className="p-2.5 bg-white/5 text-blue-400 rounded-xl border border-white/10"><Edit3 size={16}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2.5 bg-white/5 text-red-500 rounded-xl border border-white/10"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
           <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                <tr><th className="p-8">Service / Produit</th><th className="p-8">Prix</th><th className="p-8">Com.</th><th className="p-8 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {products.length === 0 ? (<tr><td colSpan={4} className="p-20 text-center opacity-30 text-[10px] uppercase">Catalogue vide</td></tr>) : 
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="p-8"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/5 overflow-hidden"><img src={p.image_url} className="w-full h-full object-cover opacity-50" /></div><span className="font-black uppercase text-white">{p.name}</span></div></td>
                      <td className="p-8 font-mono text-neutral-400">
                        <CurrencyDisplay 
                          amount={p.price} 
                          className="font-mono text-neutral-400"
                          secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                        />
                      </td>
                      <td className="p-8 font-mono text-yellow-500 font-bold">
                        <CurrencyDisplay 
                          amount={p.commission_amount} 
                          className="font-mono text-yellow-500 font-bold"
                          secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                        />
                      </td>
                      <td className="p-8 text-right">
                         <div className="flex justify-end gap-3">
                            <button onClick={() => openEditProduct(p)} className="p-3 bg-white/5 text-blue-400 rounded-xl border border-white/10 hover:bg-blue-600/10"><Edit3 size={16}/></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-3 bg-white/5 text-red-500 rounded-xl border border-white/10 hover:bg-red-600/10"><Trash2 size={16}/></button>
                         </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
           </table>
        </div>
      </div>
    );
  }

  // --- RENDU AMBASSADEUR : ESPACE UNIQUE & MINIMALISTE ---
  return (
    <div className="max-w-4xl mx-auto space-y-20 animate-fade-in pb-32 px-4">
      <SlideNotificationAffiliation activeTab="affiliation" onUpgrade={() => onSwitchTab?.('flash_offer')} />
      
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center space-y-4">
          <p className="text-xs font-black uppercase text-red-500">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 1. MES GAINS (Focus Central) */}
      <section className="text-center pt-12 space-y-6 overflow-hidden">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-yellow-600/5 border border-yellow-600/10 rounded-full">
          <div className="w-1 h-1 rounded-full bg-yellow-600 animate-pulse"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-500">Trésorerie Affiliation</span>
        </div>
        
        <div id="affiliation-balance-zone" className="space-y-4 py-4">
          <CurrencyDisplay 
            amount={commissions.filter(c => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0)} 
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white font-mono tracking-tighter leading-tight break-words"
            secondaryClassName="text-lg md:text-xl text-yellow-600 font-black uppercase mt-2"
            vertical={true}
          />
          <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">Gains Encaissés</p>
        </div>
      </section>

      {/* 2. ANALYSE (Minimaliste & Discret) */}
      <section className="space-y-12">
        <div className="grid grid-cols-3 gap-8 py-10 border-y border-white/5 max-w-2xl mx-auto">
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-white font-mono">{productStats.reduce((acc, s) => acc + (Number(s.clicks) || 0), 0)}</p>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Clics</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-white font-mono">{commissions.filter(c => c.status === 'approved').length}</p>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Ventes</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-white font-mono">
              {(productStats.reduce((acc, s) => acc + (Number(s.clicks) || 0), 0) > 0 
                ? (commissions.filter(c => c.status === 'approved').length / productStats.reduce((acc, s) => acc + (Number(s.clicks) || 0), 0) * 100).toFixed(1) 
                : "0")}%
            </p>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Conv.</p>
          </div>
        </div>

        <div className="flex justify-center w-full px-2">
          <button 
            id="btn-see-products"
            onClick={(e) => {
              e.stopPropagation();
              scrollToProducts();
            }}
            className="group relative w-full md:w-auto px-10 py-7 bg-white text-black rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-[0_40px_80px_rgba(255,255,255,0.15)] hover:bg-yellow-500 hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-4 active:scale-[0.95] overflow-hidden cursor-pointer"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
            
            <span className="relative z-10 pointer-events-none">Voir les produits à promouvoir</span>
            <ChevronDown size={20} className="relative z-10 group-hover:translate-y-2 transition-transform duration-500 pointer-events-none" />
          </button>
        </div>
      </section>

      {/* 3. VOIR LES PRODUITS (Catalogue Actionnable) */}
      {isCatalogVisible && (
        <section ref={productsRef} className="space-y-10 scroll-mt-20 min-h-[400px] animate-fade-in">
          <div className="flex items-center gap-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white whitespace-nowrap">Catalogue Élite</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {loading && products.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Chargement du catalogue...</p>
              </div>
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                  clicks={productStats.find(s => s.product_id === product.id)?.clicks || 0} 
                  referralCode={profile?.referral_code} 
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Aucun produit disponible pour le moment</p>
                <button 
                  onClick={() => fetchData()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Actualiser le catalogue
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. HISTORIQUE (Optionnel / Déroulant pour la clarté) */}
      {commissions.length > 0 && (
        <section className="pt-10 border-t border-white/5 max-w-2xl mx-auto">
          <details className="group">
            <summary className="list-none cursor-pointer flex items-center justify-between text-neutral-700 hover:text-neutral-400 transition-colors py-4">
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Historique des ventes</span>
              <ChevronDown size={14} className="group-open:rotate-180 transition-transform duration-500" />
            </summary>
            <div className="mt-8 space-y-3 animate-fade-in">
              {commissions.map(c => (
                <div key={c.id} className="p-5 bg-neutral-900/20 border border-white/5 rounded-3xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${c.status === 'approved' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-tight">{c.products?.name || 'Service MZ+'}</p>
                      <p className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <CurrencyDisplay 
                    amount={c.amount} 
                    className="text-xs font-black text-yellow-500 font-mono"
                    secondaryClassName="text-[8px] text-neutral-600 font-bold opacity-60"
                    vertical={true}
                  />
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      <footer className="pt-20 opacity-10 text-center">
        <Shield size={24} className="mx-auto text-neutral-500" />
      </footer>
    </div>
  );
};

const ProductCard = ({ product, clicks, referralCode, index }: any) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?ref=${referralCode}&prod=${product.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    
    // Dispatch a custom event for the guide to detect the copy action
    window.dispatchEvent(new CustomEvent('affiliation_link_copied', { detail: { productId: product.id } }));
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-yellow-600/40 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col h-full">
      {/* Image Section - More Immersive */}
      <div className="h-32 md:h-56 relative overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-60 group-hover:opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        
        {/* Commission Badge - Floating & Elegant */}
        <div className="absolute top-3 right-3 md:top-6 md:right-6 px-2 md:px-5 py-1 md:py-2.5 bg-yellow-600 text-black rounded-lg md:rounded-2xl text-[8px] md:text-[11px] font-black uppercase shadow-2xl shadow-yellow-600/20 flex items-center gap-1 md:gap-2">
          <Zap size={10} className="md:w-3.5 md:h-3.5" fill="currentColor" />
          <CurrencyDisplay 
            amount={product.commission_amount} 
            className="text-[8px] md:text-[11px] font-black uppercase"
            secondaryClassName="text-[6px] md:text-[8px] text-black/60 font-bold"
            vertical={true}
          />
        </div>
      </div>

      {/* Content Section - Minimalist */}
      <div className="p-4 md:p-8 flex flex-col flex-1">
        <div className="mb-3 md:mb-6">
          <h4 className="text-xs md:text-xl font-black uppercase tracking-tight leading-none mb-1 md:mb-3 group-hover:text-yellow-500 transition-colors line-clamp-1">{product.name}</h4>
          <p className="text-[7px] md:text-[11px] line-clamp-1 md:line-clamp-2 text-neutral-500 font-bold uppercase tracking-widest leading-relaxed opacity-60">{product.description}</p>
        </div>

        {/* Stats Row - Discrete */}
        <div className="flex items-center gap-3 md:gap-6 mb-4 md:mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-1 md:gap-2">
             <Cursor size={10} className="md:w-3.5 md:h-3.5 text-neutral-500" />
             <span className="text-[8px] md:text-[10px] font-black font-mono">{clicks}</span>
           </div>
           <div className="flex items-center gap-1 md:gap-2">
             <Web size={10} className="md:w-3.5 md:h-3.5 text-yellow-600/50" />
             <CurrencyDisplay 
               amount={product.price} 
               className="text-[8px] md:text-[10px] font-black font-mono"
               secondaryClassName="text-[6px] md:text-[8px] text-neutral-600 font-bold"
               vertical={true}
             />
           </div>
        </div>

        {/* Action Button - The Core Action */}
        <button 
          id={index === 0 ? "btn-copy-link" : undefined}
          onClick={handleCopy}
          className={`w-full py-3 md:py-6 rounded-xl md:rounded-[1.5rem] font-black uppercase text-[7px] md:text-[11px] tracking-[0.15em] md:tracking-[0.25em] transition-all flex items-center justify-center gap-2 md:gap-4 shadow-2xl active:scale-95 ${
            copied 
              ? 'bg-emerald-600 text-white shadow-emerald-900/20' 
              : 'bg-white text-black hover:bg-yellow-500 shadow-white/5'
          }`}
        >
          {copied ? (
            <><CheckIcon size={12} className="md:w-5 md:h-5" strokeWidth={3} /> Copié</>
          ) : (
            <><Share2 size={12} className="md:w-5 md:h-5" /> Copier le lien</>
          )}
        </button>
        
        <div className="mt-4 hidden md:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <div className="h-px w-8 bg-yellow-600/20"></div>
          <p className="text-[8px] text-yellow-600/60 font-black uppercase tracking-[0.4em]">
            50% Commission Cash
          </p>
          <div className="h-px w-8 bg-yellow-600/20"></div>
        </div>
      </div>
    </div>
  );
};
