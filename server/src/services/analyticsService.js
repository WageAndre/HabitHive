import { CheckIn } from '../models/CheckIn.js';
import { Goal } from '../models/Goal.js';
import { Habit } from '../models/Habit.js';
import { addUtcDays, enumerateDays, startOfUtcDay, startOfUtcWeek, toDateKey } from '../utils/date.js';

export function calculateStreak(dateValues, today = new Date()) {
  const completed = new Set(dateValues.map(toDateKey));
  let cursor = startOfUtcDay(today);
  if (!completed.has(toDateKey(cursor))) cursor = addUtcDays(cursor, -1);
  let streak = 0;
  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addUtcDays(cursor, -1);
  }
  return streak;
}

export function calculateLongestStreak(dateValues) {
  const keys = [...new Set(dateValues.map(toDateKey))].sort();
  let longest = 0;
  let current = 0;
  let previous = null;
  for (const key of keys) {
    const date = startOfUtcDay(key);
    current = previous && addUtcDays(previous, 1).getTime() === date.getTime() ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = date;
  }
  return longest;
}

export function isHabitScheduledFor(habit, date) {
  const day = new Date(date).getUTCDay();
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'weekdays') return day >= 1 && day <= 5;
  return habit.targetDays.includes(day);
}

export async function buildOverview(userId, referenceDate = new Date()) {
  const today = startOfUtcDay(referenceDate);
  const weekStart = startOfUtcWeek(today);
  const weekEnd = addUtcDays(weekStart, 6);
  const habits = await Habit.find({ owner: userId, isActive: true }).lean();
  const checkIns = await CheckIn.find({
    user: userId,
    status: 'completed',
    date: { $gte: addUtcDays(today, -365), $lte: addUtcDays(today, 1) },
  }).lean();

  const todayScheduled = habits.filter((habit) => isHabitScheduledFor(habit, today));
  const todayCompletedIds = new Set(
    checkIns.filter((item) => toDateKey(item.date) === toDateKey(today)).map((item) => item.habit.toString()),
  );
  const todayCompleted = todayScheduled.filter((habit) => todayCompletedIds.has(habit._id.toString())).length;

  const scheduledThisWeek = enumerateDays(weekStart, weekEnd).reduce(
    (total, day) => total + habits.filter((habit) => isHabitScheduledFor(habit, day)).length,
    0,
  );
  const completedThisWeek = checkIns.filter((item) => item.date >= weekStart && item.date <= weekEnd).length;
  const allDates = checkIns.map((item) => item.date);

  return {
    activeHabits: habits.length,
    today: {
      scheduled: todayScheduled.length,
      completed: todayCompleted,
      rate: todayScheduled.length ? Math.round((todayCompleted / todayScheduled.length) * 100) : 0,
    },
    week: {
      scheduled: scheduledThisWeek,
      completed: completedThisWeek,
      rate: scheduledThisWeek ? Math.min(100, Math.round((completedThisWeek / scheduledThisWeek) * 100)) : 0,
    },
    currentStreak: calculateStreak(allDates, today),
    longestStreak: calculateLongestStreak(allDates),
  };
}

export async function buildWeeklySeries(userId, referenceDate = new Date()) {
  const start = startOfUtcWeek(referenceDate);
  const end = addUtcDays(start, 6);
  const [habits, checkIns] = await Promise.all([
    Habit.find({ owner: userId, isActive: true }).lean(),
    CheckIn.find({ user: userId, status: 'completed', date: { $gte: start, $lte: addUtcDays(end, 1) } }).lean(),
  ]);

  return enumerateDays(start, end).map((date) => {
    const scheduled = habits.filter((habit) => isHabitScheduledFor(habit, date)).length;
    const completed = checkIns.filter((item) => toDateKey(item.date) === toDateKey(date)).length;
    return {
      date: toDateKey(date),
      scheduled,
      completed,
      rate: scheduled ? Math.min(100, Math.round((completed / scheduled) * 100)) : 0,
    };
  });
}

export async function buildHabitStreaks(userId) {
  const habits = await Habit.find({ owner: userId, isActive: true }).lean();
  const checkIns = await CheckIn.find({ user: userId, status: 'completed' }).lean();
  return habits.map((habit) => {
    const dates = checkIns.filter((item) => item.habit.equals(habit._id)).map((item) => item.date);
    return {
      habitId: habit._id,
      title: habit.title,
      color: habit.color,
      current: calculateStreak(dates),
      longest: calculateLongestStreak(dates),
      totalCompleted: dates.length,
    };
  }).sort((a, b) => b.current - a.current);
}

export async function calculateGoalProgress(goal) {
  const completed = await CheckIn.find({
    user: goal.trainee,
    status: 'completed',
    date: { $gte: goal.startDate, $lte: goal.endDate },
  }).lean();

  let current = completed.length;
  if (goal.metric === 'streak') current = calculateLongestStreak(completed.map((item) => item.date));
  if (goal.metric === 'completion_rate') {
    const habits = await Habit.find({ owner: goal.trainee, isActive: true }).lean();
    const scheduled = enumerateDays(goal.startDate, Math.min(Date.now(), goal.endDate.getTime())).reduce(
      (total, day) => total + habits.filter((habit) => isHabitScheduledFor(habit, day)).length,
      0,
    );
    current = scheduled ? Math.min(100, Math.round((completed.length / scheduled) * 100)) : 0;
  }

  return { current, target: goal.target, percentage: Math.min(100, Math.round((current / goal.target) * 100)) };
}

export async function expirePastGoals(userId) {
  await Goal.updateMany(
    { trainee: userId, status: 'active', endDate: { $lt: startOfUtcDay() } },
    { status: 'expired' },
  );
}

