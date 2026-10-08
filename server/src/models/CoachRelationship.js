import mongoose from 'mongoose';

const coachRelationshipSchema = new mongoose.Schema(
  {
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Coach is required'],
    },
    trainee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trainee is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'archived'],
      default: 'pending',
    },
    startedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

coachRelationshipSchema.index({ coach: 1, trainee: 1 }, { unique: true });
coachRelationshipSchema.index({ coach: 1, status: 1 });
coachRelationshipSchema.index({ trainee: 1, status: 1 });

coachRelationshipSchema.pre('validate', async function validateRoles() {
  if (!this.isModified('coach') && !this.isModified('trainee')) return;
  const { User } = await import('./User.js');
  const [coach, trainee] = await Promise.all([
    User.findById(this.coach).select('role'),
    User.findById(this.trainee).select('role'),
  ]);
  if (!coach || coach.role !== 'coach') this.invalidate('coach', 'Selected user must be a coach');
  if (!trainee || trainee.role !== 'trainee') this.invalidate('trainee', 'Selected user must be a trainee');
});

export const CoachRelationship = mongoose.model('CoachRelationship', coachRelationshipSchema);

