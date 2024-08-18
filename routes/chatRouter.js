import express from "express";
import chatController from "../controllers/chatController.js";
const router = express.Router();

router.get("/roomId", chatController.query);
router.get("/sender", chatController.senders);

export default router;
