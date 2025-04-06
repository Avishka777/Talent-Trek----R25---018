const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    workExperience: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    salaryRange: {
      type: String,
    },
    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Remote","Contract"],
      required: true,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    qualifications: [
      {
        type: String,
        required: true,
      },
    ],
    jobResponsibilities: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
