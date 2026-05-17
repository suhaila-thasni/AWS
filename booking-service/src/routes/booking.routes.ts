import { Router } from "express";
import {
  Registeration,
  getanBooking,
  updateData,
  bookingDelete,
  getBookings,
 
} from "../controllers/booking.controllers";
import { authenticate } from "../middleware/authenticate";
import { checkPermission } from "../middleware/role.middleware";



const router = Router();


// CRUD - Accessible by authenticated Users and Staff
router.post("/booking", Registeration);
router.get("/booking", getBookings);
router.get("/booking/:id", authenticate, checkPermission("booking", "view" ), getanBooking);
router.put("/booking/:id",  updateData);
router.delete("/booking/:id", bookingDelete);

export default router;
