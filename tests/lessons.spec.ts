import { expect, test } from "@playwright/test";
import {
  allVocabulary,
  lessons,
  vocabularyForScope,
} from "../src/lessons";

test("catalogue de leçons et sélecteurs d'exercices", async ({ page }) => {
  expect(lessons.map((lesson) => lesson.id)).toEqual(["lesson-1", "lesson-2", "lesson-3"]);
  expect(lessons[1].vocabulary.some((word) => word.hanzi === "朋友")).toBe(false);
  expect(lessons[2].vocabulary.some((word) => word.hanzi === "朋友")).toBe(true);
  expect(vocabularyForScope("all")).toEqual(allVocabulary);

  await page.goto("/");
  await page.getByRole("button", { name: "Leçons", exact: true }).click();
  await expect(page.locator('[data-open-lesson="lesson-1"]')).toBeVisible();
  await expect(page.locator('[data-open-lesson="lesson-2"]')).toBeVisible();
  await expect(page.locator('[data-open-lesson="lesson-3"]')).toBeVisible();
  await page.locator('[data-open-lesson="lesson-1"]').click();
  for (const label of ["Écriture", "Quiz", "Oral", "Vocabulaire"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const selector = page.locator(
      label === "Écriture"
        ? "#writing-scope"
        : label === "Oral"
          ? "#oral-scope"
          : label === "Vocabulaire"
            ? "#library-scope"
            : "#quiz-scope",
    );
    await expect(selector).toHaveValue("lesson-1");
    await expect(selector.locator('option[value="all"]')).toHaveCount(1);
    await selector.selectOption("all");
    await expect(selector).toHaveValue("all");
    await page.getByRole("button", { name: "Leçons", exact: true }).click();
    await page.locator('[data-open-lesson="lesson-1"]').click();
  }
});

test("saisie du pinyin avec tons et clavier de caractères chinois", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Quiz", exact: true }).click();
  await page.locator("#quiz-scope").selectOption("lesson-3");
  await page.locator("#quiz-mode").selectOption("typePinyin");
  await page.getByRole("button", { name: /Commencer le quiz/ }).click();
  const hanzi = await page.locator(".quiz-pinyin").textContent() || "";
  const word = vocabularyForScope("lesson-3").find((item) => item.hanzi === hanzi)!;
  await page.locator("#typed-answer").fill(word.pinyin);
  await page.getByRole("button", { name: "Vérifier" }).click();
  await expect(page.locator(".feedback")).toContainText("Exactement !");

  await page.getByRole("button", { name: /Quitter le quiz/ }).click();
  await page.locator("#quiz-scope").selectOption("lesson-3");
  await page.locator("#quiz-mode").selectOption("typeChinese");
  await page.getByRole("button", { name: /Commencer le quiz/ }).click();
  const meaning = await page.locator(".quiz-pinyin").textContent() || "";
  const target = vocabularyForScope("lesson-3").find((item) => item.meaning === meaning)!;
  for (const char of target.hanzi) await page.locator(`[data-type-key="${char}"]`).first().click();
  await page.getByRole("button", { name: "Vérifier" }).click();
  await expect(page.locator(".feedback")).toContainText("Exactement !");
});

test("la liste de caractères limite la pratique de l’écriture", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Écriture", exact: true }).click();
  await page.locator("#writing-scope").selectOption("lesson-3");
  const options = page.locator("[data-practice-character]");
  await expect(options.first()).toBeVisible();
  const initialCount = await options.count();
  const first = options.first();
  await first.uncheck();
  await expect(page.locator(".writing-character-picker > .subtle")).toContainText(`${initialCount - 1} caractère(s)`);
  await page.locator("#writing-select-all").click();
  await expect(page.locator(".writing-character-picker > .subtle")).toContainText(`${initialCount} caractère(s)`);
});
