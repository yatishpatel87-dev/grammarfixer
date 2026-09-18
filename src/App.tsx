/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChallengeView } from './components/ChallengeView';
import { FireworksCanvas } from './components/FireworksCanvas';
import { ResultView } from './components/ResultView';
import { CertificateModal } from './components/CertificateModal';
import { PerformanceReportModal } from './components/PerformanceReportModal';
import { TeacherModeModal } from './components/TeacherModeModal';
import { StudentNameModal } from './components/StudentNameModal';
import { INITIAL_QUESTIONS } from './data/questions';
import {
  GrammarQuestion,
  Level,
  QuestionResult,
  SessionResult,
  AchievementTier,
} from './types';
import { soundEffects } from './utils/audio';

const STORAGE_KEYS = {
  STUDENT_NAME: 'grammar_fixer_student_name',
  LEVEL: 'grammar_fixer_level',
  CUSTOM_QUESTIONS: 'grammar_fixer_custom_questions',
  STUDENT_SESSIONS: 'grammar_fixer_student_sessions',
};

const TOTAL_CHALLENGES_COUNT = 20;

export default function App() {
  // Persistence state
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || '';
  });

  const [currentLevel, setCurrentLevel] = useState<Level>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEVEL);
    return saved ? (Number(saved) as Level) : 1;
  });

  const [allQuestions, setAllQuestions] = useState<GrammarQuestion[]>(() => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom) as GrammarQuestion[];
        return [...INITIAL_QUESTIONS, ...parsed];
      }
    } catch {
      // ignore
    }
    return INITIAL_QUESTIONS;
  });

  const [studentSessions, setStudentSessions] = useState<SessionResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_SESSIONS);
      if (saved) return JSON.parse(saved) as SessionResult[];
    } catch {
      // ignore
    }
    return [];
  });

  // Game session state
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'celebrating' | 'finished'>('idle');
  const [sessionQuestions, setSessionQuestions] = useState<GrammarQuestion[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [sessionQuestionResults, setSessionQuestionResults] = useState<QuestionResult[]>([]);
  const [activeSessionResult, setActiveSessionResult] = useState<SessionResult | null>(null);

  // Modals & UI
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(!studentName);
  const [isTeacherModeOpen, setIsTeacherModeOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isPerformanceReportModalOpen, setIsPerformanceReportModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());

  // Helper to shuffle & select 20 random challenges for current level
  const startNewSession = useCallback(
    (level: Level, nameOverride?: string) => {
      const activeName = nameOverride !== undefined ? nameOverride : studentName;
      if (!activeName) {
        setIsNameModalOpen(true);
        return;
      }

      // Filter questions by level
      const matchingQuestions = allQuestions.filter((q) => q.level === level);
      // If questions are fewer than 20, fallback to include other levels as well
      const pool = matchingQuestions.length >= TOTAL_CHALLENGES_COUNT ? matchingQuestions : allQuestions;

      // Randomly shuffle using Fisher-Yates
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, TOTAL_CHALLENGES_COUNT);

      setSessionQuestions(selected);
      setCurrentChallengeIndex(0);
      setLives(3);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setSessionQuestionResults([]);
      setActiveSessionResult(null);
      setGameState('playing');
    },
    [allQuestions, studentName]
  );

  // Initialize game when student name is ready
  useEffect(() => {
    if (studentName && gameState === 'idle') {
      startNewSession(currentLevel);
    }
  }, [studentName, gameState, currentLevel, startNewSession]);

  // Handle answering a challenge
  const handleAnswerSubmit = (result: QuestionResult) => {
    const updatedResults = [...sessionQuestionResults, result];
    setSessionQuestionResults(updatedResults);

    let nextLives = lives;
    let nextScore = score;
    let nextStreak = streak;
    let nextMaxStreak = maxStreak;

    if (result.isCorrect) {
      nextScore += result.pointsEarned;
      nextStreak += 1;
      if (nextStreak > nextMaxStreak) {
        nextMaxStreak = nextStreak;
      }
    } else {
      nextLives = Math.max(0, lives - 1);
      nextStreak = 0;
    }

    setLives(nextLives);
    setScore(nextScore);
    setStreak(nextStreak);
    setMaxStreak(nextMaxStreak);

    const isLastQuestion = currentChallengeIndex + 1 >= sessionQuestions.length;
    const isGameOver = nextLives <= 0;

    // Wait a moment for the student to read feedback or click next challenge
    // We let the student click "Next Challenge" in ChallengeView or auto-advance
  };

  const handleNextChallenge = () => {
    const nextIndex = currentChallengeIndex + 1;
    const isGameOver = lives <= 0 || nextIndex >= sessionQuestions.length;

    if (isGameOver) {
      completeSession();
    } else {
      setCurrentChallengeIndex(nextIndex);
    }
  };

  const completeSession = () => {
    const totalChallenges = sessionQuestions.length || TOTAL_CHALLENGES_COUNT;
    const correctCount = sessionQuestionResults.filter((r) => r.isCorrect).length;
    const accuracy = (correctCount / totalChallenges) * 100;
    const totalTime = sessionQuestionResults.reduce((acc, r) => acc + r.timeSpentSeconds, 0);

    let achievement: AchievementTier = 'participant';
    if (accuracy >= 90) achievement = 'gold';
    else if (accuracy >= 75) achievement = 'silver';
    else if (accuracy >= 50) achievement = 'bronze';

    const result: SessionResult = {
      id: `session-${Date.now()}`,
      studentName: studentName || 'Student',
      level: currentLevel,
      timestamp: new Date().toISOString(),
      totalScore: score,
      accuracyPercentage: accuracy,
      correctCount,
      totalChallenges,
      livesRemaining: lives,
      totalTimeSeconds: totalTime,
      maxStreak,
      achievement,
      questionResults: sessionQuestionResults,
    };

    setActiveSessionResult(result);

    // Save to historical sessions
    const updatedSessions = [result, ...studentSessions].slice(0, 100);
    setStudentSessions(updatedSessions);
    localStorage.setItem(STORAGE_KEYS.STUDENT_SESSIONS, JSON.stringify(updatedSessions));

    // Transition directly to result screen where celebration firecrackers blow!
    setGameState('finished');
  };

  // Sound toggle
  const handleToggleMute = () => {
    const nextMuted = soundEffects.toggleMute();
    setIsMuted(nextMuted);
  };

  // Level switch
  const handleChangeLevel = (level: Level) => {
    setCurrentLevel(level);
    localStorage.setItem(STORAGE_KEYS.LEVEL, String(level));
    startNewSession(level);
  };

  // Save student name
  const handleSaveStudentName = (name: string, selectedLevel: Level) => {
    setStudentName(name);
    setCurrentLevel(selectedLevel);
    localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, name);
    localStorage.setItem(STORAGE_KEYS.LEVEL, String(selectedLevel));
    setIsNameModalOpen(false);
    startNewSession(selectedLevel, name);
  };

  // Teacher mode handlers
  const handleAddQuestion = (q: GrammarQuestion) => {
    const updated = [q, ...allQuestions];
    setAllQuestions(updated);
    const customOnly = updated.filter((item) => item.isCustom);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(customOnly));
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = allQuestions.filter((q) => q.id !== id);
    setAllQuestions(updated);
    const customOnly = updated.filter((item) => item.isCustom);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(customOnly));
  };

  const handleResetToDefaults = () => {
    setAllQuestions(INITIAL_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
  };

  const handleClearStudentSessions = () => {
    setStudentSessions([]);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_SESSIONS);
  };

  const handleViewStudentReport = (session: SessionResult) => {
    setActiveSessionResult(session);
    setIsTeacherModeOpen(false);
    setIsPerformanceReportModalOpen(true);
  };

  const handleViewStudentCertificate = (session: SessionResult) => {
    setActiveSessionResult(session);
    setIsTeacherModeOpen(false);
    setIsCertificateModalOpen(true);
  };

  const currentQuestion = sessionQuestions[currentChallengeIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        studentName={studentName}
        onEditStudentName={() => setIsNameModalOpen(true)}
        currentLevel={currentLevel}
        onChangeLevel={handleChangeLevel}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenTeacherMode={() => setIsTeacherModeOpen(true)}
        onRestart={() => startNewSession(currentLevel)}
        gameState={gameState}
      />

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {/* State 1: Active Challenges Run */}
        {gameState === 'playing' && currentQuestion && (
          <div className="py-4">
            <ChallengeView
              key={currentQuestion.id}
              question={currentQuestion}
              challengeIndex={currentChallengeIndex + 1}
              totalChallenges={TOTAL_CHALLENGES_COUNT}
              lives={lives}
              score={score}
              streak={streak}
              onAnswerSubmit={handleAnswerSubmit}
              onNextChallenge={handleNextChallenge}
            />

            {/* Next Challenge Action Float when answered */}
            {sessionQuestionResults.length === currentChallengeIndex + 1 && (
              <div className="max-w-3xl mx-auto px-4 pb-8 flex justify-center">
                <button
                  id="float-next-challenge-btn"
                  onClick={handleNextChallenge}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 transform hover:scale-102"
                >
                  <span>
                    {currentChallengeIndex + 1 >= sessionQuestions.length || lives <= 0
                      ? 'View Course Results 🏆'
                      : 'Continue to Challenge ' + (currentChallengeIndex + 2) + ' ➔'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 2: 15-Second Rocket Celebration Fireworks */}
        {gameState === 'celebrating' && activeSessionResult && (
          <FireworksCanvas
            studentName={activeSessionResult.studentName}
            score={activeSessionResult.totalScore}
            accuracy={activeSessionResult.accuracyPercentage}
            durationSeconds={15}
            onFinishCelebration={() => setGameState('finished')}
          />
        )}

        {/* State 3: Course Results / Game Over Scorecard */}
        {gameState === 'finished' && activeSessionResult && (
          <ResultView
            session={activeSessionResult}
            onPlayAgain={(level) => startNewSession(level || currentLevel)}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
            onOpenPerformanceReport={() => setIsPerformanceReportModalOpen(true)}
            onReplayFireworks={() => setGameState('celebrating')}
          />
        )}
      </main>

      {/* Student Name / Welcome Onboarding Modal */}
      <StudentNameModal
        isOpen={isNameModalOpen}
        currentName={studentName}
        initialLevel={currentLevel}
        allowClose={!!studentName}
        onClose={() => setIsNameModalOpen(false)}
        onSave={handleSaveStudentName}
      />

      {/* Official Certificate Modal */}
      {isCertificateModalOpen && activeSessionResult && (
        <CertificateModal
          session={activeSessionResult}
          onClose={() => setIsCertificateModalOpen(false)}
          onReplayFireworks={() => {
            setIsCertificateModalOpen(false);
            setGameState('celebrating');
          }}
        />
      )}

      {/* Detailed Progress / Performance Report Modal */}
      {isPerformanceReportModalOpen && activeSessionResult && (
        <PerformanceReportModal
          session={activeSessionResult}
          onClose={() => setIsPerformanceReportModalOpen(false)}
          onOpenCertificate={() => {
            setIsPerformanceReportModalOpen(false);
            setIsCertificateModalOpen(true);
          }}
        />
      )}

      {/* Teacher Mode Modal */}
      <TeacherModeModal
        isOpen={isTeacherModeOpen}
        onClose={() => setIsTeacherModeOpen(false)}
        questions={allQuestions}
        onAddQuestion={handleAddQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onResetToDefaults={handleResetToDefaults}
        studentSessions={studentSessions}
        onClearStudentSessions={handleClearStudentSessions}
        onViewStudentReport={handleViewStudentReport}
        onViewStudentCertificate={handleViewStudentCertificate}
      />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Grammar Fixer • ખોટું sentence દેખાય → ભૂલ શોધીને correct sentence લખવાનું</span>
          <span>20 Challenges • 3 Levels • Lives • Streak Combos • 15s Celebration Rockets</span>
        </div>
      </footer>
    </div>
  );
}
