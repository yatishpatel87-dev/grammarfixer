export type Level = 1 | 2 | 3;

export type GrammarCategory =
  | 'subject-verb'
  | 'tenses'
  | 'articles'
  | 'prepositions'
  | 'plurals'
  | 'pronouns'
  | 'adjectives-adverbs'
  | 'conditionals'
  | 'homophones'
  | 'capitalization-punctuation';

export interface GrammarQuestion {
  id: string;
  level: Level;
  incorrectSentence: string;
  correctSentence: string;
  acceptedAlternatives?: string[];
  errorWord: string; // The erroneous word or phrase
  correctedWord: string;
  category: GrammarCategory;
  explanationEn: string;
  explanationGu: string; // Gujarati explanation
  hintGu: string; // Subtle hint in Gujarati
  hintEn: string;
  isCustom?: boolean;
}

export interface QuestionResult {
  question: GrammarQuestion;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
  streakAtTime: number;
}

export type AchievementTier = 'gold' | 'silver' | 'bronze' | 'participant';

export interface SessionResult {
  id: string;
  studentName: string;
  level: Level;
  timestamp: string;
  totalScore: number;
  accuracyPercentage: number;
  correctCount: number;
  totalChallenges: number;
  livesRemaining: number;
  totalTimeSeconds: number;
  maxStreak: number;
  achievement: AchievementTier;
  questionResults: QuestionResult[];
}

export interface StudentProfile {
  name: string;
  lastActive: string;
  totalSessions: number;
  highScore: number;
}
