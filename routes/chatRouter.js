import express from "express";
import chatController from "../controllers/chatController.js";
const router = express.Router();

router.get("/queryRoomId", chatController.query);
router.get("/querySender", chatController.senders);

export default router;
