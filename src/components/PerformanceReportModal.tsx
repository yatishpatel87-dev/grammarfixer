import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Printer,
  X,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { SessionResult, GrammarCategory } from '../types';

interface PerformanceReportModalProps {
  session: SessionResult;
  onClose: () => void;
  onOpenCertificate: () => void;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  session,
  onClose,
  onOpenCertificate,
}) => {
  // Category analysis
  const categoryStats: Record<
    string,
    { total: number; correct: number }
  > = {};

  session.questionResults.forEach((res) => {
    const cat = res.question.category;
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, correct: 0 };
    }
    categoryStats[cat].total += 1;
    if (res.isCorrect) {
      categoryStats[cat].correct += 1;
    }
  });

  const exportCSV = () => {
    const headers = [
      'Challenge #',
      'Topic',
      'Incorrect Sentence',
      'Student Answer',
      'Correct Sentence',
      'Status',
      'Time (s)',
      'Points',
      'Explanation (English)',
      'Explanation (Gujarati)',
    ];

    const rows = session.questionResults.map((r, i) => [
      i + 1,
      r.question.category,
      `"${r.question.incorrectSentence.replace(/"/g, '""')}"`,
      `"${r.studentAnswer.replace(/"/g, '""')}"`,
      `"${r.question.correctSentence.replace(/"/g, '""')}"`,
      r.isCorrect ? 'Correct' : 'Incorrect',
      r.timeSpentSeconds,
      r.pointsEarned,
      `"${r.question.explanationEn.replace(/"/g, '""')}"`,
      `"${r.question.explanationGu.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Grammar_Report_${session.studentName || 'Student'}_Level${session.level}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:my-0 print:border-none print:shadow-none max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Student Performance & Progress Report</h3>
              <p className="text-xs text-slate-400">
                {session.studentName || 'Student'} • Level {session.level} •{' '}
                {new Date(session.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="export-csv-btn"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              id="print-report-btn"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              id="view-cert-from-report-btn"
              onClick={onOpenCertificate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
            >
              <Award className="w-4 h-4" />
              <span>Certificate</span>
            </button>
            <button
              id="close-report-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Accuracy Rate
              </span>
              <div className="text-3xl font-black font-mono text-emerald-700 mt-1">
                {Math.round(session.accuracyPercentage)}%
              </div>
              <span className="text-xs text-emerald-600 font-medium">
                {session.correctCount} of {session.totalChallenges} solved
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                Final Score
              </span>
              <div className="text-3xl font-black font-mono text-amber-700 mt-1">
                {session.totalScore.toLocaleString()}
              </div>
              <span className="text-xs text-amber-600 font-medium">
                Points with speed & combos
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800 block">
                Highest Streak
              </span>
              <div className="text-3xl font-black font-mono text-purple-700 mt-1 flex items-center gap-1">
                <Flame className="w-6 h-6 text-purple-600" />
                <span>{session.maxStreak}x</span>
              </div>
              <span className="text-xs text-purple-600 font-medium">
                Consecutive correct fixes
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">
                Total Time
              </span>
              <div className="text-3xl font-black font-mono text-blue-700 mt-1 flex items-center gap-1">
                <Clock className="w-6 h-6 text-blue-600" />
                <span>{Math.round(session.totalTimeSeconds)}s</span>
              </div>
              <span className="text-xs text-blue-600 font-medium">
                Avg ~{Math.round(session.totalTimeSeconds / (session.questionResults.length || 1))}s per item
              </span>
            </div>
          </div>

          {/* Grammar Topic Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Performance by Grammar Topic (વિષયવાર પરિણામ)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div
                    key={cat}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 capitalize mb-1">
                      <span>{cat.replace('-', ' ')}</span>
                      <span
                        className={`font-mono ${
                          pct >= 80
                            ? 'text-emerald-600'
                            : pct >= 50
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80
                            ? 'bg-emerald-500'
                            : pct >= 50
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Question-by-Question 20 Challenges Audit Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              📝 Detailed Challenge Log (20 પ્રશ્નોનું વિગતવાર મૂલ્યાંકન)
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Erroneous Sentence (ખોટું)</th>
                      <th className="py-3 px-3">Student Answer</th>
                      <th className="py-3 px-3">Correct Sentence (સાચું)</th>
                      <th className="py-3 px-3">Grammar Rule / ગુજરાતી સમજૂતી</th>
                      <th className="py-3 px-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {session.questionResults.map((res, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 transition ${
                          res.isCorrect ? 'bg-white' : 'bg-rose-50/20'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {res.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Correct</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Wrong</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium text-rose-900 max-w-xs">
                          {res.question.incorrectSentence}
                          <div className="text-[10px] text-rose-500">
                            Error: "{res.question.errorWord}"
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800 max-w-xs">
                          {res.studentAnswer || '(No Answer)'}
                        </td>
                        <td className="py-3 px-3 font-medium text-emerald-900 max-w-xs">
                          {res.question.correctSentence}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-sm">
                          <div className="text-slate-800">{res.question.explanationEn}</div>
                          <div className="text-emerald-800 font-medium text-[11px] mt-0.5">
                            {res.question.explanationGu}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {res.timeSpentSeconds}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
