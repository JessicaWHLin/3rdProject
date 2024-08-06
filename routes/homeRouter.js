import express from "express";
const router = express.Router();
router.get("/", (req, res) => {
  res.send({
    status: "success",
  });
});
export default router;
