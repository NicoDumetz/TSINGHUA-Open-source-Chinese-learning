import type { Lesson, Vocabulary } from "../domain";

const vocabulary: readonly Vocabulary[] = [
  { hanzi: "同学", pinyin: "tóngxué", meaning: "camarade de classe", note: "同学 désigne une personne qui étudie dans la même classe que toi.", example: { chinese: "她是我的同学。", pinyin: "Tā shì wǒ de tóngxué.", french: "C’est ma camarade de classe." } },
  { hanzi: "们", pinyin: "men", meaning: "suffixe du pluriel pour les personnes", note: "Ajoute 们 après un pronom ou un nom de personne pour parler de plusieurs personnes.", example: { chinese: "我们是同学。", pinyin: "Wǒmen shì tóngxué.", french: "Nous sommes camarades de classe." } },
  { hanzi: "来", pinyin: "lái", meaning: "venir", note: "来 exprime un mouvement vers la personne qui parle ou vers le lieu de référence.", example: { chinese: "你来吗？", pinyin: "Nǐ lái ma?", french: "Tu viens ?" } },
  { hanzi: "介绍", pinyin: "jièshào", meaning: "présenter, introduire", note: "介绍 sert à présenter une personne ou à faire les présentations.", example: { chinese: "我介绍一下儿。", pinyin: "Wǒ jièshào yíxiàr.", french: "Je vais présenter rapidement." } },
  { hanzi: "一下儿", pinyin: "yíxiàr", meaning: "un peu, un instant ; indique une action courte", note: "一下儿 adoucit souvent une demande et indique une action brève.", example: { chinese: "介绍一下儿。", pinyin: "Jièshào yíxiàr.", french: "Présente un peu." } },
  { hanzi: "姓", pinyin: "xìng", meaning: "avoir pour nom de famille, s’appeler", note: "On utilise 姓 pour demander ou dire un nom de famille.", example: { chinese: "你姓什么？", pinyin: "Nǐ xìng shénme?", french: "Quel est ton nom de famille ?" } },
  { hanzi: "的", pinyin: "de", meaning: "particule de possession : de, à, « ’s »", note: "的 relie souvent un possesseur à ce qui lui appartient.", example: { chinese: "我是中国人。", pinyin: "Wǒ shì Zhōngguó rén.", french: "Je suis chinois." } },
  { hanzi: "哪", pinyin: "nǎ", meaning: "quel, lequel", note: "哪 permet de demander un choix ou une origine.", example: { chinese: "你是哪国人？", pinyin: "Nǐ shì nǎ guó rén?", french: "De quel pays es-tu ?" } },
  { hanzi: "国", pinyin: "guó", meaning: "pays", note: "国 signifie pays et apparaît dans de nombreux noms de pays.", example: { chinese: "中国", pinyin: "Zhōngguó", french: "La Chine." } },
  { hanzi: "人", pinyin: "rén", meaning: "personne, gens", note: "人 désigne une personne ; placé après un pays, il indique la nationalité.", example: { chinese: "我是美国人。", pinyin: "Wǒ shì Měiguó rén.", french: "Je suis américain." } },
  { hanzi: "他", pinyin: "tā", meaning: "il, lui", note: "他 est le pronom masculin. Il se prononce comme 她, mais s’écrit différemment.", example: { chinese: "他是我的同学。", pinyin: "Tā shì wǒ de tóngxué.", french: "C’est mon camarade de classe." } },
  { hanzi: "认识", pinyin: "rènshi", meaning: "connaître quelqu’un, faire connaissance", note: "认识 s’emploie pour dire que l’on connaît une personne ou que l’on fait connaissance.", example: { chinese: "很高兴认识你。", pinyin: "Hěn gāoxìng rènshi nǐ.", french: "Ravi de faire ta connaissance." } },
  { hanzi: "很", pinyin: "hěn", meaning: "très", note: "很 relie souvent un sujet à un adjectif, même lorsqu’il ne signifie pas vraiment « très ».", example: { chinese: "我很高兴。", pinyin: "Wǒ hěn gāoxìng.", french: "Je suis très content." } },
  { hanzi: "高兴", pinyin: "gāoxìng", meaning: "content, heureux", note: "高兴 exprime la joie ou le plaisir, notamment lors d’une rencontre.", example: { chinese: "认识你很高兴。", pinyin: "Rènshi nǐ hěn gāoxìng.", french: "Je suis ravi de te connaître." } },
  { hanzi: "也", pinyin: "yě", meaning: "aussi, également", note: "也 se place généralement avant le verbe ou l’adjectif auquel il se rapporte.", example: { chinese: "我也很高兴。", pinyin: "Wǒ yě hěn gāoxìng.", french: "Moi aussi, je suis très content." } },
  { hanzi: "呢", pinyin: "ne", meaning: "particule interrogative : « et… ? »", note: "呢 permet souvent de retourner une question : « et toi ? ».", example: { chinese: "你呢？", pinyin: "Nǐ ne?", french: "Et toi ?" } },
  { hanzi: "美国", pinyin: "Měiguó", meaning: "États-Unis", note: "美国 est le nom chinois des États-Unis.", example: { chinese: "他是美国人。", pinyin: "Tā shì Měiguó rén.", french: "Il est américain." } },
  { hanzi: "加拿大", pinyin: "Jiānádà", meaning: "Canada", note: "加拿大 est le nom chinois du Canada.", example: { chinese: "她是加拿大人。", pinyin: "Tā shì Jiānádà rén.", french: "Elle est canadienne." } },
  { hanzi: "法国", pinyin: "Fǎguó", meaning: "France", note: "法国 est le nom chinois de la France.", example: { chinese: "我是法国人。", pinyin: "Wǒ shì Fǎguó rén.", french: "Je suis français." } },
  { hanzi: "中国", pinyin: "Zhōngguó", meaning: "Chine", note: "中国 signifie littéralement « pays du milieu ».", example: { chinese: "我是中国人。", pinyin: "Wǒ shì Zhōngguó rén.", french: "Je suis chinois." } },
];

export const lesson2: Lesson = {
  id: "lesson-2",
  number: 2,
  title: "Faire connaissance",
  titleEn: "Getting to know people",
  subtitle: "Les camarades et les origines",
  subtitleEn: "Classmates and origins",
  level: "Elementary Chinese",
  vocabulary,
};
