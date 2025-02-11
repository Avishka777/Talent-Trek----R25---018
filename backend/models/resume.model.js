const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fileUrl: {
      type: String,
    },
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String },
    emails: [{ type: String }],
    urls: [{ type: String }],
    phoneNumbers: [{ type: String }],
    dateOfBirth: {
      year: { type: Number },
      month: { type: Number },
      day: { type: Number },
    },
    address: { type: String },
    totalExperienceYears: { type: Number },
    profession: { type: String },
    summary: { type: String },
    skills: [{ type: String }],
    hasDrivingLicense: { type: Boolean, default: false },

    educations: [
      {
        startYear: { type: Number },
        isCurrent: { type: Boolean },
        endYear: { type: Number },
        issuingOrganization: { type: String },
        description: { type: String },
      },
    ],

    trainingsAndCertifications: [
      {
        year: { type: Number },
        issuingOrganization: { type: String },
        description: { type: String },
      },
    ],

    professionalExperiences: [
      {
        startDate: {
          year: { type: Number },
          month: { type: Number },
        },
        isCurrent: { type: Boolean },
        endDate: {
          year: { type: Number },
          month: { type: Number },
        },
        durationInMonths: { type: Number },
        company: { type: String },
        location: { type: String },
        title: { type: String },
        description: { type: String },
      },
    ],

    awards: [{ type: String }],
    references: [{ type: String }],
    cvText: { type: String },
    cvLanguage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
