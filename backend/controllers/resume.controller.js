const axios = require("axios");
const Resume = require("../models/resume.model");

// Parse Resume and Save in DataBase -------------------------------------------------
exports.parseResume = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const userId = req.user.id;

    // Call CV Parser API
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

    if (!response.data || !response.data.data || !response.data.data.profile) {
      return res.status(400).json({
        success: false,
        message: "Invalid response structure from CV parser API",
      });
    }

    const parsedData = response.data.data; // Extract the actual profile data

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
      message: "Resume parsed and saved successfully!",
      resume: newResume,
    });
  } catch (error) {
    console.error("Error in parseResume:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Resume Details ----------------------------------------------------------------
exports.getResumeByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }
    res.status(200).json({ success: true, resume });
  } catch (error) {
    console.error("Error in getResumeByUserId:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};
