import { Router } from 'express';
import { userRoutes } from '../modules/users/user.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { categoryRoutes } from '../modules/event_categories/category.routes';
import { eventRouter } from '../modules/events/event.routes';
import { friendRouter } from '../modules/friends/friend.route';
import { groupRouter } from '../modules/groups/group.route';
import { messageRouter } from '../modules/message/message.route';
import { notificationRouter } from '../modules/notifications/notification.route';
import { favouriteRoutes } from '../modules/favourite/favourite.route';

export const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/category',
    route: categoryRoutes,
  },
  {
    path: '/event',
    route: eventRouter,
  },
  {
    path: '/friend',
    route: friendRouter,
  },
  {
    path: '/group',
    route: groupRouter,
  },
  {
    path: '/message',
    route: messageRouter,
  },
  {
    path: '/notification',  
    route: notificationRouter,
  },
  {
    path: '/favourite',  
    route: favouriteRoutes,
  }
];

moduleRoutes.forEach((r) => {
  router.use(r.path, r.route);
});

// http:localhost:5002/user/register
// http:localhost:5002/api/v1/user/update