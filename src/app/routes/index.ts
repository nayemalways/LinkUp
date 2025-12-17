import { Router } from 'express';
import { userRoutes } from '../modules/users/user.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { categoryRoutes } from '../modules/event_categories/category.routes';
import { eventRouter } from '../modules/events/event.routes';
import { friendRouter } from '../modules/friends/friend.route';

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
  }
];

moduleRoutes.forEach((r) => {
  router.use(r.path, r.route);
});

// http:localhost:5002/user/register
// http:localhost:5002/api/v1/user/update