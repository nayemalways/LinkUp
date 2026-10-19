/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io';
import { SocketEvents } from './event.socket';
import { socketAuthMiddleware } from './socket.auth';
import env from '../config/env';

export let io: Server;
export const onlineUsers: Record<string, string> = {}; // userId -> socketId

// Socket - Init
export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL
        ? [env.FRONTEND_URL, 'http://localhost:5173']
        : '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach Socket.IO Authentication Middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;

    if (userId) {
      socket.join(userId);
      onlineUsers[userId] = socket.id;
      io.emit('get_online_users', Object.keys(onlineUsers));
    }

    // Register all event listeners (group chat, etc.)
    SocketEvents(socket);

    // Backward-compatibility: if client still emits join-user, enforce authenticated userId
    socket.on('join-user', () => {
      if (userId) {
        socket.join(userId);
        onlineUsers[userId] = socket.id;
        io.emit('get_online_users', Object.keys(onlineUsers));
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      if (userId) {
        delete onlineUsers[userId];
        io.emit('get_online_users', Object.keys(onlineUsers));
      }
    });
  });
};
