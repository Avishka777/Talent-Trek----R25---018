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

// Get Matching Candidates Details ---------------------------------------------------
exports.matchCandidates = async (req, res) => {
  try {
    // Extract the jobId from request parameters
    const { jobId } = req.params;

    // Define default weights
    const defaultWeights = {
      experience_score: 0.45,
      skills_score: 0.05,
      profession_score: 0.15,
      summary_score: 0.35,
    };

    // Initialize weights with default values
    const weights = {
      experience_score: defaultWeights.experience_score,
      skills_score: defaultWeights.skills_score,
      profession_score: defaultWeights.profession_score,
      summary_score: defaultWeights.summary_score,
    };

    // Override with provided weights from req.body if available
    if (req.body && req.body.weights) {
      if (req.body.weights.experience_score !== undefined) {
        weights.experience_score = req.body.weights.experience_score;
      }
      if (req.body.weights.skills_score !== undefined) {
        weights.skills_score = req.body.weights.skills_score;
      }
      if (req.body.weights.profession_score !== undefined) {
        weights.profession_score = req.body.weights.profession_score;
      }
      if (req.body.weights.summary_score !== undefined) {
        weights.summary_score = req.body.weights.summary_score;
      }
    }

    // Build the payload with job_id and weights
    const payload = {
      job_id: jobId,
      weights: weights,
    };

    // Build the FastAPI URL for matchi${process.env.FAST_API_BACKEND}ng resumes (POST endpoint)
    const fastApiUrl = `match-resumes`;

    // Call the FastAPI service using a POST request with the payload
    const fastApiResponse = await axios.post(fastApiUrl, payload);

    return res.json(fastApiResponse.data);
  } catch (error) {
    console.error("Error Fetching Matching Candidates.", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
