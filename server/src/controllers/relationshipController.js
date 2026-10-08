import { CoachRelationship } from '../models/CoachRelationship.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const populateRelationship = (query) => query
  .populate('coach', 'name email avatarColor bio')
  .populate('trainee', 'name email avatarColor bio');

export async function listRelationships(request, response) {
  const filter = request.user.role === 'coach' ? { coach: request.user._id } : { trainee: request.user._id };
  if (request.query.status) filter.status = request.query.status;
  const relationships = await populateRelationship(CoachRelationship.find(filter)).sort({ updatedAt: -1 });
  response.json({ relationships });
}

export async function getRelationship(request, response) {
  const relationship = await populateRelationship(CoachRelationship.findById(request.params.id));
  if (!relationship) throw new AppError('Relationship not found', 404);
  const allowed = relationship.coach._id.equals(request.user._id) || relationship.trainee._id.equals(request.user._id);
  if (!allowed) throw new AppError('You do not have access to this relationship', 403);
  response.json({ relationship });
}

export async function inviteTrainee(request, response) {
  const trainee = await User.findOne({ email: String(request.body.traineeEmail || '').toLowerCase(), role: 'trainee' });
  if (!trainee) throw new AppError('No trainee account uses that email address', 404);
  if (trainee._id.equals(request.user._id)) throw new AppError('You cannot invite yourself', 400);
  const existing = await CoachRelationship.findOne({ coach: request.user._id, trainee: trainee._id });
  if (existing) throw new AppError('A relationship with this trainee already exists', 400);
  const relationship = await CoachRelationship.create({ coach: request.user._id, trainee: trainee._id });
  await relationship.populate([
    { path: 'coach', select: 'name email avatarColor bio' },
    { path: 'trainee', select: 'name email avatarColor bio' },
  ]);
  response.status(201).json({ message: 'Invitation sent', relationship });
}

export async function acceptRelationship(request, response) {
  const relationship = await CoachRelationship.findById(request.params.id);
  if (!relationship) throw new AppError('Relationship not found', 404);
  if (!relationship.trainee.equals(request.user._id)) throw new AppError('Only the invited trainee can accept', 403);
  if (relationship.status !== 'pending') throw new AppError('This invitation is no longer pending', 400);

  await CoachRelationship.updateMany(
    { trainee: request.user._id, status: 'active', _id: { $ne: relationship._id } },
    { status: 'archived', archivedAt: new Date() },
  );
  relationship.status = 'active';
  relationship.startedAt = new Date();
  await relationship.save();
  response.json({ message: 'Coach connected', relationship });
}

export async function archiveRelationship(request, response) {
  const relationship = await CoachRelationship.findById(request.params.id);
  if (!relationship) throw new AppError('Relationship not found', 404);
  if (!relationship.coach.equals(request.user._id) && !relationship.trainee.equals(request.user._id)) {
    throw new AppError('You do not have permission to archive this relationship', 403);
  }
  relationship.status = 'archived';
  relationship.archivedAt = new Date();
  await relationship.save();
  response.json({ message: 'Relationship archived', relationship });
}

export async function deleteRelationship(request, response) {
  const relationship = await CoachRelationship.findById(request.params.id);
  if (!relationship) throw new AppError('Relationship not found', 404);
  if (!relationship.coach.equals(request.user._id)) throw new AppError('Only the coach can delete this relationship', 403);
  await relationship.deleteOne();
  response.json({ message: 'Relationship deleted' });
}
