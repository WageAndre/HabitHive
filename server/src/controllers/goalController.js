import { CoachRelationship } from '../models/CoachRelationship.js';
import { Goal } from '../models/Goal.js';
import { assertCanViewTrainee } from '../services/accessService.js';
import { calculateGoalProgress, expirePastGoals } from '../services/analyticsService.js';
import { AppError } from '../utils/AppError.js';

const goalFields = ['title', 'description', 'metric', 'target', 'period', 'startDate', 'endDate', 'status'];
const pickFields = (body) => Object.fromEntries(Object.entries(body).filter(([key]) => goalFields.includes(key)));

async function findAccessibleGoal(id, user) {
  const goal = await Goal.findById(id).populate('trainee', 'name email avatarColor').populate('coach', 'name email');
  if (!goal) throw new AppError('Goal not found', 404);
  const traineeId = goal.trainee._id || goal.trainee;
  if (!user._id.equals(traineeId)) await assertCanViewTrainee(user, traineeId);
  return goal;
}

export async function listGoals(request, response) {
  let traineeId = request.user._id;
  if (request.user.role === 'coach') {
    traineeId = request.query.traineeId;
    if (!traineeId) throw new AppError('traineeId is required for coaches', 400);
    await assertCanViewTrainee(request.user, traineeId);
  }
  await expirePastGoals(traineeId);
  const filter = { trainee: traineeId };
  if (request.query.status) filter.status = request.query.status;
  const goals = await Goal.find(filter).populate('coach', 'name email').sort({ endDate: 1 });
  const items = await Promise.all(goals.map(async (goal) => ({ goal, progress: await calculateGoalProgress(goal) })));
  response.json({ goals: items });
}

export async function getGoal(request, response) {
  const goal = await findAccessibleGoal(request.params.id, request.user);
  response.json({ goal, progress: await calculateGoalProgress(goal) });
}

export async function createGoal(request, response) {
  let traineeId = request.user._id;
  let coach = null;
  if (request.user.role === 'coach') {
    traineeId = request.body.traineeId;
    if (!traineeId) throw new AppError('traineeId is required', 400);
    const relationship = await CoachRelationship.findOne({ coach: request.user._id, trainee: traineeId, status: 'active' });
    if (!relationship) throw new AppError('An active coach relationship is required', 403);
    coach = request.user._id;
  }
  const goal = await Goal.create({ ...pickFields(request.body), trainee: traineeId, coach });
  response.status(201).json({ message: 'Goal created', goal });
}

export async function updateGoal(request, response) {
  const goal = await findAccessibleGoal(request.params.id, request.user);
  const creatorId = goal.coach?._id || goal.coach || goal.trainee._id || goal.trainee;
  if (!request.user._id.equals(creatorId)) throw new AppError('Only the goal creator can update it', 403);
  Object.assign(goal, pickFields(request.body));
  await goal.save();
  response.json({ message: 'Goal updated', goal });
}

export async function deleteGoal(request, response) {
  const goal = await findAccessibleGoal(request.params.id, request.user);
  const creatorId = goal.coach?._id || goal.coach || goal.trainee._id || goal.trainee;
  if (!request.user._id.equals(creatorId)) throw new AppError('Only the goal creator can delete it', 403);
  await goal.deleteOne();
  response.json({ message: 'Goal deleted' });
}

export async function updateGoalStatus(request, response) {
  const goal = await findAccessibleGoal(request.params.id, request.user);
  if (!['active', 'achieved', 'cancelled'].includes(request.body.status)) {
    throw new AppError('Status must be active, achieved, or cancelled', 400);
  }
  goal.status = request.body.status;
  await goal.save();
  response.json({ message: 'Goal status updated', goal });
}
