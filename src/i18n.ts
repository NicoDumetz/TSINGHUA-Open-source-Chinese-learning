export type Language = "fr" | "en";

const STORAGE_KEY = "hanzi-language";

export const getLanguage = (): Language => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
};

export const setLanguage = (language: Language) => {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // The interface still switches when storage is unavailable.
  }
};

export const localize = (
  language: Language,
  french: string,
  english: string,
) => (language === "fr" ? french : english);

export const lessonText = (lesson: { title: string; titleEn?: string; subtitle: string; subtitleEn?: string }, language: Language) =>
  language === "fr"
    ? { title: lesson.title, subtitle: lesson.subtitle }
    : { title: lesson.titleEn || lesson.title, subtitle: lesson.subtitleEn || lesson.subtitle };

const englishWords: Record<string, { meaning: string; note: string; example: string }> = {
  "你好": { meaning: "hello", note: "A common greeting. Two third tones occur together: in speech, 你 is pronounced ní in 你好. The written pinyin remains nǐ hǎo.", example: "Hello!" },
  "好": { meaning: "good, well", note: "好 expresses a positive quality. In 你好, it helps form the greeting “hello”. Notice its two parts: 女 on the left and 子 on the right.", example: "Hello!" },
  "你": { meaning: "you", note: "The pronoun used to address someone. Chinese uses the same form for “you” as subject or object. For a polite form, use 您.", example: "Are you a teacher?" },
  "是": { meaning: "to be; yes", note: "It links a person to an identity: 我是学生. It can also confirm a question with 是: “yes”. It is not used automatically before an adjective.", example: "I am a student." },
  "老师": { meaning: "teacher", note: "A two-character word to learn as a unit. It can also be used to address your teacher.", example: "Hello, teacher!" },
  "吗": { meaning: "question particle", note: "At the end of a statement, 吗 turns it into a yes/no question. Its tone is neutral. Do not add it to a question that already contains 什么.", example: "Are you a student?" },
  "不": { meaning: "not; no", note: "Negation comes before the verb: 不是, “not to be”. Before a fourth tone, bù is pronounced bú: bú shì, bú kèqi.", example: "I am not a teacher." },
  "我": { meaning: "I; me", note: "The first-person pronoun. The verb does not change with the subject: 我是 and 你是 both use 是.", example: "I am an international student." },
  "学生": { meaning: "student", note: "学 refers to learning. In this word, 生 has a neutral tone, as shown in this lesson’s pinyin.", example: "She is a student." },
  "他": { meaning: "he", note: "他 (he) and 她 (she) are both pronounced tā. In writing, 他 has the person radical 亻 on the left, while 她 has 女.", example: "He is a student." },
  "她": { meaning: "she", note: "她 (she) and 他 (he) are both pronounced tā, with a high, steady first tone. The 女 radical on the left helps identify the feminine pronoun.", example: "She is a teacher." },
  "谢谢": { meaning: "thank you", note: "The character 谢 appears twice. The second syllable has a neutral tone, so it is lighter.", example: "Thank you!" },
  "不客气": { meaning: "you’re welcome", note: "A response to 谢谢. 不 is pronounced bú here because it comes before kè, a fourth tone. The final syllable qi is neutral.", example: "You’re welcome!" },
  "您": { meaning: "you (polite)", note: "A respectful way to say “you” to one person. Here, 您 does not refer to several people.", example: "Are you a teacher?" },
  "留学生": { meaning: "international student", note: "Someone studying abroad. Notice the two characters from 学生 at the end of this three-character word.", example: "She is an international student." },
  "叫": { meaning: "to be called", note: "To give your name, use 我叫 followed by your name. The fourth tone in jiào falls clearly.", example: "What is your name?" },
  "什么": { meaning: "what; which", note: "The question word stays where the missing information would be. In 什么名字, it means “which name”. Do not use 吗 in this question.", example: "What is your name?" },
  "名字": { meaning: "name", note: "The full word asks for someone’s name. 子 has a neutral tone here, although it can be read zǐ on its own.", example: "What is your name?" },
  "同学": { meaning: "classmate", note: "同学 refers to someone who studies in the same class as you.", example: "She is my classmate." },
  "们": { meaning: "plural suffix for people", note: "Add 们 after a pronoun or a person noun to talk about several people.", example: "We are classmates." },
  "来": { meaning: "to come", note: "来 expresses movement towards the speaker or a reference place.", example: "Are you coming?" },
  "介绍": { meaning: "to introduce", note: "介绍 is used to introduce a person or make introductions.", example: "Let me introduce someone briefly." },
  "一下儿": { meaning: "a little; a moment", note: "一下儿 often softens a request and indicates a short action.", example: "Introduce yourself briefly." },
  "姓": { meaning: "to have the family name", note: "Use 姓 to ask for or state a family name.", example: "What is your family name?" },
  "的": { meaning: "possessive particle: of; ’s", note: "的 commonly connects a possessor to what belongs to them.", example: "I am Chinese." },
  "哪": { meaning: "which", note: "哪 lets you ask for a choice or an origin.", example: "Which country are you from?" },
  "国": { meaning: "country", note: "国 means country and appears in many country names.", example: "China." },
  "人": { meaning: "person; people", note: "人 means person; after a country, it indicates nationality.", example: "I am American." },
  "认识": { meaning: "to know; to meet", note: "认识 is used to say that you know someone or are getting acquainted.", example: "Nice to meet you." },
  "很": { meaning: "very", note: "很 often links a subject with an adjective, even when it does not literally mean “very”.", example: "I am very happy." },
  "高兴": { meaning: "happy; glad", note: "高兴 expresses happiness or pleasure, especially when meeting someone.", example: "I am glad to meet you." },
  "也": { meaning: "also; too", note: "也 generally comes before the verb or adjective it relates to.", example: "I am very happy too." },
  "呢": { meaning: "question particle: “and...?”", note: "呢 often returns a question, as in “and you?”.", example: "And you?" },
  "美国": { meaning: "United States", note: "美国 is the Chinese name for the United States.", example: "He is American." },
  "加拿大": { meaning: "Canada", note: "加拿大 is the Chinese name for Canada.", example: "She is Canadian." },
  "法国": { meaning: "France", note: "法国 is the Chinese name for France.", example: "I am French." },
  "中国": { meaning: "China", note: "中国 literally means “middle country”.", example: "I am Chinese." },
};

export const wordText = (
  word: { hanzi: string; meaning: string; note: string; example: { french: string } },
  language: Language,
) => {
  const english = englishWords[word.hanzi];
  return language === "en" && english
    ? english
    : { meaning: word.meaning, note: word.note, example: word.example.french };
};
