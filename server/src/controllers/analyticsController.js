import { CheckIn } from '../models/CheckIn.js';
import { CoachRelationship } from '../models/CoachRelationship.js';
import { Habit } from '../models/Habit.js';
import { assertCanViewTrainee } from '../services/accessService.js';
import {
  buildHabitStreaks,
  buildOverview,
  buildWeeklySeries,
  isHabitScheduledFor,
} from '../services/analyticsService.js';
import { AppError } from '../utils/AppError.js';
import { addUtcDays, enumerateDays, startOfUtcDay } from '../utils/date.js';

async function resolveTraineeId(request) {
  if (request.user.role === 'trainee') return request.user._id;
  const traineeId = request.query.traineeId;
  if (!traineeId) throw new AppError('traineeId is required for coaches', 400);
  await assertCanViewTrainee(request.user, traineeId);
  return traineeId;
}

export async function getOverview(request, response) {
  const traineeId = await resolveTraineeId(request);
  response.json({ overview: await buildOverview(traineeId, request.query.date) });
}

export async function getWeekly(request, response) {
  const traineeId = await resolveTraineeId(request);
  response.json({ days: await buildWeeklySeries(traineeId, request.query.date) });
}

export async function getStreaks(request, response) {
  const traineeId = await resolveTraineeId(request);
  response.json({ streaks: await buildHabitStreaks(traineeId) });
}

export async function getCategoryStats(request, response) {
  const traineeId = await resolveTraineeId(request);
  const since = addUtcDays(new Date(), -30);
  const [habits, checkIns] = await Promise.all([
    Habit.find({ owner: traineeId, isActive: true }).lean(),
    CheckIn.find({ user: traineeId, status: 'completed', date: { $gte: since } }).lean(),
  ]);
  const stats = habits.reduce((items, habit) => {
    let entry = items.find((item) => item.category === habit.category);
    if (!entry) items.push((entry = { category: habit.category, habits: 0, completed: 0 }));
    entry.habits += 1;
    entry.completed += checkIns.filter((item) => item.habit.equals(habit._id)).length;
    return items;
  }, []).sort((a, b) => b.completed - a.completed);
  response.json({ categories: stats });
}

export async function getSourceComparison(request, response) {
  const traineeId = await resolveTraineeId(request);
  const end = startOfUtcDay();
  const start = addUtcDays(end, -29);
  const [habits, checkIns] = await Promise.all([
    Habit.find({ owner: traineeId, isActive: true }).lean(),
    CheckIn.find({ user: traineeId, status: 'completed', date: { $gte: start, $lte: addUtcDays(end, 1) } }).lean(),
  ]);

  const groups = [
    { source: 'personal', habits: habits.filter((habit) => !habit.assignedBy) },
    { source: 'coach', habits: habits.filter((habit) => habit.assignedBy) },
  ];
  const comparison = groups.map((group) => {
    const ids = new Set(group.habits.map((habit) => habit._id.toString()));
    const scheduled = enumerateDays(start, end).reduce(
      (total, date) => total + group.habits.filter((habit) => isHabitScheduledFor(habit, date)).length,
      0,
    );
    const completed = checkIns.filter((item) => ids.has(item.habit.toString())).length;
    return {
      source: group.source,
      habitCount: group.habits.length,
      scheduled,
      completed,
      rate: scheduled ? Math.min(100, Math.round((completed / scheduled) * 100)) : 0,
    };
  });
  response.json({ comparison });
}

export async function getLeaderboard(request, response) {
  const relationships = await CoachRelationship.find({ coach: request.user._id, status: 'active' })
    .populate('trainee', 'name email avatarColor');
  const leaderboard = await Promise.all(relationships.map(async (relationship) => ({
    trainee: relationship.trainee,
    ...(await buildOverview(relationship.trainee._id)),
  })));
  leaderboard.sort((a, b) => b.week.rate - a.week.rate || b.currentStreak - a.currentStreak);
  response.json({ leaderboard: leaderboard.map((item, index) => ({ rank: index + 1, ...item })) });
}

export async function getMonthlyCalendar(request, response) {
  const traineeId = await resolveTraineeId(request);
  const year = Number(request.query.year);
  const month = Number(request.query.month);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new AppError('A valid year and month (1-12) are required', 400);
  }
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const checkIns = await CheckIn.find({ user: traineeId, date: { $gte: start, $lt: end } })
    .populate('habit', 'title color category')
    .sort({ date: 1 });
  response.json({ year, month, checkIns });
}

