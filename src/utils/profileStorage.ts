import { UserProfile, BackgroundThemeId, PowerUpId } from '../types/profile';
import { BirdType } from '../types/quiz';

const STORAGE_ACTIVE_KEY = 'AB_ACTIVE_PROFILE_ID';
const STORAGE_PREFIX = 'AB_PROFILE_DATA_';

const DEFAULT_PROFILES: Record<'melaine' | 'jayden' | 'others', UserProfile> = {
  melaine: {
    id: 'melaine',
    name: 'Melaine',
    avatar: '👧',
    titleZh: '喇沙女榜首 · Melaine',
    color: '#EC4899',
    coins: 600,
    diamonds: 20,
    highScore: 12500,
    totalScore: 48500,
    totalQuestionsAnswered: 45,
    totalQuestionsCorrect: 42,
    completedSets: ['l1-set-1', 'l1-set-2', 'l2-set-1'],
    piggiesDefeated: 28,
    starsEarned: 9,
    highestStreak: 12,
    lastPlayedAt: Date.now() - 3600000,
    unlockedBirds: ['red', 'chuck', 'blues'],
    selectedBird: 'red',
    unlockedBackgrounds: ['green_hills', 'night_sky'],
    selectedBackground: 'green_hills',
    powerUps: {
      laser_scope: 3,
      king_sling: 2,
      super_seed: 2,
      speed_potion: 1,
      tnt_rain: 1,
    },
    activePowerUps: {},
  },
  jayden: {
    id: 'jayden',
    name: 'Jayden',
    avatar: '👦',
    titleZh: '神級彈弓手 · Jayden',
    color: '#3B82F6',
    coins: 850,
    diamonds: 25,
    highScore: 15800,
    totalScore: 56200,
    totalQuestionsAnswered: 52,
    totalQuestionsCorrect: 49,
    completedSets: ['l1-set-1', 'l2-set-1', 'l4-set-1', 'l8-set-1'],
    piggiesDefeated: 34,
    starsEarned: 12,
    highestStreak: 15,
    lastPlayedAt: Date.now() - 1800000,
    unlockedBirds: ['red', 'bomb', 'chuck'],
    selectedBird: 'bomb',
    unlockedBackgrounds: ['green_hills', 'sunset_beach'],
    selectedBackground: 'green_hills',
    powerUps: {
      laser_scope: 2,
      king_sling: 3,
      super_seed: 1,
      speed_potion: 2,
      tnt_rain: 2,
    },
    activePowerUps: {},
  },
  others: {
    id: 'others',
    name: 'Others',
    avatar: '🦉',
    titleZh: '客席探險家 · Guest',
    color: '#10B981',
    coins: 300,
    diamonds: 10,
    highScore: 8000,
    totalScore: 18000,
    totalQuestionsAnswered: 20,
    totalQuestionsCorrect: 18,
    completedSets: ['l1-set-1'],
    piggiesDefeated: 12,
    starsEarned: 4,
    highestStreak: 6,
    lastPlayedAt: Date.now(),
    unlockedBirds: ['red'],
    selectedBird: 'red',
    unlockedBackgrounds: ['green_hills'],
    selectedBackground: 'green_hills',
    powerUps: {
      laser_scope: 1,
      king_sling: 1,
      super_seed: 0,
      speed_potion: 0,
      tnt_rain: 0,
    },
    activePowerUps: {},
  },
};

/**
 * Get active profile ID (defaults to 'melaine' if none set)
 */
export function getActiveProfileId(): 'melaine' | 'jayden' | 'others' {
  if (typeof window === 'undefined') return 'melaine';
  try {
    const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (saved === 'melaine' || saved === 'jayden' || saved === 'others') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'melaine';
}

/**
 * Set active profile ID in localStorage and sync to cloud server
 */
export function setActiveProfileId(id: 'melaine' | 'jayden' | 'others') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_KEY, id);
    // Auto-save active profile ID to server
    fetch('/api/profiles/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeProfileId: id }),
    }).catch(() => {
      // offline fallback
    });
  } catch {
    // ignore
  }
}

