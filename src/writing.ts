import HanziWriter, { type CharacterJson } from "hanzi-writer";
import { characterKey, type LessonVocabulary, type WritingMode } from "./domain";
import { progress, recordWriting } from "./progress";
import { getLanguage, wordText } from "./i18n";

const cache = new Map<string, CharacterJson>();
const target = document.createElement("div");
target.className = "writing-target";
target.setAttribute("aria-label", "Zone de tracé du caractère");
let writer: HanziWriter | undefined;
let activeContainer: HTMLElement | null = null;
let generation = 0;
let wordIndex = 0;
let characterIndex = 0;
let words: readonly LessonVocabulary[] = [];
let selectedCharacters = new Set<string>();
let mode: "observe" | WritingMode = "observe";
let resizeObserver: ResizeObserver | undefined;

function randomCharacterTarget() {
  const pool = practicePool();
  const choices =
    pool.length > 1
      ? pool.filter(
          (item) =>
            item.wordIndex !== wordIndex ||
            item.characterIndex !== characterIndex,
        )
      : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

function practicePool() {
  return words.flatMap((word, wordIndex) =>
    [...word.hanzi].flatMap((char, characterIndex) =>
      selectedCharacters.has(char) ? [{ wordIndex, characterIndex }] : [],
    ),
  );
}

export function unmountWriting() {
  generation++;
  activeContainer = null;
  writer?.cancelQuiz();
  void writer?.pauseAnimation();
  resizeObserver?.disconnect();
  target.remove();
}

export function mountWriting(
  container: HTMLElement,
  selectedWords: readonly LessonVocabulary[],
  initialWord = 0,
) {
  activeContainer = container;
  words = selectedWords;
  selectedCharacters = new Set(selectedWords.flatMap((word) => [...word.hanzi]));
  wordIndex = Math.min(initialWord, Math.max(0, words.length - 1));
  characterIndex = 0;
  mode = "observe";
  draw();
}

function draw() {
  const container = activeContainer;
  if (!container) return;
  const token = ++generation;
  writer?.cancelQuiz();
  void writer?.pauseAnimation();
  resizeObserver?.disconnect();
  target.remove();
  target.style.visibility = "hidden";
  const pool = practicePool();
  if (pool.length) {
    const currentIsSelected = selectedCharacters.has([...words[wordIndex].hanzi][characterIndex]);
    if (!currentIsSelected) {
      wordIndex = pool[0].wordIndex;
      characterIndex = pool[0].characterIndex;
    }
  }
  const word = words[wordIndex];
  const localizedWord = wordText(word, getLanguage());
  const letters = [...word.hanzi];
  const char = letters[characterIndex];
  container.innerHTML = `
    <div class="writing-layout">
      <aside class="writing-sidebar">
        <label for="writing-word">Le mot à travailler</label>
        <select id="writing-word">${words.map((v, i) => `<option value="${i}" ${i === wordIndex ? "selected" : ""}>${mode === "memory" ? v.pinyin : v.hanzi + " · " + v.pinyin} — ${wordText(v, getLanguage()).meaning}</option>`).join("")}</select>
        <button class="secondary writing-random" id="writing-random" type="button">Choisir un caractère aléatoire</button>
        <div class="writing-word-summary">
          <strong class="${mode === "memory" ? "memory-word" : ""}">${mode === "memory" ? word.pinyin : word.hanzi}</strong>
          ${mode !== "memory" ? `<span class="pinyin">${word.pinyin}</span>` : ""}
          <p>${localizedWord.meaning}</p>
        </div>
        <span class="eyebrow muted">${letters.length === 1 ? "UN CARACTÈRE" : "UN CARACTÈRE APRÈS L’AUTRE"}</span>
        <div class="writing-characters">${letters.map((c, i) => `<button class="${i === characterIndex ? "selected" : ""}" data-writing-character="${i}" aria-label="Caractère ${i + 1}" aria-pressed="${i === characterIndex}">${mode === "memory" ? i + 1 : c}<small>${progress.writing[characterKey(word.lessonId, c)]?.memory ? "✓" : i + 1}</small></button>`).join("")}</div>
        <p class="subtle">Les mots s’écrivent de gauche à droite. Travaille chaque caractère, puis recopie le mot entier sur papier.</p>
        <div class="writing-character-picker"><div class="writing-picker-heading"><strong>Ma liste de caractères</strong><button class="text-link" type="button" id="writing-select-all">Tout</button></div><div class="writing-picker-list">${[...new Set(words.flatMap((item) => [...item.hanzi]))].map((char) => `<label><input type="checkbox" data-practice-character="${char}" ${selectedCharacters.has(char) ? "checked" : ""}><span lang="zh-CN">${char}</span></label>`).join("")}</div><p class="subtle">${selectedCharacters.size} caractère(s) sélectionné(s)</p></div>
        <div class="writing-record"><strong>Ton entraînement sur ce caractère</strong><p>${progress.writing[characterKey(word.lessonId, char)]?.guided || 0} tracé(s) guidé(s) réussi(s)<br>${progress.writing[characterKey(word.lessonId, char)]?.memory || 0} tracé(s) sans modèle réussi(s)</p></div>
      </aside>
      <section class="writing-workspace" aria-label="Atelier de tracé">
        <div class="writing-modes" role="group" aria-label="Mode d’écriture">${[
          ["observe", "1. Observer"],
          ["guided", "2. Tracer"],
          ["memory", "3. De mémoire"],
        ]
          .map(
            ([id, label]) =>
              `<button data-writing-mode="${id}" class="${mode === id ? "selected" : ""}" aria-pressed="${mode === id}">${label}</button>`,
          )
          .join("")}</div>
        <p class="writing-instruction">${mode === "observe" ? "Regarde l’ordre et le sens des traits, puis passe au tracé." : mode === "guided" ? "Suis le modèle avec ton doigt, ton stylet ou ta souris, dans l’ordre des traits." : `Écris le caractère ${characterIndex + 1} de « ${word.pinyin} », sans modèle ni indice automatique.`}</p>
        <div class="writing-board"><div class="writing-grid" aria-hidden="true"></div><div id="writer-mount"></div></div>
        <p id="writing-status" class="writing-status" role="status">Chargement du modèle…</p>
        <div class="writing-actions"><button class="primary" id="writing-restart" disabled>${mode === "observe" ? "▶ Voir l’ordre des traits" : "Recommencer le tracé"}</button><button class="secondary" id="writing-next">${pool.length > 1 ? "Caractère suivant →" : "Recommencer ce caractère"}</button></div>
        <p class="subtle">${mode === "memory" ? "Un tracé sans erreur est enregistré comme réussi. Besoin d’aide ? Reviens à « Tracer »." : "La forme, la direction et l’ordre des traits sont vérifiés pendant le tracé."}</p>
      </section>
    </div>
    <aside class="tip"><span class="tip-character">字</span><div><strong>Observer → tracer → retrouver de mémoire.</strong><p>Commence par regarder l’animation. Trace ensuite avec le guide, puis essaie sans modèle. La validation aide à apprendre les traits ; elle ne remplace pas la pratique sur papier.</p></div></aside>
    <p class="writing-credit">Animation et vérification : <a href="https://hanziwriter.org/" target="_blank" rel="noreferrer">Hanzi Writer</a> · Données : <a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noreferrer">Make Me a Hanzi / Arphic</a> · <a href="./strokes/ARPHICPL.TXT" target="_blank">Licence</a></p>`;
  container.querySelector("#writer-mount")!.append(target);
  container.querySelector<HTMLButtonElement>("#writing-random")!.onclick = () => {
    const next = randomCharacterTarget();
    if (!next) return;
    wordIndex = next.wordIndex;
    characterIndex = next.characterIndex;
    draw();
  };
  container.querySelector<HTMLSelectElement>("#writing-word")!.onchange = (
    e,
  ) => {
    wordIndex = Number((e.target as HTMLSelectElement).value);
    characterIndex = 0;
    for (const char of words[wordIndex].hanzi) selectedCharacters.add(char);
    draw();
  };
  container.querySelectorAll<HTMLInputElement>("[data-practice-character]").forEach((checkbox) => {
    checkbox.onchange = () => {
      const char = checkbox.dataset.practiceCharacter!;
      if (checkbox.checked) selectedCharacters.add(char);
      else if (selectedCharacters.size > 1) selectedCharacters.delete(char);
      else checkbox.checked = true;
      draw();
    };
  });
  container.querySelector<HTMLButtonElement>("#writing-select-all")!.onclick = () => {
    selectedCharacters = new Set(words.flatMap((item) => [...item.hanzi]));
    draw();
  };
  container
    .querySelectorAll<HTMLButtonElement>("[data-writing-character]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          characterIndex = Number(b.dataset.writingCharacter);
          draw();
        }),
    );
  container.querySelectorAll<HTMLButtonElement>("[data-writing-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        mode = b.dataset.writingMode as typeof mode;
        draw();
      }),
  );
  container.querySelector<HTMLButtonElement>("#writing-next")!.onclick = () => {
    const available = practicePool();
    const current = available.findIndex((item) => item.wordIndex === wordIndex && item.characterIndex === characterIndex);
    const next = available[(current + 1) % available.length];
    wordIndex = next.wordIndex;
    characterIndex = next.characterIndex;
    draw();
  };
  void initialize();

  function status(message: string) {
    if (token === generation)
      container!.querySelector("#writing-status")!.textContent = message;
  }
  async function initialize() {
    const restart =
      container!.querySelector<HTMLButtonElement>("#writing-restart")!;
    try {
      if (!cache.has(char)) {
        const response = await fetch(
          new URL(`strokes/${encodeURIComponent(char)}.json`, document.baseURI),
        );
        if (!response.ok) throw new Error("Données indisponibles");
        const data: CharacterJson = await response.json();
        if (!Array.isArray(data.strokes) || !Array.isArray(data.medians))
          throw new Error("Données invalides");
        cache.set(char, data);
      }
      if (token !== generation) return;
      if (!writer) {
        writer = HanziWriter.create(target, char, {
          width: 280,
          height: 280,
          padding: 20,
          strokeColor: "#294f3c",
          outlineColor: "#dce4d5",
          drawingColor: "#ce774c",
          highlightColor: "#88a56e",
          strokeAnimationSpeed: 0.8,
          delayBetweenStrokes: 450,
          charDataLoader: (c) => cache.get(c)!,
          showCharacter: false,
          showOutline: false,
        });
      } else await writer.setCharacter(char);
      if (token !== generation) return;
      resizeObserver = new ResizeObserver(() => {
        const width = container!.querySelector(".writing-board")!.clientWidth;
        writer?.updateDimensions({ width, height: width, padding: 20 });
      });
      resizeObserver.observe(container!.querySelector(".writing-board")!);
      restart.disabled = false;
      restart.onclick = () => {
        void start();
      };
      await start(mode === "observe");
      if (token === generation) target.style.visibility = "visible";
    } catch {
      if (token !== generation) return;
      status("Impossible de charger les traits. Réessaie le chargement.");
      restart.textContent = "Réessayer";
      restart.disabled = false;
      restart.onclick = () => {
        draw();
      };
    }
  }
  async function start(showStatic = false) {
    const currentWriter = writer!;
    currentWriter.cancelQuiz();
    if (mode === "observe") {
      await currentWriter.showOutline({ duration: 0 });
      if (token !== generation) return;
      if (showStatic) {
        await currentWriter.showCharacter({ duration: 0 });
        status(
          `${cache.get(char)!.strokes.length} traits. Lance l’animation pour découvrir leur ordre.`,
        );
      } else {
        const restart =
          container!.querySelector<HTMLButtonElement>("#writing-restart")!;
        restart.disabled = true;
        status("Observe le mouvement de chaque trait…");
        await currentWriter.animateCharacter();
        status("À toi ! Passe à « Tracer » pour t’entraîner.");
        if (token === generation) restart.disabled = false;
      }
      return;
    }
    const practiceMode: WritingMode = mode;
    await currentWriter.hideCharacter({ duration: 0 });
    if (token !== generation) return;
    if (practiceMode === "guided")
      await currentWriter.showOutline({ duration: 0 });
    else await currentWriter.hideOutline({ duration: 0 });
    if (token !== generation) return;
    status(
      `À toi de tracer le premier trait. ${cache.get(char)!.strokes.length} traits au total.`,
    );
    void currentWriter.quiz({
      showHintAfterMisses: practiceMode === "guided" ? 1 : false,
      acceptBackwardsStrokes: false,
      onMistake: (data) =>
        status(
          `Ce trait ne correspond pas. Vérifie sa forme, son sens et sa position. ${data.totalMistakes} erreur(s).`,
        ),
      onCorrectStroke: (data) =>
        status(
          `Trait ${data.strokeNum + 1} validé · ${data.strokesRemaining} restant(s).`,
        ),
      onComplete: (result) => {
        if (token !== generation) return;
        const success = practiceMode === "guided" || result.totalMistakes === 0;
        const progressKey = characterKey(word.lessonId, char);
        const saved = success ? recordWriting(progressKey, practiceMode) : true;
        status(
          success
            ? `Bravo ! Tracé ${practiceMode === "guided" ? "guidé" : "sans modèle"} réussi · ${result.totalMistakes} erreur(s).${saved ? "" : " Sauvegarde indisponible : progression conservée pour cette session."}`
            : `Caractère terminé avec ${result.totalMistakes} erreur(s). Recommence sans erreur pour valider le tracé de mémoire.`,
        );
        container!.querySelector(".writing-record p")!.innerHTML =
          `${progress.writing[progressKey]?.guided || 0} tracé(s) guidé(s) réussi(s)<br>${progress.writing[progressKey]?.memory || 0} tracé(s) sans modèle réussi(s)`;
        if (success && practiceMode === "memory")
          container!.querySelector(
            `[data-writing-character="${characterIndex}"] small`,
          )!.textContent = "✓";
      },
    });
  }
}
