import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/soundEffects';
import { Question } from '../types/quiz';
import { Trophy, Star, RotateCcw, Crosshair, Award, ArrowRight, BookOpen } from 'lucide-react';

interface ResultModalProps {
  score: number;
  totalQuestions: number;
  correctCount: number;
  piggiesDefeated: number;
  wrongQuestions: { question: Question; userAnswer: string }[];
  onRestartSession: () => void;
  onOpenMiniGame: () => void;
  onSwitchToCodex: () => void;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  score,
  totalQuestions,
  correctCount,
  piggiesDefeated,
  wrongQuestions,
  onRestartSession,
  onOpenMiniGame,
  onSwitchToCodex,
}) => {
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const stars = percentage >= 85 ? 3 : percentage >= 60 ? 2 : 1;

  useEffect(() => {
    soundEffects.playFanfare();

    // Trigger celebratory confetti burst
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl animate-scaleUp my-8">
        {/* Top Trophy Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 shadow-lg border-2 border-yellow-200">
            <Trophy className="w-12 h-12" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-950 font-serif">
            {percentage === 100
              ? '🎉 完美通關！神級憤怒鳥！'
              : percentage >= 80
              ? '🌟 大獲全勝！搗蛋豬落荒而逃！'
              : '💪 戰績斐然！再接再厲！'}
          </h2>

          {/* Stars display */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-12 h-12 transition-transform duration-500 ${
                  s <= stars
                    ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md animate-bounce'
                    : 'text-amber-200 fill-amber-100'
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-semibold text-amber-800">
            四年級中文詞語挑戰已完成！答對率：{percentage}%
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6 text-center">
          <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200 shadow-xs">
            <span className="block text-xs font-bold text-amber-700">總得分</span>
            <span className="text-2xl font-black text-amber-900 font-mono">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200 shadow-xs">
            <span className="block text-xs font-bold text-emerald-700">正確題數</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {correctCount} / {totalQuestions}
            </span>
          </div>
          <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200 shadow-xs">
            <span className="block text-xs font-bold text-orange-700">消滅搗蛋豬</span>
            <span className="text-2xl font-black text-orange-700 font-mono">
              {piggiesDefeated} 隻
            </span>
          </div>
        </div>

        {/* Review of Wrong Questions if any */}
        {wrongQuestions.length > 0 && (
          <div className="my-5 p-4 bg-white/95 rounded-2xl border border-rose-200 shadow-xs max-h-56 overflow-y-auto custom-scrollbar">
            <h4 className="font-extrabold text-sm text-rose-800 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-rose-600" />
              <span>錯題加強溫習本（共 {wrongQuestions.length} 題）：</span>
            </h4>
            <div className="space-y-2 text-xs">
              {wrongQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-100 flex flex-col gap-1"
                >
                  <p className="font-medium text-slate-800 font-serif">
                    {item.question.sentence.replace('______', `【${item.question.answer}】`)}
                  </p>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-emerald-700 font-bold">
                      正確答案：{item.question.answer}
                    </span>
                    <span className="text-slate-500">
                      釋義：{item.question.explanation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <button
            onClick={onRestartSession}
            className="w-full sm:flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-base rounded-2xl shadow-lg border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>重新打亂題序再來一局！</span>
          </button>

          <button
            onClick={onOpenMiniGame}
            className="w-full sm:flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 transition-all"
          >
            <Crosshair className="w-5 h-5" />
            <span>進入自由彈弓打豬靶場</span>
          </button>

          <button
            onClick={onSwitchToCodex}
            className="w-full sm:w-auto py-3.5 px-4 bg-white hover:bg-amber-100 text-amber-900 font-bold text-sm rounded-2xl border-2 border-amber-300 shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>溫習字典</span>
          </button>
        </div>
      </div>
    </div>
  );
};
