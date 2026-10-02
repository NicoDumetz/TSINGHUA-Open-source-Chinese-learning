import type { Lesson, Vocabulary } from "../domain";

const vocabulary: readonly Vocabulary[] = [
  // {
  //   hanzi: "",
  //   pinyin: "",
  //   meaning: "",
  //   note: "",
  //   example: { chinese: "", pinyin: "", french: "" },
  // },
];

export const lessonX: Lesson = {
  id: "lesson-x",
  number: 0,
  title: "Titre de la leçon",
  titleEn: "Lesson title",
  subtitle: "Sous-titre",
  subtitleEn: "Lesson subtitle",
  level: "Débutant",
  vocabulary,
};
