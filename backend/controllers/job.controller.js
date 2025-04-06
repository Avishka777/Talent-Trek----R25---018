const axios = require("axios");
const Resume = require("../models/resume.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");
const Company = require("../models/company.model");

// Create Job Post -------------------------------------------------------------------
exports.createJob = async (req, res) => {
  try {
    // Find the recruiter
    const recruiter = await User.findById(req.user.id);
    if (!recruiter || recruiter.profileType !== "Recruiter") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    // Find the company associated with this recruiter
    const company = await Company.findOne({ userId: recruiter._id });
    if (!company) {
      return res
        .status(400)
        .json({ success: false, message: "Company not found for the recruiter" });
    }

    // Create a new job linked to the company (by storing company._id)
    const newJob = new Job({
      user: recruiter._id,
      company: company._id,
      ...req.body,
    });
    
    await newJob.save();

    res.status(201).json({ success: true, message: "Job Created.", job: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Jobs ----------------------------------------------------------------------
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("company").lean();
    const enrichedJobs = jobs.map((job) => ({ job }));
    res.status(200).json({ success: true, jobs: enrichedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get Job By ID ---------------------------------------------------------------------
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company");

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

    // Ensure only the job owner can update the job
    const job = await Job.findOne({ _id: jobId, user: userId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found or You Are Not Authorized to Update This Job.",
      });
    }

    // Normalize qualifications if provided
    if (
      updatedData.qualifications &&
      Array.isArray(updatedData.qualifications)
    ) {
      updatedData.qualifications = updatedData.qualifications.map((q) =>
        q.toString()
      );
    }

    // Normalize job responsibilities if provided
    if (
      updatedData.jobResponsibilities &&
      Array.isArray(updatedData.jobResponsibilities)
    ) {
      updatedData.jobResponsibilities = updatedData.jobResponsibilities.map(
        (r) => r.toString()
      );
    }

    // Update job details and populate company field
    const updatedJob = await Job.findByIdAndUpdate(jobId, updatedData, {
      new: true,
    }).populate("company");

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
      return res
        .status(404)
        .json({ success: false, message: "Resume Not Found." });
    }

    const fastApiUrl = `${process.env.FAST_API_BACKEND}match-jobs/${resume._id}`;
    const fastApiResponse = await axios.get(fastApiUrl);
    const rawMatches = fastApiResponse.data.matches;

    // Enrich each match with full job info including populated company details
    const enrichedMatches = await Promise.all(
      rawMatches.map(async (match) => {
        const jobData = await Job.findById(match.job_id)
          .populate("company")
          .lean();

        return {
          // Nest the full job details as in getAllJobs
          job: jobData,
          // Set top-level properties so that the JobCard can display them consistently
          jobTitle: jobData.jobTitle,
          companyName: jobData.company ? jobData.company.companyName : "",
          // Include matching scores if available from the matching API
          experience_score: match.experience_score,
          skills_score: match.skills_score,
          profession_score: match.profession_score,
          summary_score: match.summary_score,
          qualifications_score: match.qualifications_score,
          overall_match_percentage: match.overall_match_percentage,
        };
      })
    );

    return res.status(200).json({
      success: true,
      jobs: enrichedMatches,
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
