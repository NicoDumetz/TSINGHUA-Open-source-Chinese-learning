import { expect, test } from "@playwright/test";
import {
  allVocabulary,
  lessons,
  vocabularyForScope,
} from "../src/lessons";

test("catalogue de leçons et sélecteurs d'exercices", async ({ page }) => {
  expect(lessons.map((lesson) => lesson.id)).toEqual(["lesson-1"]);
  expect(vocabularyForScope("lesson-1")).toEqual(allVocabulary);
  expect(vocabularyForScope("all")).toEqual(allVocabulary);

  await page.goto("/");
  for (const label of ["Écriture", "Le quiz", "Oral", "Vocabulaire"]) {
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
    await page.getByRole("button", { name: "Leçon 1", exact: true }).click();
  }
});
