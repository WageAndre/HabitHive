import { Router } from 'express';
import {
  assignHabit,
  createHabit,
  deleteHabit,
  getHabit,
  listHabits,
  setHabitStatus,
  updateHabit,
} from '../controllers/habitController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const habitRouter = Router();
habitRouter.use(protect);
habitRouter.get('/', asyncHandler(listHabits));
habitRouter.get('/:id', asyncHandler(getHabit));
habitRouter.post('/', requireRole('trainee'), asyncHandler(createHabit));
habitRouter.post('/assign', requireRole('coach'), asyncHandler(assignHabit));
habitRouter.put('/:id', asyncHandler(updateHabit));
habitRouter.patch('/:id/status', asyncHandler(setHabitStatus));
habitRouter.delete('/:id', asyncHandler(deleteHabit));

