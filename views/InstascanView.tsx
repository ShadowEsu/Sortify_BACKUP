
import React from 'react';
import { Zap, Shield, Cpu, Radio, Target, ChevronRight, ShoppingCart, Sparkles, Activity, Bluetooth, Info } from 'lucide-react';

const InstascanView: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 p-8 pb-32 font-gaming animate-in fade-in duration-500">
      <div className="max-w-md mx-auto">
        {/* Header HUD */}
        <div className="flex justify-between items-start mb-12">
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">HARDWARE SYNC</h2>
             <p className="text-[9px] font-black text-blue-500/60 tracking-[0.3em] uppercase underline underline-offset-4">SECTOR_Q4_PREVIEW</p>
           </div>
           <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 animate-pulse">
             <Radio size={20} />
           </div>
        </div>

        {/* Product Hero Section */}
        <div className="relative mb-12 group">
          <div className="absolute -inset-4 bg-blue-500 rounded-[3rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative glass border-blue-500/20 rounded-[3rem] p-8 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-900/20 shadow-2xl">
            {/* Mock Product Visual */}
            <div className="flex justify-center mb-8 relative">
              <div className="w-48 h-48 bg-neutral-800 rounded-3xl border-4 border-white/5 shadow-2xl flex items-center justify-center transform group-hover:rotate-2 transition-transform duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent animate-pulse" />
                <Zap size={64} className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)]" />
                
                {/* HUD Elements around the product */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <div className="w-1 h-1 bg-blue-500/30 rounded-full" />
                </div>
                <div className="absolute bottom-2 right-2 text-[6px] font-black text-blue-500/40 uppercase tracking-widest">
                  MODEL: IS-X1-ULTRASOUND
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500 text-black text-[9px] font-black uppercase tracking-widest mb-4">
                <Sparkles size={10} fill="currentColor" /> COMING SOON
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">INSTA<span className="text-blue-400">SCAN</span></h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em] leading-relaxed">The First Ultrasonic Waste Classifier for Sortify Units.</p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-neutral-900/50 p-5 rounded-3xl border border-white/5 space-y-3">
             <Activity className="text-blue-400" size={20} />
             <h4 className="text-[10px] font-black text-white uppercase tracking-widest">ULTRA-SONIC</h4>
             <p className="text-[9px] text-neutral-500 leading-relaxed uppercase">Scans material density through non-transparent bins for 99.9% accuracy.</p>
          </div>
          <div className="bg-neutral-900/50 p-5 rounded-3xl border border-white/5 space-y-3">
             <Target className="text-blue-400" size={20} />
             <h4 className="text-[10px] font-black text-white uppercase tracking-widest">XP MULTIPLIER</h4>
             <p className="text-[9px] text-neutral-500 leading-relaxed uppercase">Unlock 2X XP bonus on all physical sorts via hardware handshake.</p>
          </div>
        </div>

        {/* Connectivity info */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Bluetooth size={24} />
          </div>
          <div className="flex-1">
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">SORTIFY SYNC</h5>
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Auto-connects to your mobile HUD via Ultra-Low Latency BT 6.0</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-400 text-black py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
            <ShoppingCart size={18} />
            PRE-ORDER COMMAND
          </button>
          
          <div className="flex items-center gap-4 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
             <Info size={16} className="text-blue-500/50 shrink-0" />
             <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest italic">
               *Hardware requires Sortify Operative Level 10+ for Full Integration. 
               Deployment slated for Winter 2025.
             </p>
          </div>
        </div>

        {/* Blueprints preview */}
        <div className="mt-12 opacity-30 group cursor-help transition-opacity hover:opacity-100">
           <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
             <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={12} /> TECHNICAL_BLUEPRINTS
             </span>
             <ChevronRight size={14} className="text-neutral-500" />
           </div>
           <div className="h-20 bg-neutral-900 rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/20 animate-pulse" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstascanView;
