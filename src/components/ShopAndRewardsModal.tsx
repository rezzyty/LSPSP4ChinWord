import React, { useState } from 'react';
import { UserProfile, BackgroundThemeId, PowerUpId } from '../types/profile';
import { BirdType } from '../types/quiz';
import { BIRDS } from '../data/birds';
import { BACKGROUND_THEMES, POWER_UP_ITEMS } from '../data/rewardsData';
import { soundEffects } from '../utils/soundEffects';
import { saveProfile } from '../utils/profileStorage';
import {
  Sparkles,
  X,
  Coins,
  Gem,
  CheckCircle2,
  Lock,
  Zap,
  Image,
  Bird,
  Flame,
  ArrowRight
} from 'lucide-react';

interface ShopAndRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenSecretCharger: () => void;
}

export const ShopAndRewardsModal: React.FC<ShopAndRewardsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onOpenSecretCharger,
}) => {
  const [activeTab, setActiveTab] = useState<'birds' | 'backgrounds' | 'powerups'>('birds');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Buy or Select Bird
  const handleBirdAction = (birdId: BirdType) => {
    const bird = BIRDS.find((b) => b.id === birdId);
    if (!bird) return;

    if (profile.unlockedBirds.includes(birdId)) {
      // Select bird
      const updated: UserProfile = { ...profile, selectedBird: birdId };
      saveProfile(updated);
      onProfileUpdated(updated);
      soundEffects.playCorrect();
      showToast(`✅ 已選用角色：${bird.nameZh}`);
    } else {
      // Buy bird
      const costCoins = bird.costCoins || 0;
      const costDiamonds = bird.costDiamonds || 0;

      if (profile.coins < costCoins || profile.diamonds < costDiamonds) {
        showToast('❌ 金幣或鑽石不足！可做練習題賺取，或查看秘密功能充值！');
        soundEffects.playWrong();
        return;
      }

      const updated: UserProfile = {
        ...profile,
        coins: profile.coins - costCoins,
        diamonds: profile.diamonds - costDiamonds,
        unlockedBirds: [...profile.unlockedBirds, birdId],
        selectedBird: birdId,
      };
      saveProfile(updated);
      onProfileUpdated(updated);
      soundEffects.playFanfare();
      showToast(`🎉 成功解鎖並裝備：${bird.nameZh}！`);
    }
  };

  // Buy or Select Background
  const handleBackgroundAction = (bgId: BackgroundThemeId) => {
    const bg = BACKGROUND_THEMES.find((b) => b.id === bgId);
    if (!bg) return;

    if (profile.unlockedBackgrounds.includes(bgId)) {
      // Select
      const updated: UserProfile = { ...profile, selectedBackground: bgId };
      saveProfile(updated);
      onProfileUpdated(updated);
      soundEffects.playCorrect();
      showToast(`🌄 已切換戰鬥背景：${bg.nameZh}`);
    } else {
      // Buy
      if (profile.coins < bg.costCoins || profile.diamonds < bg.costDiamonds) {
        showToast('❌ 金幣或鑽石不足！快去通關練習或充值吧！');
        soundEffects.playWrong();
        return;
      }

      const updated: UserProfile = {
        ...profile,
        coins: profile.coins - bg.costCoins,
        diamonds: profile.diamonds - bg.costDiamonds,
        unlockedBackgrounds: [...profile.unlockedBackgrounds, bgId],
        selectedBackground: bgId,
      };
      saveProfile(updated);
      onProfileUpdated(updated);
      soundEffects.playFanfare();
      showToast(`✨ 成功解鎖新主題背景：${bg.nameZh}！`);
    }
  };

  // Buy Power-up
  const handleBuyPowerUp = (pId: PowerUpId) => {
    const item = POWER_UP_ITEMS.find((p) => p.id === pId);
    if (!item) return;

    if (profile.coins < item.costCoins) {
      showToast('❌ 金幣不足，請完成練習題或使用秘技充值！');
      soundEffects.playWrong();
      return;
    }

    const currentCount = profile.powerUps[pId] || 0;
    const updated: UserProfile = {
      ...profile,
      coins: profile.coins - item.costCoins,
      powerUps: {
        ...profile.powerUps,
        [pId]: currentCount + 1,
      },
      activePowerUps: {
        ...profile.activePowerUps,
        [pId]: true, // Auto activate
      },
    };
    saveProfile(updated);
    onProfileUpdated(updated);
    soundEffects.playCorrect();
    showToast(`⚡ 成功購買【${item.nameZh}】！庫存現有 ${currentCount + 1} 個！`);
  };

  // Toggle active power-up
  const handleToggleActive = (pId: PowerUpId) => {
    const currentCount = profile.powerUps[pId] || 0;
    if (currentCount <= 0) {
      showToast('❌ 道具數量為 0，請先購買！');
      return;
    }
    const currentActive = !!profile.activePowerUps[pId];
    const updated: UserProfile = {
      ...profile,
      activePowerUps: {
        ...profile.activePowerUps,
        [pId]: !currentActive,
      },
    };
    saveProfile(updated);
    onProfileUpdated(updated);
    soundEffects.playCorrect();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-5 sm:p-7 border-4 border-amber-400 shadow-2xl animate-scaleUp my-auto flex flex-col gap-4 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-amber-950 font-black shadow-md flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
                <span>獎勵兌換所 · 裝備庫</span>
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {profile.avatar} {profile.name}
                </span>
              </h3>
              <p className="text-xs text-amber-800 font-semibold">
                用學習答題獲得的金幣與鑽石，解鎖超級憤怒鳥英雄、精美主題與戰鬥道具！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins & Diamonds pill */}
            <div className="flex items-center gap-2 bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-mono font-black text-amber-900">
              <span className="flex items-center gap-1">
                🪙 <span>{profile.coins.toLocaleString()}</span>
              </span>
              <span className="text-amber-400">|</span>
              <span className="flex items-center gap-1 text-sky-800">
                💎 <span>{profile.diamonds.toLocaleString()}</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center border border-amber-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
          <button
            onClick={() => setActiveTab('birds')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'birds'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white/80 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Bird className="w-4 h-4" />
            <span>憤怒鳥英雄 ({profile.unlockedBirds.length}/9)</span>
          </button>

          <button
            onClick={() => setActiveTab('backgrounds')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'backgrounds'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white/80 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>主題戰鬥背景 ({profile.unlockedBackgrounds.length}/5)</span>
          </button>

          <button
            onClick={() => setActiveTab('powerups')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'powerups'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white/80 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>戰術武器與道具</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-2.5 bg-amber-900 text-white rounded-xl text-xs font-bold text-center shadow-md animate-fadeIn">
            {toastMessage}
          </div>
        )}

        {/* Tab 1: Birds Characters Grid */}
        {activeTab === 'birds' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 max-h-[50vh] custom-scrollbar">
            {BIRDS.map((b) => {
              const isUnlocked = profile.unlockedBirds.includes(b.id);
              const isSelected = profile.selectedBird === b.id;

              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-100/95 border-amber-500 shadow-md ring-2 ring-amber-400'
                      : isUnlocked
                      ? 'bg-white/95 border-amber-200 hover:border-amber-400 shadow-xs'
                      : 'bg-slate-100/80 border-slate-300 opacity-80'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow-xs text-white"
                          style={{ backgroundColor: b.color }}
                        >
                          {b.id === 'red' ? '🔴' : b.id === 'chuck' ? '🟡' : b.id === 'bomb' ? '💣' : b.id === 'blues' ? '🔷' : b.id === 'matilda' ? '🥚' : b.id === 'terence' ? '👹' : b.id === 'hal' ? '🦜' : b.id === 'stella' ? '🌸' : '🦅'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-amber-950 font-serif">
                            {b.nameZh}
                          </div>
                          <div className="text-[10px] text-amber-700 font-bold">
                            {b.name}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                          使用中
                        </span>
                      ) : isUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                          已解鎖
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                          <Lock className="w-3.5 h-3.5" /> 未解鎖
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {b.specialSkill}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-amber-200/60 flex items-center justify-between">
                    {!isUnlocked ? (
                      <button
                        onClick={() => handleBirdAction(b.id)}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>解鎖：</span>
                        {b.costCoins ? <span>🪙 {b.costCoins}</span> : null}
                        {b.costDiamonds ? <span>💎 {b.costDiamonds}</span> : null}
                      </button>
                    ) : isSelected ? (
                      <span className="w-full text-center py-1.5 text-xs font-bold text-emerald-700">
                        ✓ 當前已出戰
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBirdAction(b.id)}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        出戰此角色 🎯
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Backgrounds */}
        {activeTab === 'backgrounds' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 max-h-[50vh] custom-scrollbar">
            {BACKGROUND_THEMES.map((bg) => {
              const isUnlocked = profile.unlockedBackgrounds.includes(bg.id);
              const isSelected = profile.selectedBackground === bg.id;

              return (
                <div
                  key={bg.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-100/95 border-amber-500 shadow-md ring-2 ring-amber-400'
                      : isUnlocked
                      ? 'bg-white/95 border-amber-200 hover:border-amber-400 shadow-xs'
                      : 'bg-slate-100/80 border-slate-300 opacity-80'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl p-1 bg-amber-50 rounded-xl border border-amber-200">
                          {bg.icon}
                        </span>
                        <div>
                          <div className="text-base font-black text-amber-950 font-serif">
                            {bg.nameZh}
                          </div>
                          <div className="text-[11px] text-amber-700 font-bold">
                            {bg.id}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[11px]">
                          當前戰場
                        </span>
                      ) : isUnlocked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[11px]">
                          已擁有
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
                          <Lock className="w-3.5 h-3.5" /> 待解鎖
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {bg.descZh}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-amber-200/60">
                    {!isUnlocked ? (
                      <button
                        onClick={() => handleBackgroundAction(bg.id)}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>兌換解鎖：</span>
                        {bg.costCoins ? <span>🪙 {bg.costCoins}</span> : null}
                        {bg.costDiamonds ? <span>💎 {bg.costDiamonds}</span> : null}
                      </button>
                    ) : isSelected ? (
                      <span className="w-full block text-center py-1.5 text-xs font-bold text-emerald-700">
                        ✓ 正在使用此戰場
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBackgroundAction(bg.id)}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        應用此背景 🌄
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Weapons and Power-ups */}
        {activeTab === 'powerups' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 max-h-[50vh] custom-scrollbar">
            {POWER_UP_ITEMS.map((item) => {
              const count = profile.powerUps[item.id] || 0;
              const isActive = !!profile.activePowerUps[item.id];

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between bg-white/95 transition-all shadow-xs ${
                    isActive ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/90' : 'border-amber-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1 bg-amber-100 rounded-xl">
                          {item.icon}
                        </span>
                        <div>
                          <div className="text-sm font-black text-amber-950 font-serif">
                            {item.nameZh}
                          </div>
                          <div className="text-[11px] font-mono font-bold text-amber-700">
                            庫存：{count} 個
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleActive(item.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : count > 0
                            ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isActive ? '● 裝備中' : '未啟用'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {item.descZh}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-amber-200/60 flex items-center gap-2">
                    <button
                      onClick={() => handleBuyPowerUp(item.id)}
                      className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>購買 +1:</span>
                      <span>🪙 {item.costCoins}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Secret Function Entry Notice */}
        <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenSecretCharger();
            }}
            className="text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <span>🔑 找不到足夠資源？點擊開啟秘密終端機一鍵充值！</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            返回練習挑戰
          </button>
        </div>
      </div>
    </div>
  );
};
