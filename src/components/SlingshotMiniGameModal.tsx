import React, { useState } from 'react';
import { AngryBirdsSlingshotCanvas } from './AngryBirdsSlingshotCanvas';
import { BirdType } from '../types/quiz';
import { BIRDS } from '../data/lessonsData';
import { X, RotateCcw, Sparkles, Award } from 'lucide-react';

interface SlingshotMiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedScore: number;
}

export const SlingshotMiniGameModal: React.FC<SlingshotMiniGameModalProps> = ({
  isOpen,
  onClose,
  earnedScore,
}) => {
  const [activeBird, setActiveBird] = useState<BirdType>('red');
  const [miniScore, setMiniScore] = useState(0);
  const [resetKey, setResetKey] = useState(1);

  if (!isOpen) return null;

  const currentBirdData = BIRDS.find((b) => b.id === activeBird) || BIRDS[0];

  const handlePiggyDefeated = (pts: number) => {
    setMiniScore((prev) => prev + pts);
  };

  const handleResetStage = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-amber-900 rounded-3xl p-5 sm:p-7 border-4 border-amber-400 shadow-2xl text-white my-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-amber-950 font-black shadow-md flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>自由彈弓獎勵靶場</span>
            </div>
            <span className="hidden sm:inline text-xs text-amber-200">
              用做題目賺取的分數，盡情發射擊倒所有搗蛋豬！
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-800/80 rounded-xl border border-amber-600 text-xs">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>答題累積得分：{earnedScore.toLocaleString()}</span>
              <span className="text-amber-400 font-bold">| 本局得分：+{miniScore.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-amber-800 hover:bg-amber-700 text-white flex items-center justify-center border border-amber-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Interactive Canvas Stage */}
        <div key={resetKey} className="w-full">
          <AngryBirdsSlingshotCanvas
            activeBird={activeBird}
            onBirdChange={setActiveBird}
            onPiggyDefeated={handlePiggyDefeated}
            interactive={true}
            compact={false}
          />
        </div>

        {/* Bird Details and Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-950/70 rounded-2xl border border-amber-700/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-md ring-2 ring-white/30"
              style={{ backgroundColor: currentBirdData.color }}
            >
              {currentBirdData.id === 'red' ? '🔴' : currentBirdData.id === 'chuck' ? '🟡' : currentBirdData.id === 'bomb' ? '💣' : currentBirdData.id === 'blues' ? '🔷' : '🥚'}
            </div>
            <div>
              <div className="font-extrabold text-sm text-yellow-300">
                {currentBirdData.nameZh}
              </div>
              <div className="text-xs text-amber-200">
                {currentBirdData.specialSkill}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetStage}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-bold text-xs border border-amber-500 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重建要塞重玩</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
            >
              返回詞語練習
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
