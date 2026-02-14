
export enum BinCategory {
  WASTE = 'waste',
  COMPOST = 'compost',
  RECYCLE = 'recycle'
}

export enum RankTier {
  IRON = 'IRON',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  ASCENDANT = 'ASCENDANT',
  IMMORTAL = 'IMMORTAL',
  RADIANT = 'RADIANT'
}

export type Specialization = 'RECYCLE_SPECIALIST' | 'COMPOST_COMMANDER' | 'WASTE_WARDEN';

export interface CharacterGear {
  specialization: Specialization;
  outfit: 'POLYMER-PLATING' | 'FERROUS-FRAME' | 'MYCO-MESH';
  accessory: 'SOLAR-VISOR' | 'KINETIC-CORE' | 'NEURAL-LINK';
  baseColor: string;
}

export interface Mission {
  id: string;
  title: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  isWeekly?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt?: number;
  requirement?: number; // scans needed
}

export interface ScanResult {
  detectedItem: string;
  binCategory: BinCategory;
  confidence: number;
  explanation: string;
  disposalTips: string[];
  funFact?: string;
}

export interface UserStats {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  photoURL: string;
  points: number;
  scansCount: number;
  level: number;
  rank: number;
  rankTier: RankTier;
  rankDivision: 1 | 2 | 3 | null;
  streak: number;
  lastScanDate?: string;
  achievements: Achievement[];
  missions: Mission[];
  gear: CharacterGear;
  flair?: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: number;
  result: ScanResult;
  xpAwarded: number;
  isPendingSync?: boolean;
  syncError?: string;
}

export interface BinLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: BinCategory;
  distance?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: BinCategory;
}
