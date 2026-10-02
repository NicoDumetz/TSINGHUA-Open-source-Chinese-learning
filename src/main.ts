import "./style.css";
import { mountDictation, unmountDictation } from "./dictation";
import { playMandarin, stopAudio } from "./audio";
import {
  characterKey,
  type Lesson,
  type LessonVocabulary,
  type QuizMode,
  type StudyScope,
  wordKey,
} from "./domain";
import {
  lessons,
  lessonById,
  uniqueCharactersForScope,
  vocabularyForScope,
} from "./lessons";
import { progress, saveProgress, storageAvailable } from "./progress";
import { mountWriting, unmountWriting } from "./writing";
import { getLanguage, lessonText, localize, setLanguage, wordText, type Language } from "./i18n";
const icons: Record<string, string> = {
  book: '<path d="M12 7C8 4 4 4 2 5v14c3-1 6-1 10 2 4-3 7-3 10-2V5c-2-1-6-1-10 2v14"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  quiz: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  sound:
    '<path d="m11 4-6 5H2v6h3l6 5zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  leaf: '<path d="M20 3C8 2 1 9 6 16S23 17 20 3ZM4 21 16 9"/>',
  trophy:
    '<path d="M8 3h8v7a4 4 0 0 1-8 0zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v6m-5 1h10"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
};
const icon = (name: string) =>
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;

type Page = "home" | "lessons" | "lesson" | "quiz" | "library" | "writing" | "oral";
let page: Page = "home";
let language: Language = getLanguage();
let query = "";
let libraryFilter = "all";
let cardIndex = 0;
let modalOpen = false;
let reveal = true;
let returnFocus: HTMLElement | null = null;
let studyScope: StudyScope = lessons[0].id;
let lesson: Lesson = lessons[0];
let vocabulary: LessonVocabulary[] = [...vocabularyForScope(studyScope)];
let uniqueCharacters: readonly string[] = uniqueCharactersForScope(studyScope);
let quiz: LessonVocabulary[] = [];
let choices: LessonVocabulary[] = [];
let question = 0;
let selected: string | null = null;
let correct = 0;
let finished = false;
let quizPool = "all";
let quizMode: QuizMode = "recognize";
let oralHeard = false;
let dictationActive = false;
let mistakes: LessonVocabulary[] = [];
let writingStartIndex = 0;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const app = document.querySelector<HTMLDivElement>("#app")!;
const learned = progress.learned;
const isLearned = (word: LessonVocabulary) => learned.has(wordKey(word));
const scopedLearned = () => vocabulary.filter(isLearned);
const scopedCharacterKeys = () =>
  [...new Set(vocabulary.flatMap((word) => [...word.hanzi].map((char) => characterKey(word.lessonId, char))))];
function setStudyScope(scope: StudyScope) {
  const nextLesson = scope === "all" ? lessons[0] : lessonById.get(scope);
  if (!nextLesson) return;
  studyScope = scope;
  lesson = nextLesson;
  vocabulary = [...vocabularyForScope(scope)];
  uniqueCharacters = uniqueCharactersForScope(scope);
  query = "";
  libraryFilter = "all";
}
const currentScopeLabel = () =>
  studyScope === "all"
    ? localize(language, "Toutes les leçons", "All lessons")
    : `${localize(language, "Leçon", "Lesson")} ${lesson.number} — ${lessonText(lesson, language).title}`;
const textFor = (word: LessonVocabulary) => wordText(word, language);
const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "")
    .toLowerCase();
const percent = () => Math.round((learned.size / vocabulary.length) * 100);
function scopeOptions(includeAll = true) {
  return `${includeAll ? `<option value="all" ${studyScope === "all" ? "selected" : ""}>${localize(language, "Toutes les leçons", "All lessons")} (${vocabularyForScope("all").length} ${localize(language, "mots", "words")})</option>` : ""}${lessons.map((item) => `<option value="${item.id}" ${studyScope === item.id ? "selected" : ""}>${localize(language, "Leçon", "Lesson")} ${item.number} · ${lessonText(item, language).title} (${item.vocabulary.length} ${localize(language, "mots", "words")})</option>`).join("")}`;
}
const shuffle = <T>(arr: T[]) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

