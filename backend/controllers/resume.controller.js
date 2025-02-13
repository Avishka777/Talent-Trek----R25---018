const axios = require("axios");
const Resume = require("../models/resume.model");
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

// Parse Resume and Save in Database -------------------------------------------------
exports.parseResume = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "File Upload Failed." });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No File Uploaded." });
    }

    try {
      const userId = req.user.id;

      // Read file from temporary storage
      const fileStream = fs.createReadStream(req.file.path);

      // S3 upload parameters
      const params = {
        Bucket: "rp-projects-public",
        Key: `profiles/${userId}/${Date.now()}-${req.file.originalname}`,
        Body: fileStream,
        ContentType: req.file.mimetype,
      };

      // Upload to S3
      const s3Response = await s3.upload(params).promise();

      // Store the uploaded file URL
      const fileUrl = s3Response.Location;

      // Delete the temporary file from local storage
      fs.unlinkSync(req.file.path);

      // Call CV Parser API with file URL
      const response = await axios.post(
        "https://cvparser.ai/api/v4/parse",
        { url: fileUrl },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.CV_PARSER_API_KEY,
          },
        }
      );

      if (
        !response.data ||
        !response.data.data ||
        !response.data.data.profile
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid Response Structure From CV Parser API.",
        });
      }

      const parsedData = response.data.data;

      // Save parsed data to MongoDB
      const newResume = new Resume({
        userId,
        fileUrl,
        firstName: parsedData.profile.basics?.first_name || "",
        lastName: parsedData.profile.basics?.last_name || "",
        gender: parsedData.profile.basics?.gender || "",
        emails: parsedData.profile.basics?.emails || [],
        urls: parsedData.profile.basics?.urls || [],
        phoneNumbers: parsedData.profile.basics?.phone_numbers || [],
        dateOfBirth: parsedData.profile.basics?.date_of_birth || {},
        address: parsedData.profile.basics?.address || "",
        totalExperienceYears:
          parsedData.profile.basics?.total_experience_in_years || 0,
        profession: parsedData.profile.basics?.profession || "",
        summary: parsedData.profile.basics?.summary || "",
        skills: parsedData.profile.basics?.skills || [],
        hasDrivingLicense:
          parsedData.profile.basics?.has_driving_license || false,
        educations: parsedData.profile.educations || [],
        trainingsAndCertifications:
          parsedData.profile.trainings_and_certifications || [],
        professionalExperiences:
          parsedData.profile.professional_experiences || [],
        awards: parsedData.profile.awards || [],
        references: parsedData.profile.references || [],
        cvText: parsedData.cv_text || "",
        cvLanguage: parsedData.cv_language || "",
      });

      await newResume.save();
      res.status(201).json({
        success: true,
        message: "Resume Uploaded, Parsed, and Saved Successfully.!",
        resume: newResume,
      });
    } catch (error) {
      console.error("Error in Parse Resume.", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error.",
        error: error.message,
      });
    }
  });
};

// Get Resume Details ----------------------------------------------------------------
exports.getResumeByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume Not Found." });
    }
    res.status(200).json({ success: true, resume });
  } catch (error) {
    console.error("Error in Get Resume By User Id.", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
