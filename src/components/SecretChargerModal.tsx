import React, { useState } from 'react';
import { UserProfile } from '../types/profile';
import { chargeResources } from '../utils/profileStorage';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { KeyRound, Sparkles, X, Coins, Gem, Bird, Image, Zap, CheckCircle2, RotateCcw } from 'lucide-react';

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
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(true); // Direct access enabled for friendly student/parent debugging, passcode gives extra fun
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerCelebration = (msg: string) => {
    setFeedbackMsg(msg);
    soundEffects.playFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
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
    const updated = chargeResources(currentProfile.id, { addCoins: amount });
    onProfileUpdated(updated);
    triggerCelebration(`🪙 成功充值 +${amount.toLocaleString()} 金幣！`);
  };

  const handleAddDiamonds = (amount: number) => {
    const updated = chargeResources(currentProfile.id, { addDiamonds: amount });
    onProfileUpdated(updated);
    triggerCelebration(`💎 成功充值 +${amount} 顆鑽石！`);
  };

  const handleUnlockAllBirds = () => {
    const updated = chargeResources(currentProfile.id, { unlockAllBirds: true });
    onProfileUpdated(updated);
    triggerCelebration('🦅 成功解鎖全體 9 隻憤怒鳥經典角色！');
  };

  const handleUnlockAllBackgrounds = () => {
    const updated = chargeResources(currentProfile.id, { unlockAllBackgrounds: true });
    onProfileUpdated(updated);
    triggerCelebration('🌄 成功解鎖全體 5 大精緻戰鬥主題背景！');
  };

  const handleFillPowerUps = (count = 20) => {
    const updated = chargeResources(currentProfile.id, { fillPowerUps: count });
    onProfileUpdated(updated);
    triggerCelebration(`⚡ 全體戰術道具補滿！各 +${count} 個！`);
  };

  const handleCompleteAllSets = () => {
    const updated = chargeResources(currentProfile.id, { completeAllSets: true });
    onProfileUpdated(updated);
    triggerCelebration('🎓 成功解鎖所有課文練習通關資格與自由靶場！');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-7 border-4 border-amber-400 shadow-2xl text-white animate-scaleUp my-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black shadow-md flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 font-serif flex items-center gap-2">
                <span>神秘金蛋秘密終端機</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] text-white font-mono">
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
            <span className="text-[10px] text-amber-300 font-bold block">已解鎖角色</span>
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

        {/* Secret Cheat Buttons Grid */}
        <div className="space-y-3 py-1">
          <div className="text-xs font-bold text-amber-200">
            點擊下方快捷按鈕，即時注入無限學習資源：
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Add Coins */}
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

            {/* Add Diamonds */}
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

            {/* Fill Power-Ups */}
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

        {/* Footer info */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-slate-400">
          <span>密鑰彩蛋密碼：<code className="text-yellow-400 font-mono">LASALLE888</code></span>
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
