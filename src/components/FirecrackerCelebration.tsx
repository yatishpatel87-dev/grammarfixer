import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Flame, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface FirecrackerCelebrationProps {
  autoBlowDurationSeconds?: number;
  onTimerComplete?: () => void;
  showControls?: boolean;
}

interface CrackerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  sparkle?: boolean;
}

interface CrackerRocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
}

export const FirecrackerCelebration: React.FC<FirecrackerCelebrationProps> = ({
  autoBlowDurationSeconds = 15,
  onTimerComplete,
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(autoBlowDurationSeconds);
  const [activeType, setActiveType] = useState<'all' | 'rocket' | 'lad' | 'anar' | 'chakri'>('all');

  const particlesRef = useRef<CrackerParticle[]>([]);
  const rocketsRef = useRef<CrackerRocket[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastLaunchRef = useRef<number>(0);

  // Countdown timer for automatic celebration
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (onTimerComplete) onTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, onTimerComplete]);

  // Burst Helpers
  const triggerLadBurst = (centerX?: number, centerY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEffects.playCrackerSeries();

    const x = centerX ?? Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
    const y = centerY ?? Math.random() * (canvas.height * 0.5) + canvas.height * 0.2;

    const colors = ['#FF2D55', '#FF9500', '#FFCC00', '#FFFFFF', '#34C759'];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      particlesRef.current.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.02,
        gravity: 0.12,
        sparkle: Math.random() > 0.4,
      });
    }
  };

  const triggerAnarFountain = (bottomX?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEffects.playSparklerCrackle();

    const x = bottomX ?? Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    const y = canvas.height - 20;

    const colors = ['#FFD700', '#FFA500', '#FFFFFF', '#00FFFF', '#FF69B4'];
    const count = 55;

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
      const speed = Math.random() * 9 + 6;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2.5 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.014,
        gravity: 0.22,
        sparkle: true,
      });
    }
  };

  const triggerChakri = (xPos?: number, yPos?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEffects.playSparklerCrackle();

    const x = xPos ?? Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    const y = yPos ?? canvas.height - 50;

    const colors = ['#30D158', '#FF375F', '#FFD60A', '#64D2FF'];
    const count = 50;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 5 + 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2.5 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        gravity: 0.05,
        sparkle: true,
      });
    }
  };

  const triggerRocket = (startX?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEffects.playRocketLaunch();

    const x = startX ?? Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    const targetY = Math.random() * (canvas.height * 0.4) + canvas.height * 0.15;
    const colors = ['#FF3B30', '#34C759', '#FF9500', '#5856D6', '#00C7BE', '#FFD700'];

    rocketsRef.current.push({
      x,
      y: canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: -(Math.random() * 3 + 8),
      targetY,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial festive blast
    triggerLadBurst();
    triggerAnarFountain();
    setTimeout(() => triggerRocket(), 200);
    setTimeout(() => triggerChakri(), 400);

    const render = (time: number) => {
      if (isPlaying) {
        // Automatic bursts every 500-900ms while active
        if (time - lastLaunchRef.current > 550) {
          const rand = Math.random();
          if (activeType === 'all') {
            if (rand < 0.35) triggerRocket();
            else if (rand < 0.65) triggerLadBurst();
            else if (rand < 0.85) triggerAnarFountain();
            else triggerChakri();
          } else if (activeType === 'rocket') {
            triggerRocket();
          } else if (activeType === 'lad') {
            triggerLadBurst();
          } else if (activeType === 'anar') {
            triggerAnarFountain();
          } else if (activeType === 'chakri') {
            triggerChakri();
          }
          lastLaunchRef.current = time;
        }
      }

      // Clear canvas with transparent fade
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.x += r.vx;
        r.y += r.vy;

        // Draw rocket head & spark trail
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sparks behind rocket
        particlesRef.current.push({
          x: r.x + (Math.random() * 4 - 2),
          y: r.y + (Math.random() * 4 - 2),
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 2 + 1,
          color: '#FFA500',
          size: 1.5,
          alpha: 0.8,
          decay: 0.05,
          gravity: 0.1,
          sparkle: true,
        });

        if (r.y <= r.targetY || r.vy >= 0) {
          triggerLadBurst(r.x, r.y);
          rocketsRef.current.splice(i, 1);
        }
      }

      // Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= 0.98;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        if (p.sparkle) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, activeType]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeType === 'anar') triggerAnarFountain(x);
    else if (activeType === 'chakri') triggerChakri(x, y);
    else if (activeType === 'rocket') triggerRocket(x);
    else triggerLadBurst(x, y);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none">
      {/* Interactive Cracker Canvas Layer */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="pointer-events-auto absolute inset-0 cursor-pointer"
        title="Tap to burst firecrackers!"
      />

      {/* Floating Festive Banner at Top Center */}
      {showControls && (
        <div className="pointer-events-auto absolute top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-lg px-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 text-white shadow-xl border border-amber-500/40 backdrop-blur-md animate-bounce">
            <span className="text-lg">🧨</span>
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              Celebration Crackers Blowing! (ફટાકડા ફૂટી રહ્યા છે!)
            </span>
            {secondsLeft > 0 && (
              <span className="font-mono text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                {secondsLeft}s
              </span>
            )}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 text-slate-300 hover:text-white transition"
              title={isPlaying ? 'Pause Crackers' : 'Resume Crackers'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          {/* Interactive Cracker Launchpad Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 shadow-lg border border-amber-200/80 backdrop-blur-sm">
            <button
              onClick={() => {
                triggerLadBurst();
                setActiveType('lad');
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition"
              title="Burst String of Crackers (લડી)"
            >
              💥 Lad Burst
            </button>

            <button
              onClick={() => {
                triggerRocket();
                setActiveType('rocket');
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition"
              title="Launch Sky Rocket (રોકેટ)"
            >
              🚀 Rocket
            </button>

            <button
              onClick={() => {
                triggerAnarFountain();
                setActiveType('anar');
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition"
              title="Light Anar Flowerpot (કોઠી/દાડમ)"
            >
              🌟 Anar
            </button>

            <button
              onClick={() => {
                triggerChakri();
                setActiveType('chakri');
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition"
              title="Spin Ground Chakri (ચકરી)"
            >
              🌀 Chakri
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
