# QuizSphere UI/UX Styleguide

## Colors & Theming
- **Primary Background**: `#0f0f1a` (Dark mode) / `#f0f0f5` (Light mode)
- **Card Background**: Translucent white with 12px blur (Glassmorphism)
- **Primary Text**: `#f0f0f5` (Dark) / `#111111` (Light)
- **Secondary Text**: `#aab` (Dark) / `#555555` (Light)
- **Accents**: 
  - Correct: `#00e676`
  - Wrong: `#ff5252`
  - Easy: `#4caf50`
  - Medium: `#ff9800`
  - Hard: `#d32f2f`

## Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 700 weight, tight letter spacing (-0.5px)
- **Body**: 500 weight, 1.6 line height

## Components
- **Buttons**:
  - Border radius: 12px
  - Padding: 1rem
  - Hover state: Slight background lighten + Y-axis translate (-2px)
  - Focus state: 2px solid outline with `--accent-highlight`
- **Pills (Difficulty)**:
  - Border radius: 20px
  - Padding: 0.6rem 1.2rem
  - Must use semantic `<button>` tags with `aria-pressed` for accessibility.

## Accessibility (a11y)
- Minimum contrast ratio for text is 4.5:1.
- All interactive elements must have visible focus rings (`:focus-visible`).
- Dynamic content updates (like new questions) should manage focus (e.g. moving focus to the question text) and use `aria-live` where appropriate.
