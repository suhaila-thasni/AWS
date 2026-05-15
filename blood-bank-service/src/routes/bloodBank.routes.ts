import { Router } from "express";
import {
  createOrUpdateStock,
  getAllStock,
  getStockById,
  getStocksByHospitalId,
  updateStockById,
  deleteStockById,
} from "../controllers/bloodBank.controller";
import { authenticate } from "../middleware/authenticate";
import { checkPermission } from "../middleware/role.middleware";

const router = Router();

// CRUD — all routes require authentication
router.post("/blood-banks",  createOrUpdateStock);
router.get("/blood-banks",    getAllStock);
router.get("/blood-banks/hospital/:hospitalId",  getStocksByHospitalId);
router.get("/blood-banks/:id", getStockById);
router.put("/blood-banks/:id", updateStockById);
router.delete("/blood-banks/:id",  deleteStockById);

export default router;
