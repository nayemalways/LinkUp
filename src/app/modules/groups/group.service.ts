import { JwtPayload } from 'jsonwebtoken';
import Group from './group.model';
import { GroupMemberRole } from './group.interface';
import AppError from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes';
import User from '../users/user.model';
import { Types } from 'mongoose';
import { sendPersonalNotification } from '../../utils/notificationsendhelper/user.notification.utils';
import { sendPushAndSave } from '../../utils/notificationsendhelper/push.notification.utils';
import { NotificationType } from '../notifications/notification.interface';
import { onlineUsers, io } from '../../socket';
import Message from '../message/message.model';
import { MessageStatus } from '../message/message.interface';

// CREATE GROUP - Only verified users
const createGroupService = async (user: JwtPayload, payload: any) => {
  const userId = user.userId;

  // Check if user is verified
  const currentUser = await User.findById(userId);
  if (!currentUser?.isVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only verified users can create groups!'
    );
  }

  // Create group with creator as superadmin
  const group = await Group.create({
    group_name: payload.group_name,
    group_description: payload.group_description,
    group_image: payload.group_image,
    event: payload.event,
    group_admin: userId,
    group_members: [
      {
        user: userId,
        role: GroupMemberRole.SUPERADMIN,
        joinedAt: new Date(),
      },
    ],
  });

  return group;
};

// GET USER'S GROUPS
const getUserGroupsService = async (user: JwtPayload) => {
  const userId = user.userId;

  const groups = await Group.find({
    'group_members.user': userId,
  })
    .populate('group_admin', 'fullName email avatar')
    .populate('group_members.user', 'fullName email avatar')
    .populate('event', 'title')
    .sort({ createdAt: -1 });

  return groups;
};

// GET SINGLE GROUP
const getSingleGroupService = async (user: JwtPayload, groupId: string) => {
  const userId = user.userId;

  const group = await Group.findById(groupId)
    .populate('group_admin', 'fullName email avatar')
    .populate('group_members.user', 'fullName email avatar')
    .populate('event', 'title');

  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, 'Group not found!');
  }

  // Check if user is a member
  const isMember = group.group_members.some(
    (member) => member.user._id.toString() === userId
  );

  if (!isMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a member of this group!'
    );
  }

  return group;
};

// INVITE USERS TO GROUP
const inviteUsersToGroupService = async (
  user: JwtPayload,
  groupId: string,
  userIds: string[]
) => {
  const userId = user.userId;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, 'Group not found!');
  }

  // Check if current user is admin or superadmin
  const currentUserMember = group.group_members.find(
    (member) => member.user.toString() === userId
  );

  if (
    !currentUserMember ||
    (currentUserMember.role !== GroupMemberRole.SUPERADMIN &&
      currentUserMember.role !== GroupMemberRole.ADMIN)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only admins can invite users to the group!'
    );
  }

  // Get inviter details
  const inviter = await User.findById(userId);

  // Filter out users who are already members
  const existingMemberIds = group.group_members.map((m) => m.user.toString());
  const newUserIds = userIds.filter((id) => !existingMemberIds.includes(id));

  if (newUserIds.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'All users are already members!'
    );
  }

  // Verify all new users exist
  const newUsers = await User.find({ _id: { $in: newUserIds } });
  if (newUsers.length !== newUserIds.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'Some users not found!');
  }

  // Add new members
  const newMembers = newUserIds.map((userId) => ({
    user: new Types.ObjectId(userId),
    role: GroupMemberRole.MEMBER,
    joinedAt: new Date(),
  }));

  group.group_members.push(...newMembers);
  await group.save();

  // Send notifications to invited users
  for (const newUserId of newUserIds) {
    const notificationPayload = {
      user: new Types.ObjectId(newUserId),
      type: NotificationType.SYSTEM,
      title: 'Group Invitation',
      description: `${inviter?.fullName} added you to ${group.group_name}`,
      data: {
        groupId: group._id.toString(),
        groupName: group.group_name,
        inviterId: userId,
        inviterName: inviter?.fullName,
      },
    };

    if (onlineUsers[newUserId]) {
      await sendPersonalNotification(notificationPayload);
    } else {
      await sendPushAndSave(notificationPayload);
    }
  }

  return { message: 'Users invited successfully!', group };
};

