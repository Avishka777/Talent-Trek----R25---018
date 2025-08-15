const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const assessmentController = require("../controllers/assessment.controller");

// Start assessment (protected)
router.post("/start", authMiddleware, assessmentController.startAssessment);

// Submit puzzle result (protected)
router.post("/submit-puzzle", authMiddleware, assessmentController.submitPuzzleResult);

// Submit MCQ result, complete assessment, update leaderboard (protected)
router.post("/submit-mcq", authMiddleware, assessmentController.submitMCQResult);

// Get MCQ questions for a question set (for candidate to take MCQ)
router.get("/mcq-questions/:questionSetId", authMiddleware, async (req, res) => {
  try {
    const QuestionSet = require("../models/mcq.model");
    const questionSet = await QuestionSet.findById(req.params.questionSetId).select("-correctAnswerIndex"); // omit correct answer for security
    if (!questionSet) return res.status(404).json({ success: false, message: "Question set not found" });
    res.json({ success: true, data: questionSet });
  } catch (error) {
    console.error("getMCQQuestions error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error.", error: error.message });
  }
});

module.exports = router;
