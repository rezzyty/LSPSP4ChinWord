import React, { useState } from 'react';
import { UserProfile } from '../types/profile';
import { chargeResources } from '../utils/profileStorage';
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
  Plus,
  SlidersHorizontal,
  Flame,
  ShieldAlert
} from 'lucide-react';

interface SecretChargerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const SecretChargerModal: React.FC<SecretChargerModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'small' | 'mega'>('small');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Custom input states for small precision amounts
  const [customCoins, setCustomCoins] = useState<string>('100');
  const [customDiamonds, setCustomDiamonds] = useState<string>('5');

  if (!isOpen) return null;

  const triggerCelebration = (msg: string) => {
    setFeedbackMsg(msg);
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
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2800);
  };

  const handleAddCoins = (amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    const updated = chargeResources(currentProfile.id, { addCoins: amount });
    onProfileUpdated(updated);
    triggerCelebration(`🪙 成功充值 +${amount.toLocaleString()} 金幣！`);
  };

  const handleAddDiamonds = (amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    const updated = chargeResources(currentProfile.id, { addDiamonds: amount });
    onProfileUpdated(updated);
    triggerCelebration(`💎 成功充值 +${amount.toLocaleString()} 顆鑽石！`);
  };

  const handleAddPowerUps = (count: number) => {
    if (count <= 0 || isNaN(count)) return;
    const updated = chargeResources(currentProfile.id, { addPowerUps: count });
    onProfileUpdated(updated);
    triggerCelebration(`⚡ 成功補充戰鬥道具！各增加 +${count} 個！`);
  };

  const handleUnlockAllBirds = () => {
    const updated = chargeResources(currentProfile.id, { unlockAllBirds: true });
    onProfileUpdated(updated);
    triggerCelebration('🦅 成功解鎖全體 9 隻憤怒鳥經典英雄！');
  };

  const handleUnlockAllBackgrounds = () => {
    const updated = chargeResources(currentProfile.id, { unlockAllBackgrounds: true });
    onProfileUpdated(updated);
    triggerCelebration('🌄 成功解鎖全體 5 大精緻戰鬥主題背景！');
  };

  const handleFillPowerUps = (count = 20) => {
    const updated = chargeResources(currentProfile.id, { fillPowerUps: count });
    onProfileUpdated(updated);
    triggerCelebration(`⚡ 全體戰術道具補滿至各 ${count} 個！`);
  };

  const handleCompleteAllSets = () => {
    const updated = chargeResources(currentProfile.id, { completeAllSets: true });
    onProfileUpdated(updated);
    triggerCelebration('🎓 成功標記全部課文練習通關，自由靶場已解鎖！');
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
                專屬秘密特權功能：即時為當前學員【{currentProfile.name}】充值金幣、鑽石與資源！
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

        {/* Current Balance Display */}
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
            <span className="text-[10px] text-amber-300 font-bold block">已解鎖英雄</span>
            <span className="text-base font-black text-emerald-300 font-mono">
              {currentProfile.unlockedBirds.length} / 9 隻
            </span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {feedbackMsg && (
          <div className="p-3 bg-emerald-500/90 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-300 flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Navigation Tabs between Small Amount & Mega Boost */}
        <div className="flex items-center gap-2 p-1 bg-black/50 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('small')}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'small'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-amber-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>🪙 小額精準充值 (Smaller Amounts)</span>
          </button>
          <button
            onClick={() => setActiveTab('mega')}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'mega'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>🚀 進階一鍵全解鎖 (Mega Unlocks)</span>
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
                <span className="text-[10px] text-amber-200/70 font-mono">點擊即時入帳</span>
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
                <span className="text-[10px] text-sky-200/70 font-mono">點擊即時入帳</span>
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
                  小額道具補給 (雷射瞄準、國王彈弓、生長種子等)
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
