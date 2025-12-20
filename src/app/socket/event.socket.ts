/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SocketEvents = (socket: any) => {
  // User joins event room
  socket.on('join-event', (eventId: string) => {
    socket.join(`event:${eventId.trim()}`);
  });

  // User joins group room
  socket.on('join-group', (groupId: string) => {
    socket.join(groupId.trim());
    console.log(`User joined group room: ${groupId}`);
  });

  // User leaves group room
  socket.on('leave-group', (groupId: string) => {
    socket.leave(groupId.trim());
    console.log(`User left group room: ${groupId}`);
  });
};
