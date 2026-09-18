import React, { useRef } from 'react';
import {
  Award,
  Download,
  Printer,
  X,
  CheckCircle,
  Star,
  Sparkles,
} from 'lucide-react';
import { SessionResult, AchievementTier } from '../types';

interface CertificateModalProps {
  session: SessionResult;
  onClose: () => void;
  onReplayFireworks?: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  session,
  onClose,
  onReplayFireworks,
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const getTierDetails = (tier: AchievementTier) => {
    switch (tier) {
      case 'gold':
        return {
          title: 'Gold Certificate of Distinction',
          titleGu: 'સુવર્ણ શ્રેષ્ઠતા પ્રમાણપત્ર',
          badgeColor: 'from-amber-400 via-yellow-300 to-amber-500',
          borderColor: 'border-amber-400',
          textColor: 'text-amber-800',
          icon: '🥇',
          ribbon: 'Distinction • સર્વોચ્ચ ગુણ',
        };
      case 'silver':
        return {
          title: 'Silver Certificate of Merit',
          titleGu: 'રજત ગુણવત્તા પ્રમાણપત્ર',
          badgeColor: 'from-slate-300 via-slate-100 to-slate-400',
          borderColor: 'border-slate-400',
          textColor: 'text-slate-700',
          icon: '🥈',
          ribbon: 'Merit • ઉત્તમ સિદ્ધિ',
        };
      case 'bronze':
        return {
          title: 'Bronze Certificate of Achievement',
          titleGu: 'કાંસ્ય સિદ્ધિ પ્રમાણપત્ર',
          badgeColor: 'from-amber-700 via-amber-600 to-amber-800',
          borderColor: 'border-amber-600',
          textColor: 'text-amber-900',
          icon: '🥉',
          ribbon: 'Passed • સફળતા',
        };
      default:
        return {
          title: 'Certificate of Participation',
          titleGu: 'સહભાગિતા પ્રમાણપત્ર',
          badgeColor: 'from-teal-400 to-emerald-500',
          borderColor: 'border-teal-400',
          textColor: 'text-teal-800',
          icon: '🎖️',
          ribbon: 'Participant',
        };
    }
  };

  const tier = getTierDetails(session.achievement);

  const handlePrint = () => {
    window.print();
  };

  const levelName =
    session.level === 1
      ? 'Level 1: Beginner (મૂળભૂત)'
      : session.level === 2
      ? 'Level 2: Intermediate (મધ્યમ)'
      : 'Level 3: Advanced (ઉચ્ચ)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:my-0 print:border-none print:shadow-none">
        {/* Modal Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Official Certificate Generator
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onReplayFireworks && (
              <button
                id="replay-fireworks-btn"
                onClick={onReplayFireworks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>15s Rockets 🎆</span>
              </button>
            )}
            <button
              id="print-certificate-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              id="close-certificate-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div
          ref={certificateRef}
          className="p-8 sm:p-14 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 text-slate-800 relative"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.04) 0%, transparent 60%)',
          }}
        >
          {/* Ornate Certificate Double Border */}
          <div className="border-4 border-double border-amber-600/40 p-6 sm:p-10 rounded-2xl relative">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-600"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-600"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-600"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-600"></div>

            {/* Header / Crest */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-900 shadow-md shadow-amber-500/20 mb-3">
                <Award className="w-9 h-9" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
                Grammar Fixer Academy
              </p>
              <h2
                className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1"
                style={{ fontFamily: "'Cinzel', serif, Georgia" }}
              >
                CERTIFICATE OF ACHIEVEMENT
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 italic mt-0.5">
                {tier.title} • {tier.titleGu}
              </p>
            </div>

            {/* Body */}
            <div className="text-center my-6 max-w-2xl mx-auto space-y-4">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-widest text-slate-400">
                This prestigious award is proudly presented to
              </p>

              {/* Student Name */}
              <div className="py-2 border-b-2 border-amber-300/80 mx-auto max-w-md">
                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight capitalize text-emerald-800">
                  {session.studentName || 'Distinguished Student'}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                for demonstrating exceptional grammar proficiency and successfully correcting
                error-laden sentences in the{' '}
                <span className="font-bold text-slate-900">{levelName}</span> challenge
                curriculum, mastering subject-verb agreement, irregular tenses, articles, and prepositions.
              </p>
            </div>

            {/* Performance Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 max-w-2xl mx-auto">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-lg font-black font-mono text-amber-600">
                  {session.totalScore.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
                <div className="text-lg font-black font-mono text-emerald-600">
                  {Math.round(session.accuracyPercentage)}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Correct</div>
                <div className="text-lg font-black font-mono text-blue-600">
                  {session.correctCount} / {session.totalChallenges}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Max Streak</div>
                <div className="text-lg font-black font-mono text-purple-600">
                  {session.maxStreak}x Combo
                </div>
              </div>
            </div>

            {/* Footer / Seal & Signatures */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-amber-200/80 mt-6">
              {/* Date & ID */}
              <div className="text-center sm:text-left text-xs text-slate-500 space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">Date Issued:</span>{' '}
                  {new Date(session.timestamp).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  ID: GF-{session.id.slice(0, 8).toUpperCase()}
                </div>
              </div>

              {/* Official Gold Seal */}
              <div className="flex items-center justify-center">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-lg border-4 border-amber-300">
                  <div className="text-center">
                    <span className="text-2xl block">{tier.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-tight block">
                      {session.achievement}
                    </span>
                    <span className="text-[8px] font-semibold text-slate-800 block">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructor Signature */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-lg text-slate-800 border-b border-slate-400 pb-1 px-4">
                  Dr. English & Grammar Board
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Grammar Fixer Certification Board
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
