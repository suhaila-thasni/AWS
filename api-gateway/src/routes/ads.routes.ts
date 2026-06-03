import express from "express";
import { proxyRequest } from "../services/ads.service";

const router = express.Router();

router.use("/ad", proxyRequest);

export default router;
