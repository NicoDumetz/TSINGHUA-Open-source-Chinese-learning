import { test, expect, type Page } from "@playwright/test";
import { allVocabulary as vocabulary } from "../src/lessons";

import { mockLessonAudio } from "./audio-helper";

test("oral : écoute, quatre choix sans homophones, réécoute, correction et score", async ({
  page,
}) => {
  await mockLessonAudio(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Oral", exact: true }).click();
  await page.getByRole("button", { name: "Commencer l’oral" }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator(".quiz-top")).toContainText(
      `Question ${i + 1} sur 10`,
    );
    await expect(page.locator("#oral-status")).toContainText("À toi");
    const spoken = await page.evaluate(
      () => (window as any).audioTest.calls.at(-1).text,
    );
    const word = vocabulary.find((v) => v.hanzi === spoken)!;
    expect(word).toBeTruthy();
    await expect(page.locator(".quiz-pinyin")).toHaveCount(0);
    await expect(page.locator(".quiz-meaning")).toHaveCount(0);
    await expect(page.locator(".feedback")).toHaveCount(0);
    const options = await page
      .locator("[data-answer]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-answer")!));
    expect(new Set(options).size).toBe(4);
    expect(options).toContain(spoken);
    expect(
      options.filter(
        (h) => vocabulary.find((v) => v.hanzi === h)!.pinyin === word.pinyin,
      ),
    ).toEqual([spoken]);
    if (i === 0) {
      await page
        .getByRole("button", { name: "Réécouter", exact: true })
        .click();
      await expect(page.locator("#oral-status")).toContainText("À toi");
      await page
        .getByRole("button", { name: "Écouter plus lentement" })
        .click();
      await expect(page.locator("#oral-status")).toContainText("À toi");
      expect(
        await page.evaluate(() => (window as any).audioTest.calls.at(-1)),
      ).toEqual({ text: spoken, rate: 0.75 });
    }
    await page.locator(`[data-answer="${spoken}"]`).click();
    await expect(page.locator(".feedback")).toContainText(word.pinyin);
    await expect(page.locator(".feedback")).toContainText(word.meaning);
    await page
      .getByRole("button", {
        name: i === 9 ? "Voir mon résultat" : "Question suivante",
      })
      .click();
  }
  await expect(page.locator(".score")).toHaveText("10 / 10");
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("hanzi-progress-v2")!).scores.at(-1),
    ),
  ).toEqual({ mode: "oral", correct: 10, total: 10 });
  await page.reload();
  await expect(page.locator(".stat").last()).toContainText("100 %");
  await page.getByRole("button", { name: "Le quiz", exact: true }).click();
  await expect(page.locator("#quiz-mode")).toHaveValue("recognize");
});

test("audio local sans voix installée, panne de fichier et réessai", async ({
  page,
}) => {
  await mockLessonAudio(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Oral", exact: true }).click();
  await expect(page.locator("#audio-info")).toContainText(
    "Audio mandarin intégré",
  );
  await expect(page.locator("#start-oral")).toBeEnabled();
  await page.evaluate(() => {
    (window as any).audioTest.fail = true;
  });
  await page.locator("#start-oral").click();
  await expect(page.locator("#oral-status")).toContainText(
    "Impossible de lire",
  );
  await expect(page.locator("[data-answer]:disabled")).toHaveCount(4);
  await page.evaluate(() => {
    (window as any).audioTest.fail = false;
  });
  await page.getByRole("button", { name: "Réécouter", exact: true }).click();
  await expect(page.locator("[data-answer]:enabled")).toHaveCount(4);
  await page.getByRole("button", { name: "Quitter le quiz" }).click();
  await expect(page.locator("#start-oral")).toBeVisible();
  await page.getByRole("button", { name: "Le quiz", exact: true }).click();
  await expect(page.locator("#quiz-mode")).toHaveValue("recognize");
});

test("oral sur mobile : navigation et quatre réponses accessibles sans débordement", async ({
  page,
}) => {
  await mockLessonAudio(page);
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/");
  await page.getByRole("button", { name: "Oral", exact: true }).click();
  await page.locator("#start-oral").click();
  await expect(page.locator("[data-answer]:enabled")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/oral-mobile.png",
    fullPage: true,
  });
});
