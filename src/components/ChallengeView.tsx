import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Timer,
  Flame,
  Copy,
  Type,
  Trash2,
  Lightbulb,
  Send,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { GrammarQuestion, QuestionResult } from '../types';
import { evaluateStudentAnswer, autoCapitalize, MatchResult } from '../utils/textMatcher';
import { soundEffects } from '../utils/audio';

interface ChallengeViewProps {
  question: GrammarQuestion;
  challengeIndex: number;
  totalChallenges: number;
  lives: number;
  score: number;
  streak: number;
  onAnswerSubmit: (result: QuestionResult) => void;
  onNextChallenge?: () => void;
  questionTimerSeconds?: number;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  question,
  challengeIndex,
  totalChallenges = 20,
  lives,
  score,
  streak,
  onAnswerSubmit,
  onNextChallenge,
  questionTimerSeconds = 45,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(questionTimerSeconds);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintLang, setHintLang] = useState<'gu' | 'en'>('gu');
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<MatchResult | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on challenge change
  useEffect(() => {
    setInputText('');
    setTimeLeft(questionTimerSeconds);
    setShowHint(false);
    setIsAnswered(false);
    setEvaluation(null);
    setPointsAwarded(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [question.id, questionTimerSeconds]);

  // Question countdown timer
  useEffect(() => {
    if (isAnswered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, question.id]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    soundEffects.playWrong();
    soundEffects.playHeartLost();

    const evalResult: MatchResult = {
      isCorrect: false,
      matchedAnswer: question.correctSentence,
      isExactCaseMatch: false,
      userNormalized: '(Time expired)',
    };
    setEvaluation(evalResult);
    setPointsAwarded(0);

    onAnswerSubmit({
      question,
      studentAnswer: '(Time expired)',
      isCorrect: false,
      timeSpentSeconds: questionTimerSeconds,
      pointsEarned: 0,
      streakAtTime: streak,
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered) return;
    if (!inputText.trim()) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswered(true);

    const evalResult = evaluateStudentAnswer(inputText, question);
    setEvaluation(evalResult);

    const timeSpent = questionTimerSeconds - timeLeft;
    let earned = 0;

    if (evalResult.isCorrect) {
      // Base score 100
      let base = 100;
      // Speed bonus: up to +50 points if answered in first half
      const speedBonus = Math.max(0, Math.floor((timeLeft / questionTimerSeconds) * 50));
      // Streak combo bonus
      const streakMultiplier = 1 + Math.min(streak * 0.15, 1.5); // up to 2.5x
      earned = Math.round((base + speedBonus) * streakMultiplier);

      soundEffects.playCorrect(streak + 1);
    } else {
      soundEffects.playWrong();
      soundEffects.playHeartLost();
    }

    setPointsAwarded(earned);

    onAnswerSubmit({
      question,
      studentAnswer: inputText,
      isCorrect: evalResult.isCorrect,
      timeSpentSeconds: timeSpent,
      pointsEarned: earned,
      streakAtTime: streak,
    });
  };

  // Helper actions
  const copyIncorrectSentence = () => {
    setInputText(question.incorrectSentence);
    inputRef.current?.focus();
  };

  const applyAutoCapitalize = () => {
    if (!inputText) return;
    setInputText(autoCapitalize(inputText));
    inputRef.current?.focus();
  };

  const clearInput = () => {
    setInputText('');
    inputRef.current?.focus();
  };

  // Progress calculations
  const timerPercentage = (timeLeft / questionTimerSeconds) * 100;
  const isTimerCritical = timeLeft <= 10;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Stats Bar: Lives, Timer, Score, Streak */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 3 Lives */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Lives:
            </span>
            {[1, 2, 3].map((heartIndex) => (
              <div
                key={heartIndex}
                className={`transition-all duration-300 transform ${
                  heartIndex <= lives
                    ? 'scale-100'
                    : 'scale-90 opacity-25 grayscale'
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    heartIndex <= lives
                      ? 'text-rose-500 fill-rose-500 drop-shadow-xs animate-pulse'
                      : 'text-slate-300'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Question Index Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wide px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              Challenge {challengeIndex} / {totalChallenges}
            </span>
          </div>

          {/* Live Score & Streak */}
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 font-bold text-xs animate-bounce">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{streak}x Combo!</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
              <span className="text-xl font-black font-mono text-emerald-600">
                {score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 20 Progress Dots */}
        <div className="grid grid-cols-20 gap-1 mt-4 pt-3 border-t border-slate-100">
          {Array.from({ length: totalChallenges }).map((_, idx) => {
            const isPast = idx < challengeIndex - 1;
            const isCurrent = idx === challengeIndex - 1;
            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1'
                    : isPast
                    ? 'bg-emerald-400'
                    : 'bg-slate-200'
                }`}
                title={`Challenge ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Timer Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1 text-slate-500">
              <Timer className={`w-3.5 h-3.5 ${isTimerCritical ? 'text-rose-500 animate-spin' : ''}`} />
              <span>Time Remaining</span>
            </span>
            <span
              className={`font-mono font-bold ${
                isTimerCritical ? 'text-rose-600 animate-pulse text-sm' : 'text-slate-700'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft <= 10
                  ? 'bg-rose-500'
                  : timeLeft <= 20
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Challenge Card: Erroneous Sentence */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Find & Fix the Error • ખોટું વાક્ય સુધારો</span>
          </span>

          <span className="text-xs font-medium text-slate-400 capitalize">
            Topic: {question.category.replace('-', ' ')}
          </span>
        </div>

        {/* The Erroneous Sentence Display */}
        <div className="my-4 p-5 bg-slate-50 border-2 border-dashed border-rose-200 rounded-2xl text-center">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight leading-relaxed">
            "{question.incorrectSentence}"
          </p>
        </div>

        {/* Hint Toggle Section */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <button
            id="challenge-hint-btn"
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 transition"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>{showHint ? 'Hide Hint' : '💡 Need a Hint? (મદદ)'}</span>
          </button>

          {showHint && (
            <div className="inline-flex items-center bg-amber-100 p-0.5 rounded-lg">
              <button
                onClick={() => setHintLang('gu')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  hintLang === 'gu' ? 'bg-white text-amber-900 shadow-2xs' : 'text-amber-700'
                }`}
              >
                ગુજરાતી
              </button>
              <button
                onClick={() => setHintLang('en')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  hintLang === 'en' ? 'bg-white text-amber-900 shadow-2xs' : 'text-amber-700'
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {showHint && (
          <div className="mt-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-sm animate-fadeIn">
            <p className="font-medium">
              🔍 {hintLang === 'gu' ? question.hintGu : question.hintEn}
            </p>
          </div>
        )}

        {/* Writing Box & Actions Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="student-answer-input"
              className="text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              ✍️ Write the correct sentence below:
            </label>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={copyIncorrectSentence}
                disabled={isAnswered}
                title="Copy erroneous sentence into writing box to edit in-place"
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition disabled:opacity-50"
              >
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copy Sentence</span>
              </button>
              <button
                type="button"
                onClick={applyAutoCapitalize}
                disabled={isAnswered || !inputText}
                title="Capitalize first letter and add period"
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition disabled:opacity-50"
              >
                <Type className="w-3 h-3" />
                <span className="hidden sm:inline">Capitalize</span>
              </button>
              {inputText && !isAnswered && (
                <button
                  type="button"
                  onClick={clearInput}
                  title="Clear input"
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              id="student-answer-input"
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isAnswered}
              autoComplete="off"
              spellCheck={false}
              placeholder="Type your corrected sentence here... (e.g. He goes to school every day.)"
              className={`w-full px-4 py-3.5 sm:text-lg font-medium rounded-xl border-2 transition outline-none pr-12 ${
                isAnswered
                  ? evaluation?.isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                    : 'border-rose-500 bg-rose-50/50 text-rose-900'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 bg-white text-slate-900'
              }`}
            />

            {!isAnswered && (
              <button
                id="submit-answer-btn"
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-2 top-2 bottom-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs transition"
              >
                <Send className="w-4 h-4 mr-1 hidden sm:inline" />
                <span>Submit</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 font-mono text-[10px]">Enter</kbd> to submit answer.
          </p>
        </form>
      </div>

      {/* 🟢 Correct / 🔴 Wrong Feedback Card */}
      {isAnswered && evaluation && (
        <div
          className={`rounded-3xl p-6 sm:p-7 border-2 shadow-lg transition-all animate-fadeIn ${
            evaluation.isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {evaluation.isCorrect ? (
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {evaluation.isCorrect ? '🟢 Correct! શાબાશ!' : '🔴 Incorrect! ભૂલ થઈ ગઈ!'}
                </h3>
                <p className="text-xs font-medium opacity-80">
                  {evaluation.isCorrect
                    ? `+${pointsAwarded} Points Earned!`
                    : lives <= 0
                    ? 'Lost your last heart!'
                    : `Lost 1 heart! ${lives} hearts remaining.`}
                </p>
              </div>
            </div>

            {/* Next Challenge Action Trigger */}
            <div className="w-full sm:w-auto">
              <button
                id="next-challenge-btn"
                autoFocus
                onClick={onNextChallenge}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition ${
                  evaluation.isCorrect
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <span>{challengeIndex >= totalChallenges || lives <= 0 ? 'See Results' : 'Next Challenge'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* What Was Fixed Breakdown */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                  ❌ Incorrect Sentence:
                </span>
                <p className="text-slate-800 font-medium">
                  {question.incorrectSentence}
                </p>
                <div className="mt-1 text-xs text-rose-700 font-semibold">
                  Error: <span className="underline decoration-rose-500 font-bold">"{question.errorWord}"</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  ✅ Correct Sentence:
                </span>
                <p className="text-emerald-900 font-bold">
                  {question.correctSentence}
                </p>
                <div className="mt-1 text-xs text-emerald-700 font-semibold">
                  Corrected to: <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded font-bold">"{question.correctedWord}"</span>
                </div>
              </div>
            </div>

            {/* Grammar Rule & Explanation in Gujarati & English */}
            <div className="pt-3 border-t border-slate-200/60">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Grammar Rule / વ્યાકરણનો નિયમ:</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">
                🇬🇧 {question.explanationEn}
              </p>
              <p className="text-sm font-medium text-emerald-900 bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200/60">
                🇮🇳 ગુજરાતી સમજૂતી: <span className="font-semibold">{question.explanationGu}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
