import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import AppError from '../../errorHelpers/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import BlockedUser from './blocked.model';
import FriendRequest from '../friends/friend.model';
import { RequestStatus } from '../friends/friend.interface';

const createBlockedUserService = async (
  userId: string,
  blockedUserId: string
) => {
  const isBlocked = await BlockedUser.findOne({
    user: userId,
    blockedUser: blockedUserId,
  });
  if (isBlocked) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User is already blocked');
  }

  const blockedUser = await BlockedUser.create({
    user: userId,
    blockedUser: blockedUserId,
  });

  // Synchronize with FriendRequest collection
  const friendRequest = await FriendRequest.findOne({
    $or: [
      { sender: userId, receiver: blockedUserId },
      { sender: blockedUserId, receiver: userId },
    ],
  });

  if (friendRequest) {
    friendRequest.status = RequestStatus.BLOCKED;
    if (friendRequest.sender.toString() !== userId) {
      friendRequest.sender = new Types.ObjectId(userId);
      friendRequest.receiver = new Types.ObjectId(blockedUserId);
    }
    await friendRequest.save();
  } else {
    await FriendRequest.create({
      sender: userId,
      receiver: blockedUserId,
      status: RequestStatus.BLOCKED,
    });
  }

  return blockedUser;
};

// GET USER BLOCK LIST
const getBlockedUsersService = async (
  userId: string,
  query: Record<string, string>
) => {
  const queryBuilder = new QueryBuilder(
    BlockedUser.find({ user: userId }),
    query
  );
  const blockList = await queryBuilder
    .filter()
    .join()
    .sort()
    .paginate()
    .build();

  const meta = await queryBuilder.getMeta();

  return { meta, blockList };
};

// UNBLOCK USER
const unblockUserService = async (userId: string, blockedUserId: string) => {
  const isUserBlocked = await BlockedUser.findOne({
    user: userId,
    blockedUser: blockedUserId,
  });
  if (!isUserBlocked) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'User not found. Maybe user is not in block list!'
    );
  }

  const unblock = await BlockedUser.findByIdAndDelete(isUserBlocked._id);

  // Synchronize with FriendRequest: remove BLOCKED request initiated by this user
  await FriendRequest.findOneAndDelete({
    sender: userId,
    receiver: blockedUserId,
    status: RequestStatus.BLOCKED,
  });

  return unblock;
};

export const blockedUserService = {
  createBlockedUserService,
  getBlockedUsersService,
  unblockUserService,
};