function header() {
  return `<header><a class="brand" href="#" aria-label="Qimeng, ${localize(language, "accueil", "home")}"><span class="brand-mark">启</span>qimeng<span class="brand-dot">.</span></a>
    <nav aria-label="${localize(language, "Navigation principale", "Main navigation")}">${(
      [
        ["home", "book", localize(language, "Mots", "Words")],
        ["lessons", "book", localize(language, "Leçons", "Lessons")],
        ["writing", "leaf", localize(language, "Écriture", "Writing")],
        ["quiz", "quiz", localize(language, "Quiz", "Quiz")],
        ["oral", "sound", localize(language, "Oral", "Listening")],
        ["library", "grid", localize(language, "Vocabulaire", "Vocabulary")],
      ] as const
    )
      .map(
        ([id, i, label]) =>
          `<button data-page="${id}" class="${page === id ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}>${icon(i)}<span>${label}</span></button>`,
      )
      .join("")}</nav>
    <div class="header-right"><button class="language-switch" id="language-switch" aria-label="${localize(language, "Passer le site en anglais", "Switch the site to French")}">${language === "fr" ? "EN" : "FR"}</button><span class="level"><i></i>Elementary Chinese</span><span class="avatar">你</span></div></header>`;
}
function render() {
  unmountWriting();
  unmountDictation();
  document.documentElement.lang = language;
  document.title = language === "fr" ? "Qimeng — apprendre le chinois" : "Qimeng — learn Chinese";
  app.innerHTML = `${header()}<main data-active-lesson="${lesson.id}">${page === "home" ? home() : page === "lessons" ? lessonsPage() : page === "lesson" ? lessonPage() : page === "library" ? library() : page === "writing" ? writingPage() : page === "oral" && dictationActive ? '<div id="dictation-root"></div>' : quizView()}</main>
    <footer><a class="brand small" href="#">启 <span>qimeng.</span></a><span>${localize(language, "Un mot à la fois, tout un monde à découvrir.", "One word at a time, a whole world to discover.")}</span><a class="contribute-link" href="https://github.com/NicoDumetz/TSINGHUA-Open-source-Chinese-learning" target="_blank" rel="noreferrer">${localize(language, "Contribuer sur GitHub", "Contribute on GitHub")}</a></footer>
    <div id="modal-root"></div><div id="toast" role="status"></div>`;
  bind();
  if (page === "oral" && dictationActive)
    mountDictation(document.querySelector("#dictation-root")!, vocabulary, () =>
      navigate("oral"),
    );
  if (page === "writing")
    mountWriting(document.querySelector("#writing-root")!, vocabulary, writingStartIndex);
  writingStartIndex = 0;
}
function navigate(next: Page) {
  if (modalOpen) {
    modalOpen = false;
    document.body.classList.remove("modal-open");
  }
  stopAudio();
  if (next === "lesson" && studyScope === "all") setStudyScope(lessons[0].id);
  if (next === "oral") quizMode = "oral";
  else if (next === "quiz" && quizMode === "oral") quizMode = "recognize";
  dictationActive = false;
  page = next;
  quiz = [];
  render();
  window.scrollTo(0, 0);
}
function startWriting(index: number) {
  writingStartIndex = index;
  navigate("writing");
}
function home() {
  const allWords = vocabularyForScope("all");
  return `<section class="page-heading home-heading"><span class="eyebrow muted">ELEMENTARY CHINESE</span><h1>${localize(language, "Les mots chinois, leçon après leçon", "Chinese words, lesson by lesson")}<span class="accent">.</span></h1><p>${localize(language, "Explore les mots de chaque leçon, puis ouvre une leçon pour apprendre, écrire et t’entraîner.", "Explore the words in each lesson, then open a lesson to study, write, and practise.")}</p></section>
    <section class="word-catalog" aria-label="${localize(language, "Les mots des leçons", "Words by lesson")}">${lessons.map((item) => {
      const itemWords = vocabularyForScope(item.id);
      const itemLearned = itemWords.filter(isLearned).length;
      const itemText = lessonText(item, language);
      return `<article class="lesson-overview"><div class="section-heading"><div><span class="eyebrow muted">${localize(language, "LEÇON", "LESSON")} ${item.number}</span><h2>${itemText.title}<span>.</span></h2><p>${itemText.subtitle} · ${itemWords.length} ${localize(language, "mots", "words")}</p></div><button class="secondary" data-open-lesson="${item.id}">${localize(language, "Ouvrir la leçon", "Open lesson")} ${icon("arrow")}</button></div><div class="dictionary course-dictionary">${wordCards(itemWords)}</div><p class="lesson-progress">${itemLearned} / ${itemWords.length} ${localize(language, "mots mémorisés", "words learned")}</p></article>`;
    }).join("")}${allWords.length ? "" : `<p class="empty">${localize(language, "Aucun mot pour le moment.", "No words yet.")}</p>`}</section>`;
}
function lessonsPage() {
  return `<section class="page-heading home-heading"><span class="eyebrow muted">ELEMENTARY CHINESE</span><h1>${localize(language, "Choisis une leçon", "Choose a lesson")}<span class="accent">.</span></h1><p>${localize(language, "Chaque leçon rassemble son vocabulaire, ses exercices et ses phrases à retenir.", "Each lesson gathers its vocabulary, exercises, and key phrases.")}</p></section>
    <section class="lesson-grid lesson-picker">${lessons.map((item) => {
      const itemWords = vocabularyForScope(item.id);
      const itemText = lessonText(item, language);
      const itemLearned = itemWords.filter(isLearned).length;
      return `<button class="lesson-card" data-open-lesson="${item.id}"><div class="lesson-top"><span>${localize(language, "LEÇON", "LESSON")} ${item.number}</span><span class="lesson-status ${itemLearned === itemWords.length ? "done" : itemLearned ? "started" : ""}">${itemLearned === itemWords.length ? localize(language, "Terminée", "Complete") : itemLearned ? localize(language, "En cours", "In progress") : localize(language, "À découvrir", "Explore")}</span></div><div class="path-symbol">${itemWords.slice(0, 2).map((word) => word.hanzi).join(" ")}</div><h3>${itemText.title}</h3><p>${itemText.subtitle}</p><div class="lesson-meta"><span>${itemLearned} / ${itemWords.length} ${localize(language, "mots mémorisés", "words learned")}</span><span class="round-arrow">${icon("arrow")}</span></div><div class="card-progress"><i style="width:${Math.round((itemLearned / itemWords.length) * 100)}%"></i></div></button>`;
    }).join("")}</section>`;
}
function lesson2Supplement() {
  if (lesson.id !== "lesson-2") return "";
  return `<section class="mini-course lesson-specific"><div class="section-heading"><div><span class="eyebrow muted">${localize(language, "COMMUNIQUER DÈS MAINTENANT", "START COMMUNICATING")}</span><h2>${localize(language, "Faire connaissance", "Getting to know people")}<span>.</span></h2></div></div><div class="grammar-grid">
    <article><span class="grammar-number">01</span><h3>${localize(language, "Demander un nom de famille", "Ask for a family name")}</h3><p>${localize(language, "Utilise <b>姓 + 什么</b> pour demander le nom de famille d’une personne.", "Use <b>姓 + 什么</b> to ask someone’s family name.")}</p><div class="phrase">你姓什么？</div><span class="pinyin">Nǐ xìng shénme?</span><p>${localize(language, "Quel est ton nom de famille ?", "What is your family name?")}</p></article>
    <article><span class="grammar-number">02</span><h3>${localize(language, "Dire son origine", "Say where you are from")}</h3><p>${localize(language, "Place le pays avant <b>人</b> pour exprimer une nationalité.", "Put a country before <b>人</b> to express a nationality.")}</p><div class="phrase">我是中国人。</div><span class="pinyin">Wǒ shì Zhōngguó rén.</span><p>${localize(language, "Je suis chinois.", "I am Chinese.")}</p></article>
    <article><span class="grammar-number">03</span><h3>${localize(language, "Répondre « et toi ? »", "Ask “and you?”")}</h3><p>${localize(language, "Ajoute <b>呢</b> après le sujet pour renvoyer la question avec naturel.", "Add <b>呢</b> after the subject to return the question naturally.")}</p><div class="phrase">你呢？</div><span class="pinyin">Nǐ ne?</span><p>${localize(language, "Et toi ?", "And you?")}</p></article>
    <article><span class="grammar-number">04</span><h3>${localize(language, "Faire connaissance", "Meet someone")}</h3><p>${localize(language, "<b>很高兴认识你</b> est une formule chaleureuse à employer lors d’une première rencontre.", "<b>很高兴认识你</b> is a warm phrase to use when meeting someone for the first time.")}</p><div class="phrase">很高兴认识你。</div><span class="pinyin">Hěn gāoxìng rènshi nǐ.</span><p>${localize(language, "Ravi de faire ta connaissance.", "Nice to meet you.")}</p></article>
  </div></section>`;
}
function lessonPage() {
  const written = uniqueCharacters.filter(
    (c) => progress.writing[characterKey(lesson.id, c)]?.memory,
  ).length;
  const currentLesson = lessonText(lesson, language);
  return `<section class="hero"><div class="hero-copy"><span class="eyebrow"><span></span> ${localize(language, "LEÇON", "LESSON")} ${lesson.number} · ${currentLesson.subtitle.toUpperCase()}</span>
    <h1>${localize(language, "Un bonjour.<br>Un nouveau <em>monde.</em>", "One hello.<br>A new <em>world.</em>")}</h1><p>${localize(language, "Reconnais les mots, comprends leur sens et apprends à les écrire. Tes premiers échanges commencent ici.", "Recognize the words, understand their meaning, and learn to write them. Your first conversations start here.")}</p>
    <button class="primary" id="continue">${learned.size ? localize(language, "Continuer à apprendre", "Keep learning") : localize(language, "Commencer à apprendre", "Start learning")} ${icon("arrow")}</button><span class="hero-note">${vocabulary.length} ${localize(language, "mots et expressions. À ton rythme.", "words and expressions. At your own pace.")}</span></div>
    <div class="hero-art" aria-hidden="true"><div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><span class="art-spark spark-one">✳</span><span class="art-spark spark-two">✧</span><div class="floating-tag">你好 <span>Tout commence par bonjour</span></div>
    <div class="hanzi-paper back-paper"><span>好</span><small>hǎo · bien</small></div><div class="hanzi-paper front-paper"><div class="practice-grid"></div><span>你</span><small>nǐ <i>·</i> toi</small><span class="paper-seal">初</span></div><span class="art-caption">Le voyage commence par un trait.</span></div></section>
    <section class="stats" aria-label="${localize(language, "Votre progression", "Your progress")}"><div class="stat"><span class="stat-icon green">${icon("book")}</span><div><strong>${scopedLearned().length}<small> / ${vocabulary.length}</small></strong><span>${localize(language, "Mots mémorisés", "Words learned")}</span></div><div class="mini-progress"><i style="width:${percent()}%"></i></div></div>
    <div class="stat"><span class="stat-icon orange">${icon("leaf")}</span><div><strong>${written}<small> / ${uniqueCharacters.length}</small></strong><span>${localize(language, "Caractères tracés de mémoire", "Characters written from memory")}</span></div></div>
    <div class="stat"><span class="stat-icon purple">${icon("trophy")}</span><div><strong>${progress.scores.length ? Math.max(...progress.scores.map((s) => Math.round((s.correct / s.total) * 100))) + " %" : "—"}</strong><span>${localize(language, "Meilleur score au quiz", "Best quiz score")}</span></div><button class="text-link" data-page="quiz">${localize(language, "S’entraîner", "Practise")} ${icon("arrow")}</button></div></section>
    <section class="lessons-section"><div class="section-heading"><div><span class="eyebrow muted">${localize(language, "DANS CETTE LEÇON", "IN THIS LESSON")}</span><h2>${currentLesson.title}<span>.</span></h2><p>${vocabulary.length} ${localize(language, "mots, composés de", "words, made up of")} ${uniqueCharacters.length} ${localize(language, "caractères distincts.", "distinct characters.")}</p></div><span class="section-badge">${icon("leaf")} Elementary Chinese</span></div>
    <div class="learning-path"><button class="lesson-card" id="open-lesson"><div class="lesson-top"><span>01 · APPRENDRE</span><span class="lesson-status ${learned.size === vocabulary.length ? "done" : learned.size ? "started" : ""}">${learned.size === vocabulary.length ? "Mots mémorisés" : learned.size ? "En cours" : "À découvrir"}</span></div><div class="path-symbol">你好</div><h3>Les mots & leur sens</h3><p>Fiches, pinyin, exemples et cartes de mémorisation.</p><div class="lesson-meta"><span>${learned.size} / ${vocabulary.length} mémorisés</span><span class="round-arrow">${icon("arrow")}</span></div><div class="card-progress"><i style="width:${percent()}%"></i></div></button>
    <button class="lesson-card" data-page="writing"><div class="lesson-top"><span>02 · ÉCRIRE</span><span class="lesson-status">Du trait au mot</span></div><div class="path-symbol writing-symbol">你</div><h3>Le geste & les traits</h3><p>Observe, trace avec un guide, puis écris de mémoire.</p><div class="lesson-meta"><span>${uniqueCharacters.length} caractères à pratiquer</span><span class="round-arrow">${icon("arrow")}</span></div></button>
    <button class="lesson-card" data-page="quiz"><div class="lesson-top"><span>03 · SE TESTER</span><span class="lesson-status">3 modes</span></div><div class="path-symbol translation-symbol">你 <span>↔ toi</span></div><h3>Reconnaître & traduire</h3><p>Retrouve les mots et leur traduction dans les deux sens.</p><div class="lesson-meta"><span>Quiz avec correction immédiate</span><span class="round-arrow">${icon("arrow")}</span></div></button></div>
    ${lesson2Supplement()}
    <section class="mini-course"><div class="section-heading"><div><span class="eyebrow muted">${localize(language, "COMPRENDRE AVANT DE MÉMORISER", "UNDERSTAND BEFORE MEMORIZING")}</span><h2>${localize(language, "Tes premières phrases", "Your first sentences")}<span>.</span></h2></div></div><div class="grammar-grid">
      <article><span class="grammar-number">01</span><h3>${localize(language, "Se présenter avec 是", "Introduce yourself with 是")}</h3><p>${localize(language, "<b>Sujet + 是 + identité.</b> Le verbe reste le même, quelle que soit la personne.", "<b>Subject + 是 + identity.</b> The verb stays the same for every person.")}</p><div class="phrase">我是学生。</div><span class="pinyin">Wǒ shì xuésheng.</span><p>${localize(language, "Je suis étudiant.", "I am a student.")}</p></article>
      <article><span class="grammar-number">02</span><h3>${localize(language, "Poser une question avec 吗", "Ask a question with 吗")}</h3><p>${localize(language, "Ajoute <b>吗 à la fin</b> pour poser une question oui/non. 吗 a un ton neutre.", "Add <b>吗 at the end</b> to make a yes/no question. 吗 has a neutral tone.")}</p><div class="phrase">你是老师吗？</div><span class="pinyin">Nǐ shì lǎoshī ma?</span><p>${localize(language, "Es-tu professeur ?", "Are you a teacher?")}</p></article>
      <article><span class="grammar-number">03</span><h3>${localize(language, "Dire non avec 不", "Say no with 不")}</h3><p>${localize(language, "Place <b>不 avant le verbe.</b> Devant un quatrième ton, bù devient bú à l’oral.", "Put <b>不 before the verb.</b> Before a fourth tone, bù becomes bú in speech.")}</p><div class="phrase">我不是老师。</div><span class="pinyin">Wǒ bú shì lǎoshī.</span><p>${localize(language, "Je ne suis pas professeur.", "I am not a teacher.")}</p></article>
      <article><span class="grammar-number">04</span><h3>${localize(language, "Demander un prénom", "Ask for a name")}</h3><p>${localize(language, "<b>什么名字</b> signifie « quel nom ». Avec 什么, on n’ajoute pas 吗.", "<b>什么名字</b> means “which name”. With 什么, do not add 吗.")}</p><div class="phrase">你叫什么名字？</div><span class="pinyin">Nǐ jiào shénme míngzi?</span><p>${localize(language, "Comment t’appelles-tu ?", "What is your name?")}</p></article>
    </div></section>
    <section class="tone-guide"><div><span class="eyebrow muted">${localize(language, "LE PINYIN DONNE LE TON", "PINYIN CARRIES THE TONE")}</span><h3>${localize(language, "Les accents se prononcent.", "The accents are pronounced.")}</h3><p>${localize(language, "Un ton change la façon de dire la syllabe. Les syllabes sans accent sont légères : c’est le ton neutre.", "A tone changes how a syllable is said. Unmarked syllables are light: that is the neutral tone.")}</p></div><div class="tone-examples"><span><b>tā →</b>1 · ${localize(language, "haut et stable", "high and level")}</span><span><b>nín ↗</b>2 · ${localize(language, "montant", "rising")}</span><span><b>hǎo ∨</b>3 · ${localize(language, "bas, puis remontant*", "low, then rising*")}</span><span><b>shì ↘</b>4 · ${localize(language, "descendant", "falling")}</span><span><b>ma ·</b>${localize(language, "neutre · léger", "neutral · light")}</span></div><small>${localize(language, "* Le troisième ton reste souvent bas dans la parole courante. Dans nǐ hǎo, le premier devient un deuxième ton à l’oral : ní hǎo.", "* The third tone often stays low in everyday speech. In nǐ hǎo, the first one becomes a second tone when spoken: ní hǎo.")}</small></section>
    <div class="section-heading vocabulary-heading"><div><span class="eyebrow muted">${localize(language, "LA LISTE COMPLÈTE", "THE FULL LIST")}</span><h2>${localize(language, "Les", "The")} ${vocabulary.length} ${localize(language, "mots de la leçon", "lesson words")}<span>.</span></h2><p>${localize(language, "Clique sur un mot pour ouvrir sa fiche.", "Select a word to open its card.")}</p></div></div><div class="dictionary course-dictionary">${wordCards(vocabulary)}</div>
    <aside class="tip"><span class="tip-character">好</span><div><strong>${localize(language, "Un peu de lecture, un peu d’écriture, un petit quiz.", "A little reading, writing, and a short quiz.")}</strong><p>${localize(language, "Commence par 3 ou 4 mots. Cache leur traduction, retrouve leur sens, puis entraîne-toi à les écrire. Reviens demain pour les revoir.", "Start with three or four words. Hide the translation, recall the meaning, then practise writing them. Return tomorrow to review them.")}</p></div>${icon("leaf")}</aside></section>`;
}
function wordCards(words: readonly LessonVocabulary[]) {
  return (
    words
      .map(
        (c) =>
          `<button class="dictionary-card" data-word="${vocabulary.indexOf(c)}" data-lesson-word="${c.lessonId}" data-hanzi="${c.hanzi}" aria-label="${localize(language, "Ouvrir la fiche de", "Open the card for")} ${c.hanzi}"><span class="learned-dot ${isLearned(c) ? "is-learned" : ""}" aria-label="${isLearned(c) ? localize(language, "Mémorisé", "Learned") : localize(language, "À apprendre", "To learn")}">${isLearned(c) ? "✓" : ""}</span><strong lang="zh-CN">${c.hanzi}</strong><span class="pinyin">${c.pinyin}</span><span>${wordText(c, language).meaning}</span></button>`,
      )
      .join("") ||
    '<p class="empty">Aucun mot trouvé. Essaie un autre mot ou un autre filtre.</p>'
  );
}
function filteredWords() {
  return vocabulary.filter(
    (c) =>
      normalize(`${c.hanzi} ${c.pinyin} ${c.meaning} ${textFor(c).meaning}`).includes(
        normalize(query),
      ) &&
      (libraryFilter === "all" ||
        (libraryFilter === "learned"
          ? isLearned(c)
          : !isLearned(c))),
  );
}
function library() {
  return `<section class="page-heading"><span class="eyebrow muted">${currentScopeLabel().toUpperCase()} · ${localize(language, "TON PETIT DICTIONNAIRE", "YOUR MINI DICTIONARY")}</span><h1>${localize(language, "Mon vocabulaire", "My vocabulary")}<span class="accent">.</span></h1><p>${vocabulary.length} ${localize(language, "mots et expressions disponibles dans cette sélection.", "words and expressions in this selection.")}</p></section>
    <div class="quiz-setup scope-picker"><label for="library-scope">${localize(language, "Vocabulaire à consulter", "Vocabulary to browse")}</label><select id="library-scope">${scopeOptions()}</select></div>
    <label class="search">${icon("search")}<input id="search" aria-label="${localize(language, "Rechercher dans le vocabulaire", "Search vocabulary")}" placeholder="${localize(language, "Un mot, un pinyin, une traduction…", "A word, pinyin, or translation...")}" value="${escape(query)}"/><span>${learned.size} ${localize(language, "mémorisés", "learned")}</span></label>
    <div class="filters library-filters">${[
      ["all", "Tous les mots"],
      ["new", "À apprendre"],
      ["learned", "Mémorisés"],
    ]
      .map(
        ([id, label]) =>
          `<button data-filter="${id}" class="${libraryFilter === id ? "selected" : ""}" aria-pressed="${libraryFilter === id}">${label}</button>`,
      )
      .join(
        "",
      )}</div><p id="search-count" class="subtle" role="status">${filteredWords().length} mot(s)</p>
    <div class="dictionary" id="dictionary">${wordCards(filteredWords())}</div>`;
}
function writingPage() {
  return `<section class="page-heading"><span class="eyebrow muted">${currentScopeLabel().toUpperCase()} · ${localize(language, "DU MOT AU GESTE", "FROM WORD TO GESTURE")}</span><h1>${localize(language, "Un trait après l’autre", "One stroke at a time")}<span class="accent">.</span></h1><p>${localize(language, "Apprends l’ordre des traits des", "Learn the stroke order of the")} ${uniqueCharacters.length} ${localize(language, "caractères qui composent tes", "characters in your")} ${vocabulary.length} ${localize(language, "mots.", "words.")}</p></section><div class="quiz-setup scope-picker"><label for="writing-scope">${localize(language, "Vocabulaire à écrire", "Vocabulary to write")}</label><select id="writing-scope">${scopeOptions()}</select></div><div id="writing-root"></div>`;
}
const modeLabels: Record<QuizMode, string> = {
  recognize: "Pinyin → chinois",
  toChinese: "Français → chinois",
  toFrench: "Chinois → français",
  oral: "Écoute → chinois",
  dictation: "Écouter et écrire",
};
function oralIntro() {
  return `<section class="quiz-intro"><span class="large-icon">${icon("sound")}</span><span class="eyebrow muted">${currentScopeLabel().toUpperCase()} · COMPRÉHENSION ORALE</span><h1>Tends l’oreille<span class="accent">.</span></h1><p>Écoute un mot, puis retrouve son écriture chinoise.<br>Choisis parmi quatre propositions ou dessine les caractères.</p>
    <div class="quiz-setup"><label for="oral-scope">Vocabulaire à écouter</label><select id="oral-scope">${scopeOptions()}</select><label for="oral-response">Comment veux-tu répondre ?</label><select id="oral-response"><option value="choices">Choisir parmi 4 propositions</option><option value="draw">Écouter et écrire · dessiner les caractères</option></select><p>10 questions à choix ou une dictée de 5 mots.<br>Tu peux réécouter chaque mot autant que tu veux.</p><p id="audio-info" class="audio-status" role="status">Audio mandarin intégré au site. Active le son pour écouter.</p><button class="secondary" id="test-audio">Tester le son : bonjour</button><button class="primary" id="start-oral">Commencer l’oral ${icon("arrow")}</button><p class="subtle">À choix, 他 et 她 ne sont jamais proposés ensemble. En dictée, leur sens français précise lequel écrire, car ils se prononcent tous deux tā.</p></div></section>`;
}
function listen(rate = 0.8) {
  if (quizMode !== "oral" || !quiz.length || finished) return;
  playMandarin(quiz[question].hanzi, rate, (message, heard) => {
    const status = document.querySelector("#oral-status");
    if (!status) return;
    status.textContent = message;
    if (heard) oralHeard = true;
    document
      .querySelectorAll<HTMLButtonElement>("[data-answer]")
      .forEach((b) => {
        b.disabled = !!selected || !oralHeard;
      });
  });
}
function quizView() {
  if (!quiz.length && page === "oral") return oralIntro();
  if (!quiz.length)
    return `<section class="quiz-intro"><span class="large-icon">${icon("quiz")}</span><span class="eyebrow muted">${currentScopeLabel().toUpperCase()} · UN PETIT DÉFI POUR PROGRESSER</span><h1>À toi de jouer<span class="accent">.</span></h1><p>Reconnais les mots, puis vérifie que tu sais les traduire.<br>Quatre propositions, une seule bonne réponse.</p>
    <div class="quiz-setup"><label for="quiz-mode">Que veux-tu travailler ?</label><select id="quiz-mode">${Object.entries(
      modeLabels,
    )
      .filter(([id]) => id !== "oral" && id !== "dictation")
      .map(
        ([id, label]) =>
          `<option value="${id}" ${quizMode === id ? "selected" : ""}>${label}${id === "recognize" ? " · avec traduction" : " · sans indice de pinyin"}</option>`,
      )
      .join("")}</select>
    <label for="quiz-scope">Quelle leçon veux-tu réviser ?</label><select id="quiz-scope">${scopeOptions()}</select>
    <label for="quiz-pool">Quels mots veux-tu réviser ?</label><select id="quiz-pool"><option value="all">Tous les mots de cette sélection (${vocabulary.length} mots)</option><option value="learned" ${scopedLearned().length < 4 ? "disabled" : ""} ${quizPool === "learned" && scopedLearned().length >= 4 ? "selected" : ""}>Mes mots mémorisés (${scopedLearned().length})</option></select>
    <p class="subtle">${scopedLearned().length < 4 ? "Mémorise au moins 4 mots pour créer un quiz sur tes acquis.<br>" : ""}Jusqu’à 10 questions · Sans chronomètre · Correction immédiate</p><button class="primary" id="start-quiz">Commencer le quiz ${icon("arrow")}</button></div></section>`;
  if (finished)
    return `<section class="quiz-intro"><span class="large-icon">${icon("trophy")}</span><span class="eyebrow muted">${modeLabels[quizMode]}</span><h1>${correct / quiz.length >= 0.8 ? "Bien joué !" : "Continue comme ça !"}</h1><div class="score">${correct}<small> / ${quiz.length}</small></div><p>${correct === quiz.length ? "Un sans-faute ! Essaie maintenant un autre mode ou l’écriture." : "Voici les mots à revoir. Ouvre leur fiche pour comprendre et mémoriser."}</p>
    ${mistakes.length ? `<div class="review-list">${mistakes.map((c) => `<button data-word="${vocabulary.indexOf(c)}"><strong lang="zh-CN">${c.hanzi}</strong><span>${c.pinyin}<small>${textFor(c).meaning}</small></span>${icon("arrow")}</button>`).join("")}</div>` : ""}
    <div class="result-actions">${mistakes.length ? `<button class="primary" id="retry-mistakes">Revoir mes ${mistakes.length} erreur(s)</button>` : ""}<button class="${mistakes.length ? "secondary" : "primary"}" id="retry">Nouveau quiz</button><button class="secondary" id="quiz-settings">${quizMode === "oral" ? "Retour à l’oral" : "Changer de mode"}</button><button class="secondary" data-page="lesson">Retour à la leçon</button></div></section>`;
  const c = quiz[question];
  const prompt =
    quizMode === "toFrench"
      ? c.hanzi
      : quizMode === "toChinese"
        ? textFor(c).meaning
        : c.pinyin;
  return `<section class="quiz-active"><div class="quiz-top"><button class="text-link" id="quit-quiz">← Quitter le quiz</button><span>Question ${question + 1} sur ${quiz.length}</span><span>${correct} bonne${correct > 1 ? "s" : ""} réponse${correct > 1 ? "s" : ""}</span></div>
    <div class="quiz-progress"><i style="width:${(question / quiz.length) * 100}%"></i></div><span class="eyebrow muted">${quizMode === "toFrench" ? "QUELLE EST LA TRADUCTION ?" : "QUEL EST LE BON MOT CHINOIS ?"}</span>
    ${quizMode === "oral" ? `<div class="oral-player"><span class="oral-symbol">${icon("sound")}</span><h1>Quel mot entends-tu ?</h1><div class="oral-controls"><button class="primary" id="replay-oral">${icon("sound")} Réécouter</button><button class="secondary" id="slow-oral">Écouter plus lentement</button></div><p id="oral-status" class="audio-status" role="status">${oralHeard ? "Tu peux réécouter le mot." : "Écoute le mot avant de répondre."}</p></div>` : `<h1 class="quiz-pinyin ${quizMode === "toChinese" ? "french-prompt" : quizMode === "toFrench" ? "chinese-prompt" : ""}">${prompt}</h1><p class="quiz-meaning">${quizMode === "recognize" ? textFor(c).meaning : modeLabels[quizMode]}</p>`}
    <div class="answer-grid">${choices.map((o, i) => `<button class="answer ${quizMode === "toFrench" ? "french-answer" : ""} ${selected ? (o.hanzi === c.hanzi ? "correct" : o.hanzi === selected ? "incorrect" : "faded") : ""}" data-answer="${o.hanzi}" ${selected || (quizMode === "oral" && !oralHeard) ? "disabled" : ""}><span>${i + 1}</span><strong>${quizMode === "toFrench" ? textFor(o).meaning : o.hanzi}</strong>${selected && o.hanzi === c.hanzi ? icon("check") : ""}</button>`).join("")}</div>
    ${selected ? `<div class="feedback ${selected === c.hanzi ? "success" : "error"}" role="status"><strong>${selected === c.hanzi ? "Exactement !" : "La bonne réponse : " + (quizMode === "toFrench" ? textFor(c).meaning : c.hanzi)}</strong><span>${c.hanzi} · ${c.pinyin} · ${textFor(c).meaning}</span><small>${textFor(c).note}</small></div><button class="primary next-question" id="next-question">${question === quiz.length - 1 ? "Voir mon résultat" : "Question suivante"} ${icon("arrow")}</button>` : '<p class="subtle">Prends ton temps. Essaie de trouver la réponse avant de lire les choix.</p>'}</section>`;
}
let activePool: LessonVocabulary[] = vocabulary;
function startQuiz(review?: readonly LessonVocabulary[]) {
  stopAudio();
  activePool =
    quizMode !== "oral" && quizPool === "learned"
      ? vocabulary.filter(isLearned)
      : vocabulary;
  if (activePool.length < 4) {
    quizPool = "all";
    activePool = vocabulary;
  }
  quiz = shuffle([...(review || activePool)]).slice(0, 10);
  question = 0;
  correct = 0;
  finished = false;
  mistakes = [];
  prepareQuestion();
  render();
  if (quizMode === "oral") listen();
}
function prepareQuestion() {
  stopAudio();
  selected = null;
  oralHeard = false;
  const c = quiz[question];
  choices = shuffle([
    c,
    ...shuffle(
      activePool.filter(
        (o) =>
          o.hanzi !== c.hanzi &&
          (quizMode !== "oral" ||
            o.pinyin.normalize("NFC").replace(/\s/g, "").toLowerCase() !==
              c.pinyin.normalize("NFC").replace(/\s/g, "").toLowerCase()),
      ),
    ).slice(0, 3),
  ]);
}
function showQuestion() {
  render();
  if (quizMode === "oral" && !finished) listen();
  document
    .querySelector<HTMLButtonElement>(
      finished
        ? "#retry"
        : quizMode === "oral"
          ? "#replay-oral"
          : "[data-answer]",
    )
    ?.focus({ preventScroll: true });
}
function openLesson(index = 0) {
  returnFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  cardIndex = index;
  modalOpen = true;
  reveal = true;
  document.body.classList.add("modal-open");
  drawModal();
}
function drawModal() {
  stopAudio();
  const c = vocabulary[cardIndex];
  document.querySelector("#modal-root")!.innerHTML =
    `<div class="modal-overlay"><section class="study-modal" role="dialog" aria-modal="true" aria-labelledby="study-title">
    <div class="modal-top"><span>LEÇON 1 · MOT ${cardIndex + 1} / ${vocabulary.length}</span><button class="icon-button" id="close-modal" aria-label="Fermer">${icon("close")}</button></div><h2 id="study-title">${lesson.title}</h2>
    <div class="study-layout"><div class="study-character word-display" lang="zh-CN">${c.hanzi}</div><div class="study-content"><span class="eyebrow muted">${reveal ? "PRONONCIATION & SENS" : "RETROUVE LE PINYIN ET LA TRADUCTION"}</span>
    ${reveal ? `<div class="study-pinyin">${c.pinyin}<button class="icon-button" id="speak" aria-label="${localize(language, "Écouter le mot", "Listen to the word")}">${icon("sound")}</button></div><h3>${textFor(c).meaning}</h3><p>${textFor(c).note}</p>` : `<div class="hidden-answer"><span>${localize(language, "À toi de te souvenir…", "Your turn to remember...")}</span><p>${localize(language, "Prononce le mot et dis sa traduction avant de retourner la carte.", "Say the word and its translation before turning the card over.")}</p></div>`}
    <button class="secondary" id="toggle-answer">${reveal ? "Cacher la réponse" : "Révéler la réponse"}</button></div></div>
    ${reveal ? `<div class="example-box"><div class="example-top"><span class="eyebrow muted">${localize(language, "LE MOT EN CONTEXTE", "THE WORD IN CONTEXT")}</span><button class="icon-button" id="speak-example" aria-label="${localize(language, "Écouter la phrase", "Listen to the sentence")}">${icon("sound")}</button></div><strong lang="zh-CN">${c.example.chinese}</strong><span class="pinyin">${c.example.pinyin}</span><p>${textFor(c).example}</p></div>` : ""}
    <div class="study-actions"><button class="${isLearned(c) ? "secondary learned-button" : "primary"}" id="mark-learned">${icon("check")}${isLearned(c) ? "Mémorisé · retirer de mes acquis" : "J’ai mémorisé ce mot"}</button><button class="secondary" id="write-word">M’entraîner à l’écrire ${icon("arrow")}</button></div>
    <div class="study-bottom"><button class="secondary" id="prev-card" ${cardIndex === 0 ? "disabled" : ""}>← Précédent</button><span class="study-counter">${cardIndex + 1} / ${vocabulary.length}</span><button class="secondary" id="next-card">${cardIndex === vocabulary.length - 1 ? "Terminer" : "Suivant →"}</button></div></section></div>`;
  document.querySelector<HTMLButtonElement>("#close-modal")!.focus();
  on("#close-modal", closeModal);
  on(".modal-overlay", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  on("#mark-learned", () => {
    isLearned(c) ? learned.delete(wordKey(c)) : learned.add(wordKey(c));
    persist();
    drawModal();
    document.querySelector<HTMLButtonElement>("#mark-learned")!.focus();
  });
  on("#prev-card", () => {
    cardIndex--;
    drawModal();
  });
  on("#next-card", () => {
    if (cardIndex === vocabulary.length - 1) closeModal();
    else {
      cardIndex++;
      drawModal();
    }
  });
  on("#toggle-answer", () => {
    reveal = !reveal;
    drawModal();
    document.querySelector<HTMLButtonElement>("#toggle-answer")!.focus();
  });
  on("#speak", () => speak(c.hanzi));
  on("#speak-example", () => speak(c.example.chinese));
  on("#write-word", () => startWriting(cardIndex));
}
function closeModal() {
  modalOpen = false;
  document.body.classList.remove("modal-open");
  stopAudio();
  // Refresh progress without losing the position of the card that opened the dialog.
  const focusWord = returnFocus?.dataset.word;
  const focusId = returnFocus?.id;
  render();
  const target =
    focusWord !== undefined
      ? document.querySelector<HTMLElement>(`[data-word="${focusWord}"]`)
      : focusId
        ? document.getElementById(focusId)
        : null;
  (
    target || document.querySelector<HTMLElement>("nav button[aria-current]")
  )?.focus({ preventScroll: true });
}
function speak(text: string) {
  playMandarin(text, 0.8, (message, _heard, phase) => {
    if (phase === "error") toast(message);
  });
}
function toast(message: string) {
  const el = document.querySelector("#toast")!;
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 6000);
}
function persist() {
  if (!saveProgress())
    toast(
      "Sauvegarde indisponible : ta progression est conservée pour cette session uniquement.",
    );
}
function on(selector: string, handler: (event: MouseEvent) => void) {
  document
    .querySelector<HTMLElement>(selector)
    ?.addEventListener("click", handler);
}
function bindWords() {
  document
    .querySelectorAll<HTMLButtonElement>("[data-word]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const lessonId = b.dataset.lessonWord;
          if (lessonId && studyScope !== lessonId) setStudyScope(lessonId);
          const index = vocabulary.findIndex((word) => word.hanzi === b.dataset.hanzi);
          openLesson(index >= 0 ? index : Number(b.dataset.word));
        }),
    );
}
function bind() {
  for (const selector of ["#library-scope", "#writing-scope", "#oral-scope", "#quiz-scope"]) {
    document.querySelector<HTMLSelectElement>(selector)?.addEventListener("change", (event) => {
      setStudyScope((event.target as HTMLSelectElement).value);
      render();
      document.querySelector<HTMLSelectElement>(selector)?.focus();
    });
  }
  on("#test-audio", () => {
    playMandarin("你好", 0.8, (message, heard) => {
      const info = document.querySelector("#audio-info");
      if (info) info.textContent = heard ? "你好 · nǐ hǎo · bonjour" : message;
    });
  });
  on("#start-oral", () => {
    setStudyScope(
      (document.querySelector("#oral-scope") as HTMLSelectElement).value,
    );
    if (
      (document.querySelector("#oral-response") as HTMLSelectElement).value ===
      "draw"
    ) {
      dictationActive = true;
      render();
    } else {
      quizMode = "oral";
      startQuiz();
    }
  });
  on("#replay-oral", () => listen());
  on("#slow-oral", () => listen(0.55));
  document
    .querySelectorAll<HTMLButtonElement>("[data-page]")
    .forEach((b) => (b.onclick = () => navigate(b.dataset.page as Page)));
  document.querySelectorAll<HTMLButtonElement>("[data-open-lesson]").forEach(
    (b) =>
      (b.onclick = () => {
        setStudyScope(b.dataset.openLesson!);
        navigate("lesson");
      }),
  );
  on("#language-switch", () => {
    language = language === "fr" ? "en" : "fr";
    setLanguage(language);
    render();
  });
  document.querySelectorAll<HTMLAnchorElement>(".brand").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.preventDefault();
        navigate("home");
      }),
  );
  on("#continue", () =>
    openLesson(
      Math.max(
        0,
        vocabulary.findIndex((c) => !isLearned(c)),
      ),
    ),
  );
  on("#open-lesson", () => openLesson());
  bindWords();
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        libraryFilter = b.dataset.filter!;
        render();
        document
          .querySelector<HTMLButtonElement>(`[data-filter="${libraryFilter}"]`)!
          .focus();
      }),
  );
  document.querySelector("#search")?.addEventListener("input", (e) => {
    query = (e.target as HTMLInputElement).value;
    document.querySelector("#dictionary")!.innerHTML =
      wordCards(filteredWords());
    document.querySelector("#search-count")!.textContent =
      `${filteredWords().length} ${localize(language, "mot(s)", "word(s)")}`;
    bindWords();
  });
  on("#start-quiz", () => {
    setStudyScope(
      (document.querySelector("#quiz-scope") as HTMLSelectElement).value,
    );
    quizPool = (document.querySelector("#quiz-pool") as HTMLSelectElement)
      .value;
    quizMode = (document.querySelector("#quiz-mode") as HTMLSelectElement)
      .value as QuizMode;
    startQuiz();
  });
  on("#retry", () => startQuiz());
  on("#retry-mistakes", () => startQuiz([...mistakes]));
  for (const selector of ["#quit-quiz", "#quiz-settings"])
    on(selector, () => {
      stopAudio();
      quiz = [];
      render();
    });
  document.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach(
    (b) =>
      (b.onclick = () => {
        if (selected || (quizMode === "oral" && !oralHeard)) return;
        stopAudio();
        selected = b.dataset.answer!;
        if (selected === quiz[question].hanzi) correct++;
        else mistakes.push(quiz[question]);
        render();
        document
          .querySelector<HTMLButtonElement>("#next-question")!
          .focus({ preventScroll: true });
      }),
  );
  on("#next-question", () => {
    if (question === quiz.length - 1) {
      finished = true;
      progress.scores.push({ mode: quizMode, correct, total: quiz.length });
      showQuestion();
      persist();
    } else {
      question++;
      prepareQuestion();
      showQuestion();
    }
  });
}
document.addEventListener("keydown", (e) => {
  if (!modalOpen) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "Tab") {
    const buttons = [
      ...document.querySelectorAll<HTMLButtonElement>(
        ".study-modal button:not(:disabled)",
      ),
    ];
    const first = buttons[0],
      last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener("pagehide", stopAudio);
render();
if (!storageAvailable)
  toast(
    "La sauvegarde locale est indisponible. Ta progression restera disponible pendant cette session.",
  );
