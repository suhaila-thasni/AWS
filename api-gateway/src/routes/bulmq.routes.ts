import express from "express";
import { proxyRequest } from "../services/bulmq.service";

const router = express.Router();

// Proxy all /bulmq/* requests to the bulmq-service
// Exposes: POST /api/bulmq/booking-task
//          POST /api/bulmq/medicin-task
router.use("/bulmq", proxyRequest);

export default router;
