import { Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import env from '../config/env';
import { CustomJwtPayload } from '../utils/user.tokens';

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const rawToken =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization as string | undefined);

    if (!rawToken) {
      return next(new Error('Authentication token required'));
    }

    const token = rawToken.startsWith('Bearer ')
      ? rawToken.slice(7)
      : rawToken;

    const decoded = verifyToken(
      token,
      env.JWT_ACCESS_SECRET
    ) as CustomJwtPayload;

    if (!decoded || !decoded.userId) {
      return next(new Error('Invalid authentication token'));
    }

    socket.data.user = decoded;
    next();
  } catch {
    return next(new Error('Unauthorized'));
  }
};

