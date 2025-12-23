import express from 'express';
import { checkAuth } from '../../middlewares/auth.middleware';
import { createReviewController } from './review.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { reviewValidations } from './review.validate';

const router = express.Router();

router.post(
  '/:eventId',
  checkAuth(),
  validateRequest(reviewValidations.createReviewValidationSchema),
  createReviewController
);

export const reviewRouter = router;
