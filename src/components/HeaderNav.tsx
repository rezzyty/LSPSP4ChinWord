import React from 'react';
import { Volume2, VolumeX, Crosshair, BookOpen, Sparkles } from 'lucide-react';
import { ChineseDialect } from '../utils/speech';

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
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-amber-950/90 backdrop-blur-md border-b-2 border-amber-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl sm:text-2xl">🎯</span>
          <span className="text-lg sm:text-xl font-black font-serif tracking-tight text-yellow-400 whitespace-nowrap">
            憤怒鳥中文彈弓大作戰
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
          <button
            onClick={() => onViewChange('quiz')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'quiz' ? 'text-yellow-400 border-b-2 border-yellow-400 pb-0.5' : 'text-amber-200 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{activeLessonTitle}·挑戰賽</span>
          </button>

          <button
            onClick={() => onViewChange('codex')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'codex' ? 'text-yellow-400 border-b-2 border-yellow-400 pb-0.5' : 'text-amber-200 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>字詞字典</span>
          </button>

          <button
            onClick={onOpenMiniGame}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              hasCompletedAtLeastOneSet ? 'text-amber-200 hover:text-yellow-300' : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Crosshair className={`w-4 h-4 ${hasCompletedAtLeastOneSet ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>自由彈弓靶場</span>
            {!hasCompletedAtLeastOneSet && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-800 text-yellow-300 text-[10px] rounded-md font-mono border border-amber-600">
                🔒 需完成1組
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dialect Switcher (粵語 / 普通話) */}
          <button
            onClick={onToggleDialect}
            className="px-2.5 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 border border-amber-700 text-xs font-bold text-amber-200 transition-colors whitespace-nowrap"
            title="切換發音語言"
          >
            🗣️ {dialect === 'zh-HK' ? '粵語發音' : '普通話發音'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-amber-900 hover:bg-amber-800 border border-amber-700 text-amber-200 transition-colors"
            title={isMuted ? '取消靜音' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
          </button>

          {/* Quick Play Target Button for Mobile */}
          <button
            onClick={onOpenMiniGame}
            className="md:hidden p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            title="自由彈弓靶場"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
