
import { ScanRecord, UserStats, BinCategory, Achievement, Mission, RankTier, CharacterGear } from '../types';

const STORAGE_USERS = 'sortify_users_v7'; 
const STORAGE_SCANS = 'sortify_scans_v7';
const STORAGE_SESSION = 'sortify_session_v7';

const DEFAULT_GEAR: CharacterGear = {
  specialization: 'RECYCLE_SPECIALIST',
  outfit: 'POLYMER-PLATING',
  accessory: 'SOLAR-VISOR',
  baseColor: '#10b981'
};

const SCAN_ACCOLADES: Achievement[] = [
  { id: 'bronze_accolade', title: 'BRONZE ACCOLADE', icon: '🥉', description: 'Complete 100 tactical scans.', requirement: 100 },
  { id: 'silver_accolade', title: 'SILVER ACCOLADE', icon: '🥈', description: 'Complete 250 tactical scans.', requirement: 250 },
  { id: 'gold_accolade', title: 'GOLD ACCOLADE', icon: '🥇', description: 'Complete 500 tactical scans.', requirement: 500 },
  { id: 'plat_accolade', title: 'PLATINUM ACCOLADE', icon: '💎', description: 'Complete 1000 tactical scans.', requirement: 1000 },
];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'd1', title: 'Daily Sortie', target: 5, current: 0, xpReward: 150, completed: false },
  { id: 'd2', title: 'Recycle Scout', target: 2, current: 0, xpReward: 100, completed: false },
  { id: 'w1', title: 'Planetary Purge', target: 50, current: 0, xpReward: 1500, completed: false, isWeekly: true },
  { id: 'w2', title: 'Compost Specialist', target: 15, current: 0, xpReward: 800, completed: false, isWeekly: true },
];

const GLOBAL_ELITES = [
  { username: 'RADIANT_ECHO', email: 'echo@global.eco', points: 12500, gear: { specialization: 'RECYCLE_SPECIALIST', outfit: 'MYCO-MESH', accessory: 'NEURAL-LINK', baseColor: '#fde047' } },
  { username: 'IMMORTAL_VINE', email: 'vine@global.eco', points: 8200, gear: { specialization: 'COMPOST_COMMANDER', outfit: 'FERROUS-FRAME', accessory: 'KINETIC-CORE', baseColor: '#ef4444' } },
];

const calculateRank = (points: number): { tier: RankTier; division: 1 | 2 | 3 | null } => {
  if (points >= 10000) return { tier: RankTier.RADIANT, division: null };
  if (points >= 7000) return { tier: RankTier.IMMORTAL, division: (Math.floor((points - 7000) / 1000) + 1) as any };
  if (points >= 5000) return { tier: RankTier.ASCENDANT, division: (Math.floor((points - 5000) / 666) + 1) as any };
  if (points >= 3500) return { tier: RankTier.DIAMOND, division: (Math.floor((points - 3500) / 500) + 1) as any };
  if (points >= 2200) return { tier: RankTier.PLATINUM, division: (Math.floor((points - 2200) / 433) + 1) as any };
  if (points >= 1200) return { tier: RankTier.GOLD, division: (Math.floor((points - 1200) / 333) + 1) as any };
  if (points >= 600) return { tier: RankTier.SILVER, division: (Math.floor((points - 600) / 200) + 1) as any };
  if (points >= 250) return { tier: RankTier.BRONZE, division: (Math.floor((points - 250) / 116) + 1) as any };
  return { tier: RankTier.IRON, division: (Math.floor(points / 83) + 1) as any };
};

