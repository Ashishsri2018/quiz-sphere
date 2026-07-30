# QuizSphere UI/UX Styleguide

## Colors & Theming
QuizSphere uses a multi-theme `data-theme` system with 7 curated palettes:
- **Midnight (default)**: Purple accent (`#7c4dff`), deep space background
- **Ocean Deep**: Cyan accent (`#00b4d8`), deep blue background
- **Aurora**: Blue/orange accent (`#58a6ff`), GitHub-inspired
- **Ember**: Orange accent (`#ff6b35`), warm background
- **Forest**: Green accent (`#00e676`), natural background
- **Neon**: Magenta accent (`#e040fb`), cyberpunk background
- **Light**: Indigo accent (`#6c5ce7`), clean and accessible

**Universal Semantic Colors**:
- Correct: `#00e676`
- Wrong: `#ff5252`
- Easy: `#4caf50`
- Medium: `#ff9800`
- Hard: `#f44336`

## Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 700 weight, tight letter spacing (-0.5px)
- **Body**: 500 weight, 1.6 line height

## Components
- **Buttons (Answers)**:
  - Border radius: 12px
  - Padding: 1rem
  - Hover state: Gradient border glow, background tint, Y-axis translate (-2px), deep shadow
  - Feedback state: Correct gives a green glow and pulse, wrong gives a red glow and shake
- **Dropdowns (Settings)**:
  - Uses native `<select>` elements for full keyboard/screen-reader accessibility.
  - Border radius: var(--radius-pill) (20px)
  - Background: Glassmorphism (translucent + backdrop-filter blur)
  - Hover state: Border color transitions to `--accent-highlight` and box-shadow inset glow
- **Badges & Pills**:
  - Question number badge: solid highlight background, pill-shaped
  - Difficulty/Category pills: translucent tinted backgrounds matching semantic colors
- **Stat Chips (Footer)**:
  - Glassmorphic pill-shaped cards holding score, streak, and accuracy
  - Streak gets a glowing hot style at ≥3

## Animations & Motion
- **Staggered Entrance**: Answer buttons enter one by one using a `fade-in-up` stagger.
- **Score Pop**: When the score updates, the value scales up 1.3x and changes color briefly.
- **Streak Celebration**: Every 5 streak points, the streak chip bursts with a golden glow.
- **Skeleton Loading**: Theme-aware gradient shimmer for empty states.

## Accessibility (a11y)
- Minimum contrast ratio for text is 4.5:1.
- All interactive elements must have visible focus rings (`:focus-visible`).
- Dynamic content updates (like new questions) should manage focus (e.g. moving focus to the question text) and use `aria-live` where appropriate.
