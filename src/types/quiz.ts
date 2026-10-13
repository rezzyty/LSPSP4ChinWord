export type BirdType = 'red' | 'chuck' | 'bomb' | 'matilda' | 'blues';

export interface BirdInfo {
  id: BirdType;
  name: string;
  nameZh: string;
  color: string;
  specialSkill: string;
  dialogue: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  pinyin: string;
  partOfSpeech: string; // 動詞, 名詞, 量詞, 副詞, 成語/短語
  definition: string;
  example: string;
  collocations?: string[];
  isNew?: boolean; // 新增詞語
}

export interface Question {
  id: string;
  sentence: string; // contains blank `______`
  answer: string;
  options: string[]; // randomized
  hint?: string;
  explanation: string;
}

export interface QuestionSet {
  id: string;
  title: string;
  questions: Question[];
}

export interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  subtitle: string;
  grade: string;
  vocabularies: VocabularyWord[];
  questionSets: QuestionSet[];
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  highestStreak: number;
  piggiesDefeated: number;
  starsEarned: number;
  totalScore: number;
}