// SEND MESSAGE IN GROUP
const sendGroupMessageService = async (
  user: JwtPayload,
  groupId: string,
  payload: { text?: string; image?: string; replyTo?: string }
) => {
  const userId = user.userId;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, 'Group not found!');
  }

  // Check if user is a member
  const isMember = group.group_members.some(
    (member) => member.user.toString() === userId
  );

  if (!isMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a member of this group!'
    );
  }

  // Create message
  const message = await Message.create({
    sender: userId,
    group: groupId,
    message: {
      text: payload.text || '',
      image: payload.image || '',
    },
    status: MessageStatus.SENT,
    replyTo: payload.replyTo,
  });

  // Populate sender details
  await message.populate('sender', 'fullName avatar');

  // Emit message to group room
  io.to(groupId).emit('group_message', message);

  return message;
};

// GET GROUP MESSAGES
const getGroupMessagesService = async (user: JwtPayload, groupId: string) => {
  const userId = user.userId;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, 'Group not found!');
  }

  // Check if user is a member
  const isMember = group.group_members.some(
    (member) => member.user.toString() === userId
  );

  if (!isMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a member of this group!'
    );
  }

  const messages = await Message.find({ group: groupId })
    .populate('sender', 'fullName avatar')
    .populate('replyTo')
    .sort({ createdAt: 1 });

  return messages;
};

// LEAVE GROUP
const leaveGroupService = async (user: JwtPayload, groupId: string) => {
  const userId = user.userId;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, 'Group not found!');
  }

  // Check if user is a member of the group
  const isMember = group.group_members.some(
    (member) => member.user.toString() === userId
  );

  if (!isMember) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not a member of this group!'
    );
  }

  // Check if user is superadmin
  if (group.group_admin.toString() === userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Superadmin cannot leave the group! Transfer ownership first or delete the group.'
    );
  }

  // Remove user from members array using filter and save (same as removeMemberService)
  group.group_members = group.group_members.filter(
    (member) => member.user.toString() !== userId
  );

  await group.save();

  return { message: 'Left group successfully!' };
};

// REMOVE MEMBER FROM GROUP (Admin/Superadmin only)
const removeMemberService = async (
  user: JwtPayload,
  groupId: string,
  memberId: string
) => {
  const userId = user.userId;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, 'Group not found!');
  }

  // Check if current user is admin or superadmin
  const currentUserMember = group.group_members.find(
    (member) => member.user.toString() === userId
  );

  if (
    !currentUserMember ||
    (currentUserMember.role !== GroupMemberRole.SUPERADMIN &&
      currentUserMember.role !== GroupMemberRole.ADMIN)
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only admins can remove members!');
  }

  // Cannot remove superadmin
  if (group.group_admin.toString() === memberId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot remove the superadmin!');
  }

  // Remove member
  group.group_members = group.group_members.filter(
    (member) => member.user.toString() !== memberId
  );

  await group.save();

  return { message: 'Member removed successfully!' };
};

// DELETE GROUP (Superadmin only)
const deleteGroupService = async (user: JwtPayload, groupId: string) => {
  const userId = user.userId;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, 'Group not found!');
  }

  // Check if user is superadmin
  if (group.group_admin.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only superadmin can delete the group!'
    );
  }

  await Group.findByIdAndDelete(groupId);
  await Message.deleteMany({ group: groupId });

  return { message: 'Group deleted successfully!' };
};

export const groupServices = {
  createGroupService,
  getUserGroupsService,
  getSingleGroupService,
  inviteUsersToGroupService,
  sendGroupMessageService,
  getGroupMessagesService,
  leaveGroupService,
  removeMemberService,
  deleteGroupService,
};
