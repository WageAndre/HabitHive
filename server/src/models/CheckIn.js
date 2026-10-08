import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, 'Habit is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    date: { type: Date, required: [true, 'Check-in date is required'] },
    status: {
      type: String,
      enum: ['completed', 'partial', 'skipped'],
      default: 'completed',
    },
    value: { type: Number, min: [0, 'Value cannot be negative'], max: 100000, default: 1 },
    note: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true },
);

checkInSchema.index({ habit: 1, user: 1, date: 1 }, { unique: true });
checkInSchema.index({ user: 1, date: -1 });

export const CheckIn = mongoose.model('CheckIn', checkInSchema);

