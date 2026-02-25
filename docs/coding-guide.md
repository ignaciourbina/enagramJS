# enagramJS Coding Guide: LAMP Principles

This guide documents the core coding principles and architectural patterns used in enagramJS, inspired by the LAMP philosophy:

## LAMP Principles
- **L**ayout Management
- **A**bstraction (Component Factories, Classes)
- **M**odern Patterns
- **P**rincipled Engineering (Separation, Documentation, Testing)

---

## 1. Layout Management System
- All UI is structured using a consistent layout system.
- Components are composed for clarity and reusability.
- Responsive design and accessibility are considered in all layouts.

## 2. Abstraction: Components, Factories, Classes
- UI is built from modular, reusable React components.
- Component factories are used for repeated UI patterns.
- Classes or pure functions are used for logic abstraction where appropriate.
- Avoid monolithic files; break logic into focused modules.

## 3. Modern Patterns
- Uses React functional components and hooks.
- State management is handled with React's `useState`, `useEffect`, and custom hooks.
- Utility logic is separated into pure functions in `utils/`.
- Follows DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid) principles.

## 4. Principled Engineering
- **Separation of Concerns**: UI, logic, and data are strongly separated.
- **Documentation**: All modules, components, and utilities are documented in the `docs/` folder.
- **Testing**: Extensive tests are written for all logic and components, located in the `tests/` folder.
- **Extensibility**: The system is designed to be easily extended with new modules, components, and features.

---

## Summary
- Use modular, composable components and factories
- Manage layout and state in a clear, predictable way
- Apply modern React and JavaScript patterns
- Never repeat code or logic unnecessarily
- Maintain strong separation of concerns
- Document and test everything

See other docs in this folder for more on architecture, contributing, and testing.
