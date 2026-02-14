
import React, { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Zap, Trophy, Flame, CheckCircle2, Clock, Calendar, Palette, Shield, Layers, Box, Fingerprint, RefreshCcw } from 'lucide-react';
import { dbService } from '../services/dbService';
import { soundService } from '../services/soundService';
import { UserStats, Mission, CharacterGear } from '../types';

const AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alpha',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bravo',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Delta',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Echo',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Foxtrot',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Golf',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hotel',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=India',
];

const ProfileView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [user, setUser] = useState<UserStats | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  useEffect(() => {
    dbService.getCurrentSessionUser().then(u => {
      setUser(u);
      if (u) setSelectedAvatar(u.photoURL);
    });
  }, []);

  const saveIdentity = async () => {
    if (!selectedAvatar) return;
    soundService.playSuccess();
    const updated = await dbService.updateUser({ photoURL: selectedAvatar });
    setUser(updated);
    setIsCalibrating(false);
  };

  const startCalibration = () => {
    soundService.playClick();
    setIsCalibrating(true);
  };

  if (!user) return <div className="h-screen flex items-center justify-center text-emerald-500 font-black">RETRIEVING_DOSSIER...</div>;

  const dailies = user.missions.filter(m => !m.isWeekly);
  const weeklies = user.missions.filter(m => m.isWeekly);

  return (
    <div className="min-h-screen bg-neutral-950 p-8 pb-32 font-gaming">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" /> OPERATIVE_ID
          </h2>
          <button onClick={() => {soundService.playClick(); onLogout();}} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
            <LogOut size={20} />
          </button>
        </div>

        {/* CHARACTER DISPLAY SECTION */}
        <div className="relative glass rounded-[3rem] p-8 border border-white/5 mb-10 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: user.gear.baseColor }} />
          
          <div className="flex flex-col items-center relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl rounded-full opacity-40 animate-pulse" style={{ backgroundColor: user.gear.baseColor }} />
              <img src={user.photoURL} className="relative w-36 h-36 rounded-[2.5rem] border-4 border-neutral-900 shadow-2xl bg-neutral-900 object-cover" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-6 py-1.5 rounded-2xl font-black text-[11px] uppercase shadow-[0_10px_20px_rgba(16,185,129,0.3)]">
                  {user.rankTier} {user.rankDivision}
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{user.displayName}</h3>
            <div className="flex flex-col items-center gap-2 mb-6">
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">ACTIVE PERK:</span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{user.gear.specialization}</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">UNIT_STATUS:</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest text-neutral-300">
                     OPERATIVE_READY
                  </span>
               </div>
            </div>

            <button 
              onClick={startCalibration}
              className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <RefreshCcw size={14} /> SYNC BIOMETRIC AVATAR
            </button>
          </div>
        </div>

        {/* AVATAR SELECTOR MODAL */}
        {isCalibrating && (
           <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
              <div className="w-full max-w-sm glass rounded-[3rem] p-8 border border-white/10 relative">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Fingerprint className="text-emerald-500" /> IDENTITY_SYNC
                 </h2>
                 
                 <div className="grid grid-cols-3 gap-3 mb-10">
                    {AVATARS.map((avatar, idx) => (
                       <button 
                          key={idx} 
                          onClick={() => {soundService.playClick(); setSelectedAvatar(avatar);}}
                          className={`relative aspect-square rounded-2xl border-2 transition-all overflow-hidden ${selectedAvatar === avatar ? 'border-emerald-500 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-white/5 grayscale opacity-40'}`}
                       >
                          <img src={avatar} className="w-full h-full object-cover" />
                          {selectedAvatar === avatar && (
                            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                               <CheckCircle2 size={24} className="text-emerald-500" />
                            </div>
                          )}
                       </button>
                    ))}
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => {soundService.playClick(); setIsCalibrating(false);}} className="flex-1 py-4 rounded-2xl border border-white/5 text-[10px] font-black text-neutral-500 uppercase">ABORT</button>
                    <button onClick={saveIdentity} className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black text-[10px] font-black uppercase shadow-xl shadow-emerald-500/20">CONFIRM SYNC</button>
                 </div>
              </div>
           </div>
        )}

        {/* PROGRESS CARDS */}
        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="bg-neutral-900/60 p-5 rounded-[2rem] border border-white/5">
              <Zap size={20} className="text-emerald-500 mb-3" />
              <p className="text-[14px] font-black text-white uppercase tabular-nums">{user.points.toLocaleString()}</p>
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">TOTAL XP</p>
           </div>
           <div className="bg-neutral-900/60 p-5 rounded-[2rem] border border-white/5">
              <Flame size={20} className="text-orange-500 mb-3" />
              <p className="text-[14px] font-black text-white uppercase tabular-nums">{user.streak} DAYS</p>
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">ACTIVE STREAK</p>
           </div>
        </div>

        {/* MISSIONS HUB */}
        <div className="space-y-8 mb-10">
            <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500" /> DAILY SORTIES
                </h4>
                <div className="space-y-3">
                    {dailies.map(m => (
                        <div key={m.id} className="bg-neutral-900/60 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-neutral-300 uppercase">{m.title}</span>
                                <span className="text-[10px] font-black text-emerald-500">+{m.xpReward} XP</span>
                            </div>
                            <div className="h-2 bg-black rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(m.current/m.target)*100}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] font-black text-neutral-600 uppercase">
                                <span>{m.current} / {m.target} UNITS</span>
                                {m.completed && <CheckCircle2 size={10} className="text-emerald-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" /> WEEKLY OPS
                </h4>
                <div className="space-y-3">
                    {weeklies.map(m => (
                        <div key={m.id} className="bg-neutral-900/60 p-5 rounded-2xl border border-blue-500/20">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-white uppercase">{m.title}</span>
                                <span className="text-[10px] font-black text-blue-400">+{m.xpReward} XP</span>
                            </div>
                            <div className="h-3 bg-black rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(m.current/m.target)*100}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] font-black text-neutral-600 uppercase">
                                <span>{m.current} / {m.target} UNITS DEPLOYED</span>
                                {m.completed && <CheckCircle2 size={10} className="text-blue-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* TACTICAL ACCOLADES */}
        <div className="mb-10">
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Trophy size={16} className="text-emerald-500" /> TACTICAL ACCOLADES
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {user.achievements.map(a => {
              const unlocked = !!a.unlockedAt;
              return (
                <div key={a.id} className={`p-4 rounded-3xl border transition-all flex items-center gap-3 ${unlocked ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-neutral-900 border-white/5 opacity-40 grayscale'}`}>
                  <div className="text-2xl">{a.icon}</div>
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase">{a.title}</h5>
                    <p className="text-[8px] font-bold text-neutral-500 uppercase">{a.requirement} SCANS</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
