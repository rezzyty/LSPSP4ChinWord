import { BackgroundTheme, PowerUpItem } from '../types/profile';

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    id: 'green_hills',
    nameZh: '經典翠綠草原',
    icon: '🌳',
    descZh: '陽光明媚的翠綠山坡與白雲，憤怒鳥最初起飛的經典戰場！',
    costCoins: 0,
    costDiamonds: 0,
  },
  {
    id: 'night_sky',
    nameZh: '極光星空夜景',
    icon: '🌌',
    descZh: '神秘深邃的紫藍夜空與流動極光，適合夜戰突襲！',
    costCoins: 800,
    costDiamonds: 0,
  },
  {
    id: 'sunset_beach',
    nameZh: '盛夏黃金海灘',
    icon: '🌅',
    descZh: '落日餘暉照耀下的金色沙灘與椰林，波濤洶湧壯麗迷人！',
    costCoins: 1500,
    costDiamonds: 15,
  },
  {
    id: 'volcano_fortress',
    nameZh: '熾熱熔岩要塞',
    icon: '🌋',
    descZh: '滾燙岩漿與火山硝煙，終極搗蛋豬大軍的地下堡壘！',
    costCoins: 2500,
    costDiamonds: 35,
  },
  {
    id: 'cyber_space',
    nameZh: '太空賽博星軌',
    icon: '🪐',
    descZh: '未來霓虹光軌與浩瀚星系，超越地心引力的科技戰場！',
    costCoins: 4000,
    costDiamonds: 60,
  },
];

export const POWER_UP_ITEMS: PowerUpItem[] = [
  {
    id: 'laser_scope',
    nameZh: '鐳射瞄準器',
    icon: '🎯',
    descZh: '射出高精度引導光線，預判彈道軌跡，精準命中弱點！',
    costCoins: 150,
    costDiamonds: 2,
  },
  {
    id: 'king_sling',
    nameZh: '橡筋彈力王',
    icon: '⚡',
    descZh: '黃金彈弓強化！小鳥飛行速度 +80%，撞擊威力大幅倍增！',
    costCoins: 200,
    costDiamonds: 3,
  },
  {
    id: 'super_seed',
    nameZh: '巨化蘑菇種子',
    icon: '🍄',
    descZh: '使小鳥體型瞬間暴增 2.2 倍，化身重裝戰車輾壓障礙！',
    costCoins: 250,
    costDiamonds: 4,
  },
  {
    id: 'speed_potion',
    nameZh: '超音速衝刺藥水',
    icon: '🧪',
    descZh: '提供極限超音速動力，無阻穿透外層木石護盾直擊核心！',
    costCoins: 300,
    costDiamonds: 5,
  },
  {
    id: 'tnt_rain',
    nameZh: '空投炸藥狂潮',
    icon: '💣',
    descZh: '在要塞上方空投 3 枚高爆炸藥箱，引發連鎖毀滅性衝擊！',
    costCoins: 400,
    costDiamonds: 8,
  },
];
