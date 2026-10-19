import type { Lesson, Vocabulary } from "../domain";

const vocabulary: readonly Vocabulary[] = [
  { hanzi: "那", pinyin: "nà", meaning: "cela, ça, celui-là", note: "那 désigne quelque chose ou quelqu’un situé à distance. Il peut précéder un nom : 那本书, ce livre-là.", example: { chinese: "那是什么？", pinyin: "Nà shì shénme?", french: "Qu’est-ce que c’est, là-bas ?" } },
  { hanzi: "谁", pinyin: "shéi / shuí", meaning: "qui", note: "谁 demande l’identité d’une personne. Les deux lectures shéi et shuí sont admises ; shéi est très courant à l’oral.", example: { chinese: "那是谁？", pinyin: "Nà shì shéi?", french: "Qui est-ce ?" } },
  { hanzi: "书", pinyin: "shū", meaning: "livre", note: "书 signifie livre. Avec le classificateur 本, on dit 一本书, un livre.", example: { chinese: "这是书。", pinyin: "Zhè shì shū.", french: "C’est un livre." } },
  { hanzi: "同屋", pinyin: "tóngwū", meaning: "camarade de chambre", note: "同屋 désigne une personne qui partage la chambre ou le logement.", example: { chinese: "他是我的同屋。", pinyin: "Tā shì wǒ de tóngwū.", french: "C’est mon camarade de chambre." } },
  { hanzi: "汉语", pinyin: "Hànyǔ", meaning: "langue chinoise, mandarin", note: "汉语 désigne la langue chinoise. Le premier caractère 汉 renvoie aux Han et 语 à la langue.", example: { chinese: "我学汉语。", pinyin: "Wǒ xué Hànyǔ.", french: "J’apprends le chinois." } },
  { hanzi: "课本", pinyin: "kèběn", meaning: "manuel scolaire", note: "课本 est un livre utilisé pour un cours ou comme manuel.", example: { chinese: "这是汉语课本。", pinyin: "Zhè shì Hànyǔ kèběn.", french: "C’est un manuel de chinois." } },
  { hanzi: "词典", pinyin: "cídiǎn", meaning: "dictionnaire", note: "词典 est un dictionnaire de mots. Le classificateur courant est 本 : 一本词典.", example: { chinese: "这是汉语词典。", pinyin: "Zhè shì Hànyǔ cídiǎn.", french: "C’est un dictionnaire de chinois." } },
  { hanzi: "就是", pinyin: "jiù shì", meaning: "c’est justement…, cela signifie…", note: "就是 peut confirmer ou préciser une identification : « c’est bien… », « c’est justement… ».", example: { chinese: "这就是课本。", pinyin: "Zhè jiù shì kèběn.", french: "C’est justement le manuel." } },
  { hanzi: "日语", pinyin: "Rìyǔ", meaning: "langue japonaise", note: "日语 désigne la langue japonaise.", example: { chinese: "她学日语。", pinyin: "Tā xué Rìyǔ.", french: "Elle apprend le japonais." } },
  { hanzi: "这", pinyin: "zhè", meaning: "ceci, ça, celui-ci", note: "这 désigne quelque chose ou quelqu’un proche. Devant un nom, il est souvent suivi d’un classificateur : 这本书.", example: { chinese: "这是什么？", pinyin: "Zhè shì shénme?", french: "Qu’est-ce que c’est ?" } },
  { hanzi: "杂志", pinyin: "zázhì", meaning: "magazine, revue", note: "杂志 désigne un périodique. On dit souvent 一本杂志, un magazine.", example: { chinese: "这是杂志。", pinyin: "Zhè shì zázhì.", french: "C’est un magazine." } },
  { hanzi: "音乐", pinyin: "yīnyuè", meaning: "musique", note: "音乐 signifie musique. Attention au quatrième ton de 乐 dans ce mot : yuè.", example: { chinese: "我喜欢音乐。", pinyin: "Wǒ xǐhuan yīnyuè.", french: "J’aime la musique." } },
  { hanzi: "朋友", pinyin: "péngyou", meaning: "ami, amie", note: "朋友 désigne une personne avec qui l’on entretient une relation amicale.", example: { chinese: "他是我的朋友。", pinyin: "Tā shì wǒ de péngyou.", french: "C’est mon ami." } },
  { hanzi: "日本", pinyin: "Rìběn", meaning: "Japon", note: "日本 est le nom chinois du Japon. Le mot signifie littéralement « origine du soleil ».", example: { chinese: "她是日本人。", pinyin: "Tā shì Rìběn rén.", french: "Elle est japonaise." } },
];

export const lesson3: Lesson = {
  id: "lesson-3",
  number: 3,
  title: "Livres et langues",
  titleEn: "Books and languages",
  subtitle: "Demander et identifier",
  subtitleEn: "Asking and identifying",
  level: "Débutant",
  vocabulary,
};
