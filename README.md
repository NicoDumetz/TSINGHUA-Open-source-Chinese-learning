# TSINGHUA Open-source Chinese Learning

An open-source web application for learning Mandarin Chinese through vocabulary, pronunciation, quizzes, listening exercises, and Chinese character writing.

The project is organized around lessons and is designed to make adding new learning content straightforward.

> This is an independent open-source project and is not an official Tsinghua University website.

## Features

### Vocabulary & Lessons

Each lesson contains Chinese vocabulary with:

- Chinese characters
- Pinyin
- Translation
- Grammar explanations
- Example sentences
- Mandarin pronunciation
- Memory tracking

The first lesson currently contains 18 words and expressions.

### Quizzes

Several quiz modes are available:

- Pinyin and translation → Chinese
- Translation → Chinese
- Chinese → translation
- Listening → Chinese

Quizzes can use vocabulary from a specific lesson, all lessons, or previously learned words.

### Listening Practice

Mandarin audio is included directly in the project.

Exercises include:

- Listening comprehension
- Normal and slow playback
- Audio-based multiple-choice questions
- Listening and writing exercises

No external text-to-speech service is required while using the website.

### Chinese Character Writing

The project uses [Hanzi Writer](https://hanziwriter.org/) to teach stroke order and character writing.

Users can:

- Watch stroke-order animations
- Practice characters with guidance
- Write characters without a visible model
- Practice with a mouse, touchscreen, or stylus
- Complete listening-and-writing exercises

Character data is stored locally in `public/strokes/`.

### Progress

Progress is stored locally in the browser.

No account or backend server is required.

---

## Run Locally

### Requirements

You need:

- Node.js
- npm
- Git

### Clone the repository

```sh
git clone https://github.com/NicoDumetz/TSINGHUA-Open-source-Chinese-learning.git
cd TSINGHUA-Open-source-Chinese-learning
```

### Install dependencies

```sh
npm install
```

### Start the development server

```sh
npm run dev
```

Then open:

```text
http://localhost:5173
```

The website automatically reloads when you modify the source code.

---

## Build

Create a production build with:

```sh
npm run build
```

The generated static website will be available in:

```text
dist/
```

You can preview the production build locally with:

```sh
npm run preview
```

---

## Tests

Run the test suite with:

```sh
npm run test
```

The project uses Playwright for browser testing.

Install Chromium for Playwright with:

```sh
npx playwright install chromium
```

To test the production build:

```sh
npm run test:production
```

Tests cover core learning features, quizzes, progress tracking, character writing, audio resources, and mobile behavior.

---

## Contributing

Contributions are welcome.

You can contribute by:

- Reporting bugs
- Suggesting features
- Improving the interface
- Fixing existing issues
- Adding vocabulary
- Improving translations or explanations
- Adding new lessons
- Improving tests or accessibility

### Contribution workflow

1. Fork the repository.

2. Clone your fork:

```sh
git clone https://github.com/YOUR_USERNAME/TSINGHUA-Open-source-Chinese-learning.git
cd TSINGHUA-Open-source-Chinese-learning
```

3. Create a branch:

```sh
git checkout -b feature/my-contribution
```

4. Install the project:

```sh
npm install
```

5. Make your changes.

6. Verify that the project builds and tests pass:

```sh
npm run build
npm run test
```

7. Commit your changes:

```sh
git add .
git commit -m "feat: describe your contribution"
```

8. Push your branch:

```sh
git push origin feature/my-contribution
```

9. Open a Pull Request against the `main` branch of this repository.

Please explain what your contribution changes and why.

---

## Adding a Lesson

Learning content is separated from the interface.

Lessons are located in:

```text
src/lessons/
```

To add a lesson:

1. Copy:

```text
src/lessons/lesson.template.ts
```

For example:

```text
src/lessons/lesson-2.ts
```

2. Give the lesson a unique `id` and `number`.

3. Add its vocabulary, translations, examples, and explanations.

4. Import the lesson into:

```text
src/lessons/index.ts
```

5. Add the lesson to the `lessons` array.

6. Generate the required Mandarin audio:

```sh
python scripts/generate-audio.py
```

7. Add any missing character stroke data to:

```text
public/strokes/
```

8. Verify everything:

```sh
npm run build
npm run test:production
```

The lesson will automatically become available to the learning interface, dictionary, quizzes, listening exercises, dictation, and writing exercises.

---

## Project Structure

```text
TSINGHUA-Open-source-Chinese-learning/
├── public/
│   ├── audio/
│   └── strokes/
├── scripts/
├── src/
│   └── lessons/
├── tests/
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
└── tsconfig.json
```

---

## Audio

Mandarin audio files are included in `public/audio/`.

They were generated using the `zh-CN-XiaoxiaoNeural` neural Mandarin voice with `edge-tts`.

The mapping between text and audio files is stored in:

```text
public/audio/sources.json
```

Audio can be regenerated with:

```sh
python scripts/generate-audio.py
```

Internet access is required when generating audio, but not when using the website.

---

## Issues

Found a bug or have an idea?

Open a GitHub Issue and describe:

- What you encountered or would like to add
- How to reproduce the problem, if applicable
- Your browser and device, if relevant
- Screenshots when useful

Before starting a large contribution, consider opening an Issue first so the implementation can be discussed.

---

## Pull Requests

Pull Requests are welcome from everyone.

Changes submitted through a Pull Request are reviewed before being merged into `main`.

Once an accepted Pull Request is merged into `main`, the production website is automatically rebuilt, tested, and deployed through GitHub Actions.

---

## License

This project is open source.

Third-party resources retain their respective licenses. Hanzi Writer is distributed under the MIT License, and the character stroke data included in `public/strokes/` contains its corresponding licensing information.