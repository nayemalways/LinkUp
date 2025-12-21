import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { eventCreateSchema, eventUpdateSchema } from "./event.validate";
import { eventControllers } from "./event.controller";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";


const router = Router();

// CREATE EVENT
router.post(
  '/',
  checkAuth(...Object.values(Role)),
  multerUpload.array('files'),                  
  validateRequest(eventCreateSchema),     
  eventControllers.createEvent       
);

// GET EVENTS
router.get('/', checkAuth(...Object.keys(Role)),  eventControllers.getEvents);
// GET INTEREST BASED EVENT
router.get('/interested_event', checkAuth(...Object.keys(Role)),  eventControllers.getInterestEvents);
// GET SPECIFIC EVENT
router.get('/details/:eventId', checkAuth(...Object.keys(Role)),  eventControllers.getEventDetails);
// UPDATE EVENT
router.patch('/:eventId', checkAuth(...Object.keys(Role)), multerUpload.array('files'), validateRequest(eventUpdateSchema),  eventControllers.updateEvent);
// GET MY EVENT
router.get('/my_events', checkAuth(...Object.keys(Role)), eventControllers.getMyEvents);
router.get('/event_analytics/:eventId', checkAuth(...Object.keys(Role)), eventControllers.geteventAnalytics);


export const eventRouter = router;