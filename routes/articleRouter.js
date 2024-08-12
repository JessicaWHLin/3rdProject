import express from "express";
import multer from "multer";

import articleController from "../controllers/articleController.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  dest: "/write",
});

const router = express.Router();

router.post("/write", upload.array("images"), articleController.write);
router.get("/zoneList", articleController.listZone);
router.get("/ranking", articleController.ranking);
router.get("", articleController.articleDetail);
router.post("/comment", articleController.comment);
router.get("/comment", articleController.findComment);

export default router;
