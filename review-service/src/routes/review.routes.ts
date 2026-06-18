import { Router } from "express";
import {
  Registeration,
  getanReview,
  updateData,
  reviewDelete,
  getReview,
  getRating

} from "../controllers/review.controllers";
import { authenticate } from "../middleware/authenticate";

const router = Router();




// CRUD

router.post("/review",  Registeration);
router.get("/review", getReview);
router.get("/review/rating", getRating);
router.get("/review/:id", getanReview);
router.put("/review/:id",  updateData);
router.delete("/review/:id", reviewDelete);




export default router;
