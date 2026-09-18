import React, { useState } from 'react';
import {
  Trophy,
  Award,
  BarChart3,
  RotateCcw,
  Sparkles,
  Flame,
  Clock,
  Heart,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { SessionResult, Level } from '../types';
import { FirecrackerCelebration } from './FirecrackerCelebration';

interface ResultViewProps {
  session: SessionResult;
  onPlayAgain: (level?: Level) => void;
  onOpenCertificate: () => void;
  onOpenPerformanceReport: () => void;
  onReplayFireworks: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  session,
  onPlayAgain,
  onOpenCertificate,
  onOpenPerformanceReport,
  onReplayFireworks,
}) => {
  const [showCrackers, setShowCrackers] = useState<boolean>(true);
  const isOutOfLives = session.livesRemaining <= 0 && session.questionResults.length < session.totalChallenges;

  const getAchievementBadge = () => {
    switch (session.achievement) {
      case 'gold':
        return {
          icon: '🥇',
          label: 'Gold Medal (Distinction)',
          labelGu: 'સુવર્ણ ચંદ્રક • શ્રેષ્ઠ સિદ્ધિ',
          bg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
          text: 'text-amber-950',
          desc: 'Outstanding mastery of English grammar rules with 90%+ accuracy!',
        };
      case 'silver':
        return {
          icon: '🥈',
          label: 'Silver Medal (Merit)',
          labelGu: 'રજત ચંદ્રક • ઉત્તમ સિદ્ધિ',
          bg: 'bg-gradient-to-r from-slate-300 to-slate-400',
          text: 'text-slate-900',
          desc: 'Great performance with 75%+ accuracy in identifying grammatical errors.',
        };
      case 'bronze':
        return {
          icon: '🥉',
          label: 'Bronze Medal (Pass)',
          labelGu: 'કાંસ્ય ચંદ્રક • સફળ પરિણામ',
          bg: 'bg-gradient-to-r from-amber-700 to-amber-800',
          text: 'text-amber-100',
          desc: 'Good effort! You passed with over 50% correct answers.',
        };
      default:
        return {
          icon: '🎖️',
          label: 'Certificate of Participation',
          labelGu: 'ભાગીદારી પ્રમાણપત્ર',
          bg: 'bg-gradient-to-r from-teal-500 to-emerald-600',
          text: 'text-white',
          desc: 'Keep practicing! Review the rules in the Performance Report to improve.',
        };
    }
  };

  const badge = getAchievementBadge();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fadeIn relative">
      {/* Background/Foreground Celebratory Firecrackers that blow after result */}
      {showCrackers && (
        <FirecrackerCelebration
          autoBlowDurationSeconds={20}
          showControls={true}
        />
      )}

      {/* Result Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl overflow-hidden relative z-10">
        {/* Top Decorative Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-amber-600 mb-4 shadow-inner ring-8 ring-amber-50">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isOutOfLives ? 'Run Ended! Better Luck Next Time' : 'Session Complete! 20 Challenges Done'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {session.studentName || 'Student'} • Level {session.level} Challenge
          </p>

          {/* Achievement Pill */}
          <div className="mt-4 inline-flex flex-col items-center">
            <div
              className={`px-5 py-2.5 rounded-2xl ${badge.bg} ${badge.text} font-black text-sm sm:text-base flex items-center gap-2 shadow-md`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium max-w-md text-center">
              {badge.desc}
            </p>
          </div>
        </div>

        {/* 4 Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              Final Score
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700 block mt-0.5">
              {session.totalScore.toLocaleString()}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Points</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Accuracy
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 block mt-0.5">
              {Math.round(session.accuracyPercentage)}%
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              {session.correctCount} / {session.totalChallenges} Solved
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider block">
              Max Streak
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-5 h-5 text-purple-600" />
              <span className="text-2xl sm:text-3xl font-black font-mono text-purple-700">
                {session.maxStreak}x
              </span>
            </div>
            <span className="text-[11px] text-purple-600 font-medium">Consecutive</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
              Time Taken
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-700">
                {Math.round(session.totalTimeSeconds)}s
              </span>
            </div>
            <span className="text-[11px] text-blue-600 font-medium">Total Duration</span>
          </div>
        </div>

        {/* Action Buttons: Certificate, Report, Fireworks, Play Again */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <button
            id="view-certificate-btn"
            onClick={onOpenCertificate}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md transition"
          >
            <Award className="w-5 h-5" />
            <span>📜 View & Print Certificate</span>
          </button>

          <button
            id="view-report-btn"
            onClick={onOpenPerformanceReport}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition"
          >
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>📊 Detailed Performance Report</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              id="toggle-crackers-btn"
              onClick={() => setShowCrackers(!showCrackers)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition ${
                showCrackers
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <span>🧨</span>
              <span>{showCrackers ? 'Crackers Active (ફટાકડા ચાલુ)' : 'Blow Firecrackers (ફટાકડા ફોડો)'}</span>
            </button>

            <button
              id="replay-fireworks-action-btn"
              onClick={onReplayFireworks}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>🎆 Fullscreen 15s Rockets</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="play-again-btn"
              onClick={() => onPlayAgain(session.level)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Level {session.level}</span>
            </button>

            {session.level < 3 && (
              <button
                id="next-level-btn"
                onClick={() => onPlayAgain((session.level + 1) as Level)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                <span>Level {session.level + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
