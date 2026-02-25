# Testing in enagramJS

## Test Organization
- All test files are located in the `tests/` directory.
- Test files should be named after the module or component they test, e.g. `EngramApp.test.jsx`, `codeExecutor.test.js`.

## Tools
- **Jest**: Main test runner
- **@testing-library/react**: For React component tests
- **@testing-library/jest-dom**: For DOM assertions

## Running Tests
- `npm test` — run all tests
- `npm run test:coverage` — run tests with coverage report
- `make test` — run tests via Makefile

## Writing Tests
- Place new test files in `tests/`
- Use descriptive test names and group related tests with `describe`
- For utility functions, test edge cases and error handling
- For components, test rendering, props, and user interactions

## Example
```js
import { executeCode } from '../src/utils/codeExecutor';

describe('executeCode', () => {
  it('evaluates code and returns success', () => {
    const result = executeCode('const x = 2 + 2;', '', 'x === 4');
    expect(result.success).toBe(true);
  });
});
```

---

See `contributing.md` for more on adding and running tests.
