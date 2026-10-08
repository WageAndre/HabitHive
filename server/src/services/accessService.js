import { CoachRelationship } from '../models/CoachRelationship.js';
import { AppError } from '../utils/AppError.js';

export async function assertCanViewTrainee(user, traineeId) {
  if (user.role === 'trainee' && user._id.equals(traineeId)) return;
  if (user.role === 'coach') {
    const relationship = await CoachRelationship.findOne({
      coach: user._id,
      trainee: traineeId,
      status: 'active',
    });
    if (relationship) return relationship;
  }
  throw new AppError('You do not have access to this trainee', 403);
}

