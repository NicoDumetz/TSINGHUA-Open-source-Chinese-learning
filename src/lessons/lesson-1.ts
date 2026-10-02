import type { Lesson, Vocabulary } from "../domain";

// Vocabulaire fourni par l’utilisateur, dans l’ordre de la leçon 1.
const vocabulary: readonly Vocabulary[] = [
  {
    hanzi: "你好",
    pinyin: "nǐ hǎo",
    meaning: "bonjour",
    note: "Une salutation courante. Deux troisièmes tons se suivent : à l’oral, 你 se prononce ní dans 你好. On conserve nǐ hǎo dans le pinyin écrit.",
    example: { chinese: "你好！", pinyin: "Nǐ hǎo!", french: "Bonjour !" },
  },
  {
    hanzi: "好",
    pinyin: "hǎo",
    meaning: "bien, bon",
    note: "好 exprime une qualité positive. Dans 你好, il participe à la salutation « bonjour ». Observe ses deux parties : 女 à gauche et 子 à droite.",
    example: { chinese: "你好！", pinyin: "Nǐ hǎo!", french: "Bonjour !" },
  },
  {
    hanzi: "你",
    pinyin: "nǐ",
    meaning: "tu, toi",
    note: "Le pronom pour s’adresser à quelqu’un. Le chinois utilise la même forme pour « tu » et « toi ». Pour une adresse polie, utilise 您.",
    example: {
      chinese: "你是老师吗？",
      pinyin: "Nǐ shì lǎoshī ma?",
      french: "Es-tu professeur ?",
    },
  },
  {
    hanzi: "是",
    pinyin: "shì",
    meaning: "être ; oui",
    note: "Relie une personne à son identité : 我是学生. Peut aussi confirmer une question avec 是 : « oui ». Il ne s’emploie pas systématiquement devant un adjectif.",
    example: {
      chinese: "我是学生。",
      pinyin: "Wǒ shì xuésheng.",
      french: "Je suis étudiant.",
    },
  },
  {
    hanzi: "老师",
    pinyin: "lǎoshī",
    meaning: "professeur",
    note: "Un mot de deux caractères, à apprendre comme un ensemble. Il peut aussi servir à s’adresser à son professeur.",
    example: {
      chinese: "老师，您好！",
      pinyin: "Lǎoshī, nín hǎo!",
      french: "Bonjour, professeur !",
    },
  },
  {
    hanzi: "吗",
    pinyin: "ma",
    meaning: "particule pour poser une question",
    note: "À la fin d’une phrase déclarative, 吗 forme une question à laquelle on peut répondre par oui ou non. Son ton est neutre. On ne l’ajoute pas à une question qui contient déjà 什么.",
    example: {
      chinese: "你是学生吗？",
      pinyin: "Nǐ shì xuésheng ma?",
      french: "Es-tu étudiant ?",
    },
  },
  {
    hanzi: "不",
    pinyin: "bù",
    meaning: "ne pas, non",
    note: "La négation se place avant le verbe : 不是, « ne pas être ». Devant un quatrième ton, bù se prononce bú : bú shì, bú kèqi.",
    example: {
      chinese: "我不是老师。",
      pinyin: "Wǒ bú shì lǎoshī.",
      french: "Je ne suis pas professeur.",
    },
  },
  {
    hanzi: "我",
    pinyin: "wǒ",
    meaning: "je, moi",
    note: "Le pronom de la première personne. Le verbe ne se conjugue pas selon le sujet : 我是 et 你是 utilisent tous deux 是.",
    example: {
      chinese: "我是留学生。",
      pinyin: "Wǒ shì liúxuéshēng.",
      french: "Je suis étudiant international.",
    },
  },
  {
    hanzi: "学生",
    pinyin: "xuésheng",
    meaning: "étudiant",
    note: "学 évoque l’apprentissage. Dans ce mot, 生 se prononce avec un ton neutre, conformément au pinyin de ta leçon.",
    example: {
      chinese: "她是学生。",
      pinyin: "Tā shì xuésheng.",
      french: "Elle est étudiante.",
    },
  },
  {
    hanzi: "他",
    pinyin: "tā",
    meaning: "il",
    note: "他 (il) et 她 (elle) se prononcent tous deux tā. À l’écrit, 他 porte le radical de la personne 亻 à gauche, tandis que 她 porte 女.",
    example: {
      chinese: "他是学生。",
      pinyin: "Tā shì xuésheng.",
      french: "Il est étudiant.",
    },
  },
  {
    hanzi: "她",
    pinyin: "tā",
    meaning: "elle",
    note: "她 (elle) et 他 (il) se prononcent tous deux tā, avec un premier ton haut et stable. Le radical 女, à gauche de 她, aide à reconnaître le pronom féminin.",
    example: {
      chinese: "她是老师。",
      pinyin: "Tā shì lǎoshī.",
      french: "Elle est professeur.",
    },
  },
  {
    hanzi: "谢谢",
    pinyin: "xièxie",
    meaning: "merci",
    note: "Le même caractère 谢 apparaît deux fois. La seconde syllabe est au ton neutre : elle est plus légère.",
    example: {
      chinese: "谢谢您！",
      pinyin: "Xièxie nín!",
      french: "Merci à vous !",
    },
  },
  {
    hanzi: "不客气",
    pinyin: "bú kèqi",
    meaning: "de rien, je vous en prie",
    note: "Une réponse à 谢谢. Le 不 se prononce ici bú car il est suivi de kè, au quatrième ton. La dernière syllabe qi est neutre.",
    example: { chinese: "不客气！", pinyin: "Bú kèqi!", french: "De rien !" },
  },
  {
    hanzi: "您",
    pinyin: "nín",
    meaning: "vous, forme polie de 你",
    note: "Une manière respectueuse de dire « vous » à une personne. 您 ne désigne pas ici plusieurs personnes.",
    example: {
      chinese: "您是老师吗？",
      pinyin: "Nín shì lǎoshī ma?",
      french: "Êtes-vous professeur ?",
    },
  },
  {
    hanzi: "留学生",
    pinyin: "liúxuéshēng",
    meaning: "étudiant international",
    note: "Désigne une personne qui étudie à l’étranger. Retrouve les deux caractères de 学生 à la fin de ce mot de trois caractères.",
    example: {
      chinese: "她是留学生。",
      pinyin: "Tā shì liúxuéshēng.",
      french: "Elle est étudiante internationale.",
    },
  },
  {
    hanzi: "叫",
    pinyin: "jiào",
    meaning: "appeler, s’appeler",
    note: "Pour donner son prénom, on utilise 我叫 suivi du prénom. Le quatrième ton de jiào descend nettement.",
    example: {
      chinese: "你叫什么名字？",
      pinyin: "Nǐ jiào shénme míngzi?",
      french: "Comment t’appelles-tu ?",
    },
  },
  {
    hanzi: "什么",
    pinyin: "shénme",
    meaning: "quoi, quel",
    note: "Le mot interrogatif reste à la place de l’information recherchée. Dans 什么名字, il signifie « quel nom ». Pas de 吗 dans cette question.",
    example: {
      chinese: "您叫什么名字？",
      pinyin: "Nín jiào shénme míngzi?",
      french: "Comment vous appelez-vous ?",
    },
  },
  {
    hanzi: "名字",
    pinyin: "míngzi",
    meaning: "nom, prénom",
    note: "Le mot complet sert à demander le nom d’une personne. 子 a ici un ton neutre, même s’il peut se lire zǐ quand il est isolé.",
    example: {
      chinese: "你叫什么名字？",
      pinyin: "Nǐ jiào shénme míngzi?",
      french: "Comment t’appelles-tu ?",
    },
  },
];
export const lesson1: Lesson = {
  id: "lesson-1",
  title: "Bonjour, je me présente",
  titleEn: "Hello, let me introduce myself",
  number: 1,
  subtitle: "Les premiers échanges",
  subtitleEn: "First conversations",
  level: "Débutant",
  vocabulary,
};
