import { DEFAULT_STATE } from '../src/utils/storage';

describe('storage helpers', () => {
  it('provides a default state object', () => {
    expect(DEFAULT_STATE).toHaveProperty('xp');
    expect(DEFAULT_STATE).toHaveProperty('streak');
    expect(DEFAULT_STATE).toHaveProperty('completed');
    expect(DEFAULT_STATE).toHaveProperty('unlocked');
  });
});
