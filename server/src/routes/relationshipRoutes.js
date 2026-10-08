import { Router } from 'express';
import {
  acceptRelationship,
  archiveRelationship,
  deleteRelationship,
  getRelationship,
  inviteTrainee,
  listRelationships,
} from '../controllers/relationshipController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const relationshipRouter = Router();
relationshipRouter.use(protect);
relationshipRouter.get('/', asyncHandler(listRelationships));
relationshipRouter.get('/:id', asyncHandler(getRelationship));
relationshipRouter.post('/', requireRole('coach'), asyncHandler(inviteTrainee));
relationshipRouter.patch('/:id/accept', requireRole('trainee'), asyncHandler(acceptRelationship));
relationshipRouter.patch('/:id/archive', asyncHandler(archiveRelationship));
relationshipRouter.delete('/:id', requireRole('coach'), asyncHandler(deleteRelationship));

