export interface ExampleSentence {
  chinese: string;
  pinyin: string;
  french: string;
}

export interface Vocabulary {
  /** Stable within its lesson; the lesson id makes it unique application-wide. */
  hanzi: string;
  pinyin: string;
  meaning: string;
  note: string;
  example: ExampleSentence;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  level: string;
  vocabulary: readonly Vocabulary[];
}

export type LessonVocabulary = Vocabulary & { readonly lessonId: string };
export type StudyScope = "all" | string;
export type QuizMode =
  | "recognize"
  | "toChinese"
  | "toFrench"
  | "oral"
  | "dictation";
export type WritingMode = "guided" | "memory";

export const wordKey = (word: Pick<LessonVocabulary, "lessonId" | "hanzi">) =>
  `${word.lessonId}:${word.hanzi}`;

export const characterKey = (lessonId: string, character: string) =>
  `${lessonId}:${character}`;

export const lessonKey = (lesson: Pick<Lesson, "id">) => lesson.id;
