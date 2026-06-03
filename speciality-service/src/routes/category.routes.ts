import { Router } from "express";
import {
 Registeration,
 categoryDelete,
 getCategorys,
 getanCategory,
 updateData
} from "../controllers/category.controllers";
import { authenticate } from "../middleware/authenticate";
import { checkPermission } from "../middleware/role.middleware";

const router = Router();



// CRUD

router.post("/category", Registeration);
router.get("/category", authenticate, checkPermission("category", "view"), getCategorys);
router.get("/category/:id",authenticate, checkPermission("category", "view"), getanCategory);
router.put("/category/:id",authenticate, checkPermission("category", "edit"), updateData);
router.delete("/category/:id",authenticate, checkPermission("category", "delete"), categoryDelete);


export default router;
