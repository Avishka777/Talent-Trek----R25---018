const axios = require("axios");
const Resume = require("../models/resume.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");

// Create Job Post -------------------------------------------------------------------
exports.createJob = async (req, res) => {
  try {
    const recruiter = await User.findById(req.user.id);
    if (!recruiter || recruiter.profileType !== "Recruiter") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const newJob = new Job({
      user: recruiter._id,
      companyName: recruiter.companyName,
      companyLogo: recruiter.companyLogo,
      ...req.body,
    });
    await newJob.save();

    res
      .status(201)
      .json({ success: true, message: "Job Created.", job: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Jobs ----------------------------------------------------------------------
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Job By ID ---------------------------------------------------------------------
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found.",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error Fetching Job.", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Get All Jobs Created by a Specific User -------------------------------------------
exports.getJobsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.find({ user: userId });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Error Fetching User Jobs.", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Update Job ------------------------------------------------------------------------
exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const updatedData = req.body;

    const job = await Job.findOne({ _id: jobId, user: userId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found or You Are Not Authorized to Update This Job.",
      });
    }

    // Ensure qualifications & responsibilities are saved correctly
    if (
      updatedData.qualifications &&
      Array.isArray(updatedData.qualifications)
    ) {
      updatedData.qualifications = updatedData.qualifications.map((q) =>
        q.toString()
      );
    }
    if (
      updatedData.jobResponsibilities &&
      Array.isArray(updatedData.jobResponsibilities)
    ) {
      updatedData.jobResponsibilities = updatedData.jobResponsibilities.map(
        (r) => r.toString()
      );
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, updatedData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Job Updated Successfully.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error Updating Job.", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Delete Job ------------------------------------------------------------------------
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const job = await Job.findOne({ _id: jobId, user: userId });

    if (!job) {
      return res.status(404).json({
        message: "Job Not Found or You Are Not Authorized to Delete This Job.",
      });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      message: "Job Deleted Successfully.",
    });
  } catch (error) {
    console.error("Error Deleting Job.", error);
    res.status(500).json({
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Send Resume Data and Fetch Job Matches Percentage ----------------------------------
exports.matchJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({ error: "Resume Not Found." });
    }

    const fastApiUrl = `${process.env.FAST_API_BACKEND}match-jobs/${resume._id}`;
    const fastApiResponse = await axios.get(fastApiUrl);
    const rawMatches = fastApiResponse.data.matches;

    // Enrich each match with the full job info from MongoDB
    const enrichedMatches = await Promise.all(
      rawMatches.map(async (match) => {
        const job = await Job.findById(match.job_id).lean();
        return {
          ...match,
          job: job,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: { matches: enrichedMatches },
    });
  } catch (error) {
    console.error("Error fetching matching jobs:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
