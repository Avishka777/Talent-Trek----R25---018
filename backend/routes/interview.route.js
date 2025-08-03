const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interview.controller");
const authMiddleware = require("../middleware/authMiddleware");

// router.post("/create", authMiddleware, jobController.createJob);
router.post("/", interviewController.videoEvaluation);


module.exports = router;
