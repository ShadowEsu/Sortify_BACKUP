
import React, { useState, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { UserStats, CharacterGear } from '../types';
import { Zap, ShieldCheck, Rocket, Loader2, ChevronRight, Target, Recycle, Leaf, Trash2 } from 'lucide-react';

interface AuthViewProps {
  onAuth: (user: UserStats) => void;
}

const TACTICAL_PERKS = [
  { id: 'RECYCLE_SPECIALIST', label: 'RECYCLE_SPECIALIST', desc: 'PERMANENT 2X XP ON ALL RECYCLABLE MATERIALS.', icon: Recycle, color: '#60a5fa' },
  { id: 'COMPOST_COMMANDER', label: 'COMPOST_COMMANDER', desc: 'PERMANENT 2X XP ON ALL ORGANIC BIO-WASTE.', icon: Leaf, color: '#10b981' },
  { id: 'WASTE_WARDEN', label: 'WASTE_WARDEN', desc: 'PERMANENT 2X XP ON ALL NON-SORTABLE WASTE.', icon: Trash2, color: '#94a3b8' },
] as const;

const AuthView: React.FC<AuthViewProps> = ({ onAuth }) => {
  const [step, setStep] = useState<'info' | 'perks'>('info');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPerk, setSelectedPerk] = useState<typeof TACTICAL_PERKS[number]['id']>('RECYCLE_SPECIALIST');

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;
    if (isLogin) {
      handleAuth();
    } else {
      if (!username.trim()) {
        setError("CODENAME REQUIRED FOR ENLISTMENT.");
        return;
      }
      setStep('perks');
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const gear: CharacterGear = {
        specialization: selectedPerk,
        outfit: 'POLYMER-PLATING',
        accessory: 'SOLAR-VISOR',
        baseColor: TACTICAL_PERKS.find(p => p.id === selectedPerk)?.color || '#10b981'
      };
      
      const user = isLogin 
        ? await dbService.login(email.trim())
        : await dbService.signup(username.trim(), email.trim(), gear);
      onAuth(user);
    } catch (err: any) {
      setError(err.message);
      setStep('info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-950 text-white font-gaming relative overflow-hidden">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 bg-emerald-500`} />

      {step === 'info' ? (
        <div className="w-full max-w-sm relative z-10 animate-in fade-in duration-500">
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
                <Zap size={48} className="text-emerald-400" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">SORT<span className="text-emerald-500">IFY</span></h1>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.4em]">Global Eco-Logistics Interface</p>
          </div>

          <div className="glass rounded-[2.5rem] p-10 border border-white/5">
            <h2 className="text-sm font-black flex items-center gap-3 uppercase tracking-widest text-emerald-400 mb-8">
                {isLogin ? <ShieldCheck size={18} /> : <Rocket size={18} />}
                {isLogin ? 'RESUME SESSION' : 'ENLIST NOW'}
            </h2>

            <form onSubmit={handleInitialSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                    <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-2 block ml-1">CODENAME / CALLSIGN</label>
                    <input 
                        type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                        placeholder="E.G. GREEN_SHADOW"
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs uppercase"
                    />
                </div>
              )}
              <div>
                <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-2 block ml-1">OPERATIVE EMAIL</label>
                <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="OPERATIVE@ECO.COM"
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs lowercase"
                />
              </div>

              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[9px] font-black text-center uppercase tracking-widest">{error}</div>}

              <button 
                className="w-full font-black py-5 bg-emerald-500 text-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95 transition-all"
                disabled={!isEmailValid || loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span>{isLogin ? 'INITIALIZE HUD' : 'PROCEED TO SPECIALIZATION'}</span>}
                {!loading && <ChevronRight size={18} />}
              </button>
            </form>

            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-[8px] font-black text-neutral-500 uppercase tracking-widest hover:text-emerald-400 text-center">
              {isLogin ? "NEW OPERATIVE? REQUEST ACCESS" : "ALREADY ENLISTED? RETRIEVE KEY"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md relative z-10 animate-in slide-in-from-right-10 duration-500">
           <div className="text-center mb-10">
              <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-4">
                 <Target size={32} />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">PERK_SELECTION</h2>
              <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.4em] mt-1">Choose Permanent XP Multiplier</p>
           </div>

           <div className="space-y-4 glass rounded-[3rem] p-8 border border-white/5">
              {TACTICAL_PERKS.map(perk => (
                 <button 
                    key={perk.id} onClick={() => setSelectedPerk(perk.id)}
                    className={`w-full p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${selectedPerk === perk.id ? 'bg-white/10 border-white/40 scale-[1.02] shadow-2xl' : 'bg-transparent border-white/5 opacity-50'}`}
                 >
                    <div className="flex items-center gap-5 relative z-10">
                       <div className={`p-4 rounded-2xl bg-black/40 border transition-colors ${selectedPerk === perk.id ? 'border-white/20' : 'border-white/5'}`}>
                          <perk.icon size={24} style={{ color: perk.color }} />
                       </div>
                       <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{perk.label}</h4>
                          <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">{perk.desc}</p>
                       </div>
                    </div>
                 </button>
              ))}

              <div className="flex gap-4 mt-8">
                 <button onClick={() => setStep('info')} className="flex-1 py-5 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-neutral-500">BACK</button>
                 <button onClick={handleAuth} className="flex-[2] py-5 rounded-2xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">START DEPLOYMENT</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AuthView;
