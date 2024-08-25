import express from "express";
import multer from "multer";
import memberController from "../controllers/memberController.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  dest: "/photo",
});
const router = express.Router();

router.post("/photo", upload.array("images"), memberController.photo);
router.get("/profile", memberController.profile);
router.put("/profile", memberController.updateProfile);
router.get("/article", memberController.articles);
export default router;
