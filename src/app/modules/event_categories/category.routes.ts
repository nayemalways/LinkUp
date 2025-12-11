import { Router } from "express";
import { categoryControllers } from "./category.controller";

const router = Router();

router.post('/', categoryControllers.createEventCategory);


export const categoryRoutes = router;