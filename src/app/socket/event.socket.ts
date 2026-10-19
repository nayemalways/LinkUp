import { Socket } from 'socket.io';
import Group from '../modules/groups/group.model';

export const SocketEvents = (socket: Socket) => {
  const userId = socket.data.user?.userId;

  // User joins group room with authorization check
  socket.on('join-group', async (groupId: unknown) => {
    try {
      if (!userId || typeof groupId !== 'string') return;

      const rawIds = groupId
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (rawIds.length === 0) return;

      // Authorize membership in MongoDB
      const authorizedGroups = await Group.find({
        _id: { $in: rawIds },
        $or: [
          { 'group_members.user': userId },
          { group_admin: userId },
        ],
      }).select('_id');

      authorizedGroups.forEach((group) => {
        socket.join(group._id.toString());
      });
    } catch {
      // Catch errors silently to prevent socket crash
    }
  });

  // User leaves group room
  socket.on('leave-group', (groupId: unknown) => {
    if (typeof groupId === 'string') {
      socket.leave(groupId.trim());
    }
  });
};
