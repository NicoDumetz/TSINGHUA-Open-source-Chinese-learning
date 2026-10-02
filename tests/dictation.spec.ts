import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { mockLessonAudio } from "./audio-helper";

async function trace(page: Page, char: string, touch = false) {
  const data = JSON.parse(
    await readFile(
      new URL(`../public/strokes/${char}.json`, import.meta.url),
      "utf8",
    ),
  );
  await page.locator(".writing-board").scrollIntoViewIfNeeded();
  const points = await page
    .locator(".writing-target svg g[transform]")
    .first()
    .evaluate((group, medians: number[][][]) => {
      const matrix = (group as SVGGraphicsElement).getScreenCTM()!;
      return medians.map((stroke) =>
        stroke.map(([x, y]) => {
          const p = new DOMPoint(x, y).matrixTransform(matrix);
          return { x: p.x, y: p.y };
        }),
      );
    }, data.medians);
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  for (let i = 0; i < points.length; i++) {
    const stroke = points[i];
    if (cdp) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [stroke[0]],
      });
      for (const p of stroke.slice(1))
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [p],
        });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    } else {
      await page.mouse.move(stroke[0].x, stroke[0].y);
      await page.mouse.down();
      for (const p of stroke.slice(1))
        await page.mouse.move(p.x, p.y, { steps: 3 });
      await page.mouse.up();
    }
    if (i === points.length - 1)
      await expect(page.locator("#dictation-status")).toContainText(
        /Caractère terminé|erreur\(s\)/,
      );
    else
      await expect(page.locator("#dictation-status")).toContainText(
        `Trait ${i + 1} validé`,
      );
  }
  await cdp?.detach();
}

async function openDictation(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Oral", exact: true }).click();
  await page.locator("#oral-response").selectOption("draw");
  await page.locator("#start-oral").click();
  await expect(page.locator("#dictation-audio-status")).toContainText("À toi");
  await expect(page.locator("#dictation-reset")).toBeEnabled();
}

test("dictée : mot composé, tracé réel, indice, score et sauvegarde", async ({
  page,
}) => {
  test.setTimeout(60000);
  await mockLessonAudio(page);
  await openDictation(page);
  await expect(page.locator("#dictation-root")).not.toContainText("你好");
  await expect(page.locator("#dictation-root")).not.toContainText("nǐ hǎo");
  await expect(page.locator("#dictation-next")).toBeHidden();
  await trace(page, "你");
  await expect(page.locator("#dictation-correction")).toBeEmpty();
  await page.getByRole("button", { name: "Caractère suivant" }).click();
  await expect(page.locator("#dictation-reset")).toBeEnabled();
  await trace(page, "好");
  await expect(page.locator("#dictation-correction")).toContainText("你好");
  await expect(page.locator("#dictation-correction")).toContainText(
    "sans aide",
  );
  await page.getByRole("button", { name: "Mot suivant" }).click();
  await expect(page.locator("#dictation-reset")).toBeEnabled();
  await page
    .getByRole("button", { name: "Indice : montrer le modèle" })
    .click();
  await expect(page.locator("#dictation-status")).toContainText(
    "Modèle affiché",
  );
  await trace(page, "好");
  await expect(page.locator("#dictation-status")).toContainText(
    "indice utilisé",
  );
  await page.getByRole("button", { name: "Mot suivant" }).click();
  for (let i = 2; i < 5; i++) {
    await page
      .getByRole("button", { name: "Voir la réponse et passer ce mot" })
      .click();
    await page.locator("#dictation-next").click();
  }
  await expect(page.locator(".score")).toHaveText("1 / 5");
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("hanzi-progress-v2")!).scores.at(-1),
    ),
  ).toEqual({ mode: "dictation", correct: 1, total: 5 });
  await page.reload();
  await expect(page.locator(".stat").last()).toContainText("20 %");
});

test("dictée mobile tactile et sortie pendant un tracé", async ({ page }) => {
  await mockLessonAudio(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await openDictation(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await trace(page, "你", true);
  await page.screenshot({
    path: "test-results/dictation-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Quitter la dictée" }).click();
  await expect(page.locator("#oral-response")).toBeVisible();
  await expect(page.locator(".writing-target")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("hanzi-progress-v2")),
  ).toBeNull();
});

test("audio et tracés indisponibles : reprise sans dévoiler de modèle", async ({
  page,
}) => {
  await mockLessonAudio(page);
  await page.goto("/");
  await page.evaluate(() => {
    (window as any).audioTest.fail = true;
  });
  await page.getByRole("button", { name: "Oral", exact: true }).click();
  await page.locator("#oral-response").selectOption("draw");
  await page.route("**/strokes/*.json", (route) => route.abort());
  await page.locator("#start-oral").click();
  await expect(page.locator("#dictation-audio-status")).toContainText(
    "Impossible de lire",
  );
  await expect(page.locator("#dictation-status")).toContainText(
    "Impossible de charger",
  );
  await expect(page.locator(".writing-target")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await page.unroute("**/strokes/*.json");
  await page.getByRole("button", { name: "Réessayer le chargement" }).click();
  await expect(page.locator("#dictation-status")).toContainText(
    "premier trait",
  );
  await expect(page.locator(".writing-target")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await page.evaluate(() => {
    (window as any).audioTest.fail = false;
  });
  await page.getByRole("button", { name: "Réécouter", exact: true }).click();
  await expect(page.locator(".writing-target")).toHaveCSS(
    "pointer-events",
    "auto",
  );
  await expect(page.locator("#dictation-root")).not.toContainText("你好");
});
