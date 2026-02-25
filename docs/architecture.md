# enagramJS Architecture

## High-Level Structure
- **React + Vite**: Modern frontend stack for fast development and hot reloading.
- **Component-based UI**: All UI elements are modular React components.
- **Utility Modules**: Curriculum, spaced repetition, code execution, and storage logic are separated for clarity and testability.
- **State Management**: Uses React's `useState` and `useEffect` for local state, with persistent storage via a storage abstraction.

## Main Folders
- `src/components/`: UI components (NavBar, StatCard, XPPopup, etc.)
- `src/utils/`: Pure logic modules (curriculum, spaced repetition, code executor, storage)
- `src/EngramApp.jsx`: Main app logic, views, and state
- `tests/`: Test files (unit, integration, UI)
- `docs/`: Documentation

## Data Flow
- **Curriculum**: Defined as a Directed Acyclic Graph (DAG) in `utils/curriculum.js`, with modules, prerequisites, and challenges.
- **State**: User progress, XP, streaks, and mastery are tracked in a persistent state object.
- **Spaced Repetition**: Review intervals and retention calculations are handled in `utils/spacedRepetition.js`.
- **Code Execution**: User code is evaluated in a sandboxed function for safety.

## Extending the App
- Add new modules/challenges in `utils/curriculum.js`
- Add new UI components in `components/`
- Add new utility logic in `utils/`
- Add tests in `tests/`

---

See `overview.md` for a project summary and `curriculum.md` for details on the learning content.
