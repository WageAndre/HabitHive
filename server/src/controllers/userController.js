import { CoachRelationship } from '../models/CoachRelationship.js';
import { User } from '../models/User.js';
import { assertCanViewTrainee } from '../services/accessService.js';
import { AppError } from '../utils/AppError.js';

export async function listTrainees(request, response) {
  const filter = { role: 'trainee', isActive: true };
  if (request.query.search) {
    const search = String(request.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  }
  const users = await User.find(filter).select('name email avatarColor bio').sort({ name: 1 }).limit(30);
  response.json({ users });
}

export async function getUser(request, response) {
  const user = await User.findById(request.params.id).select('name email role avatarColor bio timezone createdAt');
  if (!user) throw new AppError('User not found', 404);
  if (!request.user._id.equals(user._id)) {
    if (user.role !== 'trainee') throw new AppError('You do not have access to this profile', 403);
    await assertCanViewTrainee(request.user, user._id);
  }
  response.json({ user });
}

export async function updateMe(request, response) {
  const allowed = ['name', 'bio', 'timezone', 'avatarColor'];
  const changes = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(request.user._id, changes, { returnDocument: 'after', runValidators: true });
  response.json({ message: 'Profile updated', user });
}

export async function deactivateMe(request, response) {
  await User.findByIdAndUpdate(request.user._id, { isActive: false });
  response.json({ message: 'Account deactivated' });
}

export async function getCoachTrainees(request, response) {
  const relationships = await CoachRelationship.find({ coach: request.user._id, status: request.query.status || 'active' })
    .populate('trainee', 'name email avatarColor bio lastLoginAt')
    .sort({ updatedAt: -1 });
  response.json({ relationships });
}

export async function getTraineeCoach(request, response) {
  const relationship = await CoachRelationship.findOne({ trainee: request.user._id, status: 'active' })
    .populate('coach', 'name email avatarColor bio');
  response.json({ relationship });
}
