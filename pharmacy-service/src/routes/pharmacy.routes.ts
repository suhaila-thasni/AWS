import { Router } from "express";
import{
    createOrUpdatestock,
    getPharmacies,
    getPharmacy,
    updatePharmacy,
    deletePharmacy,
} from "../controllers/pharmacy.controller";

const router = Router();

router.post("/pharmacy", createOrUpdatestock);
router.put("/pharmacy/:id", updatePharmacy);
router.get("/pharmacy", getPharmacies);
router.get("/pharmacy/:id", getPharmacy);
router.delete("/pharmacy/:id", deletePharmacy);

export default router;