
import React, { useState, useEffect, useCallback } from 'react';
import ScanView from './views/ScanView';
import MapView from './views/MapView';
import LeaderboardView from './views/LeaderboardView';
import ProfileView from './views/ProfileView';
import HistoryView from './views/HistoryView';
import AuthView from './views/AuthView';
import Navigation from './components/Navigation';
import { dbService } from './services/dbService';
import { UserStats, Notification, BinCategory } from './types';
import { X, Recycle, Leaf, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserStats | null>(null);
  const [currentView, setCurrentView] = useState('scan');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    dbService.getCurrentSessionUser().then(user => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
  };

  const addNotification = useCallback((category: BinCategory, itemName: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif: Notification = {
      id,
      title: 'DISPOSAL PROTOCOL',
      message: `Deploy ${itemName.toUpperCase()} to ${category.toUpperCase()} unit immediately.`,
      category
    };
    setNotifications(prev => [...prev, newNotif]);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) return (
    <div className="h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
      <span className="text-[10px] font-black text-emerald-500 tracking-[0.4em] animate-pulse uppercase">INITIALIZING SORTIFY...</span>
    </div>
  );

  if (!currentUser) {
    return <AuthView onAuth={setCurrentUser} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'scan': return <ScanView onScanSuccess={addNotification} />;
      case 'map': return <MapView />;
      case 'leaderboard': return <LeaderboardView />;
      case 'profile': return <ProfileView onLogout={handleLogout} onNavigateHistory={() => setCurrentView('history')} />;
      case 'history': return <HistoryView onBack={() => setCurrentView('profile')} />;
      default: return <ScanView onScanSuccess={addNotification} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Global Notification Stack */}
      <div className="fixed top-6 right-6 z-[6000] flex flex-col gap-3 pointer-events-none w-72">
        {notifications.map((notif) => {
          const isRecycle = notif.category === BinCategory.RECYCLE;
          const isCompost = notif.category === BinCategory.COMPOST;
          const themeClass = isRecycle ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                             isCompost ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                             'border-neutral-500/30 bg-neutral-500/10 text-neutral-400';
          const Icon = isRecycle ? Recycle : isCompost ? Leaf : Trash2;

          return (
            <div 
              key={notif.id} 
              className={`pointer-events-auto glass border p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300 relative ${themeClass}`}
            >
              <button 
                onClick={() => removeNotification(notif.id)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
              <div className="flex items-center gap-3">
                <Icon size={20} className="shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-1">{notif.title}</p>
                  <p className="text-xs font-bold leading-snug">{notif.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <main className={`flex-1 overflow-hidden ${currentView === 'map' ? '' : 'pb-24 overflow-y-auto'}`}>
        {renderView()}
      </main>
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
