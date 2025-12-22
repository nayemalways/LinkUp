/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SocketEvents = (socket: any) => {

  // User joins group room
  socket.on('join-group', (groupId: string) => {
    groupId.split(',').forEach((id: string) => {
      socket.join(id.trim());
      console.log(`User joined group room: ${id}`);
    });
  });

  // User leaves group room
  socket.on('leave-group', (groupId: string) => {
    socket.leave(groupId.trim());
    console.log(`User left group room: ${groupId}`);
  });
};
