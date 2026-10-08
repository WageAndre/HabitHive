import { Router } from 'express';
import { getMe, login, logout, register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.get('/me', protect, asyncHandler(getMe));
authRouter.post('/logout', protect, asyncHandler(logout));

