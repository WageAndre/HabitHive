import { Router } from 'express';
import {
  getCategoryStats,
  getLeaderboard,
  getMonthlyCalendar,
  getOverview,
  getSourceComparison,
  getStreaks,
  getWeekly,
} from '../controllers/analyticsController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analyticsRouter = Router();
analyticsRouter.use(protect);
analyticsRouter.get('/overview', asyncHandler(getOverview));
analyticsRouter.get('/weekly', asyncHandler(getWeekly));
analyticsRouter.get('/streaks', asyncHandler(getStreaks));
analyticsRouter.get('/categories', asyncHandler(getCategoryStats));
analyticsRouter.get('/source-comparison', asyncHandler(getSourceComparison));
analyticsRouter.get('/calendar', asyncHandler(getMonthlyCalendar));
analyticsRouter.get('/leaderboard', requireRole('coach'), asyncHandler(getLeaderboard));

