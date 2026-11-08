import React, { useState } from 'react';
import { AngryBirdsSlingshotCanvas } from './AngryBirdsSlingshotCanvas';
import { BirdType } from '../types/quiz';
import { UserProfile, PowerUpId } from '../types/profile';
import { BIRDS } from '../data/birds';
import { BACKGROUND_THEMES } from '../data/rewardsData';
import { saveProfile } from '../utils/profileStorage';
import { X, RotateCcw, Sparkles, Award, Zap, Coins } from 'lucide-react';

interface SlingshotMiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedScore: number;
  currentProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const SlingshotMiniGameModal: React.FC<SlingshotMiniGameModalProps> = ({
  isOpen,
  onClose,
  earnedScore,
  currentProfile,
  onProfileUpdated,
}) => {
  const [activeBird, setActiveBird] = useState<BirdType>(currentProfile.selectedBird);
  const [miniScore, setMiniScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [resetKey, setResetKey] = useState(1);

  if (!isOpen) return null;

  const currentBirdData = BIRDS.find((b) => b.id === activeBird) || BIRDS[0];
  const currentBgData =
    BACKGROUND_THEMES.find((bg) => bg.id === currentProfile.selectedBackground) ||
    BACKGROUND_THEMES[0];

  const handlePiggyDefeated = (pts: number) => {
    setMiniScore((prev) => prev + pts);
    const addedCoins = 100;
    setCoinsEarned((c) => c + addedCoins);

    // Save coins & piggies defeated to profile
    const updated: UserProfile = {
      ...currentProfile,
      coins: currentProfile.coins + addedCoins,
      piggiesDefeated: currentProfile.piggiesDefeated + 1,
      totalScore: currentProfile.totalScore + pts,
      highScore: Math.max(currentProfile.highScore, earnedScore + miniScore + pts),
    };
    saveProfile(updated);
    onProfileUpdated(updated);
  };

  const handleResetStage = () => {
    setResetKey((prev) => prev + 1);
  };

  const handleTogglePowerUp = (id: PowerUpId) => {
    const isCurrentlyActive = !!currentProfile.activePowerUps[id];
    const updated: UserProfile = {
      ...currentProfile,
      activePowerUps: {
        ...currentProfile.activePowerUps,
        [id]: !isCurrentlyActive,
      },
    };
    saveProfile(updated);
    onProfileUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-amber-950 rounded-3xl p-4 sm:p-6 border-4 border-amber-400 shadow-2xl text-white my-auto flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500 text-amber-950 font-black shadow-md flex items-center gap-1.5">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm sm:text-base">自由彈弓獎勵靶場</span>
            </div>
            <span className="hidden md:inline text-xs text-amber-200">
              場景：{currentBgData.icon} {currentBgData.nameZh} ｜ 瞄準要塞承重支柱與 TNT，引發連鎖坍塌！
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-900/90 rounded-xl border border-amber-700 text-xs font-mono">
              <span className="text-yellow-400 font-bold">局分: +{miniScore.toLocaleString()}</span>
              <span className="text-amber-500">|</span>
              <span className="text-amber-300 font-bold">🪙 +{coinsEarned}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-amber-800 hover:bg-amber-700 text-white flex items-center justify-center border border-amber-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Interactive Canvas Stage */}
        <div key={resetKey} className="w-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-amber-500/50">
          <AngryBirdsSlingshotCanvas
            activeBird={activeBird}
            onBirdChange={setActiveBird}
            onPiggyDefeated={handlePiggyDefeated}
            interactive={true}
            compact={false}
            canvasHeight={360}
            theme={currentProfile.selectedBackground}
            activePowerUps={currentProfile.activePowerUps}
            onTogglePowerUp={handleTogglePowerUp}
            powerUpInventory={currentProfile.powerUps}
          />
        </div>

        {/* Character Quick Switcher & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-amber-900/70 rounded-2xl border border-amber-700/60">
          {/* Bird selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-200">切換出戰英雄:</span>
            {currentProfile.unlockedBirds.map((bId) => {
              const b = BIRDS.find((item) => item.id === bId);
              if (!b) return null;
              const isSelected = activeBird === bId;

              return (
                <button
                  key={bId}
                  onClick={() => setActiveBird(bId)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-2 ring-white/60'
                      : 'bg-black/30 hover:bg-black/50 text-white border border-white/20'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full inline-block shadow-2xs"
                    style={{ backgroundColor: b.color }}
                  />
                  <span>{b.nameZh.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetStage}
              className="flex items-center gap-1 px-3.5 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-bold text-xs border border-amber-500 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重建要塞</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer active:scale-95"
            >
              返回詞語練習
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
