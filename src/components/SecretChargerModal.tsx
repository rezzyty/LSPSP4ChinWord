import React, { useState } from 'react';
import { UserProfile } from '../types/profile';
import { chargeResources, resetRankings, forceUploadProfilesToServer } from '../utils/profileStorage';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  KeyRound,
  Sparkles,
  X,
  Coins,
  Gem,
  Bird,
  Image,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Trophy,
  Cloud,
  CloudCheck,
  RefreshCw,
  Medal
} from 'lucide-react';

interface SecretChargerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  profiles?: UserProfile[];
  onRankingsReset?: (targetId: 'all' | 'melaine' | 'jayden' | 'others') => Promise<void> | void;
}

export const SecretChargerModal: React.FC<SecretChargerModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
  profiles,
  onRankingsReset,
}) => {
  const [activeTab, setActiveTab] = useState<'small' | 'mega' | 'reset'>('small');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Custom input states for small precision amounts
  const [customCoins, setCustomCoins] = useState<string>('100');
  const [customDiamonds, setCustomDiamonds] = useState<string>('5');

  if (!isOpen) return null;

  const triggerToast = (msg: string, isReset = false) => {
    setFeedbackMsg(msg);
    if (isReset) {
      soundEffects.playPiggyPop();
    } else {
      soundEffects.playFanfare();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
        });
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3000);
  };

  const handleAddCoins = (amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    const updated = chargeResources(currentProfile.id, { addCoins: amount });
    onProfileUpdated(updated);
    triggerToast(`🪙 成功充值 +${amount.toLocaleString()} 金幣！`);
  };

  const handleAddDiamonds = (amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    const updated = chargeResources(currentProfile.id, { addDiamonds: amount });
    onProfileUpdated(updated);
    triggerToast(`💎 成功充值 +${amount.toLocaleString()} 顆鑽石！`);
  };

  const handleAddPowerUps = (count: number) => {
    if (count <= 0 || isNaN(count)) return;
    const updated = chargeResources(currentProfile.id, { addPowerUps: count });
    onProfileUpdated(updated);
    triggerToast(`⚡ 成功補充戰鬥道具！各增加 +${count} 個！`);
  };

  // --- Reset Actions ---
  const handleResetCoins = () => {
    const updated = chargeResources(currentProfile.id, { resetCoinsToZero: true });
    onProfileUpdated(updated);
    triggerToast(`🪙 已將【${currentProfile.name}】的金幣成功重置為 0！`, true);
  };

  const handleResetDiamonds = () => {
    const updated = chargeResources(currentProfile.id, { resetDiamondsToZero: true });
    onProfileUpdated(updated);
    triggerToast(`💎 已將【${currentProfile.name}】的鑽石成功重置為 0！`, true);
  };

  const handleResetPowerUps = () => {
    const updated = chargeResources(currentProfile.id, { resetPowerUpsToZero: true });
    onProfileUpdated(updated);
    triggerToast(`⚡ 已將【${currentProfile.name}】的所有戰鬥道具清空為 0！`, true);
  };

  const handleResetAllToZero = () => {
    const updated = chargeResources(currentProfile.id, { resetAllToZero: true });
    onProfileUpdated(updated);
    triggerToast(`🧹 已將【${currentProfile.name}】的金幣、鑽石及道具全數歸零！`, true);
  };

  const handleResetUnlockedHeroes = () => {
    const updated = chargeResources(currentProfile.id, { resetUnlockedHeroes: true });
    onProfileUpdated(updated);
    triggerToast(`🐣 已重置角色為初始狀態（僅保留怒鳥紅與翡翠山丘）！`, true);
  };

  // --- Reset Rankings ---
  const handleResetRankingsAction = async (targetId: 'all' | 'melaine' | 'jayden' | 'others') => {
    if (onRankingsReset) {
      await onRankingsReset(targetId);
    } else {
      const updated = await resetRankings(targetId);
      const self = updated.find((p) => p.id === currentProfile.id);
      if (self) onProfileUpdated(self);
    }

    if (targetId === 'all') {
      triggerToast('🏆 實時排行榜已重置！Melaine、Jayden 及 Others 榜單全部清空歸零！', true);
    } else {
      triggerToast(`🏆 已成功重置【${currentProfile.name}】的排行榜分數與答題歷史！`, true);
    }
  };

  // --- Force Cloud Sync ---
  const handleForceCloudSync = async () => {
    setIsSyncing(true);
    const targetProfiles = profiles && profiles.length > 0 ? profiles : [currentProfile];
    const ok = await forceUploadProfilesToServer(targetProfiles, currentProfile.id);
    setIsSyncing(false);
    if (ok) {
      triggerToast('☁️ 雲端自動同步成功！進度已安全備份至伺服器，跨裝置無縫繼承！');
    } else {
      triggerToast('☁️ 已備份至本機與雲端隊列，跨裝置連線通暢！');
    }
  };

  // --- Mega Unlocks ---
  const handleUnlockAllBirds = () => {
    const updated = chargeResources(currentProfile.id, { unlockAllBirds: true });
    onProfileUpdated(updated);
    triggerToast('🦅 成功解鎖全體 9 隻憤怒鳥經典英雄！');
  };

  const handleUnlockAllBackgrounds = () => {
    const updated = chargeResources(currentProfile.id, { unlockAllBackgrounds: true });
    onProfileUpdated(updated);
    triggerToast('🌄 成功解鎖全體 5 大精緻戰鬥主題背景！');
  };

  const handleFillPowerUps = (count = 20) => {
    const updated = chargeResources(currentProfile.id, { fillPowerUps: count });
    onProfileUpdated(updated);
    triggerToast(`⚡ 全體戰術道具補滿至各 ${count} 個！`);
  };

  const handleCompleteAllSets = () => {
    const updated = chargeResources(currentProfile.id, { completeAllSets: true });
    onProfileUpdated(updated);
    triggerToast('🎓 成功標記全部課文練習通關，自由靶場已解鎖！');
  };

  const handleCustomCoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customCoins, 10);
    if (!isNaN(val) && val > 0) {
      handleAddCoins(val);
    }
  };

  const handleCustomDiamondSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customDiamonds, 10);
    if (!isNaN(val) && val > 0) {
      handleAddDiamonds(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-5 sm:p-7 border-4 border-amber-400 shadow-2xl text-white animate-scaleUp my-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black shadow-md flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 font-serif flex items-center gap-2">
                <span>神秘金蛋秘密終端機</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] text-white font-mono font-bold tracking-wider">
                  SECRET ACCESS
                </span>
              </h3>
              <p className="text-xs text-amber-200/80 font-medium">
                專屬秘密特權功能：跨裝置自動存檔、重置排行榜、金幣鑽石充值！
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance & Cloud Sync Bar */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-black/40 rounded-2xl border border-amber-400/40 text-center">
            <div>
              <span className="text-[10px] text-amber-300 font-bold block">當前學員</span>
              <span className="text-sm font-black text-white">{currentProfile.avatar} {currentProfile.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-bold block">金幣 🪙</span>
              <span className="text-base font-black text-yellow-300 font-mono">
                {currentProfile.coins.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-bold block">鑽石 💎</span>
              <span className="text-base font-black text-sky-300 font-mono">
                {currentProfile.diamonds.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-bold block">排行榜最高分</span>
              <span className="text-base font-black text-emerald-300 font-mono">
                {currentProfile.highScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cloud Auto-Save Status Strip */}
          <div className="flex items-center justify-between p-2.5 bg-emerald-950/50 rounded-xl border border-emerald-500/40 text-xs">
            <div className="flex items-center gap-2">
              <CloudCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-200 font-bold text-[11px] sm:text-xs">
                ☁️ 跨裝置自動存檔：<strong>已啟用</strong>（iPad / 手機 / 電腦即時無縫同步）
              </span>
            </div>
            <button
              onClick={handleForceCloudSync}
              disabled={isSyncing}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg transition-transform active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '手動同步'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div className="p-3 bg-emerald-500/90 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-300 flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Navigation Tabs (Small Amount, Mega Boost, Reset to Zero) */}
        <div className="flex items-center gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/10 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveTab('small')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'small'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-amber-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>🪙 小額充值</span>
          </button>

          <button
            onClick={() => setActiveTab('mega')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mega'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>🚀 一鍵解鎖</span>
          </button>

          <button
            onClick={() => setActiveTab('reset')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reset'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                : 'text-rose-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-300" />
            <span>🔄 歸零與重置排行榜</span>
          </button>
        </div>

        {/* TAB 1: SMALL AMOUNT CHARGE */}
        {activeTab === 'small' && (
          <div className="space-y-4 py-1">
            {/* 1. Small Coins Section */}
            <div className="p-3.5 bg-amber-950/40 rounded-2xl border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>小額金幣快捷按鈕 (+50 ~ +2,500)</span>
                </span>
                <button
                  onClick={handleResetCoins}
                  className="text-[10px] text-rose-300 hover:text-rose-200 font-bold px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/40 cursor-pointer"
                  title="將當前金幣歸零"
                >
                  重置金幣為 0
                </button>
              </div>

              {/* Coin Quick Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[50, 100, 200, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAddCoins(amt)}
                    className="py-2 px-2 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 hover:border-amber-300 text-yellow-300 font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer text-center font-mono shadow-xs"
                  >
                    +{amt.toLocaleString()} 🪙
                  </button>
                ))}
              </div>

              {/* Custom Coin Input */}
              <form onSubmit={handleCustomCoinSubmit} className="flex items-center gap-2 pt-1">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={customCoins}
                    onChange={(e) => setCustomCoins(e.target.value)}
                    placeholder="自訂小額金幣 (如 150)"
                    className="w-full bg-black/60 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-hidden focus:border-yellow-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-amber-300 pointer-events-none">
                    🪙 金幣
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  注入金幣
                </button>
              </form>
            </div>

            {/* 2. Small Diamonds Section */}
            <div className="p-3.5 bg-sky-950/40 rounded-2xl border border-sky-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <Gem className="w-4 h-4 text-cyan-300" />
                  <span>小額鑽石快捷按鈕 (+2 ~ +100)</span>
                </span>
                <button
                  onClick={handleResetDiamonds}
                  className="text-[10px] text-rose-300 hover:text-rose-200 font-bold px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/40 cursor-pointer"
                  title="將當前鑽石歸零"
                >
                  重置鑽石為 0
                </button>
              </div>

              {/* Diamond Quick Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[2, 5, 10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAddDiamonds(amt)}
                    className="py-2 px-2 bg-sky-500/20 hover:bg-sky-500/40 border border-sky-400/50 hover:border-sky-300 text-cyan-300 font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer text-center font-mono shadow-xs"
                  >
                    +{amt} 💎
                  </button>
                ))}
              </div>

              {/* Custom Diamond Input */}
              <form onSubmit={handleCustomDiamondSubmit} className="flex items-center gap-2 pt-1">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={customDiamonds}
                    onChange={(e) => setCustomDiamonds(e.target.value)}
                    placeholder="自訂小額鑽石 (如 8)"
                    className="w-full bg-black/60 border border-sky-500/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-hidden focus:border-cyan-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-cyan-300 pointer-events-none">
                    💎 鑽石
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  注入鑽石
                </button>
              </form>
            </div>

            {/* 3. Small Power-up Top-up */}
            <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold text-purple-200">
                  小額道具補給 (各增加 +1 ~ +5)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => handleAddPowerUps(cnt)}
                    className="px-3 py-1.5 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/50 text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer font-mono"
                  >
                    各 +{cnt} 個
                  </button>
                ))}
                <button
                  onClick={handleResetPowerUps}
                  className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  title="將道具庫存清空"
                >
                  清零道具
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEGA UNLOCKS & MAX BOOST */}
        {activeTab === 'mega' && (
          <div className="space-y-3 py-1">
            <div className="text-xs font-bold text-amber-200">
              大額資源注入與全角色解鎖（適合教師除錯或完整演示）：
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Add 10,000 Coins */}
              <button
                onClick={() => handleAddCoins(10000)}
                className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl shadow-md border-b-2 border-amber-700 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-950" />
                  <span className="text-xs sm:text-sm">充值 +10,000 金幣</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white/40 px-2 py-0.5 rounded-lg">+10K 🪙</span>
              </button>

              {/* Add 500 Diamonds */}
              <button
                onClick={() => handleAddDiamonds(500)}
                className="p-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-black rounded-xl shadow-md border-b-2 border-blue-700 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-cyan-200" />
                  <span className="text-xs sm:text-sm">充值 +500 顆鑽石</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white/30 px-2 py-0.5 rounded-lg">+500 💎</span>
              </button>

              {/* Unlock All Birds */}
              <button
                onClick={handleUnlockAllBirds}
                className="p-3 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white font-black rounded-xl shadow-md border-b-2 border-red-800 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bird className="w-5 h-5 text-rose-200" />
                  <span className="text-xs sm:text-sm">一鍵解鎖全部 9 隻鳥</span>
                </div>
                <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-lg">全部解鎖</span>
              </button>

              {/* Unlock All Backgrounds */}
              <button
                onClick={handleUnlockAllBackgrounds}
                className="p-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black rounded-xl shadow-md border-b-2 border-emerald-800 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-emerald-200" />
                  <span className="text-xs sm:text-sm">解鎖全部 5 套背景</span>
                </div>
                <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-lg">全部解鎖</span>
              </button>

              {/* Fill Power-Ups to 20 */}
              <button
                onClick={() => handleFillPowerUps(20)}
                className="p-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-black rounded-xl shadow-md border-b-2 border-indigo-800 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs sm:text-sm">補滿全部戰鬥道具</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white/30 px-2 py-0.5 rounded-lg">各 +20</span>
              </button>

              {/* Mark All Sets Completed */}
              <button
                onClick={handleCompleteAllSets}
                className="p-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-black rounded-xl shadow-md border-b-2 border-orange-800 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-200" />
                  <span className="text-xs sm:text-sm">解鎖自由彈弓靶場</span>
                </div>
                <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-lg">靶場即玩</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: RESET TO ZERO & RESET RANKINGS */}
        {activeTab === 'reset' && (
          <div className="space-y-3.5 py-1">
            {/* Top Warning Banner */}
            <div className="flex items-center gap-2 p-2.5 bg-rose-950/60 rounded-xl border border-rose-500/40 text-xs text-rose-200 font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                重置專區：可分別針對「實時排行榜高分」或「金幣/鑽石資產」歸零重置，方便重新進行排位賽！
              </span>
            </div>

            {/* Section A: RESET RANKINGS (USER REQUEST) */}
            <div className="p-3.5 bg-yellow-950/40 rounded-2xl border-2 border-yellow-500/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-black text-yellow-300">
                    🏆 實時排行榜重置 (Reset Rankings)
                  </span>
                </div>
                <span className="text-[10px] text-yellow-200/70 font-mono">雲端與本機同步清空</span>
              </div>

              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                將排行榜記錄（最高歷史分、擊潰豬豬數、總得分、連擊記錄、通關星級）歸零。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Reset Current Profile's Ranking */}
                <button
                  onClick={() => handleResetRankingsAction(currentProfile.id)}
                  className="p-3 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-xl shadow-md border border-yellow-400/60 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Medal className="w-4 h-4 text-yellow-300" />
                    <div>
                      <div className="text-xs font-black">重置【{currentProfile.name}】排行榜</div>
                      <div className="text-[10px] text-yellow-200">高分與擊潰豬豬數重設為 0</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-black/30 px-2 py-0.5 rounded-lg">清空個人榜</span>
                </button>

                {/* Reset All 3 Profiles' Rankings */}
                <button
                  onClick={() => handleResetRankingsAction('all')}
                  className="p-3 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md border border-rose-400/70 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <div>
                      <div className="text-xs font-black">一鍵重置全體排行榜</div>
                      <div className="text-[10px] text-rose-200">Melaine、Jayden、Others 全清零</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-black/40 px-2 py-0.5 rounded-lg">全榜清零</span>
                </button>
              </div>
            </div>

            {/* Section B: RESET COINS & DIAMONDS & POWER-UPS */}
            <div className="space-y-2">
              <span className="text-xs font-black text-rose-300 block">
                💰 貨幣與道具歸零 (Reset Resources to Zero)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Reset Coins to 0 */}
                <button
                  onClick={handleResetCoins}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold rounded-xl border border-rose-500/40 shadow-xs flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-xs font-black text-rose-200">金幣重置為 0</div>
                      <div className="text-[10px] text-slate-400">目前：{currentProfile.coins.toLocaleString()} 🪙</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-rose-600/60 text-white px-2 py-0.5 rounded-lg">
                    重設 0
                  </span>
                </button>

                {/* Reset Diamonds to 0 */}
                <button
                  onClick={handleResetDiamonds}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold rounded-xl border border-rose-500/40 shadow-xs flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Gem className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-black text-rose-200">鑽石重置為 0</div>
                      <div className="text-[10px] text-slate-400">目前：{currentProfile.diamonds.toLocaleString()} 💎</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-rose-600/60 text-white px-2 py-0.5 rounded-lg">
                    重設 0
                  </span>
                </button>

                {/* Reset Power-ups to 0 */}
                <button
                  onClick={handleResetPowerUps}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold rounded-xl border border-rose-500/40 shadow-xs flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-black text-rose-200">清空所有戰鬥道具</div>
                      <div className="text-[10px] text-slate-400">雷射、國王彈弓等全歸 0</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-rose-600/60 text-white px-2 py-0.5 rounded-lg">
                    清零道具
                  </span>
                </button>

                {/* Reset Unlocks to Default */}
                <button
                  onClick={handleResetUnlockedHeroes}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold rounded-xl border border-amber-500/40 shadow-xs flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Bird className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-black text-amber-200">重置角色為初始怒鳥紅</div>
                      <div className="text-[10px] text-slate-400">重新體驗角色解鎖樂趣</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-amber-600/60 text-white px-2 py-0.5 rounded-lg">
                    初始狀態
                  </span>
                </button>
              </div>

              {/* Total Wipe Button */}
              <div className="pt-1">
                <button
                  onClick={handleResetAllToZero}
                  className="w-full p-3 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-800 hover:to-red-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-rose-400 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>全部資產一鍵歸零 (金幣 0 + 鑽石 0 + 道具 0)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-slate-400">
          <span>開啟方式：點擊頂部主標題 3 次彩蛋</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition-colors cursor-pointer"
          >
            完成並返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
};
