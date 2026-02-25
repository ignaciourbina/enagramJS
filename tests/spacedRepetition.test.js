import { getRetention, needsReview, SR_INTERVALS } from '../src/utils/spacedRepetition';

describe('spaced repetition logic', () => {
  it('calculates retention as 1 for just-reviewed', () => {
    const now = new Date().toISOString();
    expect(getRetention(now, 0)).toBeCloseTo(1, 1);
  });

  it('needs review after interval', () => {
    const past = new Date(Date.now() - (SR_INTERVALS[0] + 1) * 3600000).toISOString();
    expect(needsReview(past, 0)).toBe(true);
  });

  it('does not need review before interval', () => {
    const recent = new Date(Date.now() - (SR_INTERVALS[0] / 2) * 3600000).toISOString();
    expect(needsReview(recent, 0)).toBe(false);
  });
});
