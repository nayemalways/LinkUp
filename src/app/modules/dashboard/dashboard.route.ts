import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";
import { dashboardControllers } from "./dashboard.controller";


const router = Router();

router.get('/dasboard_states', checkAuth(Role.ADMIN), dashboardControllers.dashboardStats);

export const dashboardRouter = router;