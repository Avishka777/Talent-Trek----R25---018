const express = require("express");
const router = express.Router();
const appliedjobController = require("../controllers/appliedjob.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Apply for a job
router.post("/:jobId", authMiddleware, appliedjobController.applyForJob);

// Get all user applications
router.get("/user/applications", authMiddleware, appliedjobController.getUserApplications);

// Get application status for specific job
router.get("/:jobId/status", authMiddleware, appliedjobController.getApplicationStatus);

// Update application status
router.put("/:applicationId", authMiddleware, appliedjobController.updateApplicationStatus);

module.exports = router;