import express from 'express';
import { checkAuth } from '../../middlewares/auth.middleware';
import { groupControllers } from './group.controller';
import { Role } from '../users/user.interface';

const router = express.Router();

// CREATE GROUP - Verified users only
router.post('/create', checkAuth(...Object.keys(Role)), groupControllers.createGroup);

// GET USER'S GROUPS
router.get('/', checkAuth(), groupControllers.getUserGroups);

// GET SINGLE GROUP
router.get('/:groupId', checkAuth(), groupControllers.getSingleGroup);

// INVITE USERS TO GROUP - Admin/Superadmin only
router.post(
  '/:groupId/invite',
  checkAuth(),
  groupControllers.inviteUsersToGroup
);

// SEND MESSAGE IN GROUP
router.post(
  '/:groupId/message',
  checkAuth(),
  groupControllers.sendGroupMessage
);

// GET GROUP MESSAGES
router.get(
  '/:groupId/messages',
  checkAuth(),
  groupControllers.getGroupMessages
);

// LEAVE GROUP
router.delete('/:groupId/leave', checkAuth(), groupControllers.leaveGroup);

// REMOVE MEMBER FROM GROUP - Admin/Superadmin only
router.delete(
  '/:groupId/member/:memberId',
  checkAuth(),
  groupControllers.removeMember
);

// DELETE GROUP - Superadmin only
router.delete('/:groupId', checkAuth(), groupControllers.deleteGroup);

export const groupRouter = router;
