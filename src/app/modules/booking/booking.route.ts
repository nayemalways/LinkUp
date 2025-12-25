import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";
import { bookingControllers } from "./booking.controller";

const router = Router();

router.post('/', checkAuth(...Object.values(Role)), bookingControllers.bookEvent);


export const bookingRouter = router;