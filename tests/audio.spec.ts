import { test, expect } from "@playwright/test";
import { audioFiles } from "../src/audio-manifest";
import { allVocabulary as vocabulary } from "../src/lessons";

test("tous les mots et exemples ont un vrai MP3 décodable et non silencieux", async ({
  page,
}) => {
  await page.goto("/");
  const texts = [
    ...new Set(vocabulary.flatMap((v) => [v.hanzi, v.example.chinese])),
  ];
  for (const text of texts) expect(audioFiles[text]).toBeTruthy();
  const results = await page.evaluate(async (files) => {
    const context = new AudioContext();
    const results = [];
    for (const [text, file] of Object.entries(files)) {
      const response = await fetch(`audio/${file}`);
      if (!response.ok) throw new Error(`Missing audio: ${text}`);
      const buffer = await context.decodeAudioData(
        await response.arrayBuffer(),
      );
      const samples = buffer.getChannelData(0);
      let peak = 0,
        sum = 0;
      for (const v of samples) {
        peak = Math.max(peak, Math.abs(v));
        sum += v * v;
      }
      results.push({
        text,
        duration: buffer.duration,
        peak,
        rms: Math.sqrt(sum / samples.length),
      });
    }
    await context.close();
    return results;
  }, audioFiles);
  expect(results).toHaveLength(texts.length);
  for (const result of results) {
    expect(result.duration, result.text).toBeGreaterThan(0.3);
    expect(result.duration, result.text).toBeLessThan(12);
    expect(result.peak, result.text).toBeGreaterThan(0.02);
    expect(result.rms, result.text).toBeGreaterThan(0.003);
  }
});

test("lecture réelle du MP3 dans Chrome : test du son, oral, ralenti et cours sans synthèse vocale", async ({
  page,
}) => {
  test.setTimeout(45000);
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", {
      get() {
        throw new Error("Browser speech must never be used");
      },
    });
    Math.random = () => 0.999;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Oral", exact: true }).click();
  const preview = page.waitForResponse((r) =>
    r.url().endsWith(audioFiles["你好"]),
  );
  await page.getByRole("button", { name: "Tester le son : bonjour" }).click();
  expect((await preview).ok()).toBeTruthy();
  await expect(page.locator("#audio-info")).toContainText("nǐ hǎo", {
    timeout: 10000,
  });
  await page.locator("#start-oral").click();
  await expect(page.locator("#oral-status")).toContainText("À toi", {
    timeout: 10000,
  });
  await expect(page.locator("[data-answer]:enabled")).toHaveCount(4);
  await page.getByRole("button", { name: "Écouter plus lentement" }).click();
  await expect(page.locator("#oral-status")).toContainText("Écoute bien", {
    timeout: 5000,
  });
  await expect(page.locator("#oral-status")).toContainText("À toi", {
    timeout: 10000,
  });
  await page.locator('[data-answer="你好"]').click();
  await expect(page.locator(".feedback")).toContainText("bonjour");
  await page.getByRole("button", { name: "Leçons", exact: true }).click();
  await page.locator('[data-open-lesson="lesson-1"]').click();
  await page.getByRole("button", { name: "Ouvrir la fiche de 不客气" }).click();
  const word = page.waitForResponse((r) =>
    r.url().endsWith(audioFiles["不客气"]),
  );
  await page
    .getByRole("button", { name: "Écouter le mot", exact: true })
    .click();
  expect((await word).ok()).toBeTruthy();
  const phrase = page.waitForResponse((r) =>
    r.url().endsWith(audioFiles["不客气！"]),
  );
  await page
    .getByRole("button", { name: "Écouter la phrase", exact: true })
    .click();
  expect((await phrase).ok()).toBeTruthy();
  expect(errors).toEqual([]);
});
