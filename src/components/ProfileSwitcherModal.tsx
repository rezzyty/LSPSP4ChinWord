import React from 'react';
import { UserProfile } from '../types/profile';
import { Users, X, CheckCircle2, Trophy, Coins, Gem, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: 'melaine' | 'jayden' | 'others') => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-5 sm:p-7 border-4 border-amber-400 shadow-2xl animate-scaleUp my-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-amber-950 font-black shadow-md flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
                <span>切換學習檔案 (3 大學員角色)</span>
              </h3>
              <p className="text-xs text-amber-800 font-semibold">
                各自獨立保存做題進度、通關高分、金幣鑽石與解鎖的憤怒鳥角色！
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center border border-amber-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Profile Cards */}
        <div className="space-y-3 py-1">
          {profiles.map((p) => {
            const isSelected = p.id === activeProfileId;

            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProfile(p.id);
                  soundEffects.playCorrect();
                  onClose();
                }}
                className={`p-4 rounded-2xl border-3 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400'
                    : 'bg-white/90 border-amber-200 hover:border-amber-400 shadow-xs hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl p-2 bg-amber-50 rounded-2xl border border-amber-200 shadow-inner">
                    {p.avatar}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-amber-950 font-serif">
                        {p.name}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 使用中
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-amber-700">
                      {p.titleZh}
                    </div>

                    <div className="flex items-center gap-3 text-xs mt-1 text-slate-700 font-medium">
                      <span>🏆 最高分：<b className="text-amber-900 font-mono">{p.highScore.toLocaleString()}</b></span>
                      <span>🪙 <b className="text-amber-900 font-mono">{p.coins}</b></span>
                      <span>💎 <b className="text-sky-800 font-mono">{p.diamonds}</b></span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {isSelected ? '當前檔案' : '切換為此人'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-amber-200 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            確定返回
          </button>
        </div>
      </div>
    </div>
  );
};
