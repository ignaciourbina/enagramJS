// Spaced repetition intervals and helpers
export const SR_INTERVALS = [1, 8, 24, 72, 168, 336, 720]; // 1h, 8h, 1d, 3d, 7d, 14d, 30d

export function getRetention(lastReviewed, intervalIndex) {
  if (!lastReviewed) return 0;
  const elapsed = (Date.now() - new Date(lastReviewed).getTime()) / 3600000;
  const interval = SR_INTERVALS[Math.min(intervalIndex || 0, SR_INTERVALS.length - 1)];
  return Math.max(0, Math.min(1, 1 - (elapsed / (interval * 2.5))));
}

export function needsReview(lastReviewed, intervalIndex) {
  if (!lastReviewed) return false;
  const elapsed = (Date.now() - new Date(lastReviewed).getTime()) / 3600000;
  return elapsed > SR_INTERVALS[Math.min(intervalIndex || 0, SR_INTERVALS.length - 1)];
}
