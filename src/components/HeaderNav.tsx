import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Crosshair,
  BookOpen,
  Sparkles,
  Trophy,
  ShoppingBag,
  Users,
  KeyRound
} from 'lucide-react';
import { ChineseDialect } from '../utils/speech';
import { UserProfile } from '../types/profile';

interface HeaderNavProps {
  currentView: 'quiz' | 'codex';
  onViewChange: (view: 'quiz' | 'codex') => void;
  onOpenMiniGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  dialect: ChineseDialect;
  onToggleDialect: () => void;
  activeLessonTitle: string;
  hasCompletedAtLeastOneSet: boolean;
  currentProfile: UserProfile;
  onOpenProfileSwitcher: () => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
  onOpenSecretCharger: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onViewChange,
  onOpenMiniGame,
  isMuted,
  onToggleMute,
  dialect,
  onToggleDialect,
  activeLessonTitle,
  hasCompletedAtLeastOneSet,
  currentProfile,
  onOpenProfileSwitcher,
  onOpenLeaderboard,
  onOpenShop,
  onOpenSecretCharger,
}) => {
  const [easterEggClicks, setEasterEggClicks] = useState(0);

  const handleTitleClick = () => {
    const next = easterEggClicks + 1;
    setEasterEggClicks(next);
    if (next >= 3) {
      setEasterEggClicks(0);
      onOpenSecretCharger();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-amber-950/95 backdrop-blur-md border-b-2 border-amber-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Title with Easter Egg Secret Trigger */}
        <div
          onClick={handleTitleClick}
          className="flex items-center gap-2 shrink-0 cursor-pointer select-none group"
          title="點擊 3 次開啟神秘終端機充值"
        >
          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🎯</span>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black font-serif tracking-tight text-yellow-400 whitespace-nowrap">
              憤怒鳥中文彈弓大作戰
            </span>
            <span className="hidden sm:inline text-[10px] text-amber-300 font-mono">
              喇沙小學小四中文科 · 專屬學習平台
            </span>
          </div>
        </div>

        {/* Center Nav: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs xl:text-sm font-bold">
          <button
            onClick={() => onViewChange('quiz')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1 py-1 ${
              currentView === 'quiz'
                ? 'text-yellow-400 border-b-2 border-yellow-400 pb-0.5'
                : 'text-amber-200 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{activeLessonTitle}·挑戰</span>
          </button>

          <button
            onClick={() => onViewChange('codex')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1 py-1 ${
              currentView === 'codex'
                ? 'text-yellow-400 border-b-2 border-yellow-400 pb-0.5'
                : 'text-amber-200 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>字詞字典</span>
          </button>

          <button
            onClick={onOpenMiniGame}
            className={`transition-colors whitespace-nowrap flex items-center gap-1 py-1 ${
              hasCompletedAtLeastOneSet
                ? 'text-amber-200 hover:text-yellow-300'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Crosshair
              className={`w-4 h-4 ${hasCompletedAtLeastOneSet ? 'text-emerald-400' : 'text-amber-400'}`}
            />
            <span>自由彈弓靶場</span>
            {!hasCompletedAtLeastOneSet && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-800 text-yellow-300 text-[10px] rounded-md font-mono border border-amber-600">
                🔒需完1組
              </span>
            )}
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="text-amber-200 hover:text-yellow-300 transition-colors whitespace-nowrap flex items-center gap-1 py-1"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>實時排行榜</span>
          </button>

          <button
            onClick={onOpenShop}
            className="text-amber-200 hover:text-yellow-300 transition-colors whitespace-nowrap flex items-center gap-1 py-1"
          >
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            <span>獎勵裝備庫</span>
          </button>
        </nav>

        {/* Right Area: Profile Bar + Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Profile Switcher Pill */}
          <button
            onClick={onOpenProfileSwitcher}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/90 hover:bg-amber-800 border border-amber-600 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            title="點擊切換學員檔案 (Melaine / Jayden / Others)"
          >
            <span className="text-base">{currentProfile.avatar}</span>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-amber-200 leading-none">
                {currentProfile.name}
              </div>
              <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                <span>🪙{currentProfile.coins}</span>
                <span>💎{currentProfile.diamonds}</span>
              </div>
            </div>
            <Users className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
          </button>

          {/* Quick Shop Button (Mobile / Tablet) */}
          <button
            onClick={onOpenShop}
            className="p-2 rounded-xl bg-orange-600/90 hover:bg-orange-500 text-white transition-colors cursor-pointer"
            title="獎勵裝備庫"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Quick Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="p-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-yellow-300 border border-amber-600 transition-colors cursor-pointer"
            title="實時排行榜"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Secret Charger Quick Trigger */}
          <button
            onClick={onOpenSecretCharger}
            className="p-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-yellow-400 border border-indigo-700 transition-colors cursor-pointer"
            title="秘密資源充值器"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* Dialect Switcher (粵語 / 普通話) */}
          <button
            onClick={onToggleDialect}
            className="px-2 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 border border-amber-700 text-xs font-bold text-amber-200 transition-colors whitespace-nowrap cursor-pointer"
            title="切換發音語言"
          >
            {dialect === 'zh-HK' ? '🗣️ 粵語' : '🗣️ 國語'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-amber-900 hover:bg-amber-800 border border-amber-700 text-amber-200 transition-colors cursor-pointer"
            title={isMuted ? '取消靜音' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
