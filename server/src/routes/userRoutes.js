import { Router } from 'express';
import {
  deactivateMe,
  getCoachTrainees,
  getTraineeCoach,
  getUser,
  listTrainees,
  updateMe,
} from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userRouter = Router();
userRouter.use(protect);
userRouter.get('/trainees', requireRole('coach'), asyncHandler(listTrainees));
userRouter.get('/coach-trainees', requireRole('coach'), asyncHandler(getCoachTrainees));
userRouter.get('/trainee-coach', requireRole('trainee'), asyncHandler(getTraineeCoach));
userRouter.patch('/me', asyncHandler(updateMe));
userRouter.delete('/me', asyncHandler(deactivateMe));
userRouter.get('/:id', asyncHandler(getUser));

