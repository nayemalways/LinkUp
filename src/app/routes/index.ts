import { Router } from 'express';
import { userRoutes } from '../modules/users/user.routes';
import { authRouter } from '../modules/auth/auth.routes';

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
];

moduleRoutes.forEach((r) => {
  router.use(r.path, r.route);
});

// http:localhost:5002/user/register
// http:localhost:5002/api/v1/user/update