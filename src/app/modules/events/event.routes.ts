import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { eventCreateSchema } from "./event.validate";
import { eventControllers } from "./event.controller";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";


const router = Router();

router.post(
  '/',
  checkAuth(...Object.values(Role)),
  multerUpload.array('files'),                  
  validateRequest(eventCreateSchema),     
  eventControllers.createEvent       
);

router.get('/', checkAuth(...Object.keys(Role)),  eventControllers.getEvents);
router.get('/details/:eventId', checkAuth(...Object.keys(Role)),  eventControllers.getSingleEvent);


export const eventRouter = router;