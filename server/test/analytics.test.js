import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateLongestStreak, calculateStreak, isHabitScheduledFor } from '../src/services/analyticsService.js';

test('calculateStreak counts consecutive completed days ending today', () => {
  const dates = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'];
  assert.equal(calculateStreak(dates, '2026-10-08'), 4);
});

test('calculateStreak allows the current day to be incomplete', () => {
  const dates = ['2026-10-05', '2026-10-06', '2026-10-07'];
  assert.equal(calculateStreak(dates, '2026-10-08'), 3);
});

test('calculateLongestStreak finds the longest sequence', () => {
  const dates = ['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06', '2026-10-07'];
  assert.equal(calculateLongestStreak(dates), 3);
});

test('isHabitScheduledFor handles weekday and custom schedules', () => {
  assert.equal(isHabitScheduledFor({ frequency: 'weekdays', targetDays: [] }, '2026-10-08'), true);
  assert.equal(isHabitScheduledFor({ frequency: 'weekdays', targetDays: [] }, '2026-10-11'), false);
  assert.equal(isHabitScheduledFor({ frequency: 'custom', targetDays: [2, 4] }, '2026-10-08'), true);
});

