import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  PlusCircle,
  Download,
  Upload,
  Trash2,
  X,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { GrammarQuestion, SessionResult, Level, GrammarCategory } from '../types';

interface TeacherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: GrammarQuestion[];
  onAddQuestion: (q: GrammarQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onResetToDefaults: () => void;
  studentSessions: SessionResult[];
  onClearStudentSessions: () => void;
  onViewStudentReport: (session: SessionResult) => void;
  onViewStudentCertificate: (session: SessionResult) => void;
}

const CATEGORIES: GrammarCategory[] = [
  'subject-verb',
  'tenses',
  'articles',
  'prepositions',
  'plurals',
  'pronouns',
  'adjectives-adverbs',
  'conditionals',
  'homophones',
  'capitalization-punctuation',
];

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  isOpen,
  onClose,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onResetToDefaults,
  studentSessions,
  onClearStudentSessions,
  onViewStudentReport,
  onViewStudentCertificate,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'questions' | 'add'>('students');
  const [filterLevel, setFilterLevel] = useState<number>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New question form state
  const [newLevel, setNewLevel] = useState<Level>(1);
  const [newIncorrect, setNewIncorrect] = useState<string>('');
  const [newCorrect, setNewCorrect] = useState<string>('');
  const [newAlternatives, setNewAlternatives] = useState<string>('');
  const [newErrorWord, setNewErrorWord] = useState<string>('');
  const [newCorrectedWord, setNewCorrectedWord] = useState<string>('');
  const [newCategory, setNewCategory] = useState<GrammarCategory>('subject-verb');
  const [newExplanationEn, setNewExplanationEn] = useState<string>('');
  const [newExplanationGu, setNewExplanationGu] = useState<string>('');
  const [newHintEn, setNewHintEn] = useState<string>('');
  const [newHintGu, setNewHintGu] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  if (!isOpen) return null;

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncorrect.trim() || !newCorrect.trim()) return;

    const alts = newAlternatives
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const question: GrammarQuestion = {
      id: `custom-${Date.now()}`,
      level: newLevel,
      incorrectSentence: newIncorrect.trim(),
      correctSentence: newCorrect.trim(),
      acceptedAlternatives: alts.length > 0 ? alts : undefined,
      errorWord: newErrorWord.trim() || 'error',
      correctedWord: newCorrectedWord.trim() || 'correct',
      category: newCategory,
      explanationEn: newExplanationEn.trim() || 'Correction made for standard grammar.',
      explanationGu: newExplanationGu.trim() || 'યોગ્ય વ્યાકરણ નિયમ મુજબ સુધારેલ છે.',
      hintEn: newHintEn.trim() || 'Review the sentence carefully.',
      hintGu: newHintGu.trim() || 'વાક્ય ધ્યાનથી વાંચો.',
      isCustom: true,
    };

    onAddQuestion(question);
    setFormSuccess('New challenge successfully added to question bank!');

    // Reset form
    setNewIncorrect('');
    setNewCorrect('');
    setNewAlternatives('');
    setNewErrorWord('');
    setNewCorrectedWord('');
    setNewExplanationEn('');
    setNewExplanationGu('');
    setNewHintEn('');
    setNewHintGu('');

    setTimeout(() => {
      setFormSuccess('');
      setActiveTab('questions');
    }, 1500);
  };

  const exportQuestionsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GrammarFixer_Questions_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAllStudentsCSV = () => {
    const headers = ['Date', 'Student Name', 'Level', 'Score', 'Accuracy %', 'Correct', 'Total', 'Max Streak', 'Medal'];
    const rows = studentSessions.map((s) => [
      new Date(s.timestamp).toLocaleString(),
      `"${s.studentName.replace(/"/g, '""')}"`,
      s.level,
      s.totalScore,
      `${Math.round(s.accuracyPercentage)}%`,
      s.correctCount,
      s.totalChallenges,
      s.maxStreak,
      s.achievement,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GrammarFixer_ClassRoster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterLevel !== 0 && q.level !== filterLevel) return false;
    if (searchQuery) {
      const qText = (q.incorrectSentence + ' ' + q.correctSentence + ' ' + q.category).toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const filteredStudents = studentSessions.filter((s) => {
    if (searchQuery && !s.studentName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterLevel !== 0 && s.level !== filterLevel) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-purple-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-purple-300" />
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Teacher & Instructor Administration</span>
                <span className="text-[10px] bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full font-mono">
                  Admin Mode
                </span>
              </h3>
              <p className="text-xs text-purple-200">
                Manage question bank, monitor student reports, and export class rosters
              </p>
            </div>
          </div>
          <button
            id="close-teacher-mode-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-3 bg-purple-50 border-b border-purple-100 shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="tab-students"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'students'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Records ({studentSessions.length})</span>
            </button>

            <button
              id="tab-questions"
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'questions'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Question Bank ({questions.length})</span>
            </button>

            <button
              id="tab-add"
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'add'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Custom Challenge</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'students' && studentSessions.length > 0 && (
              <button
                id="export-class-csv-btn"
                onClick={exportAllStudentsCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-purple-900 text-xs font-bold border border-purple-200 transition shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Class CSV</span>
              </button>
            )}

            {activeTab === 'questions' && (
              <button
                id="export-questions-json-btn"
                onClick={exportQuestionsJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-purple-900 text-xs font-bold border border-purple-200 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Student Records */}
        {activeTab === 'students' && (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Level:</span>
                {[0, 1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      filterLevel === lvl
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl === 0 ? 'All' : `Lvl ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-semibold text-sm">No student sessions recorded yet.</p>
                <p className="text-slate-400 text-xs mt-1">
                  Completed challenge sessions by students will appear here with performance reports.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-3">Level</th>
                        <th className="py-3 px-3">Score</th>
                        <th className="py-3 px-3">Accuracy</th>
                        <th className="py-3 px-3">Correct</th>
                        <th className="py-3 px-3">Max Streak</th>
                        <th className="py-3 px-3">Medal</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {s.studentName || 'Anonymous Student'}
                          </td>
                          <td className="py-3 px-3 font-semibold text-purple-700">
                            Level {s.level}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-600">
                            {s.totalScore.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                            {Math.round(s.accuracyPercentage)}%
                          </td>
                          <td className="py-3 px-3">
                            {s.correctCount} / {s.totalChallenges}
                          </td>
                          <td className="py-3 px-3 font-mono text-purple-600 font-bold">
                            {s.maxStreak}x
                          </td>
                          <td className="py-3 px-3 uppercase font-bold text-[10px]">
                            {s.achievement === 'gold' && '🥇 Gold'}
                            {s.achievement === 'silver' && '🥈 Silver'}
                            {s.achievement === 'bronze' && '🥉 Bronze'}
                            {s.achievement === 'participant' && '🎖️ Pass'}
                          </td>
                          <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                            {new Date(s.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => onViewStudentReport(s)}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-md transition"
                            >
                              Report
                            </button>
                            <button
                              onClick={() => onViewStudentCertificate(s)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-md transition"
                            >
                              Certificate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {studentSessions.length > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={onClearStudentSessions}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Student History</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Question Bank */}
        {activeTab === 'questions' && (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions or grammar rule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Filter:</span>
                {[0, 1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      filterLevel === lvl
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl === 0 ? 'All Levels' : `Level ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition ${
                    q.isCustom
                      ? 'bg-purple-50/50 border-purple-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Level {q.level}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 capitalize">
                        {q.category}
                      </span>
                      {q.isCustom && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    {q.isCustom && (
                      <button
                        onClick={() => onDeleteQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-rose-700 font-medium">
                      ❌ {q.incorrectSentence}
                    </p>
                    <p className="text-emerald-800 font-bold">
                      ✅ {q.correctSentence}
                    </p>
                    <p className="text-slate-500 text-[11px] pt-1">
                      🇬🇧 {q.explanationEn}
                    </p>
                    <p className="text-emerald-900 text-[11px] font-medium">
                      🇮🇳 {q.explanationGu}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onResetToDefaults}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Reset questions to original default library
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Add Custom Challenge */}
        {activeTab === 'add' && (
          <div className="p-6 overflow-y-auto">
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4 max-w-2xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Level:
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(Number(e.target.value) as Level)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value={1}>Level 1 (Beginner)</option>
                    <option value={2}>Level 2 (Intermediate)</option>
                    <option value={3}>Level 3 (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grammar Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GrammarCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white capitalize"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Erroneous Sentence (ખોટું વાક્ય):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. He do not like apples."
                  value={newIncorrect}
                  onChange={(e) => setNewIncorrect(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Corrected Sentence (સાચું વાક્ય):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. He does not like apples."
                  value={newCorrect}
                  onChange={(e) => setNewCorrect(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-200 bg-emerald-50/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Error Word / Phrase:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. do not"
                    value={newErrorWord}
                    onChange={(e) => setNewErrorWord(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Corrected Word / Phrase:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. does not"
                    value={newCorrectedWord}
                    onChange={(e) => setNewCorrectedWord(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Accepted Alternatives (Comma-separated, optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. He doesn't like apples."
                  value={newAlternatives}
                  onChange={(e) => setNewAlternatives(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rule Explanation (English):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Third person singular takes does not."
                    value={newExplanationEn}
                    onChange={(e) => setNewExplanationEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ગુજરાતી સમજૂતી (Gujarati Explanation):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="He સાથે નકારમાં does not વપરાય છે."
                    value={newExplanationGu}
                    onChange={(e) => setNewExplanationGu(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hint (English):
                  </label>
                  <input
                    type="text"
                    placeholder="Check verb for He."
                    value={newHintEn}
                    onChange={(e) => setNewHintEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    સંકેત / Hint (ગુજરાતી):
                  </label>
                  <input
                    type="text"
                    placeholder="He સાથે do કે does આવે?"
                    value={newHintGu}
                    onChange={(e) => setNewHintGu(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Save Challenge to Question Bank
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
