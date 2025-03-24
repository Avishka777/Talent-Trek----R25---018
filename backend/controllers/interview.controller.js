const axios = require("axios");
const Resume = require("../models/resume.model");
const Job = require("../models/job.model");
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

// Setup Multer for file upload
const upload = multer({ dest: "uploads/" }).single("file");



// // Get Resume Details ----------------------------------------------------------------
// exports.getResumeByUserId = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const resume = await Resume.findOne({ userId });
//     if (!resume) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Resume Not Found." });
//     }
//     res.status(200).json({ success: true, resume });
//   } catch (error) {
//     console.error("Error in Get Resume By User Id.", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error.",
//       error: error.message,
//     });
//   }
// };


