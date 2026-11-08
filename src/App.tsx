/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LESSONS_DATA } from './data/lessonsData';
import { Question, BirdType } from './types/quiz';
import { UserProfile, ProfileId, PowerUpId } from './types/profile';
import {
  loadAllProfiles,
  saveProfile,
  getActiveProfileId,
  setActiveProfileId
} from './utils/profileStorage';
import { HeaderNav } from './components/HeaderNav';
import { AngryBirdsSlingshotCanvas } from './components/AngryBirdsSlingshotCanvas';
import { QuizCard } from './components/QuizCard';
import { VocabularyCodex } from './components/VocabularyCodex';
import { ResultModal } from './components/ResultModal';
import { SlingshotMiniGameModal } from './components/SlingshotMiniGameModal';
import { ProfileSwitcherModal } from './components/ProfileSwitcherModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ShopAndRewardsModal } from './components/ShopAndRewardsModal';
import { SecretChargerModal } from './components/SecretChargerModal';
import { soundEffects } from './utils/soundEffects';
import { ChineseDialect } from './utils/speech';
import {
  Shuffle,
  Trophy,
  Flame,
  Award,
  ChevronDown,
  Crosshair,
  Sparkles,
  BookOpen
} from 'lucide-react';

// Fisher-Yates array shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  // Profiles and user state
  const [activeProfileId, setActiveProfileIdState] = useState<ProfileId>(() => getActiveProfileId());
  const [profiles, setProfiles] = useState<UserProfile[]>(() => loadAllProfiles());

  const currentProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Modal visibility states
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isSecretChargerOpen, setIsSecretChargerOpen] = useState<boolean>(false);
  const [isMiniGameOpen, setIsMiniGameOpen] = useState<boolean>(false);
  const [showLockedAlert, setShowLockedAlert] = useState<boolean>(false);

  // Navigation & View state
  const [currentView, setCurrentView] = useState<'quiz' | 'codex'>('quiz');
  const [activeLessonId, setActiveLessonId] = useState<string>('lesson-1');
  const [activeSetId, setActiveSetId] = useState<string>('l1-set-1');

  // Slingshot & Bird state
  const [activeBird, setActiveBird] = useState<BirdType>(currentProfile.selectedBird);
  const [launchTrigger, setLaunchTrigger] = useState<number>(0);

  // Sync active bird whenever profile changes
  useEffect(() => {
    setActiveBird(currentProfile.selectedBird);
  }, [currentProfile.selectedBird, currentProfile.id]);

  // Sound & Dialect
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dialect, setDialect] = useState<ChineseDialect>('zh-HK');

  // Quiz execution state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [sessionSeed, setSessionSeed] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [piggiesDefeated, setPiggiesDefeated] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [wrongQuestions, setWrongQuestions] = useState<{ question: Question; userAnswer: string }[]>([]);

  // Track if current profile has completed at least 1 set
  const hasCompletedAtLeastOneSet = useMemo(() => {
    return currentProfile.completedSets.length > 0;
  }, [currentProfile.completedSets]);

  // Profile update handler
  const handleProfileUpdated = useCallback((updated: UserProfile) => {
    saveProfile(updated);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  // Profile switch handler
  const handleSwitchProfile = useCallback((id: ProfileId) => {
    setActiveProfileId(id);
    setActiveProfileIdState(id);
    const target = profiles.find((p) => p.id === id);
    if (target) {
      setActiveBird(target.selectedBird);
    }
  }, [profiles]);

  // Current Lesson data
  const currentLesson = useMemo(() => {
    return LESSONS_DATA.find((l) => l.id === activeLessonId) || LESSONS_DATA[0];
  }, [activeLessonId]);

  // Current Question Set
  const currentSet = useMemo(() => {
    return (
      currentLesson.questionSets.find((s) => s.id === activeSetId) ||
      currentLesson.questionSets[0]
    );
  }, [currentLesson, activeSetId]);

  // Session Questions: Shuffled questions AND shuffled answer choices per session
  const randomizedQuestions = useMemo(() => {
    const shuffledQuestions = shuffleArray(currentSet.questions);
    return shuffledQuestions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  }, [currentSet, sessionSeed]);

  const currentQuestion = randomizedQuestions[currentQuestionIndex] || randomizedQuestions[0];

  // Restart session with fresh randomized order
  const handleRestartSession = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSessionSeed((s) => s + 1);
    setScore(0);
    setStreak(0);
    setPiggiesDefeated(0);
    setWrongQuestions([]);
    setIsFinished(false);
  }, []);

  // Handle lesson change
  const handleLessonChange = (lessonId: string) => {
    setActiveLessonId(lessonId);
    const target = LESSONS_DATA.find((l) => l.id === lessonId);
    if (target && target.questionSets[0]) {
      setActiveSetId(target.questionSets[0].id);
    }
    handleRestartSession();
  };

  // Handle set change within current lesson
  const handleSetChange = (setId: string) => {
    setActiveSetId(setId);
    handleRestartSession();
  };

  // Handle correct answer
  const handleAnswerCorrect = () => {
    const pointsGained = 1000 + streak * 100;
    const newScore = score + pointsGained;
    const newStreak = streak + 1;

    setScore(newScore);
    setStreak((st) => {
      const next = st + 1;
      if (next > highestStreak) setHighestStreak(next);
      return next;
    });
    setPiggiesDefeated((p) => p + 1);

    // Reward coins & bonus diamond on 5+ streak milestone
    const coinsEarned = 50;
    const diamondEarned = newStreak % 5 === 0 ? 1 : 0;

    const updatedProfile: UserProfile = {
      ...currentProfile,
      coins: currentProfile.coins + coinsEarned,
      diamonds: currentProfile.diamonds + diamondEarned,
      totalQuestionsAnswered: currentProfile.totalQuestionsAnswered + 1,
      totalQuestionsCorrect: currentProfile.totalQuestionsCorrect + 1,
      piggiesDefeated: currentProfile.piggiesDefeated + 1,
      totalScore: currentProfile.totalScore + pointsGained,
      highScore: Math.max(currentProfile.highScore, newScore),
    };
    handleProfileUpdated(updatedProfile);

    // Fire slingshot
    setLaunchTrigger(Date.now());
  };

  // Handle wrong answer
  const handleAnswerWrong = () => {
    setStreak(0);
    if (currentQuestion) {
      setWrongQuestions((prev) => {
        if (!prev.some((w) => w.question.id === currentQuestion.id)) {
          return [...prev, { question: currentQuestion, userAnswer: '' }];
        }
        return prev;
      });
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      totalQuestionsAnswered: currentProfile.totalQuestionsAnswered + 1,
    };
    handleProfileUpdated(updatedProfile);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < randomizedQuestions.length) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setIsFinished(true);

      // Reward completion bonus to current profile
      const setCompletedId = `${activeLessonId}-${currentSet.id}`;
      const isAlreadyCompleted = currentProfile.completedSets.includes(setCompletedId);
      const newCompletedSets = isAlreadyCompleted
        ? currentProfile.completedSets
        : [...currentProfile.completedSets, setCompletedId];

      const completionCoins = 350;
      const completionDiamonds = 10;
      const completionStars = isAlreadyCompleted ? 0 : 3;

      const finalProfile: UserProfile = {
        ...currentProfile,
        coins: currentProfile.coins + completionCoins,
        diamonds: currentProfile.diamonds + completionDiamonds,
        starsEarned: currentProfile.starsEarned + completionStars,
        completedSets: newCompletedSets,
        highScore: Math.max(currentProfile.highScore, score),
      };
      handleProfileUpdated(finalProfile);
    }
  };

  // Open Mini Game with requirement check
  const handleOpenMiniGame = () => {
    if (!hasCompletedAtLeastOneSet) {
      setShowLockedAlert(true);
      return;
    }
    setIsMiniGameOpen(true);
  };

  // Sound mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  // Dialect toggle
  const handleToggleDialect = () => {
    setDialect((d) => (d === 'zh-HK' ? 'zh-CN' : 'zh-HK'));
  };

  // Toggle active power-up
  const handleTogglePowerUp = (id: PowerUpId) => {
    const isCurrentlyActive = !!currentProfile.activePowerUps[id];
    const updated: UserProfile = {
      ...currentProfile,
      activePowerUps: {
        ...currentProfile.activePowerUps,
        [id]: !isCurrentlyActive,
      },
    };
    handleProfileUpdated(updated);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-amber-100/60 font-sans selection:bg-amber-300 selection:text-amber-950"
      style={{
        backgroundImage: `radial-gradient(circle at 10% 20%, rgba(254, 240, 138, 0.35) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(186, 230, 253, 0.35) 0%, transparent 40%)`,
      }}
    >
      {/* Top Header with Profile, Coins, Diamonds & Actions */}
      <HeaderNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenMiniGame={handleOpenMiniGame}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        dialect={dialect}
        onToggleDialect={handleToggleDialect}
        activeLessonTitle={currentLesson.title}
        hasCompletedAtLeastOneSet={hasCompletedAtLeastOneSet}
        currentProfile={currentProfile}
        onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenSecretCharger={() => setIsSecretChargerOpen(true)}
      />

      {/* Main Content Area - Optimized for iPad Pro 13" and zero excessive scroll */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-3 sm:py-4 flex flex-col gap-3">
        {/* Compact Single-Row Toolbar (Lesson, Set, Seed, Mode) */}
        <div className="bg-white/95 rounded-2xl px-3 sm:px-4 py-2.5 shadow-sm border border-amber-200 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Lesson Selector & Exercise Set Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lesson selector */}
            <div className="relative">
              <select
                value={activeLessonId}
                onChange={(e) => handleLessonChange(e.target.value)}
                className="appearance-none bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm pl-3 pr-8 py-1.5 rounded-xl shadow-xs border-b-2 border-amber-700 cursor-pointer transition-colors focus:outline-hidden"
              >
                {LESSONS_DATA.map((l) => (
                  <option key={l.id} value={l.id} className="bg-white text-slate-900">
                    第 {l.lessonNumber} 課 · 《{l.title}》
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Exercise Set Dropdown (All 8 sets + Master) */}
            <div className="relative">
              <select
                value={currentSet.id}
                onChange={(e) => handleSetChange(e.target.value)}
                className="appearance-none bg-orange-100 hover:bg-orange-200 text-amber-950 font-bold text-xs sm:text-sm pl-3 pr-8 py-1.5 rounded-xl border border-amber-300 cursor-pointer transition-colors focus:outline-hidden"
              >
                {currentLesson.questionSets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-amber-800 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Total sets badge */}
            <span className="hidden md:inline-flex text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              全套共 {currentLesson.questionSets.length} 組練習題
            </span>
          </div>

          {/* Right: Randomizer & View Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartSession}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs border border-amber-300 transition-colors shadow-2xs cursor-pointer"
              title="重新打亂題目與選項順序"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-700" />
              <span>隨機題序 (第 {sessionSeed} 回)</span>
            </button>

            {/* View Switch Buttons */}
            <div className="flex items-center bg-amber-100/80 p-0.5 rounded-xl border border-amber-300">
              <button
                onClick={() => setCurrentView('quiz')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  currentView === 'quiz' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-900 hover:text-amber-950'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>闖關測驗</span>
              </button>
              <button
                onClick={() => setCurrentView('codex')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  currentView === 'codex' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-900 hover:text-amber-950'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>字詞簿</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- VIEW 1: NO-SCROLL INTEGRATED SPLIT-SCREEN QUIZ ARENA --- */}
        {currentView === 'quiz' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch min-h-0">
            {/* Left Column (5 cols): Slingshot Stage + Compact HUD */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              {/* Slingshot Arena Canvas with Theme & Power-ups */}
              <div className="w-full">
                <AngryBirdsSlingshotCanvas
                  activeBird={activeBird}
                  onBirdChange={(bird) => {
                    setActiveBird(bird);
                    const updated = { ...currentProfile, selectedBird: bird };
                    handleProfileUpdated(updated);
                  }}
                  triggerLaunch={launchTrigger}
                  onPiggyDefeated={(pts) => {
                    setScore((s) => s + pts);
                    const addedCoins = 30;
                    const updated: UserProfile = {
                      ...currentProfile,
                      coins: currentProfile.coins + addedCoins,
                      piggiesDefeated: currentProfile.piggiesDefeated + 1,
                      totalScore: currentProfile.totalScore + pts,
                      highScore: Math.max(currentProfile.highScore, score + pts),
                    };
                    handleProfileUpdated(updated);
                  }}
                  interactive={true}
                  compact={true}
                  canvasHeight={215}
                  theme={currentProfile.selectedBackground}
                  activePowerUps={currentProfile.activePowerUps}
                  onTogglePowerUp={handleTogglePowerUp}
                  powerUpInventory={currentProfile.powerUps}
                />
              </div>

              {/* Compact HUD Stats & Progress Bar */}
              <div className="bg-white/95 rounded-2xl p-2.5 shadow-sm border border-amber-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="font-extrabold text-amber-950 font-mono">
                      {score.toLocaleString()} 分
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-extrabold text-rose-600 font-mono">
                      {streak} 連擊
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-extrabold text-emerald-700 font-mono">
                      {piggiesDefeated} 豬
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Progress bar */}
                  <div className="w-20 sm:w-28 bg-amber-100 rounded-full h-2 overflow-hidden border border-amber-300">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / randomizedQuestions.length) * 100}%`,
                      }}
                    />
                  </div>

                  <button
                    onClick={handleOpenMiniGame}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-transform hover:scale-105 cursor-pointer"
                    title={hasCompletedAtLeastOneSet ? "自由彈弓靶場" : "需先完成1組練習以解鎖靶場"}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>靶場</span>
                  </button>
                </div>
              </div>

              {/* Quick Set Switcher Strip (Allows 1-click jump to any of the 8 sets + master) */}
              <div className="hidden sm:flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-amber-200/80 overflow-x-auto text-[11px] font-bold">
                <span className="text-amber-800 shrink-0 px-1">快速切換套題：</span>
                {currentLesson.questionSets.map((set, idx) => (
                  <button
                    key={set.id}
                    onClick={() => handleSetChange(set.id)}
                    className={`px-2 py-0.5 rounded-md transition-colors shrink-0 cursor-pointer ${
                      currentSet.id === set.id
                        ? 'bg-amber-500 text-white shadow-2xs font-black'
                        : 'text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {idx < 8 ? `套${idx + 1}` : '★模擬'}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column (7 cols): Interactive Question Card (Directly visible, ZERO scroll!) */}
            <div className="lg:col-span-7 flex flex-col">
              {currentQuestion && (
                <QuizCard
                  key={`${currentQuestion.id}-${sessionSeed}`}
                  question={currentQuestion}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={randomizedQuestions.length}
                  onAnswerCorrect={handleAnswerCorrect}
                  onAnswerWrong={handleAnswerWrong}
                  onNextQuestion={handleNextQuestion}
                  dialect={dialect}
                  isLastQuestion={currentQuestionIndex + 1 === randomizedQuestions.length}
                />
              )}
            </div>
          </div>
        )}

        {/* --- VIEW 2: VOCABULARY CODEX --- */}
        {currentView === 'codex' && (
          <VocabularyCodex
            vocabularies={currentLesson.vocabularies}
            dialect={dialect}
            lessonTitle={currentLesson.title}
          />
        )}
      </main>

      {/* Result Victory Modal */}
      {isFinished && (
        <ResultModal
          score={score}
          totalQuestions={randomizedQuestions.length}
          correctCount={randomizedQuestions.length - wrongQuestions.length}
          piggiesDefeated={piggiesDefeated}
          wrongQuestions={wrongQuestions}
          vocabularies={currentLesson.vocabularies}
          dialect={dialect}
          earnedCoins={350}
          earnedDiamonds={10}
          onRestartSession={handleRestartSession}
          onOpenMiniGame={() => {
            setIsFinished(false);
            setIsMiniGameOpen(true);
          }}
          onSwitchToCodex={() => {
            setIsFinished(false);
            setCurrentView('codex');
          }}
          onClose={() => setIsFinished(false)}
        />
      )}

      {/* Free Slingshot Shooting Range Mini-Game Modal */}
      <SlingshotMiniGameModal
        isOpen={isMiniGameOpen}
        onClose={() => setIsMiniGameOpen(false)}
        earnedScore={score}
        currentProfile={currentProfile}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* 3-Account Profile Switcher Modal */}
      <ProfileSwitcherModal
        isOpen={isProfileSwitcherOpen}
        onClose={() => setIsProfileSwitcherOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSwitchProfile}
      />

      {/* Real-time Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSwitchProfile}
      />

      {/* Rewards & Equipment Store Modal */}
      <ShopAndRewardsModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        profile={currentProfile}
        onProfileUpdated={handleProfileUpdated}
        onOpenSecretCharger={() => {
          setIsShopOpen(false);
          setIsSecretChargerOpen(true);
        }}
      />

      {/* Secret Resource Charger Modal */}
      <SecretChargerModal
        isOpen={isSecretChargerOpen}
        onClose={() => setIsSecretChargerOpen(false)}
        currentProfile={currentProfile}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Locked MiniGame Alert Modal */}
      {showLockedAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-amber-400 shadow-2xl text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-3xl">
              🔒
            </div>
            <h3 className="text-xl font-black text-amber-950 font-serif">
              自由彈弓靶場尚未解鎖！
            </h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              為了鼓勵認真學習，請先完成至少 <strong>1 組中文詞語練習題</strong>（完成全部題目並檢視成績），即可解鎖刺激有趣的彈弓打豬靶場！
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowLockedAlert(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow-md border-b-4 border-amber-700 transition-transform active:scale-95 cursor-pointer"
              >
                我知道了，馬上開始做練習！ 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

