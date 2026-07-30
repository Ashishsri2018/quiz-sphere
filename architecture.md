# QuizSphere Architecture

Vanilla HTML/CSS/JS infinite trivia website, fully static and deployable anywhere (e.g. GitHub Pages, Cloudflare Pages).

## Components
- **Providers:** OpenTDB, The Trivia API, and local Fallback. Rotation via `ProviderManager`.
- **Engine:** `QuestionBuffer` prefetches questions. `QuizEngine` manages state (idle, loading, show_question, answered).
- **UI:** CSS custom properties for styling, `renderer.js` for DOM manipulation.
