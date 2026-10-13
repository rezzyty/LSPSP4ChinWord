import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/soundEffects';
import { speakChinese, ChineseDialect } from '../utils/speech';
import { Question, VocabularyWord } from '../types/quiz';
import {
  Trophy,
  Star,
  RotateCcw,
  Crosshair,
  Award,
  BookOpen,
  Volume2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface ResultModalProps {
  score: number;
  totalQuestions: number;
  correctCount: number;
  piggiesDefeated: number;
  wrongQuestions: { question: Question; userAnswer: string }[];
  vocabularies?: VocabularyWord[];
  dialect?: ChineseDialect;
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
  vocabularies = [],
  dialect = 'zh-HK',
  onRestartSession,
  onOpenMiniGame,
  onSwitchToCodex,
}) => {
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

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

  const handlePronounce = async (word: string) => {
    setPlayingWord(word);
    await speakChinese(word, dialect);
    setPlayingWord(null);
  };

  // Find vocabulary details for each wrong question
  const enhancedWrongQuestions = wrongQuestions.map((item) => {
    const vocab = vocabularies.find((v) => v.word === item.question.answer);
    return {
      ...item,
      vocab,
      definition: vocab?.definition || item.question.explanation,
      pinyin: vocab?.pinyin || '',
      partOfSpeech: vocab?.partOfSpeech || '詞語',
      collocations: vocab?.collocations || [],
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-5 sm:p-7 border-4 border-amber-400 shadow-2xl animate-scaleUp my-6 max-h-[92vh] flex flex-col">
        {/* ================= VIEW 1: 錯題溫習與反思視窗 (Mistake Review View) ================= */}
        {isReviewOpen ? (
          <div className="flex flex-col h-full min-h-0">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsReviewOpen(false)}
                  className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="返回成績榜"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">返回成績</span>
                </button>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-rose-600" />
                    <span>錯題溫習與詞義反思</span>
                  </h3>
                  <p className="text-xs text-amber-800 font-semibold">
                    本輪共有 {wrongQuestions.length} 個題目需要加強，請仔細閱讀詞語正確定義與語境用法！
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-bold text-xs border border-rose-300 shrink-0">
                {wrongQuestions.length} 題待複習
              </span>
            </div>

            {/* Scrollable Mistake Cards List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 custom-scrollbar pr-1 min-h-0">
              {enhancedWrongQuestions.length === 0 ? (
                <div className="text-center py-12 bg-white/80 rounded-2xl border-2 border-emerald-200 p-6 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-emerald-900">
                    太棒了！本輪全對零錯題！
                  </h4>
                  <p className="text-xs text-emerald-700 font-medium max-w-md mx-auto">
                    您已完全掌握本套練習的所有重點字詞，沒有任何做錯的題目！可以前往自由靶場或挑戰其他套題！
                  </p>
                </div>
              ) : (
                enhancedWrongQuestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 bg-white/95 rounded-2xl border-2 border-rose-200 shadow-sm space-y-3 transition-all hover:border-amber-400"
                  >
                    {/* Top Row: Word, Pinyin, Tag & Audio Pronunciation */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-amber-950 font-serif tracking-tight">
                          {item.question.answer}
                        </span>
                        {item.pinyin && (
                          <span className="text-xs sm:text-sm font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-200 font-mono">
                            {item.pinyin}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          {item.partOfSpeech}
                        </span>
                      </div>

                      {/* Pronounce Button */}
                      <button
                        onClick={() => handlePronounce(item.question.answer)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          playingWord === item.question.answer
                            ? 'bg-amber-600 text-white animate-pulse'
                            : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                        }`}
                        title="點擊朗讀此詞語"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{dialect === 'zh-HK' ? '粵語朗讀' : '國語朗讀'}</span>
                      </button>
                    </div>

                    {/* Word Definition (Core Requirement) */}
                    <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200/90 text-xs sm:text-sm space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>【正確定義與釋義】</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium pl-5">
                        {item.definition}
                      </p>
                    </div>

                    {/* Question Sentence Context */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-slate-500 font-bold block text-[11px]">
                        題目語境：
                      </span>
                      <p className="text-slate-800 font-serif leading-relaxed text-sm">
                        {item.question.sentence.split('______').map((part, pIdx, arr) => (
                          <React.Fragment key={pIdx}>
                            {part}
                            {pIdx < arr.length - 1 && (
                              <span className="inline-block mx-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black border border-emerald-300">
                                {item.question.answer}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>

                    {/* Common Collocations (if available) */}
                    {item.collocations && item.collocations.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                        <span className="text-slate-500 font-bold text-[11px]">
                          常考搭配：
                        </span>
                        {item.collocations.map((col, cIdx) => (
                          <span
                            key={cIdx}
                            className="bg-orange-100/80 text-amber-900 font-medium px-2 py-0.5 rounded-md text-[11px] border border-amber-200"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions inside Review View */}
            <div className="pt-4 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回成績榜</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onRestartSession}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs border-b-2 border-amber-700 flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重練此題組</span>
                </button>

                <button
                  onClick={onSwitchToCodex}
                  className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 rounded-xl font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>課文生字簿</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: 成績排行榜 (Default Result Scorecard) ================= */
          <div className="flex flex-col h-full min-h-0">
            {/* Top Trophy Banner */}
            <div className="text-center space-y-2 shrink-0">
              <div className="inline-flex p-3 sm:p-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 shadow-lg border-2 border-yellow-200">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-serif">
                {percentage === 100
                  ? '🎉 完美通關！神級憤怒鳥！'
                  : percentage >= 80
                  ? '🌟 大獲全勝！搗蛋豬落荒而逃！'
                  : '💪 戰績斐然！再接再厲！'}
              </h2>

              {/* Stars display */}
              <div className="flex items-center justify-center gap-2.5 py-1">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-9 h-9 sm:w-11 sm:h-11 transition-transform duration-500 ${
                      s <= stars
                        ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md animate-bounce'
                        : 'text-amber-200 fill-amber-100'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-amber-800">
                四年級中文詞語挑戰已完成！答對率：
                <span className="font-bold font-mono text-base ml-1">{percentage}%</span>
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 my-4 text-center shrink-0">
              <div className="p-2.5 sm:p-3 bg-white/90 rounded-2xl border border-amber-200 shadow-xs">
                <span className="block text-[11px] font-bold text-amber-700">總得分</span>
                <span className="text-xl sm:text-2xl font-black text-amber-900 font-mono">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 sm:p-3 bg-white/90 rounded-2xl border border-amber-200 shadow-xs">
                <span className="block text-[11px] font-bold text-emerald-700">正確題數</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                  {correctCount} / {totalQuestions}
                </span>
              </div>
              <div className="p-2.5 sm:p-3 bg-white/90 rounded-2xl border border-amber-200 shadow-xs">
                <span className="block text-[11px] font-bold text-orange-700">消滅搗蛋豬</span>
                <span className="text-xl sm:text-2xl font-black text-orange-700 font-mono">
                  {piggiesDefeated} 隻
                </span>
              </div>
            </div>

            {/* Mistake Reminder Callout Banner */}
            {wrongQuestions.length > 0 ? (
              <div className="p-3 bg-rose-50/90 rounded-2xl border-2 border-rose-200 flex items-center justify-between gap-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {wrongQuestions.length}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-rose-900">
                      本輪有 {wrongQuestions.length} 道題目需要加強溫習
                    </h5>
                    <p className="text-[11px] text-rose-700">
                      點擊右側「錯題溫習」按鈕，快速查閱全部錯誤詞語與精準定義！
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsReviewOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-transform hover:scale-105 shrink-0 flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>進入錯題溫習</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 mb-4 text-emerald-800 text-xs font-bold shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>太出色了！本輪測驗全部答對，沒有任何錯題！</span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 shrink-0">
              {/* Highlighted Button: 錯題溫習 (Review Mistakes) */}
              <button
                onClick={() => setIsReviewOpen(true)}
                className={`py-3 px-4 font-black text-sm rounded-2xl shadow-md border-b-4 flex items-center justify-center gap-2 transition-all ${
                  wrongQuestions.length > 0
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700 active:translate-y-1 active:border-b-0'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {wrongQuestions.length > 0
                    ? `📝 錯題溫習（共 ${wrongQuestions.length} 題）`
                    : '📝 錯題溫習（全對零錯題）'}
                </span>
              </button>

              {/* Restart / Shuffle */}
              <button
                onClick={onRestartSession}
                className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow-md border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重新打亂題序再來一局！</span>
              </button>

              {/* Free Slingshot Shooting Range */}
              <button
                onClick={onOpenMiniGame}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 transition-all"
              >
                <Crosshair className="w-4 h-4" />
                <span>進入自由彈弓打豬靶場</span>
              </button>

              {/* Complete Vocabulary Codex */}
              <button
                onClick={onSwitchToCodex}
                className="py-3 px-4 bg-white hover:bg-amber-100 text-amber-900 font-bold text-sm rounded-2xl border-2 border-amber-300 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>翻閱完整課文字詞簿</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
