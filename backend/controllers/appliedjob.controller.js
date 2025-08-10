const AppliedJob = require("../models/appliedjob.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const mongoose = require("mongoose");

// Apply for a Job -------------------------------------------------------------------
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Validate jobId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    // Check if user exists and is a job seeker
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profileType !== "Job Seeker") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can apply for jobs",
      });
    }

    // Check if job exists with better error handling
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        details: `No job found with ID: ${jobId}`,
      });
    }

    // Check if application deadline has passed
    if (new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
        deadline: job.applicationDeadline,
        currentDate: new Date(),
      });
    }

    // Check if user already applied
    const existingApplication = await AppliedJob.findOne({
      user: userId,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
        existingApplicationId: existingApplication._id,
        currentStatus: existingApplication.status,
      });
    }

    // Create new application
    const appliedJob = new AppliedJob({
      user: userId,
      job: jobId,
      status: "Applied",
    });

    await appliedJob.save();

    // Create notification for the recruiter
    const notification = new Notification({
      user_id: userId,
      notification_type: "job_application",
      title: "New Job Application",
      message: `${user.fullName} has applied for your job posting: ${job.jobTitle}`,
      ref_id: jobId,
    });

    await notification.save();

    // This requires you to have socket.io set up
    const io = req.app.get("socketio");
    if (io) {
      io.to(`user_${job.postedBy}`).emit("new_notification", notification);
    }

    // Populate some fields in the response
    const result = await AppliedJob.findById(appliedJob._id)
      .populate("job", "jobTitle company")
      .populate("user", "fullName email");

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: result,
      notification: {
        sent: true,
        recipient: job.postedBy,
      },
    });
  } catch (error) {
    console.error("Application error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Recommend for Job -----------------------------------------------------------------
exports.recommendForJob = async (req, res) => {
  try {
    const { jobId, userId } = req.params;

    // Validate inputs
    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Check if job exists
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user exists and is job seeker
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.profileType !== "Job Seeker") {
      return res.status(400).json({
        success: false,
        message: "Only job seekers can be recommended for jobs",
      });
    }

    // Check for existing application
    const existingApplication = await AppliedJob.findOne({
      job: jobId,
      user: userId,
    });

    // If already exists with "Recommended" status
    if (existingApplication && existingApplication.status === "Recommended") {
      return res.json({
        success: true,
        message: "User is already recommended for this job",
        application: existingApplication,
      });
    }

    let application;

    // If exists but different status, update to Recommended
    if (existingApplication) {
      application = await AppliedJob.findByIdAndUpdate(
        existingApplication._id,
        { status: "Recommended" },
        { new: true, runValidators: true }
      )
        .populate("user", "fullName email")
        .populate("job", "jobTitle");
    }
    // If doesn't exist, create new recommendation
    else {
      application = new AppliedJob({
        user: userId,
        job: jobId,
        status: "Recommended",
      });
      await application.save();
      application = await AppliedJob.findById(application._id)
        .populate("user", "fullName email")
        .populate("job", "jobTitle");
    }

    return res.json({
      success: true,
      message: "User successfully recommended for job",
      application: application,
    });
  } catch (error) {
    console.error("Error recommending for job:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get User's Applied Jobs -----------------------------------------------------------
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await AppliedJob.find({ user: userId })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "companyName logo industry location phone",
        },
      })
      .sort({ createdAt: -1 });

    // Transform the data for better frontend consumption
    const enrichedApplications = applications.map((app) => ({
      _id: app._id,
      status: app.status,
      createdAt: app.createdAt,
      job: {
        ...app.job._doc,
        applicationDeadline: app.job.applicationDeadline,
        company: app.job.company,
      },
    }));

    res.status(200).json({
      success: true,
      applications: enrichedApplications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Application Status for Specific Job -------------------------------------------
exports.getApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if application exists
    const application = await AppliedJob.findOne({
      user: userId,
      job: jobId,
    }).populate({
      path: "job",
      populate: {
        path: "company",
        select: "companyName logo industry",
      },
    });

    if (!application) {
      return res.status(200).json({
        success: true,
        status: "Not Applied",
        application: null,
      });
    }

    res.status(200).json({
      success: true,
      status: application.status,
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Application Status ---------------------------------------------------------
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if application exists
    const application = await AppliedJob.findById(applicationId).populate(
      "job",
      "user"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if user is either the applicant or the recruiter who posted the job
    if (
      application.user.toString() !== userId &&
      application.job.user.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this application",
      });
    }

    // Update status
    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application status updated",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
