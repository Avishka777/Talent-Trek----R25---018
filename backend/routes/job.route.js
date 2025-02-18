const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, jobController.createJob);
router.post("/match_jobs", authMiddleware, jobController.matchJobs);
router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);
router.get("/user/jobs", authMiddleware, jobController.getJobsByUser);
router.put("/:id", authMiddleware, jobController.updateJob);
router.delete("/:id", authMiddleware, jobController.deleteJob);

module.exports = router;
