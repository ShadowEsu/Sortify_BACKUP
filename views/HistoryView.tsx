
import React, { useEffect, useState } from 'react';
import { ChevronLeft, History, Clock, Activity, Zap, Info, Sparkles, CloudSync, WifiOff, Filter } from 'lucide-react';
import { dbService } from '../services/dbService';
import { ScanRecord, BinCategory } from '../types';

interface HistoryViewProps {
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BinCategory | 'all'>('all');

  useEffect(() => {
    dbService.getCurrentSessionUser().then(user => {
      if (user) {
        dbService.getScans(user.uid).then(scans => {
          setHistory(scans);
          setLoading(false);
        });
      }
    });
  }, []);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString([], { 
      month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const filteredHistory = history.filter(scan => 
    filter === 'all' ? true : scan.result.binCategory === filter
  );

  const filterButtons = [
    { id: 'all', label: 'ALL LOGS', icon: History },
    { id: BinCategory.RECYCLE, label: 'RECYCLE', color: 'text-blue-400' },
    { id: BinCategory.COMPOST, label: 'COMPOST', color: 'text-emerald-400' },
    { id: BinCategory.WASTE, label: 'WASTE', color: 'text-neutral-400' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-8 pb-32 font-gaming">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onBack}
            className="p-3 bg-neutral-900 rounded-2xl border border-white/5 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">SORT LOGS</h2>
            <p className="text-[9px] font-black text-emerald-500/60 tracking-[0.3em] uppercase">COMPLETE DEPLOYMENT HISTORY</p>
          </div>
        </div>

        {/* Tactical Filters */}
        <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
          <div className="flex gap-2 min-w-max">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as any)}
                className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                  filter === btn.id 
                  ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                  : 'bg-neutral-900 text-neutral-500 border-white/5 hover:border-white/10 hover:text-neutral-300'
                }`}
              >
                {btn.id === 'all' && <btn.icon size={12} />}
                <span className={filter === btn.id ? 'text-black' : btn.color}>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
             <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
             <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">FETCHING LOGS...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-neutral-900/30 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-white/5 animate-in fade-in zoom-in duration-300">
             <Filter size={48} className="mx-auto text-neutral-800 mb-4" />
             <p className="text-xs font-black text-neutral-600 uppercase tracking-[0.2em]">NO ENTRIES MATCHING FILTER.</p>
             <button 
               onClick={() => setFilter('all')}
               className="mt-6 text-[9px] font-black text-emerald-500 uppercase tracking-widest underline decoration-2 underline-offset-4"
             >
               RESET PROTOCOL
             </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredHistory.map((scan) => (
              <div key={scan.id} className={`bg-neutral-900/80 p-7 rounded-[2.5rem] border space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 group transition-all ${scan.isPendingSync ? 'border-orange-500/20' : 'border-white/5 hover:border-emerald-500/20'}`}>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={scan.imageUrl} className="w-28 h-28 rounded-3xl object-cover border-2 border-white/10" />
                    <div className={`absolute -bottom-2 -right-2 text-black px-3 py-1.5 rounded-xl text-[11px] font-black shadow-lg ${scan.isPendingSync ? 'bg-orange-400' : 'bg-emerald-500'}`}>
                      +{scan.xpAwarded} XP
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-black text-white text-base uppercase tracking-tight leading-tight">
                        {scan.result.detectedItem}
                        </h5>
                        {scan.isPendingSync && <CloudSync size={14} className="text-orange-400 animate-pulse" />}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border-2 ${
                        scan.result.binCategory === 'recycle' ? 'border-blue-400 text-blue-400 bg-blue-400/5' :
                        scan.result.binCategory === 'compost' ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5' : 
                        'border-neutral-500 text-neutral-500 bg-neutral-500/5'
                      }`}>
                        {scan.result.binCategory}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Activity size={12} className={scan.isPendingSync ? 'text-orange-400' : 'text-emerald-500'} />
                        {Math.round(scan.result.confidence * 100)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[9px] text-neutral-600 font-bold uppercase tracking-widest">
                      <Clock size={12} />
                      {formatTime(scan.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className={`p-5 rounded-3xl border shadow-inner ${scan.isPendingSync ? 'bg-orange-500/5 border-orange-500/10' : 'bg-black/40 border-white/5'}`}>
                  <div className="flex items-start gap-3">
                    {scan.isPendingSync ? <WifiOff size={16} className="text-orange-400 shrink-0 mt-1" /> : <Info size={16} className="text-emerald-500 shrink-0 mt-1" />}
                    <p className={`text-[12px] font-medium italic leading-relaxed ${scan.isPendingSync ? 'text-orange-200/60' : 'text-neutral-300'}`}>
                      "{scan.result.explanation}"
                    </p>
                  </div>
                </div>

                {scan.result.funFact && (
                  <div className={`p-4 rounded-2xl border flex gap-3 items-center ${scan.isPendingSync ? 'bg-orange-500/5 border-orange-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                    <Sparkles size={14} className={scan.isPendingSync ? 'text-orange-400' : 'text-emerald-500'} shrink-0 />
                    <p className={`text-[10px] italic font-medium ${scan.isPendingSync ? 'text-orange-100/70' : 'text-emerald-100/70'}`}>{scan.result.funFact}</p>
                  </div>
                )}

                {scan.result.disposalTips && scan.result.disposalTips.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {scan.result.disposalTips.map((tip, i) => (
                      <div key={i} className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${scan.isPendingSync ? 'text-orange-500/80 bg-orange-500/5 border-orange-500/10' : 'text-emerald-500/80 bg-emerald-500/5 border-emerald-500/10'}`}>
                        <Zap size={10} />
                        {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
