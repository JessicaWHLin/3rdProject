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
router.get("", articleController.articleDetail);
router.post("/comment", articleController.comment);
router.get("/comment", articleController.findComment);
router.post("/like", articleController.like);
router.get("/ranking", articleController.ranking);
router.post("/favorite", articleController.favorite);
router.get("/favorite", articleController.findFavorite);
router.post("/views", articleController.viewCount);
router.get("/views", articleController.sumViewCount);

export default router;
