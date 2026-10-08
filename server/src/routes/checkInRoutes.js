import { Router } from 'express';
import {
  createCheckIn,
  deleteCheckIn,
  getCheckIn,
  getDailyCheckIns,
  listCheckIns,
  updateCheckIn,
} from '../controllers/checkInController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const checkInRouter = Router();
checkInRouter.use(protect);
checkInRouter.get('/', asyncHandler(listCheckIns));
checkInRouter.get('/daily/:date', asyncHandler(getDailyCheckIns));
checkInRouter.get('/:id', asyncHandler(getCheckIn));
checkInRouter.post('/', requireRole('trainee'), asyncHandler(createCheckIn));
checkInRouter.put('/:id', requireRole('trainee'), asyncHandler(updateCheckIn));
checkInRouter.delete('/:id', requireRole('trainee'), asyncHandler(deleteCheckIn));

