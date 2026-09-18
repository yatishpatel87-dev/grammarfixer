import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface FireworksCanvasProps {
  studentName: string;
  score: number;
  accuracy: number;
  onFinishCelebration: () => void;
  durationSeconds?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  gravity: number;
  trail: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

const PALETTES = [
  ['#FF3B30', '#FF9500', '#FFCC00'], // Fire orange-gold
  ['#34C759', '#30D158', '#63E6E2'], // Emerald neon
  ['#5856D6', '#AF52DE', '#FF2D55'], // Electric violet-pink
  ['#00C7BE', '#32ADE6', '#007AFF'], // Radiant azure cyan
  ['#FFD700', '#FFE4B5', '#FFFFFF'], // Royal sparkle gold
];

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  studentName,
  score,
  accuracy,
  onFinishCelebration,
  durationSeconds = 15,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());
  const animationFrameId = useRef<number | null>(null);

  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastLaunchTimeRef = useRef<number>(0);

  // Play fanfare on mount
  useEffect(() => {
    soundEffects.playVictoryFanfare();
  }, []);

  // 15-second countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinishCelebration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinishCelebration]);

  // Rocket launcher function
  const launchRocket = (targetX?: number, targetY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = targetX !== undefined ? targetX + (Math.random() * 40 - 20) : Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    const destY = targetY !== undefined ? targetY : Math.random() * (canvas.height * 0.4) + canvas.height * 0.15;
    const speed = Math.random() * 3 + 8;
    const angle = -Math.PI / 2 + (Math.random() * 0.2 - 0.1);

    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const color = palette[Math.floor(Math.random() * palette.length)];

    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      targetY: destY,
      vx: Math.cos(angle) * (Math.random() * 2 - 1),
      vy: -speed,
      color,
      exploded: false,
      trail: [],
    });

    soundEffects.playRocketLaunch();
  };

  const explodeRocket = (x: number, y: number, baseColor: string) => {
    soundEffects.playRocketExplosion();
    const count = Math.floor(Math.random() * 35) + 65;
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.3 - 0.15);
      const velocity = Math.random() * 6 + 2;
      const color = Math.random() > 0.3 ? baseColor : palette[Math.floor(Math.random() * palette.length)];

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012,
        color,
        size: Math.random() * 3.2 + 1.5,
        gravity: 0.08,
        trail: [],
      });
    }
  };

  // Canvas loop
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

    // Initial barrage
    for (let i = 0; i < 4; i++) {
      setTimeout(() => launchRocket(), i * 280);
    }

    const render = (time: number) => {
      // Auto launch rockets every ~450-800ms
      if (time - lastLaunchTimeRef.current > 480) {
        launchRocket();
        if (Math.random() > 0.4) {
          setTimeout(() => launchRocket(), 150);
        }
        lastLaunchTimeRef.current = time;
      }

      // Semi-transparent fade for dark festive night effect with trails
      ctx.fillStyle = 'rgba(10, 15, 30, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & Draw Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 8) r.trail.shift();

        // Draw trail
        for (let t = 0; t < r.trail.length; t++) {
          const tp = r.trail[t];
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 100, ${t / r.trail.length})`;
          ctx.fill();
        }

        r.x += r.vx;
        r.y += r.vy;

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (r.y <= r.targetY || r.vy >= 0) {
          explodeRocket(r.x, r.y, r.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 4) p.trail.shift();

        p.vx *= 0.98;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    launchRocket(x, y);
  };

  const handleToggleMute = () => {
    const nextMute = soundEffects.toggleMute();
    setIsMuted(nextMute);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-slate-950/95 text-white select-none">
      {/* Interactive Fireworks Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair"
      />

      {/* Top Banner with 15s Countdown */}
      <div className="relative z-10 w-full max-w-4xl px-4 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-amber-500/40 shadow-lg shadow-amber-500/10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="text-sm font-semibold tracking-wide text-amber-300">
            🚀 15-Second Rocket Celebration:
          </span>
          <span className="font-mono text-base font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
            {secondsRemaining}s
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="fireworks-mute-btn"
            onClick={handleToggleMute}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium backdrop-blur-sm border border-slate-700 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            {isMuted ? 'Unmute Sound' : 'Mute Sound'}
          </button>

          <button
            id="fireworks-skip-btn"
            onClick={onFinishCelebration}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
          >
            <span>View Result & Crackers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Central Announcement Banner */}
      <div className="relative z-10 text-center px-4 py-8 max-w-2xl pointer-events-none">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-medium mb-3 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>COURSE COMPLETED! • 20 CHALLENGES CONQUERED</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md">
          Congratulations,{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
            {studentName || 'Grammar Champ'}
          </span>
          !
        </h1>

        <p className="text-base sm:text-lg text-slate-300 mb-6 font-medium">
          તમે બધા 20 Grammar Challenges સફળતાપૂર્વક પૂર્ણ કર્યા છે! 🚀
        </p>

        <div className="inline-grid grid-cols-2 gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 shadow-xl pointer-events-auto">
          <div className="text-center px-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Score</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="text-center px-4 border-l border-slate-700">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Accuracy</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {Math.round(accuracy)}%
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 animate-pulse">
          ✨ Tip: Tap anywhere on the screen to launch custom fire rockets!
        </p>
      </div>

      {/* Bottom status */}
      <div className="relative z-10 pb-6 text-center text-xs text-slate-400">
        Showing full 15-second celebratory rocket launch sequence
      </div>
    </div>
  );
};
