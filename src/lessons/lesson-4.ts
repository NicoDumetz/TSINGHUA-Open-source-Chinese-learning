import type { Lesson, Vocabulary } from "../domain";

const vocabulary: readonly Vocabulary[] = [
  { hanzi: "请问", pinyin: "qǐngwèn", meaning: "Excusez-moi, puis-je demander…", note: "请问 est une formule polie pour aborder quelqu’un avant de poser une question.", example: { chinese: "请问，图书馆在哪儿？", pinyin: "Qǐngwèn, túshūguǎn zài nǎr?", french: "Excusez-moi, où se trouve la bibliothèque ?" } },
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "bibliothèque", note: "图书馆 est composé de 图书, « livres », et 馆, « établissement ».", example: { chinese: "学校的图书馆在这儿。", pinyin: "Xuéxiào de túshūguǎn zài zhèr.", french: "La bibliothèque de l’école est ici." } },
  { hanzi: "在", pinyin: "zài", meaning: "être, se trouver à un endroit", note: "Pour situer une personne ou un lieu, 在 se place avant l’endroit : 图书馆在学校.", example: { chinese: "图书馆在学校北边。", pinyin: "Túshūguǎn zài xuéxiào běibian.", french: "La bibliothèque se trouve au nord de l’école." } },
  { hanzi: "哪儿", pinyin: "nǎr", meaning: "où", note: "哪儿 sert à demander un lieu. Il se place à l’endroit où l’on donnerait normalement la réponse.", example: { chinese: "图书馆在哪儿？", pinyin: "Túshūguǎn zài nǎr?", french: "Où se trouve la bibliothèque ?" } },
  { hanzi: "对不起", pinyin: "duìbuqǐ", meaning: "désolé, excusez-moi", note: "对不起 sert à présenter des excuses ou à attirer poliment l’attention.", example: { chinese: "对不起，我不知道。", pinyin: "Duìbuqǐ, wǒ bù zhīdào.", french: "Désolé, je ne sais pas." } },
  { hanzi: "个", pinyin: "gè", meaning: "classificateur général", note: "个 est le classificateur le plus courant. Il se place entre un nombre ou 这/那 et un nom : 一个学校, cette école-ci : 这个学校.", example: { chinese: "这儿有一个图书馆。", pinyin: "Zhèr yǒu yí ge túshūguǎn.", french: "Il y a une bibliothèque ici." } },
  { hanzi: "学校", pinyin: "xuéxiào", meaning: "école", note: "学校 désigne une école ou un établissement scolaire.", example: { chinese: "图书馆在学校里。", pinyin: "Túshūguǎn zài xuéxiào lǐ.", french: "La bibliothèque est dans l’école." } },
  { hanzi: "知道", pinyin: "zhīdào", meaning: "savoir, connaître", note: "知道 exprime le fait de savoir une information ou de connaître un fait.", example: { chinese: "我知道图书馆在哪儿。", pinyin: "Wǒ zhīdào túshūguǎn zài nǎr.", french: "Je sais où se trouve la bibliothèque." } },
  { hanzi: "没关系", pinyin: "méi guānxi", meaning: "ce n’est pas grave", note: "没关系 est une réponse courante pour rassurer quelqu’un après des excuses.", example: { chinese: "没关系。", pinyin: "Méi guānxi.", french: "Ce n’est pas grave." } },
  { hanzi: "这儿", pinyin: "zhèr", meaning: "ici", note: "这儿 désigne un endroit proche de la personne qui parle. En mandarin du Nord, 儿 se fond souvent dans la syllabe précédente.", example: { chinese: "图书馆在这儿。", pinyin: "Túshūguǎn zài zhèr.", french: "La bibliothèque est ici." } },
  { hanzi: "办公楼", pinyin: "bàngōnglóu", meaning: "bâtiment administratif, immeuble de bureaux", note: "办公楼 désigne un bâtiment où se trouvent des bureaux ou des services administratifs.", example: { chinese: "办公楼在学校北边。", pinyin: "Bàngōnglóu zài xuéxiào běibian.", french: "Le bâtiment administratif est au nord de l’école." } },
  { hanzi: "教学楼", pinyin: "jiàoxuélóu", meaning: "bâtiment d’enseignement", note: "教学楼 est le bâtiment où se déroulent les cours.", example: { chinese: "教学楼在办公楼左边。", pinyin: "Jiàoxuélóu zài bàngōnglóu zuǒbian.", french: "Le bâtiment d’enseignement est à gauche du bâtiment administratif." } },
  { hanzi: "那儿", pinyin: "nàr", meaning: "là-bas", note: "那儿 désigne un endroit éloigné de la personne qui parle.", example: { chinese: "宿舍在那儿。", pinyin: "Sùshè zài nàr.", french: "Le dortoir est là-bas." } },
  { hanzi: "宿舍", pinyin: "sùshè", meaning: "dortoir, résidence universitaire", note: "宿舍 désigne un dortoir ou un logement collectif, notamment sur un campus.", example: { chinese: "宿舍在学校北边。", pinyin: "Sùshè zài xuéxiào běibian.", french: "Le dortoir est au nord de l’école." } },
  { hanzi: "北边", pinyin: "běibian", meaning: "côté nord, au nord", note: "北边 signifie « côté nord ». Pour situer un lieu, le lieu de référence vient d’abord : 学校北边, au nord de l’école.", example: { chinese: "图书馆在学校北边。", pinyin: "Túshūguǎn zài xuéxiào běibian.", french: "La bibliothèque est au nord de l’école." } },
  { hanzi: "左边", pinyin: "zuǒbian", meaning: "côté gauche, à gauche", note: "左边 indique le côté gauche d’un point de référence, généralement nommé juste avant.", example: { chinese: "教学楼在办公楼左边。", pinyin: "Jiàoxuélóu zài bàngōnglóu zuǒbian.", french: "Le bâtiment d’enseignement est à gauche du bâtiment administratif." } },
  { hanzi: "右边", pinyin: "yòubian", meaning: "côté droit, à droite", note: "右边 indique le côté droit d’un point de référence.", example: { chinese: "宿舍在图书馆右边。", pinyin: "Sùshè zài túshūguǎn yòubian.", french: "Le dortoir est à droite de la bibliothèque." } },
  { hanzi: "不用谢", pinyin: "bú yòng xiè", meaning: "de rien, pas besoin de remercier", note: "不用谢 répond à 谢谢. 不 se prononce bú devant le quatrième ton de 用.", example: { chinese: "谢谢！— 不用谢。", pinyin: "Xièxie! — Bú yòng xiè.", french: "Merci ! — De rien." } },
];

export const lesson4: Lesson = {
  id: "lesson-4",
  number: 4,
  title: "Demander son chemin",
  titleEn: "Asking for directions",
  subtitle: "Se repérer sur le campus",
  subtitleEn: "Finding your way around campus",
  level: "Débutant",
  vocabulary,
};
