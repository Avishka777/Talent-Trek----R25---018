const mongoose = require("mongoose");

const InterViewMarksSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    answerList: [
        {
            quactionNo:{type: Number},
            video: {type: String},
            confidene: {type: Number},
            answerMatch: {type: Number}
        }
    ],
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("interviewmarks", InterViewMarksSchema);
