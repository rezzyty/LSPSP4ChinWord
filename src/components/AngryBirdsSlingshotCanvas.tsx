import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BirdType, BirdInfo } from '../types/quiz';
import { BackgroundThemeId, PowerUpId } from '../types/profile';
import { BIRDS } from '../data/birds';
import { soundEffects } from '../utils/soundEffects';
import { Target, Zap, ShieldAlert, Sparkles, Flame } from 'lucide-react';

interface SlingshotCanvasProps {
  activeBird: BirdType;
  onBirdChange?: (bird: BirdType) => void;
  triggerLaunch?: number; // timestamp trigger from parent on correct answer
  onPiggyDefeated?: (points: number) => void;
  interactive?: boolean; // allow manual drag & release
  compact?: boolean;
  canvasHeight?: number;
  theme?: BackgroundThemeId;
  activePowerUps?: Partial<Record<PowerUpId, boolean>>;
  onTogglePowerUp?: (id: PowerUpId) => void;
  powerUpInventory?: Record<PowerUpId, number>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  type: 'feather' | 'wood' | 'smoke' | 'star' | 'score' | 'flame' | 'spark';
  text?: string;
}

interface Piggy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alive: boolean;
  hp: number;
  hasHelmet?: boolean;
  isKing?: boolean;
  scale: number;
  isFalling?: boolean;
}

interface Block {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  material: 'wood' | 'ice' | 'stone' | 'tnt';
  hp: number;
  maxHp: number;
  destroyed: boolean;
  rotation: number;
  rotSpeed: number;
  isFalling: boolean;
  supports?: number[]; // block IDs that support this block
}

