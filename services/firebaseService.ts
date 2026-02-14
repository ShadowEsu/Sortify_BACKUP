
import { ScanRecord, UserStats, BinCategory, RankTier, CharacterGear } from '../types';

/**
 * HACKATHON NOTE:
 * This service is designed to be swapped with actual Firebase SDK calls.
 * Current implementation uses LocalStorage for demo persistence.
 */

const STORAGE_KEY_USER = 'recyclexp_user';
const STORAGE_KEY_SCANS = 'recyclexp_scans';
const STORAGE_KEY_LEADERBOARD = 'recyclexp_leaderboard';

// Default gear for mock users
// Fixed: outfit must be one of 'POLYMER-PLATING' | 'FERROUS-FRAME' | 'MYCO-MESH' and added missing specialization.
const DEFAULT_GEAR: CharacterGear = {
  specialization: 'RECYCLE_SPECIALIST',
  outfit: 'POLYMER-PLATING',
  accessory: 'SOLAR-VISOR',
  baseColor: '#10b981'
};

const INITIAL_MOCK_LEADERBOARD: UserStats[] = [
  // Added missing 'email', 'missions', 'rankTier', 'rankDivision', and 'gear' properties to match UserStats interface
  { uid: '1', username: 'ecowarrior', email: 'ecowarrior@example.com', displayName: 'EcoWarrior', photoURL: 'https://picsum.photos/seed/1/100', points: 1250, scansCount: 125, level: 12, rank: 1, streak: 5, achievements: [], missions: [], rankTier: RankTier.GOLD, rankDivision: 1, gear: DEFAULT_GEAR },
  { uid: '2', username: 'greenqueen', email: 'greenqueen@example.com', displayName: 'GreenQueen', photoURL: 'https://picsum.photos/seed/2/100', points: 980, scansCount: 98, level: 9, rank: 2, streak: 3, achievements: [], missions: [], rankTier: RankTier.SILVER, rankDivision: 2, gear: DEFAULT_GEAR },
  { uid: '3', username: 'trashhero', email: 'trashhero@example.com', displayName: 'TrashHero', photoURL: 'https://picsum.photos/seed/3/100', points: 850, scansCount: 85, level: 8, rank: 3, streak: 2, achievements: [], missions: [], rankTier: RankTier.SILVER, rankDivision: 3, gear: DEFAULT_GEAR },
  { uid: '4', username: 'sortmaster', email: 'sortmaster@example.com', displayName: 'SortMaster', photoURL: 'https://picsum.photos/seed/4/100', points: 720, scansCount: 72, level: 7, rank: 4, streak: 1, achievements: [], missions: [], rankTier: RankTier.SILVER, rankDivision: 1, gear: DEFAULT_GEAR },
];

export const firebaseService = {
  // Authentication (Anonymous Mock)
  getCurrentUser: async (): Promise<UserStats> => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) return JSON.parse(saved);
    
    // Added missing 'email', 'missions', 'rankTier', 'rankDivision', and 'gear' properties to match UserStats interface
    const newUser: UserStats = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      username: 'new_recycler',
      email: 'new_recycler@example.com',
      displayName: 'New Recycler',
      photoURL: 'https://picsum.photos/seed/user/100',
      points: 0,
      scansCount: 0,
      level: 1,
      rank: 100,
      streak: 0,
      achievements: [],
      missions: [],
      rankTier: RankTier.IRON,
      rankDivision: 1,
      gear: DEFAULT_GEAR,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    return newUser;
  },

  // Firestore & Storage Simulation
  saveScan: async (userId: string, imageUrl: string, result: any): Promise<ScanRecord> => {
    // Added missing 'xpAwarded' property to match ScanRecord interface
    const scan: ScanRecord = {
      id: 'scan_' + Date.now(),
      userId,
      imageUrl,
      timestamp: Date.now(),
      result,
      xpAwarded: 1,
    };

    // Save scan to "Firestore"
    const scans = JSON.parse(localStorage.getItem(STORAGE_KEY_SCANS) || '[]');
    scans.unshift(scan);
    localStorage.setItem(STORAGE_KEY_SCANS, JSON.stringify(scans.slice(0, 50)));

    // Update User Stats (Award 1 point)
    const user = await firebaseService.getCurrentUser();
    user.points += 1;
    user.scansCount += 1;
    user.level = Math.floor(user.points / 10) + 1;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    return scan;
  },

  getScans: async (userId: string): Promise<ScanRecord[]> => {
    const scans = JSON.parse(localStorage.getItem(STORAGE_KEY_SCANS) || '[]');
    return scans.filter((s: ScanRecord) => s.userId === userId);
  },

  getLeaderboard: async (scope: string): Promise<UserStats[]> => {
    const user = await firebaseService.getCurrentUser();
    // Simulate different results for scopes
    const base = [...INITIAL_MOCK_LEADERBOARD];
    
    // Add current user to list if not present
    if (!base.find(u => u.uid === user.uid)) {
      base.push(user);
    }
    
    return base.sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));
  }
};
