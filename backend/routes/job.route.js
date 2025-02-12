const express = require("express");
const { createJob, getJobs } = require("../controllers/job.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createJob);
router.get("/", getJobs);

module.exports = router;