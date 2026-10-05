import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { vocabularyForScope } from "../src/lessons";

const words = [
  "你好",
  "好",
  "你",
  "是",
  "老师",
  "吗",
  "不",
  "我",
  "学生",
  "他",
  "她",
  "谢谢",
  "不客气",
  "您",
  "留学生",
  "叫",
  "什么",
  "名字",
];
const legacyKey = "hanzi-lesson-1-v1";
const key = "hanzi-progress-v2";
const vocabulary = vocabularyForScope("lesson-1");

async function openLesson1(page: Page) {
  await page.getByRole("button", { name: "Leçons", exact: true }).click();
  await page.locator('[data-open-lesson="lesson-1"]').click();
}

async function drawCharacter(page: Page, char: string, touch = false) {
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
      await expect(page.locator("#writing-status")).toContainText("Bravo");
    else
      await expect(page.locator("#writing-status")).toContainText(
        `Trait ${i + 1} validé`,
      );
  }
  await cdp?.detach();
}

test("uniquement les 18 mots, nouvelle progression et fiches complètes", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "hanzi-progress",
      JSON.stringify({ learned: ["人", "你"], scores: [100] }),
    ),
  );
  await page.goto("/");
  await openLesson1(page);
  await expect(page.locator(".stat").first()).toContainText("0 / 18");
  await expect(page.locator(".dictionary-card")).toHaveCount(18);
  expect(
    await page.locator(".dictionary-card strong").allTextContents(),
  ).toEqual(words);
  await page.getByRole("button", { name: "Commencer à apprendre" }).click();
  await expect(page.locator(".word-display")).toHaveText("你好");
  await expect(page.locator(".study-pinyin")).toContainText("nǐ hǎo");
  await page.getByRole("button", { name: "Cacher la réponse" }).click();
  await expect(page.locator(".study-pinyin")).toHaveCount(0);
  await expect(page.locator(".example-box")).toHaveCount(0);
  await page.getByRole("button", { name: "Révéler la réponse" }).click();
  await expect(page.locator(".example-box")).toContainText("Bonjour !");
  await page.getByRole("button", { name: "J’ai mémorisé ce mot" }).click();
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await page.reload();
  await openLesson1(page);
  await expect(page.locator(".stat").first()).toContainText("1 / 18");
  await page.getByRole("button", { name: "Vocabulaire", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Rechercher dans le vocabulaire" })
    .fill("liuxuesheng");
  await expect(page.locator(".dictionary-card")).toHaveCount(1);
  await page.locator(".dictionary-card").click();
  await expect(page.locator(".word-display")).toHaveText("留学生");
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Rechercher dans le vocabulaire" })
    .fill("");
  await page.getByRole("button", { name: "Ouvrir la fiche de 名字" }).click();
  await expect(page.locator(".modal-top")).toContainText("MOT 18 / 18");
  await expect(page.locator(".word-display")).toHaveText("名字");
});

for (const mode of ["recognize", "toChinese", "toFrench"]) {
  test(`quiz ${mode} : dix questions, correction, score et révision ciblée`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Quiz", exact: true }).click();
    await page.locator("#quiz-mode").selectOption(mode);
    await page.getByRole("button", { name: "Commencer le quiz" }).click();
    for (let i = 0; i < 10; i++) {
      await expect(page.locator(".quiz-top")).toContainText(
        `Question ${i + 1} sur 10`,
      );
      const prompt = await page.locator(".quiz-pinyin").innerText();
      const meaning = await page.locator(".quiz-meaning").innerText();
      const word = vocabulary.find(
        (v) =>
          (mode === "toFrench"
            ? v.hanzi
            : mode === "toChinese"
              ? v.meaning
              : v.pinyin) === prompt &&
          (mode !== "recognize" || v.meaning === meaning),
      )!;
      expect(word).toBeTruthy();
      if (mode !== "recognize")
        await expect(page.locator(".quiz-active")).not.toContainText(
          word.pinyin,
        );
      const options = await page
        .locator("[data-answer]")
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("data-answer")),
        );
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options.every((o) => words.includes(o!))).toBeTruthy();
      const answer =
        i === 0 ? options.find((o) => o !== word.hanzi)! : word.hanzi;
      await page.locator(`[data-answer="${answer}"]`).click();
      await expect(page.locator(".answer.correct")).toHaveAttribute(
        "data-answer",
        word.hanzi,
      );
      await expect(page.locator(".feedback")).toContainText(word.meaning);
      await page
        .getByRole("button", {
          name: i === 9 ? "Voir mon résultat" : "Question suivante",
        })
        .click();
    }
    await expect(page.locator(".score")).toHaveText("9 / 10");
    await expect(page.locator(".review-list button")).toHaveCount(1);
    expect(
      await page.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)!).scores.at(-1),
        key,
      ),
    ).toEqual({ mode, correct: 9, total: 10 });
    await page.getByRole("button", { name: "Revoir mes 1 erreur(s)" }).click();
    await expect(page.locator(".quiz-top")).toContainText("Question 1 sur 1");
    await expect(page.locator(".answer")).toHaveCount(4);
  });
}

