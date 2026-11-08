import React from 'react';
import { UserProfile } from '../types/profile';
import { Trophy, Medal, Star, Flame, Target, Award, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: 'melaine' | 'jayden' | 'others') => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
}) => {
  if (!isOpen) return null;

  // Sort profiles by highScore descending
  const sortedProfiles = [...profiles].sort((a, b) => b.highScore - a.highScore);

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: '🥇', label: '第 1 名', bg: 'bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-yellow-400' };
    if (index === 1) return { icon: '🥈', label: '第 2 名', bg: 'bg-slate-100 border-slate-300 text-slate-800' };
    if (index === 2) return { icon: '🥉', label: '第 3 名', bg: 'bg-orange-100 border-orange-300 text-orange-900' };
    return { icon: `#${index + 1}`, label: `第 ${index + 1} 名`, bg: 'bg-amber-50 text-amber-900' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-5 sm:p-7 border-4 border-amber-400 shadow-2xl animate-scaleUp my-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black shadow-md flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
                <span>喇沙小學 四年級 實時排行榜</span>
                <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-400 animate-pulse" />
              </h3>
              <p className="text-xs text-amber-800 font-semibold">
                實時統計三大學員檔案的最高得分、答題正確率與要塞突破記錄！
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

        {/* Real-time Profile Rankings List */}
        <div className="space-y-3 py-1">
          {sortedProfiles.map((p, idx) => {
            const badge = getRankBadge(idx);
            const isCurrent = p.id === activeProfileId;
            const accuracy =
              p.totalQuestionsAnswered > 0
                ? Math.round((p.totalQuestionsCorrect / p.totalQuestionsAnswered) * 100)
                : 0;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
                  isCurrent
                    ? 'bg-amber-100/90 border-amber-400 ring-3 ring-amber-300'
                    : 'bg-white/90 border-amber-200/80 hover:border-amber-300'
                }`}
              >
                {/* Left: Avatar, Rank & Name */}
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 border ${badge.bg}`}>
                    {badge.icon}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-1 bg-amber-50 rounded-xl border border-amber-200">
                      {p.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-black text-amber-950 font-serif">
                          {p.name}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
                            當前登入中
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-amber-700">
                        {p.titleZh}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle & Right: Real-time Stats & Quick Switch */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                      <span className="block text-[10px] font-bold text-amber-700">最高得分</span>
                      <span className="text-sm font-black text-amber-900 font-mono">
                        {p.highScore.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                      <span className="block text-[10px] font-bold text-emerald-700">正確率</span>
                      <span className="text-sm font-black text-emerald-800 font-mono">
                        {accuracy}%
                      </span>
                    </div>

                    <div className="bg-orange-50 px-2.5 py-1.5 rounded-xl border border-orange-200">
                      <span className="block text-[10px] font-bold text-orange-700">完成組數</span>
                      <span className="text-sm font-black text-orange-800 font-mono">
                        {p.completedSets.length} 組
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onSelectProfile(p.id);
                        soundEffects.playCorrect();
                        onClose();
                      }}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs transition-transform active:scale-95 shrink-0"
                    >
                      切換此人
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Banner */}
        <div className="p-3 bg-amber-100/70 rounded-2xl border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-600 shrink-0" />
            <span>答題連擊與通關每套練習題，即可賺取大量金幣 🪙 與鑽石 💎，衝擊排行榜首！</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shrink-0"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
