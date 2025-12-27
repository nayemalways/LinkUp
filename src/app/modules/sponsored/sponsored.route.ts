import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";
import { SponsoredController } from "./sponsored.controller";

const router = Router();

// ONLY FOR ADMIN
router.post('/create_package', checkAuth(Role.ADMIN), SponsoredController.createSponsoredPackage);
router.get('/available_package', checkAuth(...Object.keys(Role)), SponsoredController.getAvailablePackage);
router.patch('/update_package', checkAuth(Role.ADMIN), SponsoredController.updatePackage)


export const sponsoredRouter = router;