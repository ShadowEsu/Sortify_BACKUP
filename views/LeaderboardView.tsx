
import React, { useEffect, useState } from 'react';
import { Trophy, Crown, ArrowUp, Zap, Target, Loader2, Globe, Radio, CheckCircle2, ShieldAlert } from 'lucide-react';
import { dbService } from '../services/dbService';
import { UserStats, RankTier } from '../types';

const getRankColor = (tier: RankTier) => {
  switch (tier) {
    case RankTier.IRON: return 'text-neutral-500 border-neutral-700 bg-neutral-900/40';
    case RankTier.BRONZE: return 'text-orange-700 border-orange-900 bg-orange-950/20';
    case RankTier.SILVER: return 'text-slate-300 border-slate-500 bg-slate-800/20';
    case RankTier.GOLD: return 'text-yellow-400 border-yellow-600 bg-yellow-900/20';
    case RankTier.PLATINUM: return 'text-cyan-400 border-cyan-600 bg-cyan-900/20';
    case RankTier.DIAMOND: return 'text-purple-400 border-purple-600 bg-purple-900/20';
    case RankTier.ASCENDANT: return 'text-emerald-400 border-emerald-600 bg-emerald-900/20';
    case RankTier.IMMORTAL: return 'text-red-500 border-red-800 bg-red-950/30';
    case RankTier.RADIANT: return 'text-yellow-200 border-yellow-200 bg-yellow-400/20 shadow-[0_0_20px_rgba(253,224,71,0.3)]';
    default: return 'text-white';
  }
};

const LeaderboardView: React.FC = () => {
  const [rankings, setRankings] = useState<UserStats[]>([]);
  const [currentUser, setCurrentUser] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [data, user] = await Promise.all([dbService.getLeaderboard(), dbService.getCurrentSessionUser()]);
      setRankings(data);
      setCurrentUser(user);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 p-8 pb-32 font-gaming">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-emerald-500 animate-spin-slow" />
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Sector Registry_Global</p>
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">GLOBAL <span className="text-emerald-500">GRID</span></h2>
          </div>
          <div className="p-4 bg-emerald-500 text-black rounded-2xl">
            <Trophy size={28} />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SYNCING_GRID...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((user, i) => {
              const isMe = user.uid === currentUser?.uid;
              const rankStyle = getRankColor(user.rankTier);
              return (
                <div 
                  key={user.uid} 
                  className={`flex items-center gap-4 p-4 rounded-3xl border transition-all ${isMe ? 'bg-emerald-500/10 border-emerald-500' : 'bg-neutral-900/40 border-white/5'}`}
                >
                  <div className="w-8 flex justify-center text-xs font-black text-neutral-600">
                    {i < 3 ? <Crown size={20} className={i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : 'text-orange-400'} /> : i + 1}
                  </div>
                  
                  <img src={user.photoURL} className="w-12 h-12 rounded-xl border border-white/10" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black uppercase tracking-wider ${isMe ? 'text-emerald-400' : 'text-white'}`}>{user.displayName}</h4>
                        {user.uid.startsWith('npc_') && <span className="text-[6px] font-black bg-white/5 px-1 rounded text-neutral-500">BOT</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest ${rankStyle}`}>
                        {user.rankTier} {user.rankDivision}
                      </div>
                      <span className="text-[8px] font-black text-neutral-600 uppercase">{user.streak}D STREAK</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-sm text-white">{user.points.toLocaleString()}</p>
                    <p className="text-[8px] font-black text-emerald-500">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardView;
