const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interview.controller");
const authMiddleware = require("../middleware/authMiddleware");

// router.post("/create", authMiddleware, jobController.createJob);
router.post("/", interviewController.videoEvaluation);
router.post("/create-interview-quactions", interviewController.createInterviewQuestion);
router.get("/get-interview-quactions/:id", interviewController.getInterviewQuestionById);



module.exports = router;
