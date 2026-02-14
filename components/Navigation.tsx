
import React from 'react';
import { Camera, MapPin, Trophy, User, Zap } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const tabs = [
    { id: 'scan', icon: Camera, label: 'SCAN' },
    { id: 'map', icon: MapPin, label: 'RADAR' },
    { id: 'leaderboard', icon: Trophy, label: 'RANKS' },
    { id: 'profile', icon: User, label: 'OP_ID' },
    { id: 'instascan', icon: Zap, label: 'INSTASCAN' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur-2xl border-t border-white/10 px-4 pb-8 pt-4 flex justify-between items-center z-[3000] safe-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center gap-2 transition-all relative group flex-1 ${
              isActive ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {isActive && (
              <div className="absolute -top-2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(52,211,153,1)]" />
            )}
            <div className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-transparent border border-transparent group-hover:bg-white/5'}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'fill-current' : ''} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.1em] font-gaming whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
