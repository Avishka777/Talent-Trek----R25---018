const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resume.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/parse", authMiddleware, resumeController.parseResume);
router.get("/parse", authMiddleware, resumeController.getResumeByUserId);
router.post("/match_candidates/:jobId", resumeController.matchCandidates);

module.exports = router;