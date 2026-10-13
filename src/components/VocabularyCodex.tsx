import React, { useState } from 'react';
import { VocabularyWord } from '../types/quiz';
import { speakChinese, ChineseDialect } from '../utils/speech';
import { Volume2, BookOpen, Search, BookmarkCheck, Check } from 'lucide-react';

interface VocabularyCodexProps {
  vocabularies: VocabularyWord[];
  dialect: ChineseDialect;
  lessonTitle: string;
}

export const VocabularyCodex: React.FC<VocabularyCodexProps> = ({
  vocabularies,
  dialect,
  lessonTitle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  const selectedWord = vocabularies.find((v) => v.id === selectedWordId) || vocabularies[0] || null;

  const filtered = vocabularies.filter(
    (v) =>
      v.word.includes(searchTerm) ||
      v.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.definition.includes(searchTerm)
  );

  const handlePlayAudio = (text: string) => {
    speakChinese(text, dialect);
  };

  const handleCopyWord = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-950 font-serif">
              {lessonTitle} · 重點字詞溫習簿
            </h2>
            <p className="text-xs text-amber-800/80 font-medium">
              喇沙小學四年級重點考核字詞（共 {vocabularies.length} 個），支援粵語與普通話真人發音
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋字詞、拼音或解釋..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-amber-50/70 border border-amber-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-amber-950 placeholder-amber-400"
          />
        </div>
      </div>

      {/* Two-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Word Grid / Chips */}
        <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filtered.map((item) => {
            const isSelected = selectedWord?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedWordId(item.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-101'
                    : 'bg-amber-50/60 hover:bg-amber-100/70 border-amber-200/80 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black font-serif">{item.word}</span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-amber-100' : 'text-amber-700'}`}>
                      {item.pinyin}
                    </span>
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-amber-200' : 'text-amber-600'}`}>
                      {item.partOfSpeech}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.isNew && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-amber-400 text-amber-950' : 'bg-red-500 text-white'}`}>
                      新增
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(item.word);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-white text-amber-800 hover:bg-amber-200'
                    }`}
                    title="朗讀此字詞"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-amber-600 font-medium">
              沒有找到符合「{searchTerm}」的詞語
            </div>
          )}
        </div>

        {/* Right Column: Detailed Card Focus */}
        <div className="lg:col-span-7">
          {selectedWord ? (
            <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-50 rounded-2xl p-6 sm:p-7 border-2 border-amber-200 flex flex-col justify-between shadow-sm">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-4xl sm:text-5xl font-black text-amber-950 font-serif">
                        {selectedWord.word}
                      </h3>
                      <button
                        onClick={() => handlePlayAudio(selectedWord.word)}
                        className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                        title="朗讀發音"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCopyWord(selectedWord.word)}
                        className="p-2.5 rounded-2xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-xs transition-colors"
                        title="複製字詞"
                      >
                        {copiedWord === selectedWord.word ? (
                          <Check className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <BookmarkCheck className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
                        漢語拼音：{selectedWord.pinyin}
                      </span>
                      <span className="font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
                        詞性：{selectedWord.partOfSpeech}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Definition */}
                <div className="p-4 bg-white/90 rounded-xl border border-amber-200 shadow-xs">
                  <span className="block text-xs font-bold text-amber-700 mb-1">
                    詳細解釋：
                  </span>
                  <p className="text-base text-amber-950 font-medium leading-relaxed">
                    {selectedWord.definition}
                  </p>
                </div>

                {/* Common Collocations */}
                {selectedWord.collocations && selectedWord.collocations.length > 0 && (
                  <div className="p-4 bg-white/90 rounded-xl border border-amber-200 shadow-xs">
                    <span className="block text-xs font-bold text-amber-700 mb-2">
                      常見詞語搭配（考試重點）：
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedWord.collocations.map((c, i) => (
                        <span
                          key={i}
                          onClick={() => handlePlayAudio(c)}
                          className="cursor-pointer px-3 py-1 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                          title="點擊聽發音"
                        >
                          <span>{c}</span>
                          <Volume2 className="w-3 h-3 text-amber-700" />
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example Sentence */}
                <div className="p-4 bg-amber-100/70 rounded-xl border border-amber-200 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-800">
                      課文與語境例句：
                    </span>
                    <button
                      onClick={() => handlePlayAudio(selectedWord.example)}
                      className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> 朗讀例句
                    </button>
                  </div>
                  <p className="text-base text-amber-950 font-serif leading-relaxed">
                    {selectedWord.example}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Quiz Button */}
              <div className="mt-6 pt-4 border-t border-amber-200/80 flex items-center justify-between text-xs text-amber-800">
                <span>💡 熟悉字詞的用法是答對填充題的關鍵！</span>
                <span className="font-semibold text-amber-700">小四中文實戰</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-amber-700 font-medium">
              請從左側點選詞語查看詳細內容
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
