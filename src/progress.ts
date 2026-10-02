import { characterKey, type QuizMode, type WritingMode, wordKey } from "./domain";
import { allVocabulary, lessons } from "./lessons";

export const STORAGE_KEY = "hanzi-progress-v2";
const LEGACY_STORAGE_KEY = "hanzi-lesson-1-v1";
export interface QuizResult {
  mode: QuizMode;
  correct: number;
  total: number;
}
export const progress = {
  learned: new Set<string>(),
  writing: {} as Record<string, { guided: number; memory: number }>,
  scores: [] as QuizResult[],
};
export let storageAvailable = true;
const count = (value: unknown): number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;
try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY) ||
      "{}",
  );
  if (saved && typeof saved === "object") {
    if (Array.isArray(saved.learned)) {
      progress.learned = new Set(
        saved.learned.flatMap((value: unknown) => {
          if (typeof value !== "string") return [];
          if (allVocabulary.some((word) => wordKey(word) === value))
            return [value];
          const legacyWord = allVocabulary.find(
            (word) => word.lessonId === lessons[0].id && word.hanzi === value,
          );
          return legacyWord ? [wordKey(legacyWord)] : [];
        }),
      );
    }
    for (const lesson of lessons) {
      for (const char of new Set(
        lesson.vocabulary.flatMap((word) => [...word.hanzi]),
      )) {
        const key = characterKey(lesson.id, char);
        const result =
          saved.writing?.[key] ||
          (lesson.id === lessons[0].id ? saved.writing?.[char] : undefined);
        if (result)
          progress.writing[key] = {
          guided: count(result.guided),
          memory: count(result.memory),
        };
      }
    }
    if (Array.isArray(saved.scores))
      progress.scores = saved.scores
        .filter(
          (s: QuizResult) =>
            s &&
            [
              "recognize",
              "toChinese",
              "toFrench",
              "oral",
              "dictation",
            ].includes(s.mode) &&
            Number.isInteger(s.total) &&
            s.total > 0 &&
            s.total <= allVocabulary.length &&
            Number.isInteger(s.correct) &&
            s.correct >= 0 &&
            s.correct <= s.total,
        )
        .slice(-100);
  }
} catch {
  storageAvailable = false;
}
export function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        learned: [...progress.learned],
        writing: progress.writing,
        scores: progress.scores.slice(-100),
      }),
    );
    return true;
  } catch {
    storageAvailable = false;
    return false;
  }
}
export function recordWriting(char: string, mode: WritingMode) {
  const record = progress.writing[char] || { guided: 0, memory: 0 };
  record[mode]++;
  progress.writing[char] = record;
  return saveProgress();
}