test("quiz sur quatre acquis seulement et décompte adapté", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, words }) =>
      localStorage.setItem(key, JSON.stringify({ learned: words.slice(0, 4) })),
    { key: legacyKey, words },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Quiz", exact: true }).click();
  await page.locator("#quiz-pool").selectOption("learned");
  await page.getByRole("button", { name: "Commencer le quiz" }).click();
  await expect(page.locator(".quiz-top")).toContainText("Question 1 sur 4");
  expect(
    (
      await page
        .locator("[data-answer]")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-answer")))
    ).sort(),
  ).toEqual(words.slice(0, 4).sort());
});

test("écriture guidée, erreur réelle, réussite de mémoire et sauvegarde", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Écriture", exact: true }).click();
  await page.locator("#writing-word").selectOption("6"); // 不, 4 traits
  await expect(page.locator("#writing-status")).toContainText("4 traits");
  await page.getByRole("button", { name: "2. Tracer" }).click();
  await expect(page.locator("#writing-status")).toContainText("premier trait");
  const box = (await page.locator(".writing-board").boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 22, box.y + 23);
  await page.mouse.up();
  await expect(page.locator("#writing-status")).toContainText(
    "Ce trait ne correspond pas",
  );
  await drawCharacter(page, "不");
  await expect(page.locator(".writing-record")).toContainText(
    "1 tracé(s) guidé(s) réussi(s)",
  );
  await page.getByRole("button", { name: "3. De mémoire" }).click();
  await expect(page.locator("#writing-status")).toContainText("premier trait");
  await expect(page.locator(".writing-word-summary")).not.toContainText("不");
  await drawCharacter(page, "不");
  await expect(page.locator(".writing-record")).toContainText(
    "1 tracé(s) sans modèle réussi(s)",
  );
  await page.reload();
  await openLesson1(page);
  await expect(page.locator(".stat").nth(1)).toContainText("1 / 22");
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).writing["lesson-1:不"],
      key,
    ),
  ).toEqual({ guided: 1, memory: 1 });
});

test("animation, navigation dans les mots et chargement local avec reprise après erreur", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999;
  });
  await page.goto("/");
  await openLesson1(page);
  await page.getByRole("button", { name: "Ouvrir la fiche de 不客气" }).click();
  await page.getByRole("button", { name: "M’entraîner à l’écrire" }).click();
  await expect(page.locator("#writing-word")).toHaveValue("12");
  await expect(page.locator("[data-writing-character]")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Choisir un caractère aléatoire" })
    .click();
  await expect(page.locator("#writing-word")).toHaveValue("17");
  await expect(page.locator('[data-writing-character="1"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#writing-status")).toContainText("6 traits");
  await page.locator("#writing-word").selectOption("12");
  await expect(page.locator("#writing-status")).toContainText("4 traits");
  await page.getByRole("button", { name: "Voir l’ordre des traits" }).click();
  await expect(page.locator("#writing-status")).toContainText(
    "Observe le mouvement",
  );
  await expect(page.locator("#writing-status")).toContainText("À toi !", {
    timeout: 15000,
  });
  await page.getByRole("button", { name: "Caractère suivant" }).click();
  await expect(page.locator('[data-writing-character="1"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#writing-status")).toContainText("9 traits");
  await page.route("**/strokes/*.json", (route) => route.abort());
  await page.locator("#writing-word").selectOption("17");
  await expect(page.locator("#writing-status")).toContainText(
    "Impossible de charger",
  );
  await page.unroute("**/strokes/*.json");
  await page.getByRole("button", { name: "Réessayer", exact: true }).click();
  await expect(page.locator("#writing-status")).toContainText("6 traits");
});

test("mobile : aucun débordement, mot long et écriture tactile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await openLesson1(page);
  const noOverflow = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  await noOverflow();
  await page.screenshot({
    path: "test-results/lesson-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Ouvrir la fiche de 留学生" }).click();
  await expect(page.locator(".word-display")).toHaveText("留学生");
  await noOverflow();
  await page.getByRole("button", { name: "M’entraîner à l’écrire" }).click();
  await page.locator("#writing-word").selectOption("6");
  await page.getByRole("button", { name: "2. Tracer" }).click();
  await expect(page.locator("#writing-status")).toContainText("premier trait");
  await noOverflow();
  await drawCharacter(page, "不", true);
  await page.screenshot({
    path: "test-results/writing-mobile.png",
    fullPage: true,
  });
});
