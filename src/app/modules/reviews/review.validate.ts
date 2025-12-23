import { z } from 'zod';

export const createReviewValidationSchema = z.object({
  body: z.object({
    vote: z.enum(['UP', 'DOWN'], {
      message: 'Vote must be either UP or DOWN',
    }),
    comment: z
      .string()
      .trim()
      .max(500, 'Comment must not exceed 500 characters')
      .optional(),
  }),
  params: z.object({
    eventId: z.string({
      message: 'Event ID is required',
    }),
  }),
});

export const reviewValidations = {
  createReviewValidationSchema,
};
