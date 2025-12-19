import express from 'express';
import { messageControllers } from './message.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { messageValidation } from './message.validate';

const router = express.Router();

// Get all conversations (list of users with last message)
router.get('/conversations', checkAuth(), messageControllers.getConversations);

// Send direct message to a user
router.post(
  '/send/:receiverId',
  checkAuth(),
  validateRequest(messageValidation.sendMessageSchema),
  messageControllers.sendDirectMessage
);

// Get all messages with a specific user
router.get('/:userId', checkAuth(), messageControllers.getDirectMessages);

// Mark messages as seen
router.patch(
  '/:userId/seen',
  checkAuth(),
  messageControllers.markMessagesAsSeen
);

export const messageRouter = router;
