/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";
import { SocketEvents } from "./event.socket";

export let io: Server;
export const onlineUsers: Record<string, string> = {}; // userId -> socketId



// Socket - Init
export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Register All event here
    SocketEvents(socket);

    let userId: string | null = null;

    // Event: join-user
    socket.on('join-user', (_userId: string) => {
      userId = _userId;
      socket.join(userId);
      onlineUsers[userId] = socket.id;

      console.log('User joined room:', userId);
      io.emit('get_online_users', Object.keys(onlineUsers));
    });


    // Handle Disconnect
    socket.on('disconnect', () => {
      if (userId) delete onlineUsers[userId];

      io.emit('get_online_users', Object.keys(onlineUsers));
      console.log('User disconnected:', socket.id);
    });
  });
};
