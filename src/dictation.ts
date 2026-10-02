import HanziWriter, { type CharacterJson } from "hanzi-writer";
import type { LessonVocabulary } from "./domain";
import { playMandarin, stopAudio } from "./audio";
import { progress, saveProgress } from "./progress";
import { getLanguage, wordText } from "./i18n";

// Keep one writer: its pointer listeners remain attached to this reusable target.
const target = document.createElement("div");
target.className = "writing-target";
target.setAttribute("aria-label", "Dessiner le caractère entendu");
const cache = new Map<string, CharacterJson>();
let writer: HanziWriter | undefined;
let root: HTMLElement | null = null;
let resize: ResizeObserver | undefined;
let generation = 0;
let words: LessonVocabulary[] = [];
let index = 0;
let letter = 0;
let correct = 0;
let heard = false;
let ready = false;
let loadFailed = false;
let completed = false;
let revealed = false;
let assisted = false;
let mistakes = 0;
let nextStroke = 0;
let exit: () => void;

export function unmountDictation() {
  if (!root) return;
  generation++;
  stopAudio();
  writer?.cancelQuiz();
  void writer?.pauseAnimation();
  resize?.disconnect();
  target.remove();
  root = null;
}

export function mountDictation(
  container: HTMLElement,
  selectedWords: readonly LessonVocabulary[],
  onExit: () => void,
) {
  root = container;
  exit = onExit;
  words = [...selectedWords];
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  words = words.slice(0, 5);
  index = 0;
  correct = 0;
  beginWord();
}

function beginWord() {
  stopAudio();
  letter = 0;
  heard = false;
  revealed = false;
  assisted = false;
  mistakes = 0;
  draw();
  listen();
}

function listen(rate = 0.8) {
  if (!root) return;
  const currentRoot = root;
  const wordIndex = index;
  playMandarin(words[index].hanzi, rate, (message, played) => {
    if (root !== currentRoot || wordIndex !== index) return;
    const el = root.querySelector("#dictation-audio-status");
    if (!el) return;
    el.textContent = played
      ? "À toi : écris le mot que tu as entendu."
      : message;
    if (played) heard = true;
    updateControls();
  });
}

function updateControls() {
  if (!root) return;
  target.style.pointerEvents = ready && heard && !completed ? "auto" : "none";
  for (const id of ["dictation-hint", "dictation-reset"]) {
    const button = root.querySelector<HTMLButtonElement>(`#${id}`);
    if (button)
      button.disabled =
        completed ||
        (id === "dictation-reset" && loadFailed ? false : !ready || !heard);
  }
}

