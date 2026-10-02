import { type Page } from "@playwright/test";
import { audioFiles } from "../src/audio-manifest";

// Fast deterministic playback for interaction tests. Real MP3 decoding/playback
// is independently covered by audio.spec.ts without replacing HTMLAudioElement.
export async function mockLessonAudio(page: Page) {
  await page.addInitScript(
    ({ files }) => {
      const state = {
        fail: false,
        calls: [] as { text: string; rate: number }[],
        cancels: 0,
      };
      Object.assign(window, { audioTest: state });
      class LessonAudio {
        src: string;
        playbackRate = 1;
        preservesPitch = true;
        preload = "";
        onplaying?: () => void;
        onended?: () => void;
        onerror?: () => void;
        timer?: ReturnType<typeof setTimeout>;
        constructor(src: string) {
          this.src = src;
        }
        play() {
          const file = new URL(this.src).pathname.split("/").at(-1);
          const text = Object.entries(files).find(
            ([, name]) => name === file,
          )?.[0];
          state.calls.push({ text: text || "", rate: this.playbackRate });
          this.onplaying?.();
          this.timer = setTimeout(
            () => (state.fail ? this.onerror?.() : this.onended?.()),
            70,
          );
          return Promise.resolve();
        }
        pause() {
          state.cancels++;
          clearTimeout(this.timer);
        }
        removeAttribute(name: string) {
          if (name === "src") this.src = "";
        }
        load() {}
      }
      Object.defineProperty(window, "Audio", {
        value: LessonAudio,
        configurable: true,
      });
      Object.defineProperty(window, "speechSynthesis", {
        value: undefined,
        configurable: true,
      });
      Math.random = () => 0.999;
    },
    { files: audioFiles },
  );
}
