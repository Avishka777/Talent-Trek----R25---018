const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new job
router.post("/create", authMiddleware, jobController.createJob);

// Get recomended jobs
router.post("/match/jobs", authMiddleware, jobController.matchJobs);

// Get all jobs
router.get("/", jobController.getJobs);

// Get job by ID
router.get("/:id", jobController.getJobById);

// Get jobs by user
router.get("/user/jobs", authMiddleware, jobController.getJobsByUser);

// Update job
router.put("/:id", authMiddleware, jobController.updateJob);

// Delete job
router.delete("/:id", authMiddleware, jobController.deleteJob);

module.exports = router;
