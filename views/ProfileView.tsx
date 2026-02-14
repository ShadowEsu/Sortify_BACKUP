
import React, { useEffect, useState } from 'react';
// Added Loader2 to imports from lucide-react
import { Settings, History, Calendar, Star, ChevronRight, Award, LogOut, Flame, BarChart3, ShieldCheck, Target, Zap, Clock, Activity, Lock, Trophy, Medal, Sparkles, UserPlus, Palette, Eye, Ghost, Zap as Bolt, Waves, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { UserStats, ScanRecord, Achievement } from '../types';

interface ProfileViewProps {
  onLogout: () => void;
  onNavigateHistory?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onLogout, onNavigateHistory }) => {
  const [user, setUser] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [selectedFlair, setSelectedFlair] = useState<string | undefined>(undefined);
  const [isConfirmingFlair, setIsConfirmingFlair] = useState(false);

  useEffect(() => {
    dbService.getCurrentSessionUser().then(userData => {
      if (userData) {
        setUser(userData);
        setSelectedFlair(userData.flair);
        dbService.getScans(userData.uid).then(scans => setHistory(scans));
      }
    });
  }, []);

  if (!user) return <div className="h-screen bg-neutral-950 flex items-center justify-center text-emerald-500 font-black tracking-widest uppercase">RETRIEVING DOSSIER...</div>;

  const xpRequiredForNextLevel = 200;
  const xpInCurrentLevel = user.points % xpRequiredForNextLevel;
  const progressPercent = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const AVATAR_SEEDS = ['Nova', 'Zenith', 'Echo', 'Apex', 'Shadow', 'Vector', 'Ghost', 'Rogue'];
  
  const FLAIR_OPTIONS = [
    { id: 'visor', label: 'HOLO-VISOR', icon: Eye, reqLevel: 1 },
    { id: 'aura', label: 'BIO-AURA', icon: Sparkles, reqLevel: 3 },
    { id: 'wings', label: 'CYBER-WINGS', icon: Ghost, reqLevel: 5 },
    { id: 'surge', label: 'SURGE-FIELD', icon: Bolt, reqLevel: 7 },
  ];

  const changeAvatar = async (seed: string) => {
    setIsUpdatingAvatar(true);
    const newUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}_${user.username}`;
    try {
      const updatedUser = await dbService.updateUser({ photoURL: newUrl });
      setUser(updatedUser);
    } catch (err) {
      console.error("Avatar calibration failed", err);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const confirmFlairUpdate = async () => {
    setIsConfirmingFlair(true);
    try {
      const updatedUser = await dbService.updateUser({ flair: selectedFlair });
      setUser(updatedUser);
      alert("FLAIR STRAND SYNCED SUCCESSFULLY.");
    } catch (err) {
      console.error("Flair calibration failed", err);
    } finally {
      setIsConfirmingFlair(false);
    }
  };

  const getFlairOverlayClass = (flairId?: string) => {
    switch(flairId) {
      case 'visor': return 'ring-4 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]';
      case 'aura': return 'ring-4 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse';
      case 'wings': return 'ring-4 ring-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.5)]';
      case 'surge': return 'ring-4 ring-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.5)] animate-bounce';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 pb-32 font-gaming">
      <div className="max-w-md mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">OPERATIVE STATUS</h2>
             <p className="text-[9px] font-black text-emerald-500/60 tracking-[0.3em] uppercase">ID: {user.uid.slice(0, 10)}</p>
           </div>
           <button onClick={onLogout} className="p-3 bg-neutral-900 rounded-2xl border border-white/5 text-neutral-500 hover:text-red-400 transition-colors">
             <LogOut size={20} />
           </button>
        </div>

        {/* Identity Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className={`absolute -inset-2 bg-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${user.flair ? 'opacity-40' : ''}`} />
            <img 
              src={user.photoURL} 
              className={`relative w-32 h-32 rounded-full border-4 border-neutral-950 shadow-2xl mb-6 object-cover bg-neutral-800 transition-all ${isUpdatingAvatar ? 'opacity-50' : 'opacity-100'} ${getFlairOverlayClass(user.flair)}`} 
            />
            {user.flair && (
              <div className="absolute top-0 right-0 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 animate-bounce">
                <Sparkles size={16} className="text-emerald-400" />
              </div>
            )}
            <div className="absolute bottom-6 right-2 bg-emerald-500 text-black p-2 rounded-xl border-2 border-neutral-950 shadow-lg">
              <ShieldCheck size={18} fill="currentColor" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">SORTIFY <span className="text-emerald-500">{user.username}</span></h3>
          <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.4em] mt-2">Active Sortifier Corps</p>
        </div>

        {/* AVATAR RE-CALIBRATION */}
        <div className="mb-10">
          <h4 className="font-black text-white text-xs tracking-widest uppercase mb-6 flex items-center gap-3">
            <Palette size={18} className="text-emerald-500" /> AVATAR STRANDS
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_SEEDS.map((seed) => (
              <button 
                key={seed}
                onClick={() => changeAvatar(seed)}
                disabled={isUpdatingAvatar}
                className="aspect-square bg-neutral-900 rounded-xl border border-white/5 overflow-hidden hover:border-emerald-500/50 transition-all active:scale-95 disabled:opacity-50"
              >
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}_${user.username}`} alt={seed} className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* FLAIR / ACCESSORIES SECTION */}
        <div className="mb-10 bg-neutral-900/40 p-6 rounded-[2rem] border border-white/5">
          <h4 className="font-black text-white text-xs tracking-widest uppercase mb-6 flex items-center gap-3">
            <Zap size={18} className="text-emerald-500" /> FLAIR STRANDS
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {FLAIR_OPTIONS.map((flair) => {
              const isLocked = user.level < flair.reqLevel;
              const isSelected = selectedFlair === flair.id;
              return (
                <button
                  key={flair.id}
                  disabled={isLocked}
                  onClick={() => setSelectedFlair(isSelected ? undefined : flair.id)}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    isSelected 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : isLocked 
                    ? 'bg-black/20 border-white/5 text-neutral-700' 
                    : 'bg-neutral-900 border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <flair.icon size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{flair.label}</span>
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <Lock size={10} />
                    </div>
                  )}
                  {isLocked && (
                    <span className="text-[7px] font-bold text-neutral-600 uppercase mt-1">LVL {flair.reqLevel}</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={confirmFlairUpdate}
            disabled={isConfirmingFlair || selectedFlair === user.flair}
            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              selectedFlair !== user.flair 
              ? 'bg-emerald-500 text-black shadow-[0_5px_15px_rgba(52,211,153,0.3)] hover:scale-[1.02]' 
              : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            {/* Fix: Loader2 is now correctly imported */}
            {isConfirmingFlair ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            CONFIRM FLAIR CALIBRATION
          </button>
        </div>

        {/* Level & XP Progression */}
        <div className="glass rounded-[2rem] p-8 border-emerald-500/10 mb-8 relative overflow-hidden">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-1">XP PROGRESSION</p>
              <h4 className="text-4xl font-black text-white leading-none tracking-tight">LVL {user.level}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">GLOBAL XP</p>
              <p className="text-2xl font-black text-white leading-none tracking-tight">{user.points.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-4 bg-neutral-800 rounded-full overflow-hidden mb-3 border border-white/5">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* TACTICAL ACCOLADES (Badges Section) */}
        <div className="mb-10">
          <h4 className="font-black text-white text-xs tracking-widest uppercase mb-6 flex items-center gap-3">
            <Trophy size={18} className="text-emerald-500" /> TACTICAL ACCOLADES
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {user.achievements.map((badge: Achievement) => {
              const isUnlocked = !!badge.unlockedAt;
              return (
                <div 
                  key={badge.id} 
                  className={`relative aspect-square rounded-[1.5rem] border flex flex-col items-center justify-center p-3 transition-all ${
                    isUnlocked 
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]' 
                    : 'bg-neutral-900 border-white/5 opacity-40'
                  }`}
                >
                  <div className={`text-2xl mb-2 transition-transform ${isUnlocked ? 'scale-110' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight ${isUnlocked ? 'text-white' : 'text-neutral-500'}`}>
                    {badge.title}
                  </span>
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[1.5rem] backdrop-blur-[1px]">
                      <Lock size={12} className="text-neutral-600" />
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1">
                      <Bolt size={10} className="text-emerald-400 fill-emerald-400 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest text-center mt-4 italic">
            {user.achievements.filter(a => !!a.unlockedAt).length} / {user.achievements.length} MEDALS UNLOCKED
          </p>
        </div>

        {/* Tactical History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-white text-xs tracking-widest uppercase flex items-center gap-3">
               <History size={18} className="text-emerald-500" /> SORT LOGS
            </h4>
            {history.length > 3 && (
              <button 
                onClick={onNavigateHistory}
                className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
              >
                VIEW ALL <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-neutral-900/50 rounded-3xl p-10 text-center border border-dashed border-white/10">
                 <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">NO DEPLOYMENT DATA FOUND.</p>
              </div>
            ) : (
              history.slice(0, 3).map((scan) => (
                <div key={scan.id} className="bg-neutral-900/80 p-5 rounded-[2rem] border border-white/5 space-y-4 group hover:border-emerald-500/30 transition-all">
                   <div className="flex items-center gap-4">
                     <img src={scan.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                     <div className="flex-1">
                       <div className="flex justify-between items-start mb-1">
                         <h5 className="font-black text-white text-xs uppercase tracking-tight leading-tight">{scan.result.detectedItem}</h5>
                         <span className="text-[10px] font-black text-emerald-400 whitespace-nowrap">+{scan.xpAwarded} XP</span>
                       </div>
                       
                       <div className="flex items-center gap-2 mb-2">
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                           scan.result.binCategory === 'recycle' ? 'border-blue-400 text-blue-400' :
                           scan.result.binCategory === 'compost' ? 'border-emerald-400 text-emerald-400' : 'border-neutral-500 text-neutral-500'
                         }`}>
                           {scan.result.binCategory}
                         </span>
                         <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-bold uppercase tracking-widest">
                           <Activity size={10} className="text-emerald-500" />
                           {Math.round(scan.result.confidence * 100)}% CONF
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-1.5 text-[8px] text-neutral-600 font-bold uppercase tracking-widest">
                         <Clock size={10} />
                         {formatTime(scan.timestamp)}
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[13px] text-neutral-200 font-medium italic leading-relaxed line-clamp-3">
                        "{scan.result.explanation}"
                      </p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
