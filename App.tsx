
import React, { useState, useEffect, useCallback } from 'react';
import ScanView from './views/ScanView';
import MapView from './views/MapView';
import LeaderboardView from './views/LeaderboardView';
import ProfileView from './views/ProfileView';
import HistoryView from './views/HistoryView';
import AuthView from './views/AuthView';
import InstascanView from './views/InstascanView';
import Navigation from './components/Navigation';
import { dbService } from './services/dbService';
import { UserStats, Notification, BinCategory } from './types';
import { X, Recycle, Leaf, Trash2, BellRing, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserStats | null>(null);
  const [currentView, setCurrentView] = useState('scan');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    dbService.getCurrentSessionUser().then(user => {
      if (user) setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
    setCurrentView('scan');
  };

  const handleAuthSuccess = (user: UserStats) => {
    setCurrentUser(user);
    setCurrentView('scan');
  };

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((category: BinCategory, itemName: string, bonus: boolean = false) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif: Notification = {
      id,
      title: bonus ? 'PERK BONUS MULTIPLIER' : 'DISPOSAL PROTOCOL UPDATED',
      message: `Item: ${itemName.toUpperCase()}\nDeploy to: ${category.toUpperCase()} unit.`,
      category
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => removeNotification(id), 10000);
  }, [removeNotification]);

  if (loading) return (
    <div className="h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-emerald-500 font-gaming">
      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em]">CONNECTING HUD...</span>
    </div>
  );

  if (!currentUser) return <AuthView onAuth={handleAuthSuccess} />;

  const renderView = () => {
    switch (currentView) {
      case 'scan': return <ScanView onScanSuccess={addNotification} />;
      case 'map': return <MapView />;
      case 'leaderboard': return <LeaderboardView />;
      case 'profile': return <ProfileView onLogout={handleLogout} />;
      case 'history': return <HistoryView onBack={() => setCurrentView('profile')} />;
      case 'instascan': return <InstascanView />;
      default: return <ScanView onScanSuccess={addNotification} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 font-gaming">
      <div className="fixed top-6 right-6 z-[6000] flex flex-col gap-4 pointer-events-none w-80 sm:w-96">
        {notifications.map((notif) => {
          const isRecycle = notif.category === BinCategory.RECYCLE;
          const isCompost = notif.category === BinCategory.COMPOST;
          const isBonus = notif.title.includes('BONUS');
          
          const themeClass = isBonus ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400 shadow-yellow-500/20' :
                             isRecycle ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-blue-500/20' :
                             isCompost ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' :
                             'border-neutral-500 bg-neutral-950 text-neutral-400 shadow-white/5';
          const Icon = isBonus ? Zap : isRecycle ? Recycle : isCompost ? Leaf : Trash2;

          return (
            <div 
              key={notif.id} 
              className={`pointer-events-auto glass border-2 p-6 rounded-3xl shadow-2xl transition-all duration-500 transform animate-in slide-in-from-right-20 relative overflow-hidden ${themeClass} group`}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-40" />
              <button onClick={() => removeNotification(notif.id)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors z-20">
                <X size={20} />
              </button>
              
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl bg-black/40 border-2 shadow-inner animate-pulse-limited ${themeClass}`}>
                  <Icon size={32} className="shrink-0" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BellRing size={12} className="animate-bounce" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 leading-none">{notif.title}</p>
                  </div>
                  <p className="text-[14px] font-black leading-tight uppercase tracking-tight whitespace-pre-line mb-2">{notif.message}</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-[timer_10s_linear_forwards]" style={{ width: '100%' }} />
            </div>
          );
        })}
      </div>

      <main className={`flex-1 overflow-hidden ${currentView === 'map' ? '' : 'pb-24 overflow-y-auto'}`}>
        {renderView()}
      </main>
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      
      <style>{`
        @keyframes timer { from { width: 100%; } to { width: 0%; } }
        @keyframes pulse-limited { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
        .animate-pulse-limited { animation: pulse-limited 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