/**
 * Load a specific profile from localStorage or default
 */
export function loadProfile(id: 'melaine' | 'jayden' | 'others'): UserProfile {
  const fallback = DEFAULT_PROFILES[id];
  if (typeof window === 'undefined') return { ...fallback };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...fallback,
        ...parsed,
        powerUps: {
          ...fallback.powerUps,
          ...(parsed.powerUps || {}),
        },
        activePowerUps: {
          ...(parsed.activePowerUps || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to parse profile data', e);
  }
  return { ...fallback };
}

/**
 * Save profile locally and auto-save in background to server for cross-device sync
 */
export function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    // 1. Instant local save
    localStorage.setItem(`${STORAGE_PREFIX}${profile.id}`, JSON.stringify(profile));

    // 2. Real-time background cloud auto-save (cross-device sync)
    fetch(`/api/profiles/${profile.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    }).catch(() => {
      // graceful offline fallback
    });
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

/**
 * Save profile to local storage only without network call
 */
function saveProfileLocally(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${profile.id}`, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile locally', e);
  }
}

/**
 * Load all 3 profiles for leaderboard & selector
 */
export function loadAllProfiles(): UserProfile[] {
  return [loadProfile('melaine'), loadProfile('jayden'), loadProfile('others')];
}

/**
 * Fetch all profiles from server (ensuring latest cloud progress on any new device)
 */
export async function syncProfilesFromServer(): Promise<{
  profiles: UserProfile[];
  activeProfileId?: 'melaine' | 'jayden' | 'others';
} | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.profiles) && data.profiles.length > 0) {
        data.profiles.forEach((p: UserProfile) => {
          saveProfileLocally(p);
        });
        if (data.activeProfileId) {
          try {
            localStorage.setItem(STORAGE_ACTIVE_KEY, data.activeProfileId);
          } catch {
            // ignore
          }
        }
        return {
          profiles: data.profiles,
          activeProfileId: data.activeProfileId,
        };
      }
    }
  } catch (err) {
    console.log('[Cloud Sync] Server not reachable or offline, running on local storage cache');
  }
  return null;
}

/**
 * Force manual full sync of local profiles up to the cloud server
 */
export async function forceUploadProfilesToServer(profiles: UserProfile[], activeId?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/profiles/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profiles, activeProfileId: activeId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Reset rankings (high scores, stars, streak, piggies defeated) across profiles
 */
export async function resetRankings(
  targetProfileId: 'all' | 'melaine' | 'jayden' | 'others' = 'all'
): Promise<UserProfile[]> {
  const all = loadAllProfiles();
  const updated = all.map((p) => {
    if (targetProfileId === 'all' || p.id === targetProfileId) {
      return {
        ...p,
        highScore: 0,
        totalScore: 0,
        piggiesDefeated: 0,
        highestStreak: 0,
        totalQuestionsAnswered: 0,
        totalQuestionsCorrect: 0,
        completedSets: [],
        starsEarned: 0,
      };
    }
    return p;
  });

  // 1. Update local storage
  updated.forEach((p) => saveProfileLocally(p));

  // 2. Sync reset to server
  try {
    await fetch('/api/rankings/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetProfileId }),
    });
  } catch {
    // offline fallback
  }

  return updated;
}

/**
 * Quick resource charger secret helper
 */