export const AngryBirdsSlingshotCanvas: React.FC<SlingshotCanvasProps> = ({
  activeBird,
  onBirdChange,
  triggerLaunch,
  onPiggyDefeated,
  interactive = true,
  compact = false,
  canvasHeight,
  theme = 'green_hills',
  activePowerUps = {},
  onTogglePowerUp,
  powerUpInventory = {
    laser_scope: 0,
    king_sling: 0,
    super_seed: 0,
    speed_potion: 0,
    tnt_rain: 0,
  },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic height supporting iPad Pro 13" and mobile
  const effectiveHeight = canvasHeight || (compact ? 190 : 290);

  // Slingshot origin coords
  const SLING_X = 135;
  const SLING_Y = effectiveHeight - 88;
  const REST_BIRD_X = SLING_X - 10;
  const REST_BIRD_Y = SLING_Y - 26;

  // Dragging state
  const isDragging = useRef(false);
  const birdPos = useRef({ x: REST_BIRD_X, y: REST_BIRD_Y });
  const birdVel = useRef({ vx: 0, vy: 0 });
  const inFlight = useRef(false);
  const birdRotation = useRef(0);
  const flightStartTime = useRef(0);

  // Flight smoke trail
  const trail = useRef<{ x: number; y: number; alpha: number; color?: string }[]>([]);

  // Fortress & Piggies
  const piggies = useRef<Piggy[]>([]);
  const blocks = useRef<Block[]>([]);
  const particles = useRef<Particle[]>([]);

  // Screen shake
  const shakeTimer = useRef(0);

  // Active Bird Info
  const activeBirdData = BIRDS.find((b) => b.id === activeBird) || BIRDS[0];

  // Reset / spawn destructible fortress
  const initFortress = useCallback((width: number, height: number) => {
    const groundY = height - 50;
    // Align fortress near the right edge
    const fortressX = Math.max(360, width - 200);

    // Multi-tier destructible fortress with structural support dependencies
    // Tier 1 (Base pillars 1 & 2 support Stone Lintel 3)
    // Tier 2 (Ice columns 4 & 5 support Wood Crossbar 6)
    // Central TNT Box 7
    // Tier 3 (Roof posts 8 & 9 support Top Stone 10)
    blocks.current = [
      // Base pillars
      { id: 1, x: fortressX - 55, y: groundY - 42, vx: 0, vy: 0, w: 22, h: 42, material: 'wood', hp: 2, maxHp: 2, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false },
      { id: 2, x: fortressX + 45, y: groundY - 42, vx: 0, vy: 0, w: 22, h: 42, material: 'wood', hp: 2, maxHp: 2, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false },
      // Heavy Stone Slab above base
      { id: 3, x: fortressX - 65, y: groundY - 58, vx: 0, vy: 0, w: 140, h: 16, material: 'stone', hp: 3, maxHp: 3, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false, supports: [1, 2] },
      
      // Mid level ice pillars
      { id: 4, x: fortressX - 40, y: groundY - 100, vx: 0, vy: 0, w: 20, h: 42, material: 'ice', hp: 1, maxHp: 1, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false, supports: [3] },
      { id: 5, x: fortressX + 30, y: groundY - 100, vx: 0, vy: 0, w: 20, h: 42, material: 'ice', hp: 1, maxHp: 1, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false, supports: [3] },
      // Mid wood beam
      { id: 6, x: fortressX - 48, y: groundY - 116, vx: 0, vy: 0, w: 110, h: 16, material: 'wood', hp: 2, maxHp: 2, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false, supports: [4, 5] },
      
      // TNT box in central reinforced alcove
      { id: 7, x: fortressX - 14, y: groundY - 38, vx: 0, vy: 0, w: 32, h: 36, material: 'tnt', hp: 1, maxHp: 1, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false },
      
      // Top roof supports
      { id: 8, x: fortressX - 22, y: groundY - 152, vx: 0, vy: 0, w: 18, h: 36, material: 'wood', hp: 1, maxHp: 1, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false, supports: [6] },
      { id: 9, x: fortressX + 16, y: groundY - 152, vx: 0, vy: 0, w: 18, h: 36, material: 'wood', hp: 1, maxHp: 1, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false, supports: [6] },
      // Crown stone triangle roof
      { id: 10, x: fortressX - 30, y: groundY - 168, vx: 0, vy: 0, w: 75, h: 16, material: 'stone', hp: 2, maxHp: 2, destroyed: false, rotation: 0, rotSpeed: 0, isFalling: false, supports: [8, 9] },
    ];

    // Piggies positioned inside the fortress
    piggies.current = [
      {
        id: 1,
        x: fortressX + 3,
        y: groundY - 84,
        vx: 0,
        vy: 0,
        radius: 17,
        alive: true,
        hp: 1,
        scale: 1,
        isFalling: false,
      },
      {
        id: 2,
        x: fortressX + 3,
        y: groundY - 140,
        vx: 0,
        vy: 0,
        radius: 19,
        alive: true,
        hp: 2,
        hasHelmet: true,
        scale: 1,
        isFalling: false,
      },
      {
        id: 3,
        x: fortressX - 85,
        y: groundY - 20,
        vx: 0,
        vy: 0,
        radius: 15,
        alive: true,
        hp: 1,
        scale: 1,
        isFalling: false,
      },
    ];
  }, []);

  // Launch bird with velocity
  const fireBird = useCallback(
    (vx: number, vy: number) => {
      inFlight.current = true;
      isDragging.current = false;
      flightStartTime.current = Date.now();

      // King Sling power-up gives speed and punch multiplier!
      const speedMultiplier = activePowerUps.king_sling ? 1.6 : 1;
      birdVel.current = { vx: vx * speedMultiplier, vy: vy * speedMultiplier };

      soundEffects.playLaunch();
      soundEffects.playBirdChirp(activeBird === 'chuck' ? 'chuck' : activeBird === 'bomb' ? 'bomb' : 'red');

      // Trigger TNT rain if active
      if (activePowerUps.tnt_rain && canvasRef.current) {
        const cWidth = canvasRef.current.width / (window.devicePixelRatio || 1);
        const fx = Math.max(360, cWidth - 200);
        // Add falling TNT bomb blocks
        blocks.current.push(
          { id: 991, x: fx - 30, y: 10, vx: 1, vy: 5, w: 28, h: 28, material: 'tnt', hp: 1, maxHp: 1, destroyed: false, rotation: 0.1, rotSpeed: 0.05, isFalling: true },
          { id: 992, x: fx + 20, y: -20, vx: -0.5, vy: 6, w: 28, h: 28, material: 'tnt', hp: 1, maxHp: 1, destroyed: false, rotation: -0.1, rotSpeed: -0.04, isFalling: true }
        );
      }
    },
    [activeBird, activePowerUps]
  );

  // Automated trigger from parent on correct quiz answer
  useEffect(() => {
    if (!triggerLaunch) return;

    // Reset bird to slingshot and pull back
    birdPos.current = { x: REST_BIRD_X - 48, y: REST_BIRD_Y + 28 };
    soundEffects.playSlingshotPull();

    const timer = setTimeout(() => {
      // Launch forward with high accuracy toward target
      const targetX = canvasRef.current ? Math.max(360, (canvasRef.current.width / (window.devicePixelRatio || 1)) - 190) : 650;
      const targetY = canvasRef.current ? (canvasRef.current.height / (window.devicePixelRatio || 1)) - 100 : 200;
      const dx = targetX - SLING_X;
      const dy = targetY - SLING_Y;
      const distance = Math.hypot(dx, dy);
      const speed = 19;
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed - 2.6;

      fireBird(vx, vy);
    }, 160);

    return () => clearTimeout(timer);
  }, [triggerLaunch, fireBird, REST_BIRD_X, REST_BIRD_Y, SLING_X, SLING_Y]);

  // Reset bird to slingshot
  const resetBird = useCallback(() => {
    inFlight.current = false;
    isDragging.current = false;
    birdPos.current = { x: REST_BIRD_X, y: REST_BIRD_Y };
    birdVel.current = { vx: 0, vy: 0 };
    birdRotation.current = 0;
    trail.current = [];
  }, [REST_BIRD_X, REST_BIRD_Y]);

  // Particles explosion generator
  const spawnExplosion = (
    x: number,
    y: number,
    color: string,
    type: 'wood' | 'smoke' | 'star' | 'feather' | 'score' | 'flame' | 'spark',
    count = 10,
    text?: string
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = Math.random() * 4 + 2;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 6 + 4,
        color,
        alpha: 1,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        type,
        text,
      });
    }
  };

  // Main game animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = effectiveHeight * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      initFortress(rect.width, effectiveHeight);
      resetBird();
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const groundY = height - 44;

      ctx.save();

      // Screen Shake
      if (shakeTimer.current > 0) {
        const shakeX = (Math.random() - 0.5) * shakeTimer.current * 1.5;
        const shakeY = (Math.random() - 0.5) * shakeTimer.current * 1.5;
        ctx.translate(shakeX, shakeY);
        shakeTimer.current -= 0.6;
        if (shakeTimer.current < 0) shakeTimer.current = 0;
      }

      ctx.clearRect(0, 0, width, height);

      // --- 1. Background Scene based on Custom Theme ---
      drawBackgroundTheme(ctx, width, height, groundY, theme);

      // --- 2. Slingshot Stand & Trajectory Laser / Guide ---
      const slingBaseX = SLING_X;
      const slingBaseY = groundY;

      // Draw Slingshot Fork
      ctx.strokeStyle = activePowerUps.king_sling ? '#F59E0B' : '#5B3314';
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Left prong
      ctx.beginPath();
      ctx.moveTo(slingBaseX, slingBaseY);
      ctx.lineTo(slingBaseX, SLING_Y);
      ctx.lineTo(slingBaseX - 18, SLING_Y - 42);
      ctx.stroke();

      // Right prong
      ctx.beginPath();
      ctx.moveTo(slingBaseX, SLING_Y);
      ctx.lineTo(slingBaseX + 18, SLING_Y - 42);
      ctx.stroke();

      // Golden aura for King Sling
      if (activePowerUps.king_sling) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 18;
        ctx.stroke();
      }

      const leftForkX = slingBaseX - 18;
      const leftForkY = SLING_Y - 42;
      const rightForkX = slingBaseX + 18;
      const rightForkY = SLING_Y - 42;

      // Back rubber band
      ctx.strokeStyle = activePowerUps.king_sling ? '#FACC15' : '#3E1F0B';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(leftForkX, leftForkY);
      ctx.lineTo(birdPos.current.x, birdPos.current.y);
      ctx.stroke();

      // --- Aiming Trajectory Guide / Laser Scope ---
      if (isDragging.current && !inFlight.current) {
        const pullDx = REST_BIRD_X - birdPos.current.x;
        const pullDy = REST_BIRD_Y - birdPos.current.y;
        const testSpeedMult = activePowerUps.king_sling ? 1.6 : 1;
        const testVx = pullDx * 0.28 * testSpeedMult;
        const testVy = pullDy * 0.28 * testSpeedMult;

        const hasLaser = !!activePowerUps.laser_scope;
        const maxSteps = hasLaser ? 32 : 18;

        ctx.save();
        let simX = birdPos.current.x;
        let simY = birdPos.current.y;
        let simVy = testVy;

        if (hasLaser) {
          // Vivid Laser Scope beam!
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.shadowColor = '#F87171';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(simX, simY);
          for (let step = 0; step < maxSteps; step++) {
            simX += testVx * 1.4;
            simY += simVy * 1.4;
            simVy += 0.52;
            ctx.lineTo(simX, simY);
          }
          ctx.stroke();

          // Target reticle at end of laser
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(simX, simY, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard dotted trajectory curve
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          for (let step = 0; step < maxSteps; step++) {
            simX += testVx * 1.5;
            simY += simVy * 1.5;
            simVy += 0.55;

            if (step % 2 === 0) {
              ctx.beginPath();
              ctx.arc(simX, simY, Math.max(1.5, 4.5 - step * 0.12), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        ctx.restore();
      }

      // --- 3. Draw Bird Mascot ---
      const bx = birdPos.current.x;
      const by = birdPos.current.y;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(birdRotation.current);

      // Super Seed power-up scales bird to 2.2x giant size!
      const birdScale = activePowerUps.super_seed ? 2.2 : 1;
      ctx.scale(birdScale, birdScale);

      // Render Bird Mascot Sprite
      drawBirdSprite(ctx, activeBird);

      ctx.restore();

      // Front rubber band (attached to right prong)
      if (!inFlight.current) {
        ctx.strokeStyle = activePowerUps.king_sling ? '#EAB308' : '#4B250E';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(rightForkX, rightForkY);
        ctx.lineTo(birdPos.current.x + 8, birdPos.current.y + 4);
        ctx.stroke();
      }

      // --- 4. Structural Physics Check (Crumble / Fall on destroyed support) ---
      blocks.current.forEach((block) => {
        if (block.destroyed) return;

        // If block has supports, check if all supports were destroyed
        if (block.supports && block.supports.length > 0 && !block.isFalling) {
          const livingSupports = blocks.current.filter(
            (b) => block.supports?.includes(b.id) && !b.destroyed
          );
          if (livingSupports.length === 0) {
            // Supports crumbled! This block falls!
            block.isFalling = true;
            block.vy = 2.5;
            block.vx = (Math.random() - 0.5) * 2;
            block.rotSpeed = (Math.random() - 0.5) * 0.08;
          }
        }

        // Apply falling physics
        if (block.isFalling) {
          block.x += block.vx;
          block.y += block.vy;
          block.vy += 0.45; // gravity
          block.rotation += block.rotSpeed;

          // Check hit ground
          if (block.y + block.h >= groundY) {
            block.y = groundY - block.h;
            block.vy = 0;
            block.vx *= 0.5;
            block.rotSpeed *= 0.5;

            // When heavy stone or TNT hits ground hard, damage it
            if (Math.abs(block.vy) > 4) {
              block.hp -= 1;
              if (block.hp <= 0) block.destroyed = true;
            }
          }

          // Check if falling block crushes a piggy below it!
          piggies.current.forEach((pig) => {
            if (!pig.alive) return;
            if (
              block.x < pig.x + pig.radius &&
              block.x + block.w > pig.x - pig.radius &&
              block.y + block.h >= pig.y - pig.radius &&
              block.y <= pig.y + pig.radius &&
              Math.abs(block.vy) > 1.2
            ) {
              // Crushed by collapsing structure!
              pig.alive = false;
              soundEffects.playPiggyPop();
              shakeTimer.current = 10;
              spawnExplosion(pig.x, pig.y, '#22C55E', 'smoke', 15);
              spawnExplosion(pig.x, pig.y - 20, '#FACC15', 'score', 1, '+1,500 塌方擊殺!');
              if (onPiggyDefeated) onPiggyDefeated(1500);
            }
          });
        }
      });

      // --- 5. Render Blocks (Wood, Ice, Stone, TNT) ---
      blocks.current.forEach((block) => {
        if (block.destroyed) return;

        ctx.save();
        ctx.translate(block.x + block.w / 2, block.y + block.h / 2);
        ctx.rotate(block.rotation);

        if (block.material === 'wood') {
          ctx.fillStyle = '#D97706';
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 2;
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
          // wood grain line
          ctx.beginPath();
          ctx.moveTo(-block.w / 2 + 3, 0);
          ctx.lineTo(block.w / 2 - 3, 0);
          ctx.stroke();
        } else if (block.material === 'ice') {
          ctx.fillStyle = 'rgba(147, 197, 253, 0.88)';
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 2;
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
          // Ice glint
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.moveTo(-block.w / 2 + 4, -block.h / 2 + 4);
          ctx.lineTo(0, -block.h / 2 + 4);
          ctx.lineTo(-block.w / 2 + 4, 0);
          ctx.closePath();
          ctx.fill();
        } else if (block.material === 'stone') {
          ctx.fillStyle = '#64748B';
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
        } else if (block.material === 'tnt') {
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('TNT', 0, 0);
          ctx.strokeStyle = '#991B1B';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
        }

        ctx.restore();
      });

      // --- 6. Render Piggies ---
      piggies.current.forEach((pig) => {
        if (!pig.alive) return;
        drawPiggySprite(ctx, pig.x, pig.y, pig.radius, pig.hasHelmet);
      });

      // --- 7. Flight Physics & Collision Detection ---
      if (inFlight.current) {
        // Record trail
        const trailColor = activePowerUps.king_sling
          ? '#F59E0B'
          : activePowerUps.speed_potion
          ? '#38BDF8'
          : activeBirdData.color;

        trail.current.push({ x: bx, y: by, alpha: 0.9, color: trailColor });
        if (trail.current.length > 24) trail.current.shift();

        // Update physics
        birdPos.current.x += birdVel.current.vx;
        birdPos.current.y += birdVel.current.vy;
        birdVel.current.vy += 0.52; // gravity
        birdRotation.current = Math.atan2(birdVel.current.vy, birdVel.current.vx);

        // Ground hit
        if (birdPos.current.y >= groundY - 14) {
          birdPos.current.y = groundY - 14;
          soundEffects.playImpact();
          spawnExplosion(birdPos.current.x, birdPos.current.y, activeBirdData.color, 'feather', 10);
          shakeTimer.current = 6;

          setTimeout(() => {
            resetBird();
          }, 600);
        }

        // Out of screen bounds
        if (birdPos.current.x > width + 60 || birdPos.current.x < -60) {
          resetBird();
        }

        const effectiveBirdRadius = (activePowerUps.super_seed ? 2.2 : 1) * 18;

        // Collision with blocks
        blocks.current.forEach((b) => {
          if (b.destroyed) return;
          const hit =
            birdPos.current.x + effectiveBirdRadius >= b.x &&
            birdPos.current.x - effectiveBirdRadius <= b.x + b.w &&
            birdPos.current.y + effectiveBirdRadius >= b.y &&
            birdPos.current.y - effectiveBirdRadius <= b.y + b.h;

          if (hit) {
            // Speed potion or Terence / Mighty Eagle penetrates easily!
            const hitDamage =
              activePowerUps.super_seed || activeBird === 'terence' || activeBird === 'mighty_eagle'
                ? 3
                : activePowerUps.king_sling
                ? 2
                : 1;

            b.hp -= hitDamage;
            if (b.hp <= 0) {
              b.destroyed = true;
            } else {
              // Knockback & wobble
              b.vx += birdVel.current.vx * 0.15;
              b.isFalling = true;
            }

            soundEffects.playImpact();
            shakeTimer.current = b.material === 'tnt' ? 16 : 8;
            spawnExplosion(
              b.x + b.w / 2,
              b.y + b.h / 2,
              b.material === 'wood'
                ? '#D97706'
                : b.material === 'ice'
                ? '#93C5FD'
                : b.material === 'tnt'
                ? '#DC2626'
                : '#64748B',
              'wood',
              14
            );

            // TNT mega explosion
            if (b.material === 'tnt') {
              b.destroyed = true;
              shakeTimer.current = 18;
              soundEffects.playImpact();
              spawnExplosion(b.x + b.w / 2, b.y + b.h / 2, '#EF4444', 'flame', 24);

              // Chain destroy nearby blocks & kill pigs
              blocks.current.forEach((nearbyB) => {
                if (nearbyB.destroyed) return;
                const d = Math.hypot(b.x - nearbyB.x, b.y - nearbyB.y);
                if (d < 120) {
                  nearbyB.destroyed = true;
                  spawnExplosion(nearbyB.x + nearbyB.w / 2, nearbyB.y + nearbyB.h / 2, '#F59E0B', 'wood', 8);
                }
              });

              piggies.current.forEach((p) => {
                if (p.alive) {
                  p.alive = false;
                  soundEffects.playPiggyPop();
                  spawnExplosion(p.x, p.y, '#22C55E', 'smoke', 18);
                  spawnExplosion(p.x, p.y - 25, '#F59E0B', 'score', 1, '+2,500 TNT大爆破!');
                  if (onPiggyDefeated) onPiggyDefeated(2500);
                }
              });
            }

            // Deflection velocity if not super speed
            if (!activePowerUps.speed_potion && activeBird !== 'mighty_eagle') {
              birdVel.current.vx *= 0.45;
              birdVel.current.vy *= 0.65;
            }
          }
        });

        // Collision with piggies
        piggies.current.forEach((pig) => {
          if (!pig.alive) return;
          const dist = Math.hypot(birdPos.current.x - pig.x, birdPos.current.y - pig.y);
          if (dist < pig.radius + effectiveBirdRadius) {
            if (pig.hasHelmet) {
              // Knock off helmet first
              pig.hasHelmet = false;
              soundEffects.playImpact();
              shakeTimer.current = 7;
              spawnExplosion(pig.x, pig.y - 10, '#64748B', 'spark', 10);
              birdVel.current.vx *= 0.6;
            } else {
              pig.alive = false;
              soundEffects.playPiggyPop();
              shakeTimer.current = 10;
              spawnExplosion(pig.x, pig.y, '#22C55E', 'smoke', 16);
              spawnExplosion(pig.x, pig.y - 20, '#FACC15', 'score', 1, '+1,000!');
              if (onPiggyDefeated) onPiggyDefeated(1000);

              // Re-spawn fortress if all cleared after delay
              const remaining = piggies.current.filter((p) => p.alive).length;
              if (remaining === 0) {
                setTimeout(() => {
                  initFortress(width, height);
                }, 1600);
              }
            }
          }
        });
      }

      // --- 8. Draw Smoke & Flame Trail ---
      trail.current.forEach((pt) => {
        ctx.fillStyle = pt.color
          ? `rgba(${hexToRgb(pt.color)}, ${pt.alpha})`
          : `rgba(255, 255, 255, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6 * pt.alpha, 0, Math.PI * 2);
        ctx.fill();
        pt.alpha -= 0.025;
      });
      trail.current = trail.current.filter((pt) => pt.alpha > 0);

      // --- 9. Draw Flying Particles & Floating Scores ---
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.alpha -= 0.025;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        if (p.type === 'score' && p.text) {
          ctx.fillStyle = '#FEF08A';
          ctx.strokeStyle = '#854D0E';
          ctx.lineWidth = 3.5;
          ctx.font = '900 18px "Fredoka", sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeText(p.text, 0, 0);
          ctx.fillText(p.text, 0, 0);
        } else if (p.type === 'flame') {
          ctx.fillStyle = '#F97316';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'smoke') {
          ctx.fillStyle = '#E2E8F0';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      });
      particles.current = particles.current.filter((p) => p.alpha > 0);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [
    activeBird,
    activeBirdData,
    activePowerUps,
    compact,
    effectiveHeight,
    fireBird,
    initFortress,
    onPiggyDefeated,
    resetBird,
    SLING_X,
    SLING_Y,
    theme,
  ]);

  // Touch & Mouse Drag interactions (Optimized for iPad Pro 13" and Touchscreens)
  const handleStart = (clientX: number, clientY: number) => {
    if (!interactive || inFlight.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Generous touch grab radius on iPad and mobile (up to 75px)
    const distToBird = Math.hypot(x - birdPos.current.x, y - birdPos.current.y);
    const distToSling = Math.hypot(x - SLING_X, y - (SLING_Y - 25));

    if (distToBird < 65 || distToSling < 75) {
      isDragging.current = true;
      soundEffects.playSlingshotPull();
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || inFlight.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Clamp drag distance from slingshot
    const dx = x - REST_BIRD_X;
    const dy = y - REST_BIRD_Y;
    const dist = Math.hypot(dx, dy);
    const maxPull = 90;

    if (dist > maxPull) {
      birdPos.current = {
        x: REST_BIRD_X + (dx / dist) * maxPull,
        y: REST_BIRD_Y + (dy / dist) * maxPull,
      };
    } else {
      birdPos.current = { x, y };
    }

    birdRotation.current = Math.atan2(REST_BIRD_Y - birdPos.current.y, REST_BIRD_X - birdPos.current.x);
  };

  const handleEnd = () => {
    if (!isDragging.current || inFlight.current) return;
    isDragging.current = false;

    const pullDx = REST_BIRD_X - birdPos.current.x;
    const pullDy = REST_BIRD_Y - birdPos.current.y;
    const pullDist = Math.hypot(pullDx, pullDy);

    // Minimum pull threshold to fire
    if (pullDist > 16) {
      const powerRatio = 0.29;
      const vx = pullDx * powerRatio;
      const vy = pullDy * powerRatio;
      fireBird(vx, vy);
    } else {
      // Snap back without firing
      resetBird();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden select-none touch-none">
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => {
          if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleEnd}
        className={`w-full rounded-2xl block shadow-inner ${
          interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
        }`}
        style={{ height: `${effectiveHeight}px` }}
      />

      {/* Floating Tactical Power-Up Bar (Usable in real-time) */}
      {interactive && onTogglePowerUp && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20 text-white">
          <span className="text-[11px] font-bold text-yellow-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>戰術道具:</span>
          </span>

          <button
            onClick={() => onTogglePowerUp('laser_scope')}
            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activePowerUps.laser_scope
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
            title="鐳射瞄準器"
          >
            <span>🎯 鐳射</span>
            <span className="text-[10px] opacity-75">({powerUpInventory.laser_scope || 0})</span>
          </button>

          <button
            onClick={() => onTogglePowerUp('king_sling')}
            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activePowerUps.king_sling
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
            title="橡筋彈力王"
          >
            <span>⚡ 彈力王</span>
            <span className="text-[10px] opacity-75">({powerUpInventory.king_sling || 0})</span>
          </button>

          <button
            onClick={() => onTogglePowerUp('super_seed')}
            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activePowerUps.super_seed
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
            title="巨化蘑菇"
          >
            <span>🍄 巨化</span>
            <span className="text-[10px] opacity-75">({powerUpInventory.super_seed || 0})</span>
          </button>
        </div>
      )}

      {/* Floating prompt overlay if not dragging */}
      {interactive && !inFlight.current && (
        <div className="absolute bottom-2 left-3 pointer-events-none text-[11px] font-bold text-white/90 drop-shadow-md bg-black/40 px-2.5 py-0.5 rounded-lg">
          👆 拖動憤怒鳥向後蓄力，瞄準要塞弱點鬆開射擊！
        </div>
      )}
    </div>
  );
};

// --- Helper Functions ---

function hexToRgb(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length === 6) {
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }
  return '255, 255, 255';
}

function drawBackgroundTheme(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  theme: BackgroundThemeId
) {
  if (theme === 'night_sky') {
    // Midnight purple-navy gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#0F172A');
    skyGrad.addColorStop(0.6, '#1E1B4B');
    skyGrad.addColorStop(1, '#312E81');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // Glowing Aurora waves
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, groundY * 0.4);
    ctx.bezierCurveTo(width * 0.3, groundY * 0.2, width * 0.7, groundY * 0.6, width, groundY * 0.3);
    ctx.lineTo(width, groundY);
    ctx.lineTo(0, groundY);
    ctx.fill();

    // Twinkling stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 35; i++) {
      const sx = (i * 97) % width;
      const sy = (i * 53) % (groundY - 30);
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3 === 0) ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moon
    ctx.fillStyle = '#FEF08A';
    ctx.shadowColor = '#FDE047';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(width * 0.75, 45, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dark mountains
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width * 0.3, groundY - 60);
    ctx.lineTo(width * 0.6, groundY - 30);
    ctx.lineTo(width, groundY - 70);
    ctx.lineTo(width, groundY);
    ctx.fill();

    // Dark ground
    ctx.fillStyle = '#065F46';
    ctx.fillRect(0, groundY - 8, width, 12);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, groundY + 4, width, height - groundY);
  } else if (theme === 'sunset_beach') {
    // Sunset orange-magenta gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#FB923C');
    skyGrad.addColorStop(0.5, '#F43F5E');
    skyGrad.addColorStop(1, '#FED7AA');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // Giant setting sun
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(width * 0.5, groundY - 10, 48, 0, Math.PI * 2);
    ctx.fill();

    // Ocean water
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(0, groundY - 20, width, 20);

    // Golden sand beach
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(0, groundY - 8, width, 12);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(0, groundY + 4, width, height - groundY);
  } else if (theme === 'volcano_fortress') {
    // Smoky red-charcoal volcano sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#18181B');
    skyGrad.addColorStop(0.6, '#7F1D1D');
    skyGrad.addColorStop(1, '#991B1B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // Volcano crags
    ctx.fillStyle = '#27272A';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width * 0.4, groundY - 85);
    ctx.lineTo(width * 0.55, groundY - 75);
    ctx.lineTo(width * 0.8, groundY - 95);
    ctx.lineTo(width, groundY);
    ctx.fill();

    // Magma glows
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(0, groundY - 8, width, 12);
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(0, groundY + 4, width, height - groundY);

    // Lava bubbles
    ctx.fillStyle = '#FCD34D';
    for (let px = 30; px < width; px += 60) {
      ctx.beginPath();
      ctx.arc(px, groundY + 12, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'cyber_space') {
    // Deep Space Cyber
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#050505');
    skyGrad.addColorStop(0.5, '#0B0F19');
    skyGrad.addColorStop(1, '#1A102F');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // Distant cyber grid lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 1;
    for (let gy = groundY - 50; gy < groundY; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // Neon ground
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(0, groundY - 6, width, 8);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, groundY + 2, width, height - groundY);
  } else {
    // Classic Green Hills (Default)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#7DD3FC');
    skyGrad.addColorStop(0.7, '#BAE6FD');
    skyGrad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // Distant rolling mountains / hills
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadraticCurveTo(width * 0.25, groundY - 70, width * 0.5, groundY - 30);
    ctx.quadraticCurveTo(width * 0.75, groundY + 10, width, groundY - 45);
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();

    // Midground Green Cliff
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadraticCurveTo(width * 0.2, groundY - 40, width * 0.45, groundY - 15);
    ctx.quadraticCurveTo(width * 0.75, groundY - 45, width, groundY - 20);
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();

    // Fluffy cartoon clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    const drawCloud = (cx: number, cy: number, scale: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 18 * scale, cy - 6 * scale, 22 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 38 * scale, cy, 16 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(100, 45, 1);
    drawCloud(width * 0.55, 60, 1.2);
    drawCloud(width * 0.85, 40, 0.9);

    // Ground Dirt & Grass
    ctx.fillStyle = '#65A30D';
    ctx.fillRect(0, groundY - 8, width, 12);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, groundY + 4, width, height - groundY);

    // Soil texture pebbles
    ctx.fillStyle = '#92400E';
    for (let px = 20; px < width; px += 45) {
      ctx.beginPath();
      ctx.arc(px, groundY + 16, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// --- Detailed Vector Sprites for all 9 Bird Types ---

function drawBirdSprite(ctx: CanvasRenderingContext2D, type: BirdType) {
  if (type === 'red') {
    // Red Body
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Belly patch
    ctx.fillStyle = '#FECACA';
    ctx.beginPath();
    ctx.arc(2, 6, 11, 0, Math.PI);
    ctx.fill();

    // Fierce black eyebrows
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(0, -4);
    ctx.lineTo(10, -8);
    ctx.lineTo(10, -4);
    ctx.lineTo(0, -1);
    ctx.lineTo(-10, -4);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-5, -2, 5, 0, Math.PI * 2);
    ctx.arc(5, -2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Yellow beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(8, 2);
    ctx.lineTo(-4, 6);
    ctx.closePath();
    ctx.fill();

    // Top feathers
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(-8, -26);
    ctx.lineTo(-2, -22);
    ctx.lineTo(2, -28);
    ctx.lineTo(2, -18);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'chuck') {
    // Yellow Triangle
    ctx.fillStyle = '#EAB308';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-16, -18);
    ctx.lineTo(-16, 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-4, -4, 4.5, 0, Math.PI * 2);
    ctx.arc(4, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-2, -4, 2, 0, Math.PI * 2);
    ctx.arc(6, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Orange beak
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(14, 2);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'bomb') {
    // Black round body
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3F3F46';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fuse on top
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(2, -28);
    ctx.stroke();

    // Red pupil glow
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-5, -3, 4.5, 0, Math.PI * 2);
    ctx.arc(5, -3, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(-4, -3, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(7, 2);
    ctx.lineTo(-4, 6);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'blues') {
    // Tiny blue bird
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-3, -2, 3.5, 0, Math.PI * 2);
    ctx.arc(4, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-2, -2, 1.8, 0, Math.PI * 2);
    ctx.arc(5, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(6, 1.5);
    ctx.lineTo(-2, 4);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'matilda') {
    // Matilda Egg shape
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pink cheeks
    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.arc(-10, 4, 3.5, 0, Math.PI * 2);
    ctx.arc(10, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-3, -1);
    ctx.lineTo(6, 1);
    ctx.lineTo(-3, 4);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'terence') {
    // Giant Dark Red Terence
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Heavy menacing brow
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(0, -5);
    ctx.lineTo(16, -10);
    ctx.lineTo(14, -2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-14, -2);
    ctx.closePath();
    ctx.fill();

    // Small intense eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-7, 2, 4, 0, Math.PI * 2);
    ctx.arc(7, 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-6, 2, 2.5, 0, Math.PI * 2);
    ctx.arc(8, 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Solid beak
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.lineTo(8, 6);
    ctx.lineTo(-4, 11);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'hal') {
    // Hal (Green Toucan Boomerang)
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(-4, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Huge long yellow beak
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(24, 4);
    ctx.lineTo(2, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-2, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, -4, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'stella') {
    // Stella (Cute Pink)
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DB2777';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Big sky blue eyes
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-4, -2, 4.5, 0, Math.PI * 2);
    ctx.arc(5, -2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Yellow beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-2, 1);
    ctx.lineTo(7, 3);
    ctx.lineTo(-2, 6);
    ctx.closePath();
    ctx.fill();
  } else {
    // Mighty Eagle (Huge Legendary Eagle)
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // White bald eagle face
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(4, -2, 18, 0, Math.PI * 2);
    ctx.fill();

    // Curved fierce golden beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.quadraticCurveTo(28, 0, 22, 14);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();

    // Eagle fierce eye
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(2, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(4, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPiggySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  hasHelmet?: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  // Pig Body
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#86EFAC';
  ctx.beginPath();
  ctx.ellipse(0, 2, radius * 0.52, radius * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.arc(-radius * 0.2, 2, radius * 0.12, 0, Math.PI * 2);
  ctx.arc(radius * 0.2, 2, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-radius * 0.35, -radius * 0.32, radius * 0.24, 0, Math.PI * 2);
  ctx.arc(radius * 0.35, -radius * 0.32, radius * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-radius * 0.3, -radius * 0.32, radius * 0.12, 0, Math.PI * 2);
  ctx.arc(radius * 0.3, -radius * 0.32, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.arc(-radius * 0.65, -radius * 0.65, radius * 0.22, 0, Math.PI * 2);
  ctx.arc(radius * 0.65, -radius * 0.65, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#15803D';
  ctx.stroke();

  // Helmet
  if (hasHelmet) {
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(0, -radius * 0.25, radius * 0.95, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.fillRect(-radius * 0.95, -radius * 0.25, radius * 1.9, 4);
  }

  ctx.restore();
}
