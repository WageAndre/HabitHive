import { Router } from 'express';
import {
  createGoal,
  deleteGoal,
  getGoal,
  listGoals,
  updateGoal,
  updateGoalStatus,
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const goalRouter = Router();
goalRouter.use(protect);
goalRouter.get('/', asyncHandler(listGoals));
goalRouter.get('/:id', asyncHandler(getGoal));
goalRouter.post('/', asyncHandler(createGoal));
goalRouter.put('/:id', asyncHandler(updateGoal));
goalRouter.patch('/:id/status', asyncHandler(updateGoalStatus));
goalRouter.delete('/:id', asyncHandler(deleteGoal));

