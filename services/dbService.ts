
import { ScanRecord, UserStats, BinCategory, Achievement, Mission } from '../types';

const STORAGE_USERS = 'sortify_users_v2';
const STORAGE_SCANS = 'sortify_scans_v2';
const STORAGE_SESSION = 'sortify_session_v2';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_scan', title: 'Recruit', icon: '🌱', description: 'Complete your first scan.' },
  { id: 'streak_3', title: 'Consistent', icon: '🔥', description: 'Maintain a 3-day sorting streak.' },
  { id: 'recycle_pro', title: 'Plastic Punisher', icon: '♻️', description: 'Sort 10 recyclable items.' },
];

const DAILY_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Daily Sortie', target: 3, current: 0, xpReward: 50, completed: false },
  { id: 'm2', title: 'Recycle Scout', target: 1, current: 0, xpReward: 30, completed: false },
];

export const dbService = {
  // --- AUTH ---
  signup: async (username: string): Promise<UserStats> => {
    const users = JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}');
    const normalizedUsername = username.toLowerCase().trim();
    if (users[normalizedUsername]) throw new Error('Operative ID already exists.');
    
    const newUser: UserStats = {
      uid: 'u_' + Math.random().toString(36).substr(2, 9),
      username: normalizedUsername,
      displayName: username,
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${normalizedUsername}`,
      points: 0,
      scansCount: 0,
      level: 1,
      rank: 0,
      streak: 0,
      achievements: INITIAL_ACHIEVEMENTS,
      missions: DAILY_MISSIONS,
    };
    
    users[normalizedUsername] = newUser;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_SESSION, normalizedUsername);
    return newUser;
  },

  login: async (username: string): Promise<UserStats> => {
    const users = JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}');
    const normalizedUsername = username.toLowerCase().trim();
    if (!users[normalizedUsername]) throw new Error('Operative ID not found.');
    localStorage.setItem(STORAGE_SESSION, normalizedUsername);
    return users[normalizedUsername];
  },

  logout: () => {
    localStorage.removeItem(STORAGE_SESSION);
  },

  getCurrentSessionUser: async (): Promise<UserStats | null> => {
    const username = localStorage.getItem(STORAGE_SESSION);
    if (!username) return null;
    const users = JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}');
    return users[username] || null;
  },

  updateUser: async (updates: Partial<UserStats>): Promise<UserStats> => {
    const username = localStorage.getItem(STORAGE_SESSION);
    if (!username) throw new Error("No active session.");
    const users = JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}');
    if (!users[username]) throw new Error("User record missing.");
    
    const updatedUser = { ...users[username], ...updates };
    users[username] = updatedUser;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    return updatedUser;
  },

  // --- SCANS & MISSIONS ---
  saveScan: async (userId: string, imageUrl: string, result: any, isPending: boolean = false): Promise<{scan: ScanRecord, user: UserStats}> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]');
    const xpBase = isPending ? 5 : 15; // Lower initial reward for offline "draft"
    const xpBonus = isPending ? 0 : Math.floor(result.confidence * 10);
    const xpAwarded = xpBase + xpBonus;

    const scan: ScanRecord = {
      id: 's_' + Date.now(),
      userId,
      imageUrl,
      timestamp: Date.now(),
      result,
      xpAwarded,
      isPendingSync: isPending
    };

    scans.unshift(scan);
    localStorage.setItem(STORAGE_SCANS, JSON.stringify(scans.slice(0, 100)));

    const users = JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}');
    const sessionUser = localStorage.getItem(STORAGE_SESSION);
    if (!sessionUser || !users[sessionUser]) throw new Error('Data sync failure.');

    const user = users[sessionUser] as UserStats;
    user.points += xpAwarded;
    user.scansCount += 1;
    user.level = Math.floor(user.points / 200) + 1;

    // Mission Progress
    user.missions = user.missions.map(m => {
      if (m.completed) return m;
      let newCurrent = m.current;
      if (m.id === 'm1') newCurrent++;
      if (!isPending && m.id === 'm2' && result.binCategory === BinCategory.RECYCLE) newCurrent++;
      
      const isNowComplete = newCurrent >= m.target;
      if (isNowComplete && !m.completed) {
        user.points += m.xpReward;
      }
      return { ...m, current: newCurrent, completed: isNowComplete };
    });

    // Streak Logic
    const today = new Date().toISOString().split('T')[0];
    if (user.lastScanDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      user.streak = (user.lastScanDate === yesterday) ? user.streak + 1 : 1;
      user.lastScanDate = today;
    }

    // Achievement Logic
    if (user.scansCount === 1) user.achievements[0].unlockedAt = Date.now();
    if (user.streak >= 3) user.achievements[1].unlockedAt = Date.now();
    if (user.scansCount >= 10 && !user.achievements[2].unlockedAt) user.achievements[2].unlockedAt = Date.now();

    users[sessionUser] = user;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    
    return { scan, user };
  },

  updateScanAfterSync: async (scanId: string, result: any, additionalXp: number): Promise<void> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]') as ScanRecord[];
    const scanIndex = scans.findIndex(s => s.id === scanId);
    
    if (scanIndex !== -1) {
      scans[scanIndex].result = result;
      scans[scanIndex].isPendingSync = false;
      scans[scanIndex].xpAwarded += additionalXp;
      localStorage.setItem(STORAGE_SCANS, JSON.stringify(scans));

      // Update user points with the "difference" in XP
      const users = JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}');
      const sessionUser = localStorage.getItem(STORAGE_SESSION);
      if (sessionUser && users[sessionUser]) {
        const user = users[sessionUser] as UserStats;
        user.points += additionalXp;
        user.level = Math.floor(user.points / 200) + 1;
        
        // Re-check Recycle Scout mission if sync was successful
        user.missions = user.missions.map(m => {
            if (m.id === 'm2' && !m.completed && result.binCategory === BinCategory.RECYCLE) {
                m.current++;
                if (m.current >= m.target) {
                    m.completed = true;
                    user.points += m.xpReward;
                }
            }
            return m;
        });

        users[sessionUser] = user;
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      }
    }
  },

  getScans: async (userId: string): Promise<ScanRecord[]> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]');
    return scans.filter((s: any) => s.userId === userId);
  },

  getPendingScans: async (userId: string): Promise<ScanRecord[]> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]');
    return scans.filter((s: ScanRecord) => s.userId === userId && s.isPendingSync === true);
  },

  getLeaderboard: async (): Promise<UserStats[]> => {
    const usersObj = JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}');
    return Object.values(usersObj)
      .sort((a: any, b: any) => b.points - a.points)
      .map((u: any, i) => ({ ...u, rank: i + 1 }));
  }
};
