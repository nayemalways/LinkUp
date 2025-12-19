import { z } from 'zod';

// Validation schema for sending a message
export const sendMessageSchema = z
  .object({
    text: z.string().optional(),
    image: z.string().url().optional(),
    replyTo: z.string().optional(),
  })
  .refine((data) => data.text || data.image, {
    message: 'Message must contain either text or image',
  });

export const messageValidation = {
  sendMessageSchema,
};
