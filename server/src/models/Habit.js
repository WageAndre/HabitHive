import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Habit owner is required'],
    },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    relationship: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachRelationship', default: null },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [80, 'Title cannot exceed 80 characters'],
    },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    category: {
      type: String,
      enum: ['fitness', 'nutrition', 'mindfulness', 'learning', 'sleep', 'productivity', 'other'],
      default: 'other',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekdays', 'custom'],
      default: 'daily',
    },
    targetDays: {
      type: [Number],
      validate: {
        validator: (days) => days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: 'Target days must be between 0 and 6',
      },
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    targetValue: { type: Number, min: [1, 'Target must be at least 1'], max: 100000, default: 1 },
    unit: { type: String, trim: true, maxlength: 24, default: 'time' },
    color: {
      type: String,
      enum: ['amber', 'violet', 'emerald', 'sky', 'rose'],
      default: 'amber',
    },
    startDate: { type: Date, default: Date.now },
    endDate: {
      type: Date,
      default: null,
      validate: {
        validator(value) {
          return !value || !this.startDate || value >= this.startDate;
        },
        message: 'End date must be after the start date',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

habitSchema.index({ owner: 1, isActive: 1 });
habitSchema.index({ assignedBy: 1, owner: 1 });

export const Habit = mongoose.model('Habit', habitSchema);

