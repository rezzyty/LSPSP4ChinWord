import { BirdType } from './quiz';

export type BackgroundThemeId = 'green_hills' | 'night_sky' | 'sunset_beach' | 'volcano_fortress' | 'cyber_space';

export type PowerUpId = 'laser_scope' | 'king_sling' | 'super_seed' | 'tnt_rain' | 'speed_potion';

export interface PowerUpItem {
  id: PowerUpId;
  nameZh: string;
  icon: string;
  descZh: string;
  costCoins: number;
  costDiamonds: number;
}

export interface BackgroundTheme {
  id: BackgroundThemeId;
  nameZh: string;
  icon: string;
  descZh: string;
  costCoins: number;
  costDiamonds: number;
}

export type ProfileId = 'melaine' | 'jayden' | 'others';

export interface UserProfile {
  id: ProfileId;
  name: string;
  avatar: string;
  titleZh: string;
  color: string;

  // Economy & Resources
  coins: number;      // 金幣 🪙
  diamonds: number;   // 鑽石 💎

  // Stats & Progress
  highScore: number;
  totalScore: number;
  totalQuestionsAnswered: number;
  totalQuestionsCorrect: number;
  completedSets: string[]; // List of unique completed set IDs
  piggiesDefeated: number;
  starsEarned: number;
  highestStreak: number;
  lastPlayedAt: number;

  // Unlocks & Selections
  unlockedBirds: BirdType[];
  selectedBird: BirdType;
  unlockedBackgrounds: BackgroundThemeId[];
  selectedBackground: BackgroundThemeId;

  // Inventory of Weapons & Power-ups
  powerUps: Record<PowerUpId, number>;

  // Currently toggled power-ups for active gameplay
  activePowerUps: Partial<Record<PowerUpId, boolean>>;
}
