import { CheckIn } from '../models/CheckIn.js';
import { Habit } from '../models/Habit.js';
import { assertCanViewTrainee } from '../services/accessService.js';
import { isHabitScheduledFor } from '../services/analyticsService.js';
import { AppError } from '../utils/AppError.js';
import { addUtcDays, startOfUtcDay } from '../utils/date.js';

async function assertOwnHabit(userId, habitId) {
  const habit = await Habit.findOne({ _id: habitId, owner: userId });
  if (!habit) throw new AppError('Habit not found or does not belong to you', 404);
  return habit;
}

export async function listCheckIns(request, response) {
  let userId = request.user._id;
  if (request.user.role === 'coach') {
    if (!request.query.traineeId) throw new AppError('traineeId is required for coaches', 400);
    userId = request.query.traineeId;
    await assertCanViewTrainee(request.user, userId);
  }
  const filter = { user: userId };
  if (request.query.habitId) filter.habit = request.query.habitId;
  if (request.query.status) filter.status = request.query.status;
  if (request.query.from || request.query.to) {
    filter.date = {};
    if (request.query.from) filter.date.$gte = startOfUtcDay(request.query.from);
    if (request.query.to) filter.date.$lte = addUtcDays(request.query.to, 1);
  }
  const checkIns = await CheckIn.find(filter).populate('habit', 'title color category targetValue unit').sort({ date: -1 });
  response.json({ checkIns });
}

export async function getCheckIn(request, response) {
  const checkIn = await CheckIn.findById(request.params.id).populate('habit', 'title color category targetValue unit');
  if (!checkIn) throw new AppError('Check-in not found', 404);
  if (!checkIn.user.equals(request.user._id)) {
    await assertCanViewTrainee(request.user, checkIn.user);
  }
  response.json({ checkIn });
}

export async function createCheckIn(request, response) {
  const { habitId, date, status = 'completed', value = 1, note = '' } = request.body;
  if (!habitId || !date) throw new AppError('habitId and date are required', 400);
  await assertOwnHabit(request.user._id, habitId);
  const normalizedDate = startOfUtcDay(date);
  if (!normalizedDate) throw new AppError('Enter a valid check-in date', 400);
  if (normalizedDate > startOfUtcDay()) throw new AppError('Future check-ins are not allowed', 400);

  const existing = await CheckIn.findOne({ habit: habitId, user: request.user._id, date: normalizedDate });
  const checkIn = await CheckIn.findOneAndUpdate(
    { habit: habitId, user: request.user._id, date: normalizedDate },
    { status, value, note },
    { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).populate('habit', 'title color category targetValue unit');
  response.status(existing ? 200 : 201).json({ message: existing ? 'Check-in updated' : 'Habit checked in', checkIn });
}

export async function updateCheckIn(request, response) {
  const checkIn = await CheckIn.findById(request.params.id);
  if (!checkIn) throw new AppError('Check-in not found', 404);
  if (!checkIn.user.equals(request.user._id)) throw new AppError('You can only update your own check-ins', 403);
  const allowed = ['status', 'value', 'note'];
  Object.assign(checkIn, Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key))));
  await checkIn.save();
  response.json({ message: 'Check-in updated', checkIn });
}

export async function deleteCheckIn(request, response) {
  const checkIn = await CheckIn.findById(request.params.id);
  if (!checkIn) throw new AppError('Check-in not found', 404);
  if (!checkIn.user.equals(request.user._id)) throw new AppError('You can only delete your own check-ins', 403);
  await checkIn.deleteOne();
  response.json({ message: 'Check-in deleted' });
}

export async function getDailyCheckIns(request, response) {
  let userId = request.user._id;
  if (request.user.role === 'coach') {
    userId = request.query.traineeId;
    if (!userId) throw new AppError('traineeId is required for coaches', 400);
    await assertCanViewTrainee(request.user, userId);
  }
  const date = startOfUtcDay(request.params.date);
  if (!date) throw new AppError('Enter a valid date', 400);
  const [habits, checkIns] = await Promise.all([
    Habit.find({ owner: userId, isActive: true }).populate('assignedBy', 'name'),
    CheckIn.find({ user: userId, date: { $gte: date, $lt: addUtcDays(date, 1) } }),
  ]);
  const byHabit = new Map(checkIns.map((item) => [item.habit.toString(), item]));
  response.json({
    date,
    items: habits
      .filter((habit) => isHabitScheduledFor(habit, date) && habit.startDate <= date && (!habit.endDate || habit.endDate >= date))
      .map((habit) => ({ habit, checkIn: byHabit.get(habit._id.toString()) || null })),
  });
}
