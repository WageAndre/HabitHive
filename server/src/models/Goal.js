import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    trainee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trainee is required'],
    },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    metric: {
      type: String,
      enum: ['completion_rate', 'streak', 'check_ins'],
      required: [true, 'Goal metric is required'],
    },
    target: { type: Number, required: true, min: 1, max: 10000 },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'custom'],
      default: 'weekly',
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: {
      type: Date,
      required: [true, 'Goal end date is required'],
      validate: {
        validator(value) {
          return !this.startDate || value >= this.startDate;
        },
        message: 'End date must be after the start date',
      },
    },
    status: {
      type: String,
      enum: ['active', 'achieved', 'expired', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true },
);

goalSchema.index({ trainee: 1, status: 1 });
goalSchema.index({ coach: 1, status: 1 });

export const Goal = mongoose.model('Goal', goalSchema);