function draw() {
  if (!root) return;
  const token = ++generation;
  const container = root;
  writer?.cancelQuiz();
  void writer?.pauseAnimation();
  resize?.disconnect();
  target.remove();
  target.style.visibility = "hidden";
  target.style.pointerEvents = "none";
  loadFailed = false;
  ready = false;
  completed = false;
  nextStroke = 0;
  const word = words[index];
  const localizedWord = wordText(word, getLanguage());
  const chars = [...word.hanzi];
  const char = chars[letter];
  const ambiguous = words.some(
    (w) => w.hanzi !== word.hanzi && w.pinyin === word.pinyin,
  );
  container.innerHTML = `<section class="dictation-exercise">
    <div class="quiz-top"><button class="text-link" id="dictation-exit">← Quitter la dictée</button><span>Mot ${index + 1} sur ${words.length}</span><span>${correct} sans aide</span></div>
    <div class="quiz-progress"><i style="width:${(index / words.length) * 100}%"></i></div>
    <span class="eyebrow muted">ÉCOUTER ET ÉCRIRE</span><h1>À toi de tracer<span class="accent">.</span></h1>
    <div class="oral-controls"><button class="primary" id="dictation-replay">Réécouter</button><button class="secondary" id="dictation-slow">Écouter plus lentement</button></div>
    <p id="dictation-audio-status" class="audio-status" role="status">${heard ? "Tu peux réécouter le mot entier." : "Écoute le mot avant de tracer."}</p>
    ${ambiguous ? `<p class="homophone-help">Ce son correspond à plusieurs mots. Sens demandé : <strong>${localizedWord.meaning}</strong>.</p>` : ""}
    <div class="dictation-slots" aria-label="Avancement du mot">${chars.map((c, i) => `<span class="${i === letter ? "current" : ""}" aria-label="Caractère ${i + 1}${i < letter ? " terminé" : ""}">${i < letter ? c : i + 1}</span>`).join("")}</div>
    <p class="subtle">Caractère ${letter + 1} sur ${chars.length} · Trace dans l’ordre des traits, à la souris, au doigt ou au stylet.</p>
    <div class="writing-board"><div class="writing-grid" aria-hidden="true"></div><div id="dictation-mount"></div></div>
    <p id="dictation-status" class="writing-status" role="status">Chargement du tracé…</p>
    <div class="writing-actions"><button class="secondary" id="dictation-reset" disabled>Effacer et recommencer</button><button class="secondary" id="dictation-hint" disabled>Indice : montrer le modèle</button></div>
    <div id="dictation-correction"></div>
    <div class="dictation-next"><button class="text-link" id="dictation-solution">Voir la réponse et passer ce mot</button><button class="primary" id="dictation-next" hidden>Suivant</button></div>
    <p class="subtle">Un point pour un mot terminé sans erreur, sans indice et sans voir la réponse. Recommencer n’efface pas les erreurs du mot.</p>
    <p class="writing-credit">Tracés : Hanzi Writer · Make Me a Hanzi / Arphic · <a href="./strokes/ARPHICPL.TXT" target="_blank">Licence</a></p>
  </section>`;
  container.querySelector("#dictation-mount")!.append(target);
  container.querySelector<HTMLButtonElement>("#dictation-exit")!.onclick = () =>
    exit();
  container.querySelector<HTMLButtonElement>("#dictation-replay")!.onclick =
    () => listen();
  container.querySelector<HTMLButtonElement>("#dictation-slow")!.onclick = () =>
    listen(0.55);
  container.querySelector<HTMLButtonElement>("#dictation-reset")!.onclick =
    () => {
      draw();
    };
  container.querySelector<HTMLButtonElement>("#dictation-hint")!.onclick =
    () => {
      assisted = true;
      void writer?.showOutline({ duration: 0 });
      status(
        "Modèle affiché. Continue à tracer ; ce mot sera compté comme travaillé avec aide.",
      );
    };
  container.querySelector<HTMLButtonElement>("#dictation-solution")!.onclick =
    () => {
      revealed = true;
      completed = true;
      generation++; // Ignore an in-flight model load after the answer is revealed.
      writer?.cancelQuiz();
      stopAudio();
      showCorrection(false);
      updateControls();
    };
  container.querySelector<HTMLButtonElement>("#dictation-next")!.onclick =
    () => {
      if (!completed) return;
      stopAudio();
      if (!revealed && letter < chars.length - 1) {
        letter++;
        draw();
        return;
      }
      index++;
      if (index === words.length) finish();
      else beginWord();
    };
  void initialize();

  function status(message: string) {
    if (root === container)
      container.querySelector("#dictation-status")!.textContent = message;
  }
  function showCorrection(success: boolean) {
    container.querySelector("#dictation-correction")!.innerHTML =
      `<div class="feedback ${success ? "success" : "error"}"><strong>${success ? "Bravo, le mot entier est réussi sans aide !" : revealed ? "Voici le mot à retenir." : "Mot terminé. Continue à t’entraîner pour le retrouver sans aide."}</strong><span lang="zh-CN">${word.hanzi}</span><span>${word.pinyin} · ${localizedWord.meaning}</span><small>${localizedWord.note}</small></div>`;
    status(
      revealed
        ? "Réponse affichée : aucun point ajouté pour ce mot."
        : `${mistakes} erreur(s)${assisted ? " · indice utilisé" : ""}.`,
    );
    const next = container.querySelector<HTMLButtonElement>("#dictation-next")!;
    next.hidden = false;
    next.textContent =
      index === words.length - 1 ? "Voir mon résultat" : "Mot suivant →";
    container.querySelector<HTMLButtonElement>("#dictation-solution")!.hidden =
      true;
    next.focus({ preventScroll: true });
  }
  async function initialize() {
    try {
      if (!cache.has(char)) {
        const response = await fetch(
          new URL(`strokes/${encodeURIComponent(char)}.json`, document.baseURI),
        );
        if (!response.ok) throw new Error("Modèle indisponible");
        const data: CharacterJson = await response.json();
        if (!Array.isArray(data.strokes) || !Array.isArray(data.medians))
          throw new Error("Modèle invalide");
        cache.set(char, data);
      }
      if (token !== generation || root !== container) return;
      if (!writer)
        writer = HanziWriter.create(target, char, {
          width: 280,
          height: 280,
          padding: 20,
          showCharacter: false,
          showOutline: false,
          strokeColor: "#294f3c",
          outlineColor: "#dce4d5",
          drawingColor: "#ce774c",
          highlightColor: "#88a56e",
          charDataLoader: (c) => cache.get(c)!,
        });
      else await writer.setCharacter(char);
      if (token !== generation || root !== container) return;
      await writer.hideCharacter({ duration: 0 });
      await writer.hideOutline({ duration: 0 });
      if (token !== generation || root !== container) return;
      resize = new ResizeObserver(() => {
        if (root !== container) return;
        const size = container.querySelector(".writing-board")!.clientWidth;
        writer?.updateDimensions({ width: size, height: size, padding: 20 });
      });
      resize.observe(container.querySelector(".writing-board")!);
      ready = true;
      target.style.visibility = "visible";
      updateControls();
      status(
        "À toi de tracer le premier trait. Aucun modèle ni indice automatique.",
      );
      void writer.quiz({
        showHintAfterMisses: false,
        acceptBackwardsStrokes: false,
        onMistake: () => {
          if (token !== generation) return;
          mistakes++;
          status(
            `Ce trait ne correspond pas. Vérifie la forme, le sens et l’ordre. ${mistakes} erreur(s) sur le mot.`,
          );
        },
        onCorrectStroke: (data) => {
          if (token !== generation) return;
          nextStroke = data.strokeNum + 1;
          status(
            `Trait ${nextStroke} validé · ${data.strokesRemaining} restant(s).`,
          );
        },
        onComplete: () => {
          if (token !== generation || completed) return;
          completed = true;
          updateControls();
          if (letter === chars.length - 1) {
            const success = !assisted && mistakes === 0;
            if (success) correct++;
            showCorrection(success);
          } else {
            status(
              "Caractère terminé ! Passe au caractère suivant du même mot.",
            );
            const next =
              container.querySelector<HTMLButtonElement>("#dictation-next")!;
            next.hidden = false;
            next.textContent = "Caractère suivant →";
            next.focus({ preventScroll: true });
          }
        },
      });
    } catch {
      if (token !== generation || root !== container) return;
      loadFailed = true;
      status("Impossible de charger le tracé. Réessaie le chargement.");
      const reset =
        container.querySelector<HTMLButtonElement>("#dictation-reset")!;
      reset.disabled = false;
      reset.textContent = "Réessayer le chargement";
      reset.onclick = () => draw();
    }
  }
}

function finish() {
  if (!root) return;
  generation++;
  writer?.cancelQuiz();
  resize?.disconnect();
  progress.scores.push({ mode: "dictation", correct, total: words.length });
  const saved = saveProgress();
  root.innerHTML = `<section class="quiz-intro"><span class="eyebrow muted">ÉCOUTER ET ÉCRIRE · RÉSULTAT</span><h1>Dictée terminée !</h1><div class="score">${correct}<small> / ${words.length}</small></div><p>Mots écrits sans erreur et sans aide.</p><p class="subtle">${saved ? "Ton score a été enregistré." : "Sauvegarde indisponible : ton score reste disponible pour cette session."}</p><div class="result-actions"><button class="primary" id="dictation-again">Nouvelle dictée</button><button class="secondary" id="dictation-back">Retour à l’oral</button></div></section>`;
  root.querySelector<HTMLButtonElement>("#dictation-again")!.onclick = () => {
    if (root) mountDictation(root, words, exit);
  };
  root.querySelector<HTMLButtonElement>("#dictation-back")!.onclick = () =>
    exit();
}