export function chargeResources(
  id: 'melaine' | 'jayden' | 'others',
  params: {
    addCoins?: number;
    setCoins?: number;
    addDiamonds?: number;
    setDiamonds?: number;
    addPowerUps?: number;
    resetCoinsToZero?: boolean;
    resetDiamondsToZero?: boolean;
    resetPowerUpsToZero?: boolean;
    resetAllToZero?: boolean;
    resetUnlockedHeroes?: boolean;
    unlockAllBirds?: boolean;
    unlockAllBackgrounds?: boolean;
    fillPowerUps?: number;
    completeAllSets?: boolean;
  }
): UserProfile {
  const p = loadProfile(id);

  if (params.resetAllToZero) {
    p.coins = 0;
    p.diamonds = 0;
    p.powerUps = {
      laser_scope: 0,
      king_sling: 0,
      super_seed: 0,
      speed_potion: 0,
      tnt_rain: 0,
    };
    p.activePowerUps = {};
  } else {
    if (params.resetCoinsToZero) {
      p.coins = 0;
    } else if (params.setCoins !== undefined) {
      p.coins = Math.max(0, params.setCoins);
    } else if (params.addCoins) {
      p.coins = Math.max(0, p.coins + params.addCoins);
    }

    if (params.resetDiamondsToZero) {
      p.diamonds = 0;
    } else if (params.setDiamonds !== undefined) {
      p.diamonds = Math.max(0, params.setDiamonds);
    } else if (params.addDiamonds) {
      p.diamonds = Math.max(0, p.diamonds + params.addDiamonds);
    }

    if (params.resetPowerUpsToZero) {
      p.powerUps = {
        laser_scope: 0,
        king_sling: 0,
        super_seed: 0,
        speed_potion: 0,
        tnt_rain: 0,
      };
      p.activePowerUps = {};
    } else if (params.addPowerUps) {
      const add = params.addPowerUps;
      p.powerUps = {
        laser_scope: (p.powerUps.laser_scope || 0) + add,
        king_sling: (p.powerUps.king_sling || 0) + add,
        super_seed: (p.powerUps.super_seed || 0) + add,
        speed_potion: (p.powerUps.speed_potion || 0) + add,
        tnt_rain: (p.powerUps.tnt_rain || 0) + add,
      };
    }
  }

  if (params.resetUnlockedHeroes) {
    p.unlockedBirds = ['red'];
    p.selectedBird = 'red';
    p.unlockedBackgrounds = ['green_hills'];
    p.selectedBackground = 'green_hills';
  }
  if (params.unlockAllBirds) {
    p.unlockedBirds = [
      'red',
      'chuck',
      'bomb',
      'blues',
      'matilda',
      'terence',
      'hal',
      'stella',
      'mighty_eagle',
    ];
  }
  if (params.unlockAllBackgrounds) {
    p.unlockedBackgrounds = [
      'green_hills',
      'night_sky',
      'sunset_beach',
      'volcano_fortress',
      'cyber_space',
    ];
  }
  if (params.fillPowerUps) {
    const count = params.fillPowerUps;
    p.powerUps = {
      laser_scope: Math.max(p.powerUps.laser_scope || 0, count),
      king_sling: Math.max(p.powerUps.king_sling || 0, count),
      super_seed: Math.max(p.powerUps.super_seed || 0, count),
      speed_potion: Math.max(p.powerUps.speed_potion || 0, count),
      tnt_rain: Math.max(p.powerUps.tnt_rain || 0, count),
    };
  }
  if (params.completeAllSets) {
    // Mark typical set IDs as completed
    const allKnownSets = [
      'l1-set-1', 'l1-set-2', 'l1-set-3', 'l1-set-4', 'l1-set-5', 'l1-set-6', 'l1-set-7', 'l1-set-8', 'l1-set-master',
      'l2-set-1', 'l2-set-2', 'l2-set-3', 'l2-set-4', 'l2-set-5', 'l2-set-6', 'l2-set-7', 'l2-set-8', 'l2-set-master',
      'l4-set-1', 'l4-set-2', 'l4-set-3', 'l4-set-4', 'l4-set-5', 'l4-set-6', 'l4-set-7', 'l4-set-8', 'l4-set-master',
      'l5-set-1', 'l5-set-2', 'l5-set-3', 'l5-set-4', 'l5-set-5', 'l5-set-6', 'l5-set-7', 'l5-set-8', 'l5-set-master',
      'l8-set-1', 'l8-set-2', 'l8-set-3', 'l8-set-4', 'l8-set-5', 'l8-set-6', 'l8-set-7', 'l8-set-8', 'l8-set-master',
    ];
    p.completedSets = Array.from(new Set([...p.completedSets, ...allKnownSets]));
  }

  saveProfile(p);
  return p;
}
