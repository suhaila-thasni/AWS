import { Router } from "express";

import { 
Registeration,
getPrescription,
getPrescriptionById,
prescriptionDelete,
updatePrescription
} from "../controllers/prescription.controllers";
import { authenticate } from "../middleware/authenticate";
import { checkPermission } from "../middleware/role.middleware";



const router = Router();

// CRUD

router.post("/prescription-template",  Registeration);
router.get("/prescription-template",  getPrescription);
router.get("/prescription-template/:id",  getPrescriptionById);
router.put("/prescription-template/:id", updatePrescription);
router.delete("/prescription-template/:id",  prescriptionDelete);

export default router;


