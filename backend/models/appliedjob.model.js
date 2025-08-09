const mongoose = require("mongoose");

const AppliedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: ["Recommended", "Applied", "Interview", "Rejected", "Hired"],
      default: "Recommended",
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

AppliedJobSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("AppliedJob", AppliedJobSchema);
