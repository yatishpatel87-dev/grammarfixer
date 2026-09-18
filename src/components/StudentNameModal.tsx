import React, { useState } from 'react';
import { User, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { Level } from '../types';

interface StudentNameModalProps {
  isOpen: boolean;
  currentName: string;
  onSave: (name: string, selectedLevel: Level) => void;
  onClose?: () => void;
  allowClose?: boolean;
  initialLevel?: Level;
}

export const StudentNameModal: React.FC<StudentNameModalProps> = ({
  isOpen,
  currentName,
  onSave,
  onClose,
  allowClose = false,
  initialLevel = 1,
}) => {
  const [name, setName] = useState<string>(currentName || '');
  const [level, setLevel] = useState<Level>(initialLevel);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), level);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 animate-fadeIn">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to Grammar Fixer!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ખોટું sentence દેખાય → ભૂલ શોધીને correct sentence લખવાનું 👦
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="student-name-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              👦 Student Name / વિદ્યાર્થીનું નામ:
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              autoFocus
              placeholder="Enter your full name (e.g., Aarav Patel)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Your name will appear on your official Certificate of Achievement.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              🎯 Select Starting Level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLevel(1)}
                className={`p-3 rounded-xl border text-center transition ${
                  level === 1
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="text-xs font-black">Level 1</div>
                <div className="text-[10px] text-slate-400">Beginner</div>
              </button>

              <button
                type="button"
                onClick={() => setLevel(2)}
                className={`p-3 rounded-xl border text-center transition ${
                  level === 2
                    ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="text-xs font-black">Level 2</div>
                <div className="text-[10px] text-slate-400">Intermediate</div>
              </button>

              <button
                type="button"
                onClick={() => setLevel(3)}
                className={`p-3 rounded-xl border text-center transition ${
                  level === 3
                    ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="text-xs font-black">Level 3</div>
                <div className="text-[10px] text-slate-400">Advanced</div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {allowClose && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            )}
            <button
              id="start-challenge-name-btn"
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Start 20 Challenges!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
