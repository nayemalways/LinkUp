import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";
import { blockedUserController } from "./blocked.controller";


const router = Router();

router.post("/", checkAuth(...Object.values(Role)), blockedUserController.blockedUser );
router.get('/', checkAuth(...Object.keys(Role)), blockedUserController.getBlockedUsers);
router.get('/unblock/:blockedUserId', checkAuth(...Object.keys(Role)), blockedUserController.unblockUser);

export const blockedUserRoutes = router;