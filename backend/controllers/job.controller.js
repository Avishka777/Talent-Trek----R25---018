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
      .json({ success: true, message: "Job created", job: newJob });
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
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
    console.error("Error fetching user jobs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
        message: "Job not found or you are not authorized to update this job",
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
      message: "Job updated successfully!",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
        success: false,
        message: "Job not found or you are not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
