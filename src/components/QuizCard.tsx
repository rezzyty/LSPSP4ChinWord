import React, { useState } from 'react';
import { Question } from '../types/quiz';
import { soundEffects } from '../utils/soundEffects';
import { speakChinese, ChineseDialect } from '../utils/speech';
import { Volume2, Sparkles, CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onAnswerCorrect: () => void;
  onAnswerWrong: () => void;
  onNextQuestion: () => void;
  dialect: ChineseDialect;
  isLastQuestion: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onAnswerCorrect,
  onAnswerWrong,
  onNextQuestion,
  dialect,
  isLastQuestion,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Play audio for the sentence
  const handleReadSentence = async () => {
    setIsSpeaking(true);
    await speakChinese(question.sentence, dialect);
    setIsSpeaking(false);
  };

  // Play audio for a specific vocabulary word
  const handleReadWord = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakChinese(word, dialect);
  };

  const handleSelectOption = (word: string) => {
    if (isCorrect === true) return; // Already solved correctly

    setSelectedWord(word);
    if (word === question.answer) {
      setIsCorrect(true);
      soundEffects.playCorrect();
      onAnswerCorrect();
    } else {
      setIsCorrect(false);
      soundEffects.playWrong();
      onAnswerWrong();
    }
  };

  // Replace blank with chosen word if correct or selected
  const renderSentence = () => {
    const parts = question.sentence.split('______');
    return (
      <div className="text-xl sm:text-2xl lg:text-3xl font-black leading-relaxed tracking-wide text-amber-950 font-serif">
        {parts[0]}
        <span
          className={`inline-flex items-center justify-center min-w-[6rem] sm:min-w-[8rem] px-4 py-1 mx-2 rounded-2xl border-3 font-black transition-all ${
            isCorrect === true
              ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-105 shadow-md animate-bounce'
              : isCorrect === false
              ? 'bg-rose-100 border-rose-500 text-rose-800 animate-shake'
              : selectedWord
              ? 'bg-amber-100 border-amber-400 text-amber-900'
              : 'bg-white/95 border-dashed border-amber-400 text-amber-500 hover:border-amber-600'
          }`}
        >
          {selectedWord || '______'}
        </span>
        {parts[1] || ''}
      </div>
    );
  };

  return (
    <div className="relative bg-white rounded-3xl p-4 sm:p-7 shadow-lg border-3 border-amber-200 flex flex-col justify-between h-full">
      <div>
        {/* Question Counter & Action Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-xs">
              第 {currentIndex + 1} / {totalQuestions} 題
            </span>
            {isCorrect === true && (
              <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 正確解答！+50 🪙
              </span>
            )}
          </div>

          {/* Read-aloud & Hint Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReadSentence}
              disabled={isSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs sm:text-sm border border-amber-200 transition-colors shadow-xs cursor-pointer active:scale-95"
              title="點擊朗讀題目句子"
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-600 animate-pulse' : 'text-amber-700'}`} />
              <span>朗讀句子</span>
            </button>

            {question.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl font-bold text-xs sm:text-sm border border-sky-200 transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>{showHint ? '隱藏提示' : '詞義提示'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Sentence Card with Large Clear Typography */}
        <div className="my-4 sm:my-5 p-5 sm:p-6 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 rounded-2xl border-2 border-amber-200/90 shadow-inner">
          {renderSentence()}
        </div>

        {/* Hint Banner if toggled */}
        {showHint && question.hint && (
          <div className="mb-4 p-3.5 bg-sky-50 border-l-4 border-sky-500 rounded-r-2xl text-sky-950 text-sm sm:text-base font-semibold leading-relaxed animate-fadeIn">
            💡 <span className="font-extrabold text-sky-800">四年級溫習指引：</span> {question.hint}
          </div>
        )}

        {/* Multiple Choice Options Grid (Large readable buttons for iPad Pro 13" and mobile touch) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-3 sm:my-4">
          {question.options.map((opt, idx) => {
            const isSelected = selectedWord === opt;
            const isThisCorrect = opt === question.answer;

            let btnClass = 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-300 text-amber-950';

            if (isCorrect === true && isThisCorrect) {
              btnClass = 'bg-emerald-500 border-emerald-600 text-white ring-4 ring-emerald-200 shadow-md scale-102';
            } else if (isSelected && isCorrect === false) {
              btnClass = 'bg-rose-500 border-rose-600 text-white animate-shake ring-4 ring-rose-200';
            } else if (isSelected) {
              btnClass = 'bg-amber-300 border-amber-500 text-amber-950';
            }

            return (
              <div key={`${opt}-${idx}`} className="relative group">
                <button
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full min-h-[58px] sm:min-h-[66px] lg:min-h-[72px] py-3.5 sm:py-4 px-3 rounded-2xl border-b-4 font-black text-xl sm:text-2xl lg:text-3xl transition-all shadow-sm active:translate-y-1 active:border-b-0 flex items-center justify-center cursor-pointer select-none ${btnClass}`}
                >
                  <span className="tracking-wide font-serif">{opt}</span>
                </button>

                {/* Pronounce single word icon button */}
                <button
                  onClick={(e) => handleReadWord(opt, e)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs text-xs opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                  title={`聽取「${opt}」發音`}
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Feedback on Correct Answer */}
      {isCorrect === true && (
        <div className="mt-2 p-3 sm:p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 shadow-xs animate-fadeIn flex items-center justify-between gap-3">
          <div className="space-y-0.5 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
              <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              <span>擊潰要塞搗蛋豬！(+1000 分)</span>
            </div>
            <p className="text-emerald-900/90 text-xs line-clamp-2">
              <span className="font-bold underline decoration-emerald-400">解析：</span>{' '}
              {question.explanation}
            </p>
          </div>

          <button
            onClick={onNextQuestion}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <span>{isLastQuestion ? '查看戰報' : '下一題'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Visual Feedback on Incorrect Answer */}
      {isCorrect === false && (
        <div className="mt-2 p-2.5 sm:p-3 bg-rose-50 rounded-2xl border-2 border-rose-300 shadow-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>砲彈偏離目標！仔細讀句子再選一次吧！</span>
          </div>
          <button
            onClick={() => {
              setSelectedWord(null);
              setIsCorrect(null);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            重新選擇
          </button>
        </div>
      )}
    </div>
  );
};
