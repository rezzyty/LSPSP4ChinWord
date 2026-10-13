import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BirdType, BirdInfo } from '../types/quiz';
import { BIRDS } from '../data/lessonsData';
import { soundEffects } from '../utils/soundEffects';

interface SlingshotCanvasProps {
  activeBird: BirdType;
  onBirdChange?: (bird: BirdType) => void;
  triggerLaunch?: number; // timestamp trigger from parent on correct answer
  onPiggyDefeated?: (points: number) => void;
  interactive?: boolean; // allow manual drag & release
  compact?: boolean;
  canvasHeight?: number;
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
  type: 'feather' | 'wood' | 'smoke' | 'star' | 'score';
  text?: string;
}

interface Piggy {
  id: number;
  x: number;
  y: number;
  radius: number;
  alive: boolean;
  hp: number;
  hasHelmet?: boolean;
  isKing?: boolean;
  scale: number;
}

interface Block {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  material: 'wood' | 'ice' | 'stone' | 'tnt';
  destroyed: boolean;
  rotation: number;
}

export const AngryBirdsSlingshotCanvas: React.FC<SlingshotCanvasProps> = ({
  activeBird,
  onBirdChange,
  triggerLaunch,
  onPiggyDefeated,
  interactive = true,
  compact = false,
  canvasHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const effectiveHeight = canvasHeight || (compact ? 160 : 250);

  // Slingshot origin coords
  const SLING_X = 130;
  const SLING_Y = effectiveHeight - 85;
  const REST_BIRD_X = SLING_X - 10;
  const REST_BIRD_Y = SLING_Y - 26;

  // Dragging state
  const isDragging = useRef(false);
  const birdPos = useRef({ x: REST_BIRD_X, y: REST_BIRD_Y });
  const birdVel = useRef({ vx: 0, vy: 0 });
  const inFlight = useRef(false);
  const birdRotation = useRef(0);

  // Flight smoke trail
  const trail = useRef<{ x: number; y: number; alpha: number }[]>([]);

  // Fortress & Piggies
  const piggies = useRef<Piggy[]>([]);
  const blocks = useRef<Block[]>([]);
  const particles = useRef<Particle[]>([]);

  // Screen shake
  const shakeTimer = useRef(0);
  const [activeBirdData, setActiveBirdData] = useState<BirdInfo>(
    BIRDS.find((b) => b.id === activeBird) || BIRDS[0]
  );

  useEffect(() => {
    const found = BIRDS.find((b) => b.id === activeBird);
    if (found) setActiveBirdData(found);
  }, [activeBird]);

  // Reset / spawn fortress
  const initFortress = useCallback((width: number, height: number) => {
    const groundY = height - 55;
    const fortressX = width - 170;

    // Blocks
    blocks.current = [
      // Base
      { id: 1, x: fortressX - 50, y: groundY - 40, w: 20, h: 40, material: 'wood', destroyed: false, rotation: 0 },
      { id: 2, x: fortressX + 50, y: groundY - 40, w: 20, h: 40, material: 'wood', destroyed: false, rotation: 0 },
      { id: 3, x: fortressX - 55, y: groundY - 55, w: 130, h: 15, material: 'stone', destroyed: false, rotation: 0 },
      // Mid level
      { id: 4, x: fortressX - 35, y: groundY - 95, w: 20, h: 40, material: 'ice', destroyed: false, rotation: 0 },
      { id: 5, x: fortressX + 35, y: groundY - 95, w: 20, h: 40, material: 'ice', destroyed: false, rotation: 0 },
      { id: 6, x: fortressX - 40, y: groundY - 110, w: 100, h: 15, material: 'wood', destroyed: false, rotation: 0 },
      // TNT box
      { id: 7, x: fortressX - 10, y: groundY - 35, w: 28, h: 35, material: 'tnt', destroyed: false, rotation: 0 },
      // Top roof
      { id: 8, x: fortressX - 15, y: groundY - 145, w: 18, h: 35, material: 'wood', destroyed: false, rotation: 0 },
      { id: 9, x: fortressX + 15, y: groundY - 145, w: 18, h: 35, material: 'wood', destroyed: false, rotation: 0 },
      { id: 10, x: fortressX - 25, y: groundY - 160, w: 70, h: 15, material: 'stone', destroyed: false, rotation: 0 },
    ];

    // Piggies
    piggies.current = [
      {
        id: 1,
        x: fortressX,
        y: groundY - 80,
        radius: 17,
        alive: true,
        hp: 1,
        scale: 1,
      },
      {
        id: 2,
        x: fortressX,
        y: groundY - 135,
        radius: 19,
        alive: true,
        hp: 1,
        hasHelmet: true,
        scale: 1,
      },
    ];
  }, []);

  // Launch bird with velocity
  const fireBird = useCallback((vx: number, vy: number) => {
    inFlight.current = true;
    isDragging.current = false;
    birdVel.current = { vx, vy };
    soundEffects.playLaunch();
    soundEffects.playBirdChirp(activeBird === 'chuck' ? 'chuck' : activeBird === 'bomb' ? 'bomb' : 'red');
  }, [activeBird]);

  // Automated trigger from parent on correct quiz answer
  useEffect(() => {
    if (!triggerLaunch) return;

    // Reset bird to slingshot and pull back
    birdPos.current = { x: REST_BIRD_X - 48, y: REST_BIRD_Y + 28 };
    soundEffects.playSlingshotPull();

    const timer = setTimeout(() => {
      // Launch forward with high accuracy toward target
      const targetX = canvasRef.current ? canvasRef.current.width - 170 : 650;
      const targetY = canvasRef.current ? canvasRef.current.height - 110 : 200;
      const dx = targetX - SLING_X;
      const dy = targetY - SLING_Y;
      const distance = Math.hypot(dx, dy);
      const speed = 19;
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed - 2.8;

      fireBird(vx, vy);
    }, 180);

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
  const spawnExplosion = (x: number, y: number, color: string, type: 'wood' | 'smoke' | 'star' | 'feather' | 'score', count = 10, text?: string) => {
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
      ctx.scale(dpr, dpr);
      initFortress(rect.width, effectiveHeight);
      resetBird();
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const groundY = height - 45;

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

      // --- 1. Background Sky & Hills ---
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
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
      ctx.fillStyle = '#65A30D'; // Bright green grass top
      ctx.fillRect(0, groundY - 8, width, 12);
      ctx.fillStyle = '#78350F'; // Rich soil
      ctx.fillRect(0, groundY + 4, width, height - groundY);

      // Soil texture pebbles
      ctx.fillStyle = '#92400E';
      for (let px = 20; px < width; px += 45) {
        ctx.beginPath();
        ctx.arc(px, groundY + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 2. Slingshot Stand & Trajectory ---
      const slingBaseX = SLING_X;
      const slingBaseY = groundY;

      // Draw Slingshot Back Wood Fork
      ctx.strokeStyle = '#5B3314';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Left prong
      ctx.beginPath();
      ctx.moveTo(slingBaseX, slingBaseY);
      ctx.lineTo(slingBaseX, SLING_Y);
      ctx.lineTo(slingBaseX - 16, SLING_Y - 40);
      ctx.stroke();

      // Right prong
      ctx.beginPath();
      ctx.moveTo(slingBaseX, SLING_Y);
      ctx.lineTo(slingBaseX + 16, SLING_Y - 40);
      ctx.stroke();

      // Rubber bands
      const leftForkX = slingBaseX - 16;
      const leftForkY = SLING_Y - 40;
      const rightForkX = slingBaseX + 16;
      const rightForkY = SLING_Y - 40;

      // Back rubber band
      ctx.strokeStyle = '#3E1F0B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftForkX, leftForkY);
      ctx.lineTo(birdPos.current.x, birdPos.current.y);
      ctx.stroke();

      // Aiming Trajectory Guide (Dotted curve when dragging)
      if (isDragging.current && !inFlight.current) {
        const pullDx = REST_BIRD_X - birdPos.current.x;
        const pullDy = REST_BIRD_Y - birdPos.current.y;
        const testVx = pullDx * 0.28;
        const testVy = pullDy * 0.28;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        let simX = birdPos.current.x;
        let simY = birdPos.current.y;
        let simVy = testVy;

        for (let step = 0; step < 18; step++) {
          simX += testVx * 1.5;
          simY += simVy * 1.5;
          simVy += 0.55; // gravity

          if (step % 2 === 0) {
            ctx.beginPath();
            ctx.arc(simX, simY, 4 - step * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // --- 3. Draw Bird ---
      const bx = birdPos.current.x;
      const by = birdPos.current.y;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(birdRotation.current);

      // Render Bird Mascot by type
      drawBirdSprite(ctx, activeBird);

      ctx.restore();

      // Front rubber band (attached to right prong)
      if (!inFlight.current) {
        ctx.strokeStyle = '#4B250E';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(rightForkX, rightForkY);
        ctx.lineTo(birdPos.current.x + 8, birdPos.current.y + 4);
        ctx.stroke();
      }

      // --- 4. Blocks (Wood, Ice, Stone, TNT) ---
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
          ctx.fillStyle = 'rgba(147, 197, 253, 0.85)';
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 2;
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
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
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('TNT', 0, 0);
          ctx.strokeStyle = '#991B1B';
          ctx.lineWidth = 2;
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
        }

        ctx.restore();
      });

      // --- 5. Piggies ---
      piggies.current.forEach((pig) => {
        if (!pig.alive) return;
        drawPiggySprite(ctx, pig.x, pig.y, pig.radius, pig.hasHelmet);
      });

      // --- 6. Flight Physics & Collision Detection ---
      if (inFlight.current) {
        // Record trail smoke
        trail.current.push({ x: bx, y: by, alpha: 0.9 });
        if (trail.current.length > 20) trail.current.shift();

        // Update physics
        birdPos.current.x += birdVel.current.vx;
        birdPos.current.y += birdVel.current.vy;
        birdVel.current.vy += 0.52; // gravity
        birdRotation.current = Math.atan2(birdVel.current.vy, birdVel.current.vx);

        // Ground hit
        if (birdPos.current.y >= groundY - 14) {
          birdPos.current.y = groundY - 14;
          soundEffects.playImpact();
          spawnExplosion(birdPos.current.x, birdPos.current.y, activeBirdData.color, 'feather', 8);
          shakeTimer.current = 5;

          setTimeout(() => {
            resetBird();
          }, 600);
        }

        // Out of screen bounds
        if (birdPos.current.x > width + 40 || birdPos.current.x < -40) {
          resetBird();
        }

        // Collision with blocks
        blocks.current.forEach((b) => {
          if (b.destroyed) return;
          const hit =
            birdPos.current.x + 15 >= b.x &&
            birdPos.current.x - 15 <= b.x + b.w &&
            birdPos.current.y + 15 >= b.y &&
            birdPos.current.y - 15 <= b.y + b.h;

          if (hit) {
            b.destroyed = true;
            soundEffects.playImpact();
            shakeTimer.current = 8;
            spawnExplosion(b.x + b.w / 2, b.y + b.h / 2, b.material === 'wood' ? '#D97706' : b.material === 'ice' ? '#93C5FD' : '#DC2626', 'wood', 12);

            if (b.material === 'tnt') {
              // TNT mega explosion
              shakeTimer.current = 14;
              soundEffects.playImpact();
              piggies.current.forEach((p) => {
                if (p.alive) {
                  p.alive = false;
                  soundEffects.playPiggyPop();
                  spawnExplosion(p.x, p.y, '#22C55E', 'smoke', 16);
                  spawnExplosion(p.x, p.y - 20, '#F59E0B', 'score', 1, '+2,000');
                  if (onPiggyDefeated) onPiggyDefeated(2000);
                }
              });
            }
          }
        });

        // Collision with piggies
        piggies.current.forEach((pig) => {
          if (!pig.alive) return;
          const dist = Math.hypot(birdPos.current.x - pig.x, birdPos.current.y - pig.y);
          if (dist < pig.radius + 18) {
            pig.alive = false;
            soundEffects.playPiggyPop();
            shakeTimer.current = 10;
            spawnExplosion(pig.x, pig.y, '#22C55E', 'smoke', 14);
            spawnExplosion(pig.x, pig.y - 20, '#FACC15', 'score', 1, '+1,000!');
            if (onPiggyDefeated) onPiggyDefeated(1000);

            // Re-spawn fortress if all cleared after delay
            const remaining = piggies.current.filter((p) => p.alive).length;
            if (remaining === 0) {
              setTimeout(() => {
                initFortress(width, height);
              }, 1800);
            }
          }
        });
      }

      // --- 7. Draw Smoke Trail ---
      trail.current.forEach((pt) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5 * pt.alpha, 0, Math.PI * 2);
        ctx.fill();
        pt.alpha -= 0.02;
      });
      trail.current = trail.current.filter((pt) => pt.alpha > 0);

      // --- 8. Draw Flying Particles & Floating Scores ---
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
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
          ctx.lineWidth = 3;
          ctx.font = '900 18px "Fredoka", sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeText(p.text, 0, 0);
          ctx.fillText(p.text, 0, 0);
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
  }, [activeBird, activeBirdData, compact, fireBird, initFortress, onPiggyDefeated, resetBird, SLING_X, SLING_Y]);

  // Mouse & Touch Drag interactions
  const handleStart = (clientX: number, clientY: number) => {
    if (!interactive || inFlight.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check click near slingshot bird
    const dist = Math.hypot(x - birdPos.current.x, y - birdPos.current.y);
    if (dist < 55) {
      isDragging.current = true;
      soundEffects.playSlingshotPull();
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || inFlight.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Limit maximum stretch radius
    const maxPull = 80;
    const dx = x - REST_BIRD_X;
    const dy = y - REST_BIRD_Y;
    const distance = Math.hypot(dx, dy);

    if (distance > maxPull) {
      const angle = Math.atan2(dy, dx);
      birdPos.current = {
        x: REST_BIRD_X + Math.cos(angle) * maxPull,
        y: REST_BIRD_Y + Math.sin(angle) * maxPull,
      };
    } else {
      birdPos.current = { x, y };
    }
  };

  const handleEnd = () => {
    if (!isDragging.current || inFlight.current) return;
    const pullDx = REST_BIRD_X - birdPos.current.x;
    const pullDy = REST_BIRD_Y - birdPos.current.y;
    const pullDist = Math.hypot(pullDx, pullDy);

    if (pullDist > 16) {
      // Valid shot
      const power = Math.min(pullDist * 0.28, 22);
      const angle = Math.atan2(pullDy, pullDx);
      const vx = Math.cos(angle) * power;
      const vy = Math.sin(angle) * power;
      fireBird(vx, vy);
    } else {
      // Cancelled pull
      resetBird();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl border-4 border-amber-800/40 bg-sky-200 shadow-lg">
      <canvas
        ref={canvasRef}
        className="w-full touch-none cursor-grab active:cursor-grabbing block"
        style={{ height: `${effectiveHeight}px` }}
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
      />

      {/* Bird Selection Tray & Interactive Affordance Bar */}
      <div className="absolute top-2 left-3 flex items-center gap-2 bg-amber-950/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs border border-amber-400/40 shadow-sm">
        <span className="font-bold text-amber-300">彈弓出擊戰隊：</span>
        <div className="flex items-center gap-1.5">
          {BIRDS.map((b) => (
            <button
              key={b.id}
              onClick={() => onBirdChange && onBirdChange(b.id)}
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-transform ${
                activeBird === b.id
                  ? 'scale-115 ring-2 ring-yellow-300 shadow-md ring-offset-1 ring-offset-amber-950'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: b.color }}
              title={b.nameZh}
            >
              {b.id === 'red' ? '🔴' : b.id === 'chuck' ? '🟡' : b.id === 'bomb' ? '💣' : b.id === 'blues' ? '🔷' : '🥚'}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions Pill for primary school students */}
      <div className="absolute bottom-2 left-3 bg-white/85 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-semibold text-amber-900 border border-amber-300 shadow-xs pointer-events-none">
        🎯 答對題目立刻蓄力發射！亦可用手指／滑鼠拉動彈弓瞄準綠皮豬！
      </div>

      {/* Mini status indicator */}
      <div className="absolute top-2 right-3 bg-emerald-600/90 text-white font-bold text-xs px-3 py-1 rounded-full border border-emerald-300 shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
        <span>搗蛋豬要塞 · 迎戰中</span>
      </div>
    </div>
  );
};

// --- Helper Sprite Draw Functions ---

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
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1;
    ctx.stroke();

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

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-5, -3, 4.5, 0, Math.PI * 2);
    ctx.arc(5, -3, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-4, -3, 2, 0, Math.PI * 2);
    ctx.arc(6, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Orange beak
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

    // Eyes
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

    // Beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(6, 1.5);
    ctx.lineTo(-2, 4);
    ctx.closePath();
    ctx.fill();
  } else {
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

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Yellow beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-3, -1);
    ctx.lineTo(6, 1);
    ctx.lineTo(-3, 4);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPiggySprite(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, hasHelmet?: boolean) {
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

  // Googly pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-radius * 0.3, -radius * 0.32, radius * 0.12, 0, Math.PI * 2);
  ctx.arc(radius * 0.3, -radius * 0.32, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Cute Ears
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.arc(-radius * 0.65, -radius * 0.65, radius * 0.22, 0, Math.PI * 2);
  ctx.arc(radius * 0.65, -radius * 0.65, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#15803D';
  ctx.stroke();

  // Optional Helmet
  if (hasHelmet) {
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(0, -radius * 0.25, radius * 0.95, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Helmet rim
    ctx.fillStyle = '#475569';
    ctx.fillRect(-radius * 0.95, -radius * 0.25, radius * 1.9, 4);
  }

  ctx.restore();
}
