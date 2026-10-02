import { audioFiles } from "./audio-manifest";

type AudioPhase = "loading" | "playing" | "ended" | "error";
type AudioStatus = (message: string, heard: boolean, phase: AudioPhase) => void;
let generation = 0;
let active: HTMLAudioElement | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

export function stopAudio() {
  generation++;
  clearTimeout(timer);
  if (active) {
    active.onplaying = null;
    active.onended = null;
    active.onerror = null;
    active.pause();
    active.removeAttribute("src");
    active.load();
    active = null;
  }
}

/** Pre-rendered Mandarin, shared by the course, oral quiz and handwriting dictation. */
export function playMandarin(text: string, rate: number, status: AudioStatus) {
  stopAudio();
  const token = generation;
  const filename = audioFiles[text];
  if (!filename) {
    status(
      "L’audio de ce mot est indisponible. Recharge le site puis réessaie.",
      false,
      "error",
    );
    return;
  }
  const player = new Audio(new URL(`audio/${filename}`, document.baseURI).href);
  active = player;
  player.preload = "auto";
  // Keep the neural voice's natural pitch and Mandarin tones when slowing down.
  player.playbackRate = rate < 0.7 ? 0.75 : 1;
  player.preservesPitch = true;
  let started = false;
  const update = (message: string, heard: boolean, phase: AudioPhase) => {
    if (token === generation) status(message, heard, phase);
  };
  const fail = (blocked = false) => {
    if (token !== generation) return;
    stopAudio();
    status(
      blocked
        ? "Le navigateur a bloqué la lecture. Appuie sur « Réécouter » pour lancer l’audio."
        : "Impossible de lire le fichier audio. Recharge la page ou appuie sur « Réécouter » pour réessayer.",
      false,
      "error",
    );
  };
  player.onplaying = () => {
    started = true;
    update("Écoute bien…", false, "playing");
  };
  player.onended = () => {
    if (token !== generation) return;
    clearTimeout(timer);
    if (!started) {
      fail();
      return;
    }
    update("À toi : retrouve le mot que tu as entendu.", true, "ended");
  };
  player.onerror = () => fail();
  update("Chargement de l’audio…", false, "loading");
  timer = setTimeout(() => fail(), 20000);
  void player
    .play()
    .catch((error: unknown) =>
      fail(error instanceof DOMException && error.name === "NotAllowedError"),
    );
}
