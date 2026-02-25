# Curriculum Design

enagramJS uses a modular, unlockable curriculum structured as a Directed Acyclic Graph (DAG). Each module covers a core JavaScript concept and contains several interactive challenges.

## Module Structure
- **id**: Unique identifier
- **title**: Display name
- **icon**: Emoji or symbol
- **prereqs**: Array of prerequisite module ids
- **tier**: Numeric tier for grouping
- **desc**: Short description
- **challenges**: Array of challenge objects

## Challenge Structure
- **id**: Unique within module
- **title**: Short name
- **prompt**: User-facing challenge description
- **setup**: (Optional) Setup code provided to the user
- **test**: JS expression to test user code
- **hint**: Tip or guidance

## Example
```
{
  id: "variables",
  title: "Variables & Types",
  icon: "⚡",
  prereqs: [],
  tier: 0,
  desc: "let, const, and primitive types",
  challenges: [
    { id: "var1", title: "Declare & Assign", ... },
    ...
  ]
}
```

## Adding New Content
1. Edit `src/utils/curriculum.js`
2. Add a new module object to the `MODULES` map
3. Define challenges with prompts, tests, and hints
4. Specify prerequisites for unlock logic

---

See `architecture.md` for technical details and `overview.md` for a project summary.
