import { lesson1 } from "./lesson-1";
import { lesson2 } from "./lesson-2";
import type { Lesson, LessonVocabulary, StudyScope } from "../domain";

export const lessons: readonly Lesson[] = [lesson1, lesson2];

export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export const allVocabulary: readonly LessonVocabulary[] = lessons.flatMap(
  (lesson) => lesson.vocabulary.map((word) => ({ ...word, lessonId: lesson.id })),
);

export function vocabularyForScope(scope: StudyScope): readonly LessonVocabulary[] {
  if (scope === "all") return allVocabulary;
  const lesson = lessonById.get(scope);
  return lesson
    ? lesson.vocabulary.map((word) => ({ ...word, lessonId: lesson.id }))
    : [];
}

export function uniqueCharactersForScope(scope: StudyScope): readonly string[] {
  return [...new Set(vocabularyForScope(scope).flatMap((word) => [...word.hanzi]))];
}

export function scopeLabel(scope: StudyScope): string {
  if (scope === "all") return "Toutes les leçons";
  const lesson = lessonById.get(scope);
  return lesson ? `Leçon ${lesson.number} — ${lesson.title}` : "Leçon inconnue";
}
