const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interview.controller");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/cloudinaryUpload");

// router.post("/create", authMiddleware, jobController.createJob);
router.post(
    "/", 
    interviewController.videoEvaluation
);


router.post(
    "/create-interview-quactions", 
    interviewController.createInterviewQuestion
);


router.get(
    "/get-interview-quactions/:id", 
    interviewController.getInterviewQuestionById
);

router.post(
    "/upload-interview",
    authMiddleware, upload.single("video"), 
    interviewController.uploadInterviewToCloudinary
);


router.get(
    "/get-evalute-result/:id", 
    interviewController.getEvaluteResult
);

router.get(
    "/get-user-evalute-result/:id/:userId", 
    interviewController.getUserEvaluteResult
);



// router.post("/upload-interview", interviewController.uploadInterviewToCloudinary);



module.exports = router;
