
import React, { useState, useEffect } from 'react';
import { Send, Target, User, Users, Bell, Zap, Info, Gift, AlertTriangle, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard, PrimaryButton, GoldText } from '../../UI.tsx';

export const PushAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    icon_type: 'info',
    target_type: 'all',
    target_value: ''
  });

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('admin_push_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setHistory(data || []);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Recherche d'utilisateurs
  useEffect(() => {
    const search = async () => {
      if (userSearchTerm.length < 2) {
        setUserResults([]);
        return;
      }
      setIsSearchingUsers(true);
      const { data } = await supabase
        .from('users')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${userSearchTerm}%,email.ilike.%${userSearchTerm}%`)
        .limit(5);
      setUserResults(data || []);
      setIsSearchingUsers(false);
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.target_type === 'user' && !selectedUser) {
      alert("Veuillez sélectionner un utilisateur.");
      return;
    }

    setIsSending(true);
    try {
      const finalData = {
        ...formData,
        target_value: formData.target_type === 'user' ? selectedUser.id : formData.target_value
      };

      const { error } = await supabase.from('admin_push_notifications').insert([finalData]);
      if (error) throw error;

      alert("Notification Push envoyée ! Elle apparaîtra instantanément chez les utilisateurs ciblés.");
      setFormData({ title: '', body: '', icon_type: 'info', target_type: 'all', target_value: '' });
      setSelectedUser(null);
      fetchHistory();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 px-2 md:px-0">
        {/* FORMULAIRE D'ENVOI */}
        <div className="w-full lg:flex-[2] space-y-6">
          <GoldBorderCard className="p-6 md:p-8 border-yellow-600/20 bg-black/40 mx-2 md:mx-0">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-6 md:mb-8">
              <Zap className="text-yellow-500" /> Envoyer un <GoldText>Push Élite</GoldText>
            </h3>

            <form onSubmit={handleSend} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Titre de l'alerte</label>
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-yellow-600 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Nouveau Bonus Disponible !" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Type d'icône</label>
                  <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-yellow-600 appearance-none" value={formData.icon_type} onChange={e => setFormData({...formData, icon_type: e.target.value})}>
                    <option value="info">Information (Bleu)</option>
                    <option value="money">Finance / Gain (Or)</option>
                    <option value="gift">Cadeau / Bonus (Vert)</option>
                    <option value="alert">Urgent / Alerte (Rouge)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Message court (Push)</label>
                <textarea required rows={2} className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white resize-none outline-none focus:border-yellow-600 transition-all shadow-inner" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} placeholder="Soyez bref et impactant (max 120 car.)" maxLength={120} />
              </div>

              <div className="p-5 md:p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6">
                <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Audience Cible</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, target_type: 'all', target_value: ''})} className={`flex items-center justify-center gap-2 p-4 sm:p-3 rounded-xl border transition-all text-[9px] font-black uppercase ${formData.target_type === 'all' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-black border-white/5 text-neutral-600'}`}><Users size={14}/> Tous</button>
                  <button type="button" onClick={() => setFormData({...formData, target_type: 'level', target_value: 'standard'})} className={`flex items-center justify-center gap-2 p-4 sm:p-3 rounded-xl border transition-all text-[9px] font-black uppercase ${formData.target_type === 'level' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-black border-white/5 text-neutral-600'}`}><Target size={14}/> Par Niveau</button>
                  <button type="button" onClick={() => setFormData({...formData, target_type: 'user', target_value: ''})} className={`flex items-center justify-center gap-2 p-4 sm:p-3 rounded-xl border transition-all text-[9px] font-black uppercase ${formData.target_type === 'user' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-black border-white/5 text-neutral-600'}`}><User size={14}/> Précis</button>
                </div>

                {formData.target_type === 'level' && (
                  <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" value={formData.target_value} onChange={e => setFormData({...formData, target_value: e.target.value})}>
                    <option value="standard">Membres Standards</option>
                    <option value="niveau_mz_plus">Membres Niveau MZ+</option>
                  </select>
                )}

                {formData.target_type === 'user' && (
                  <div className="relative">
                    {selectedUser ? (
                      <div className="flex items-center justify-between p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl">
                        <span className="text-[10px] font-black text-white uppercase">{selectedUser.full_name}</span>
                        <button onClick={() => setSelectedUser(null)} className="text-neutral-500 hover:text-white text-[10px] font-bold uppercase">Changer</button>
                      </div>
                    ) : (
                      <>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                        <input className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 text-xs text-white outline-none focus:border-yellow-600" placeholder="Nom ou Email..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} />
                        {userResults.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-[#0c0c0c] border border-white/10 rounded-xl mt-2 overflow-hidden shadow-2xl z-50">
                            {userResults.map(u => (
                              <button key={u.id} type="button" onClick={() => setSelectedUser(u)} className="w-full p-4 text-left hover:bg-yellow-600/10 border-b border-white/5 last:border-0">
                                <p className="text-[10px] font-black text-white uppercase">{u.full_name}</p>
                                <p className="text-[8px] text-neutral-600 font-mono">{u.email}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <PrimaryButton type="submit" fullWidth isLoading={isSending} size="lg">Diffuser la notification</PrimaryButton>
            </form>
          </GoldBorderCard>
        </div>

        {/* HISTORIQUE RAPIDE */}
        <div className="w-full lg:flex-1 space-y-6 px-2 md:px-0">
          <div className="flex items-center gap-3 px-2">
             <Bell size={18} className="text-neutral-600" />
             <h4 className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em]">Derniers Envois</h4>
          </div>
          <div className="space-y-3">
             {history.length === 0 ? (
               <div className="p-8 text-center border border-dashed border-white/5 rounded-3xl opacity-20">
                 <p className="text-[9px] font-black uppercase">Aucun historique</p>
               </div>
             ) : (
               history.map(item => (
                 <div key={item.id} className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-yellow-600/20 transition-all">
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-white uppercase truncate">{item.title}</p>
                       <p className="text-[8px] text-neutral-600 mt-1 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="px-2 py-1 bg-white/5 rounded text-[7px] font-black text-neutral-500 uppercase">
                      {item.target_type === 'all' ? 'Tous' : 'Ciblé'}
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
