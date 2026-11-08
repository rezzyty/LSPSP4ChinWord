import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'profiles.json');

// Default initial profiles
const DEFAULT_PROFILES = [
  {
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
  {
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
  {
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
];

function loadServerData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading server data:', err);
  }

  const initial = {
    profiles: DEFAULT_PROFILES,
    activeProfileId: 'melaine',
    updatedAt: Date.now(),
  };
  saveServerData(initial);
  return initial;
}

function saveServerData(data: { profiles: any[]; activeProfileId: string; updatedAt?: number }) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.updatedAt = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server data:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  // API 1: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // API 2: Get all profiles & activeProfileId (Cross-Device Cloud Load)
  app.get('/api/profiles', (req, res) => {
    const data = loadServerData();
    res.json(data);
  });

  // API 3: Auto-Save / Update single profile
  app.post('/api/profiles/:id', (req, res) => {
    const { id } = req.params;
    const profileUpdate = req.body;
    if (!profileUpdate || typeof profileUpdate !== 'object') {
      return res.status(400).json({ error: 'Invalid profile data' });
    }

    const data = loadServerData();
    let found = false;
    data.profiles = data.profiles.map((p: any) => {
      if (p.id === id) {
        found = true;
        return { ...p, ...profileUpdate, id };
      }
      return p;
    });

    if (!found) {
      data.profiles.push({ ...profileUpdate, id });
    }

    saveServerData(data);
    res.json({ success: true, profile: profileUpdate });
  });

  // API 4: Sync all profiles in batch
  app.post('/api/profiles/sync', (req, res) => {
    const { profiles, activeProfileId } = req.body;
    if (!Array.isArray(profiles)) {
      return res.status(400).json({ error: 'profiles must be an array' });
    }

    const data = loadServerData();
    data.profiles = profiles;
    if (activeProfileId) {
      data.activeProfileId = activeProfileId;
    }
    saveServerData(data);
    res.json({ success: true, count: profiles.length });
  });

  // API 5: Set active profile ID
  app.post('/api/profiles/active', (req, res) => {
    const { activeProfileId } = req.body;
    if (!activeProfileId) {
      return res.status(400).json({ error: 'activeProfileId required' });
    }
    const data = loadServerData();
    data.activeProfileId = activeProfileId;
    saveServerData(data);
    res.json({ success: true, activeProfileId });
  });

  // API 6: Reset rankings across profiles (or for single profile)
  app.post('/api/rankings/reset', (req, res) => {
    const { targetProfileId } = req.body; // optional: 'melaine' | 'jayden' | 'others' | 'all'
    const data = loadServerData();

    data.profiles = data.profiles.map((p: any) => {
      if (!targetProfileId || targetProfileId === 'all' || p.id === targetProfileId) {
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

    saveServerData(data);
    res.json({ success: true, profiles: data.profiles });
  });

  // API 7: Hard reset all data to default
  app.post('/api/profiles/reset-all', (req, res) => {
    const initial = {
      profiles: DEFAULT_PROFILES,
      activeProfileId: 'melaine',
      updatedAt: Date.now(),
    };
    saveServerData(initial);
    res.json({ success: true, profiles: initial.profiles });
  });

  // Vite Integration:
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cross-Device Cloud Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