const getStoredUsers = () => {
  const data = localStorage.getItem(STORAGE_USERS);
  if (!data) {
    const seed: Record<string, UserStats> = {};
    GLOBAL_ELITES.forEach(elite => {
      const { tier, division } = calculateRank(elite.points);
      seed[elite.username.toLowerCase()] = {
        uid: 'npc_' + elite.username,
        username: elite.username.toLowerCase(),
        email: elite.email,
        displayName: elite.username,
        photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${elite.username}`,
        points: elite.points,
        scansCount: Math.floor(elite.points / 20),
        level: Math.floor(elite.points / 200) + 1,
        rank: 0, rankTier: tier, rankDivision: division,
        streak: 15, achievements: SCAN_ACCOLADES, missions: INITIAL_MISSIONS,
        gear: (elite.gear || DEFAULT_GEAR) as CharacterGear,
      };
    });
    localStorage.setItem(STORAGE_USERS, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

export const dbService = {
  signup: async (username: string, email: string, gear?: CharacterGear): Promise<UserStats> => {
    const users = getStoredUsers();
    const normalizedUsername = username.toLowerCase().trim();
    if (users[normalizedUsername]) throw new Error('CODENAME ALREADY IN USE.');
    
    const { tier, division } = calculateRank(0);
    const newUser: UserStats = {
      uid: 'u_' + Math.random().toString(36).substr(2, 9),
      username: normalizedUsername,
      email: email.toLowerCase().trim(),
      displayName: username,
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${normalizedUsername}`,
      points: 0, scansCount: 0, level: 1, rank: 0, streak: 0,
      rankTier: tier, rankDivision: division,
      achievements: SCAN_ACCOLADES, missions: INITIAL_MISSIONS,
      gear: gear || DEFAULT_GEAR,
    };
    users[normalizedUsername] = newUser;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_SESSION, normalizedUsername);
    return newUser;
  },

  login: async (email: string): Promise<UserStats> => {
    const users = getStoredUsers();
    const user = Object.values(users).find((u: any) => u.email === email.toLowerCase().trim()) as UserStats;
    if (!user) throw new Error('NO OPERATIVE FOUND.');
    localStorage.setItem(STORAGE_SESSION, user.username);
    return user;
  },

  logout: () => localStorage.removeItem(STORAGE_SESSION),

  getCurrentSessionUser: async (): Promise<UserStats | null> => {
    const username = localStorage.getItem(STORAGE_SESSION);
    if (!username) return null;
    const users = getStoredUsers();
    return users[username] || null;
  },

  updateUser: async (updates: Partial<UserStats>): Promise<UserStats> => {
    const username = localStorage.getItem(STORAGE_SESSION);
    if (!username) throw new Error("NO SESSION.");
    const users = getStoredUsers();
    const updatedUser = { ...users[username], ...updates };
    users[username] = updatedUser;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    return updatedUser;
  },

  saveScan: async (userId: string, imageUrl: string, result: any, isPending: boolean = false): Promise<{scan: ScanRecord, user: UserStats, isDuplicate: boolean, multiplierActive: boolean}> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]') as ScanRecord[];
    const isDuplicate = scans.some(s => s.userId === userId && s.result.detectedItem.toLowerCase().trim() === result.detectedItem.toLowerCase().trim());

    const users = getStoredUsers();
    const sessionUser = localStorage.getItem(STORAGE_SESSION);
    if (!sessionUser || !users[sessionUser]) throw new Error('DB SYNC ERROR.');
    const user = users[sessionUser] as UserStats;

    // Check Perk Multiplier
    let multiplier = 1;
    const spec = user.gear.specialization;
    if (
      (spec === 'RECYCLE_SPECIALIST' && result.binCategory === BinCategory.RECYCLE) ||
      (spec === 'COMPOST_COMMANDER' && result.binCategory === BinCategory.COMPOST) ||
      (spec === 'WASTE_WARDEN' && result.binCategory === BinCategory.WASTE)
    ) {
      multiplier = 2;
    }

    const xpBase = isPending ? 5 : 25;
    const xpAwarded = isDuplicate ? 0 : (xpBase + Math.floor(result.confidence * 20)) * multiplier;

    const scan: ScanRecord = {
      id: 's_' + Date.now(),
      userId, imageUrl, timestamp: Date.now(), result, xpAwarded, isPendingSync: isPending
    };

    scans.unshift(scan);
    localStorage.setItem(STORAGE_SCANS, JSON.stringify(scans.slice(0, 100)));

    user.points += xpAwarded;
    user.scansCount += 1;
    
    user.achievements = user.achievements.map(a => (a.requirement && user.scansCount >= a.requirement && !a.unlockedAt) ? { ...a, unlockedAt: Date.now() } : a);
    user.missions = user.missions.map(m => {
        if (m.completed || isDuplicate) return m;
        let newCurrent = m.current;
        if (m.id === 'd1' || m.id === 'w1') newCurrent++;
        if (!isPending && (m.id === 'd2' || m.id === 'w2') && result.binCategory === BinCategory.RECYCLE) newCurrent++;
        const isNowComplete = newCurrent >= m.target;
        if (isNowComplete && !m.completed) user.points += m.xpReward;
        return { ...m, current: newCurrent, completed: isNowComplete };
    });

    const { tier, division } = calculateRank(user.points);
    user.rankTier = tier; user.rankDivision = division;
    user.level = Math.floor(user.points / 200) + 1;

    users[sessionUser] = user;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    return { scan, user, isDuplicate, multiplierActive: multiplier > 1 };
  },

  getScans: async (userId: string): Promise<ScanRecord[]> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]');
    return scans.filter((s: any) => s.userId === userId);
  },

  getPendingScans: async (userId: string): Promise<ScanRecord[]> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]') as ScanRecord[];
    return scans.filter((s: ScanRecord) => s.userId === userId && s.isPendingSync);
  },

  updateScanAfterSync: async (scanId: string, result: any, xpAwarded: number): Promise<void> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_SCANS) || '[]') as ScanRecord[];
    const scanIndex = scans.findIndex(s => s.id === scanId);
    if (scanIndex === -1) return;
    scans[scanIndex].result = result;
    scans[scanIndex].xpAwarded += xpAwarded;
    scans[scanIndex].isPendingSync = false;
    localStorage.setItem(STORAGE_SCANS, JSON.stringify(scans));
    const users = getStoredUsers();
    const sessionUser = localStorage.getItem(STORAGE_SESSION);
    if (sessionUser && users[sessionUser]) {
        const user = users[sessionUser];
        user.points += xpAwarded;
        const { tier, division } = calculateRank(user.points);
        user.rankTier = tier; user.rankDivision = division;
        users[sessionUser] = user;
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }
  },

  getLeaderboard: async (): Promise<UserStats[]> => {
    const usersObj = getStoredUsers();
    return Object.values(usersObj).sort((a: any, b: any) => b.points - a.points).map((u: any, i) => ({ ...u, rank: i + 1 }));
  }
};
