import cors from 'cors';
import express from 'express';
import { analyticsRouter } from './routes/analyticsRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { checkInRouter } from './routes/checkInRoutes.js';
import { goalRouter } from './routes/goalRoutes.js';
import { habitRouter } from './routes/habitRoutes.js';
import { relationshipRouter } from './routes/relationshipRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestLogger } from './middleware/requestLogger.js';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'HabitHive API' });
});
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/relationships', relationshipRouter);
app.use('/api/habits', habitRouter);
app.use('/api/check-ins', checkInRouter);
app.use('/api/goals', goalRouter);
app.use('/api/analytics', analyticsRouter);

app.use(notFound);
app.use(errorHandler);

