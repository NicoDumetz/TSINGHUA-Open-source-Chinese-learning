import { expect, test } from "@playwright/test";
import {
  allVocabulary,
  lessons,
  vocabularyForScope,
} from "../src/lessons";

test("catalogue de leçons et sélecteurs d'exercices", async ({ page }) => {
  expect(lessons.map((lesson) => lesson.id)).toEqual(["lesson-1", "lesson-2"]);
  expect(vocabularyForScope("all")).toEqual(allVocabulary);

  await page.goto("/");
  await page.getByRole("button", { name: "Leçons", exact: true }).click();
  await expect(page.locator('[data-open-lesson="lesson-1"]')).toBeVisible();
  await expect(page.locator('[data-open-lesson="lesson-2"]')).toBeVisible();
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
