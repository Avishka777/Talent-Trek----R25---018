const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resume.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Parse Resume and Save in Database
router.post("/parse", authMiddleware, resumeController.parseResume);

// Get Resume by User ID
router.get("/parse", authMiddleware, resumeController.getResumeByUserId);

// Get Matching Candidates Details
router.post("/match/candidates/:jobId", resumeController.matchCandidates);

module.exports = router;