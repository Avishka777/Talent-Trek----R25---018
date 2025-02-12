const Job = require("../models/job.model");
const User = require("../models/user.model");

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

    res.status(201).json({ success: true, message: "Job created", job: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("user", "fullName email");
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};