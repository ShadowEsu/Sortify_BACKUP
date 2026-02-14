
import React, { useState, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { soundService } from '../services/soundService';
import { UserStats, CharacterGear } from '../types';
import { Zap, ShieldCheck, Rocket, Loader2, ChevronRight, Target, Recycle, Leaf, Trash2, Fingerprint, Activity, Terminal } from 'lucide-react';

interface AuthViewProps {
  onAuth: (user: UserStats) => void;
}

const TACTICAL_PERKS = [
  { id: 'RECYCLE_SPECIALIST', label: 'RECYCLE_SPECIALIST', desc: 'PERMANENT 2X XP ON ALL RECYCLABLE MATERIALS.', icon: Recycle, color: '#60a5fa' },
  { id: 'COMPOST_COMMANDER', label: 'COMPOST_COMMANDER', desc: 'PERMANENT 2X XP ON ALL ORGANIC BIO-WASTE.', icon: Leaf, color: '#10b981' },
  { id: 'WASTE_WARDEN', label: 'WASTE_WARDEN', desc: 'PERMANENT 2X XP ON ALL NON-SORTABLE WASTE.', icon: Trash2, color: '#94a3b8' },
] as const;

const AuthView: React.FC<AuthViewProps> = ({ onAuth }) => {
  const [step, setStep] = useState<'info' | 'perks' | 'welcome'>('info');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPerk, setSelectedPerk] = useState<typeof TACTICAL_PERKS[number]['id']>('RECYCLE_SPECIALIST');
  const [tempUser, setTempUser] = useState<UserStats | null>(null);

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
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
      
      setTempUser(user);
      setStep('welcome');
      soundService.playSuccess();
    } catch (err: any) {
      setError(err.message);
      setStep('info');
    } finally {
      setLoading(false);
    }
  };

  const finalizeInduction = () => {
    soundService.playEnterGrid();
    if (tempUser) onAuth(tempUser);
  };

  const generateOpId = (uid: string) => {
    return `ID-${uid.slice(-6).toUpperCase()}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-950 text-white font-gaming relative overflow-hidden">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 bg-emerald-500 transition-all duration-1000`} />

      {step === 'info' && (
        <div className="w-full max-sm relative z-10 animate-in fade-in duration-500">
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
                <Zap size={48} className="text-emerald-400" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase">SORT<span className="text-emerald-500">IFY</span></h1>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.4em]">Global Eco-Logistics Interface</p>
          </div>

          <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
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
                className="w-full font-black py-5 bg-emerald-500 text-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                disabled={!isEmailValid || loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span>{isLogin ? 'INITIALIZE HUD' : 'PROCEED TO SPECIALIZATION'}</span>}
                {!loading && <ChevronRight size={18} />}
              </button>
            </form>

            <button onClick={() => {setIsLogin(!isLogin); setError(''); soundService.playClick();}} className="w-full mt-8 text-[8px] font-black text-neutral-500 uppercase tracking-widest hover:text-emerald-400 text-center">
              {isLogin ? "NEW OPERATIVE? REQUEST ACCESS" : "ALREADY ENLISTED? RETRIEVE KEY"}
            </button>
          </div>
        </div>
      )}

      {step === 'perks' && (
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
                    key={perk.id} onClick={() => {setSelectedPerk(perk.id); soundService.playClick();}}
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
                 <button onClick={() => {setStep('info'); soundService.playClick();}} className="flex-1 py-5 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-neutral-500">BACK</button>
                 <button onClick={handleAuth} className="flex-[2] py-5 rounded-2xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">START DEPLOYMENT</button>
              </div>
           </div>
        </div>
      )}

      {step === 'welcome' && tempUser && (
        <div className="w-full max-w-md relative z-10 animate-in zoom-in duration-500">
          <div className="glass rounded-[4rem] p-12 border border-white/10 text-center relative overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-[shimmer_2s_infinite]" />
            
            <div className="mb-10 relative">
               <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
               <div className="relative inline-flex p-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 mb-6">
                  <ShieldCheck size={48} className="animate-[pulse_2s_infinite]" />
               </div>
               <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">ACCESS_GRANTED</h2>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">WELCOME, OPERATIVE</h1>
               <div className="flex items-center justify-center gap-2">
                  <Activity size={14} className="text-neutral-500" />
                  <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.3em]">Neural Connection Stable</p>
               </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-3xl p-8 mb-10 text-left space-y-4">
               <div>
                  <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">DUMMY_TAG</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tight">{tempUser.displayName}</p>
               </div>
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">OPERATIVE_ID</p>
                    <p className="text-sm font-black text-emerald-400 font-mono tracking-widest">{generateOpId(tempUser.uid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">AGENT_CLASS</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">
                      [AGENT: {tempUser.gear.specialization.split('_')[0]}]
                    </p>
                  </div>
               </div>
            </div>

            <div className="relative h-12 flex items-center justify-center mb-10">
               <div className="absolute inset-0 border border-emerald-500/10 rounded-xl" />
               <div className="absolute left-0 h-full w-[2px] bg-emerald-500 animate-[loading-bar_1.5s_ease-in-out_infinite]" />
               <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.5em]">BIOMETRIC_AUTH_PASS</p>
            </div>

            <button 
              onClick={finalizeInduction}
              className="w-full py-6 bg-emerald-500 text-black rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Terminal size={18} />
              ENTER THE GRID
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes loading-bar {
          0% { left: 0%; width: 5px; }
          50% { left: 45%; width: 40px; }
          100% { left: 98%; width: 5px; }
        }
      `}</style>
    </div>
  );
};

export default AuthView;
