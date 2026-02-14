
export enum BinCategory {
  WASTE = 'waste',
  COMPOST = 'compost',
  RECYCLE = 'recycle'
}

export interface Mission {
  id: string;
  title: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt?: number;
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
  displayName: string;
  photoURL: string;
  points: number;
  scansCount: number;
  level: number;
  rank: number;
  streak: number;
  lastScanDate?: string;
  achievements: Achievement[];
  missions: Mission[];
  flair?: string; // New: selected holographic/special accessory
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
