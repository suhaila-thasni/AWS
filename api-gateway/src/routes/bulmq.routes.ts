import express from "express";
import { proxyRequest } from "../services/bulmq.service";

const router = express.Router();

// Define the routes that should be handled by the bulmq-service
router.post("/medicin-task", proxyRequest);
router.post("/booking-task", proxyRequest);

export default router;
