import { CoachRelationship } from '../models/CoachRelationship.js';
import { CheckIn } from '../models/CheckIn.js';
import { Habit } from '../models/Habit.js';
import { assertCanViewTrainee } from '../services/accessService.js';
import { AppError } from '../utils/AppError.js';

const editableFields = [
  'title', 'description', 'category', 'frequency', 'targetDays', 'targetValue',
  'unit', 'color', 'startDate', 'endDate', 'isActive',
];

function pickHabitFields(body) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => editableFields.includes(key)));
}

async function findAccessibleHabit(id, user) {
  const habit = await Habit.findById(id).populate('owner', 'name email avatarColor').populate('assignedBy', 'name email');
  if (!habit) throw new AppError('Habit not found', 404);
  const ownerId = habit.owner._id || habit.owner;
  if (user._id.equals(ownerId)) return habit;
  if (user.role === 'coach') {
    await assertCanViewTrainee(user, ownerId);
    return habit;
  }
  throw new AppError('You do not have access to this habit', 403);
}

function assertCanModifyHabit(habit, user) {
  const ownerId = habit.owner._id || habit.owner;
  const assignedById = habit.assignedBy?._id || habit.assignedBy;
  const permitted = assignedById ? user._id.equals(assignedById) : user._id.equals(ownerId);
  if (!permitted) throw new AppError('Only the habit creator can modify this habit', 403);
}

export async function listHabits(request, response) {
  let ownerId = request.user._id;
  if (request.user.role === 'coach') {
    if (!request.query.traineeId) throw new AppError('traineeId is required for coaches', 400);
    ownerId = request.query.traineeId;
    await assertCanViewTrainee(request.user, ownerId);
  }

  const filter = { owner: ownerId };
  if (request.query.active !== undefined) filter.isActive = request.query.active === 'true';
  if (request.query.category) filter.category = request.query.category;
  if (request.query.source === 'coach') filter.assignedBy = { $ne: null };
  if (request.query.source === 'personal') filter.assignedBy = null;
  if (request.query.search) {
    const escaped = String(request.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ title: new RegExp(escaped, 'i') }, { description: new RegExp(escaped, 'i') }];
  }

  const habits = await Habit.find(filter)
    .populate('owner', 'name email avatarColor')
    .populate('assignedBy', 'name email')
    .sort({ isActive: -1, createdAt: -1 });
  response.json({ habits });
}

export async function getHabit(request, response) {
  const habit = await findAccessibleHabit(request.params.id, request.user);
  response.json({ habit });
}

export async function createHabit(request, response) {
  const habit = await Habit.create({ ...pickHabitFields(request.body), owner: request.user._id });
  await habit.populate('owner', 'name email avatarColor');
  response.status(201).json({ message: 'Habit created', habit });
}

export async function assignHabit(request, response) {
  const { traineeId } = request.body;
  if (!traineeId) throw new AppError('traineeId is required', 400);
  const relationship = await CoachRelationship.findOne({
    coach: request.user._id,
    trainee: traineeId,
    status: 'active',
  });
  if (!relationship) throw new AppError('An active coach relationship is required', 403);

  const habit = await Habit.create({
    ...pickHabitFields(request.body),
    owner: traineeId,
    assignedBy: request.user._id,
    relationship: relationship._id,
  });
  await habit.populate([
    { path: 'owner', select: 'name email avatarColor' },
    { path: 'assignedBy', select: 'name email' },
  ]);
  response.status(201).json({ message: 'Habit assigned', habit });
}

export async function updateHabit(request, response) {
  const habit = await findAccessibleHabit(request.params.id, request.user);
  assertCanModifyHabit(habit, request.user);
  Object.assign(habit, pickHabitFields(request.body));
  await habit.save();
  response.json({ message: 'Habit updated', habit });
}

export async function setHabitStatus(request, response) {
  const habit = await findAccessibleHabit(request.params.id, request.user);
  assertCanModifyHabit(habit, request.user);
  if (typeof request.body.isActive !== 'boolean') throw new AppError('isActive must be a boolean', 400);
  habit.isActive = request.body.isActive;
  await habit.save();
  response.json({ message: habit.isActive ? 'Habit activated' : 'Habit archived', habit });
}

export async function deleteHabit(request, response) {
  const habit = await findAccessibleHabit(request.params.id, request.user);
  assertCanModifyHabit(habit, request.user);
  await CheckIn.deleteMany({ habit: habit._id });
  await habit.deleteOne();
  response.json({ message: 'Habit deleted' });
}
