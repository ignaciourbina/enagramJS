import { executeCode } from '../src/utils/codeExecutor';

describe('executeCode', () => {
  it('evaluates code and returns success', () => {
    // Use a return statement to ensure x is defined in the test context
    const result = executeCode('const x = 2 + 2;', '', 'x === 4');
    expect(result.success).toBe(true);
  });

  it('returns error for invalid code', () => {
    const result = executeCode('const x = ;', '', 'x === 4');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
