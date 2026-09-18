import { GrammarQuestion } from '../types';

export function normalizeSentence(str: string): string {
  return str
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’`]/g, "'")
    .replace(/\s+/g, ' ')
    // normalize space before punctuation
    .replace(/\s+([.,!?;:])/g, '$1');
}

export function cleanForComparison(str: string): string {
  return normalizeSentence(str)
    .toLowerCase()
    // strip trailing period, exclamation, question mark for comparison
    .replace(/[.?!]+$/, '')
    .trim();
}

export interface MatchResult {
  isCorrect: boolean;
  matchedAnswer: string;
  isExactCaseMatch: boolean;
  userNormalized: string;
  feedbackNote?: string;
}

export function evaluateStudentAnswer(
  userText: string,
  question: GrammarQuestion
): MatchResult {
  const normUser = normalizeSentence(userText);
  const cleanUser = cleanForComparison(userText);

  if (!cleanUser) {
    return {
      isCorrect: false,
      matchedAnswer: question.correctSentence,
      isExactCaseMatch: false,
      userNormalized: normUser,
    };
  }

  const candidateAnswers = [
    question.correctSentence,
    ...(question.acceptedAlternatives || []),
  ];

  for (const candidate of candidateAnswers) {
    const cleanCand = cleanForComparison(candidate);
    if (cleanUser === cleanCand) {
      const isExactCase = normUser.replace(/[.?!]+$/, '') === normalizeSentence(candidate).replace(/[.?!]+$/, '');
      return {
        isCorrect: true,
        matchedAnswer: candidate,
        isExactCaseMatch: isExactCase,
        userNormalized: normUser,
        feedbackNote: !isExactCase ? 'Good job! Pay attention to capital letters for perfection.' : undefined,
      };
    }
  }

  return {
    isCorrect: false,
    matchedAnswer: question.correctSentence,
    isExactCaseMatch: false,
    userNormalized: normUser,
  };
}

export function autoCapitalize(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  // If no ending punctuation, add period if it's a declarative sentence
  if (!/[.?!]$/.test(capitalized)) {
    return capitalized + '.';
  }
  return capitalized;
}
