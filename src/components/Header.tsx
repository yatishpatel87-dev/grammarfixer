import React from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  GraduationCap,
  RotateCcw,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Level } from '../types';

interface HeaderProps {
  studentName: string;
  onEditStudentName: () => void;
  currentLevel: Level;
  onChangeLevel: (level: Level) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTeacherMode: () => void;
  onRestart: () => void;
  gameState: 'idle' | 'playing' | 'celebrating' | 'finished';
}

export const Header: React.FC<HeaderProps> = ({
  studentName,
  onEditStudentName,
  currentLevel,
  onChangeLevel,
  isMuted,
  onToggleMute,
  onOpenTeacherMode,
  onRestart,
  gameState,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Grammar Fixer
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ENG ↔ GUJ
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                ખોટું sentence દેખાય → ભૂલ શોધીને correct sentence લખવાનું
              </p>
            </div>
          </div>

          {/* Level Selector & Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Level Selector */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <span className="px-2 text-slate-400 text-[11px] hidden lg:inline">Level:</span>
              <button
                id="header-lvl-1"
                onClick={() => onChangeLevel(1)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  currentLevel === 1
                    ? 'bg-white text-emerald-700 shadow-xs font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Beginner
              </button>
              <button
                id="header-lvl-2"
                onClick={() => onChangeLevel(2)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  currentLevel === 2
                    ? 'bg-white text-blue-700 shadow-xs font-bold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2 Inter
              </button>
              <button
                id="header-lvl-3"
                onClick={() => onChangeLevel(3)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  currentLevel === 3
                    ? 'bg-white text-purple-700 shadow-xs font-bold border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3 Advanced
              </button>
            </div>

            {/* Student Name Pill */}
            <button
              id="header-student-name-btn"
              onClick={onEditStudentName}
              title="Change Student Name"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[110px] truncate">{studentName || 'Student'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="header-sound-toggle"
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            {/* Restart Session button if active */}
            {gameState === 'playing' && (
              <button
                id="header-restart-btn"
                onClick={onRestart}
                title="Restart 20 Challenges"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium border border-slate-200 hover:border-rose-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Teacher Mode Button */}
            <button
              id="header-teacher-mode-btn"
              onClick={onOpenTeacherMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition shadow-2xs"
            >
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Teacher Mode</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
