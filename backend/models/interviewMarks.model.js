const mongoose = require("mongoose");

const InterViewMarksSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    quactionList: [
        {
            quactionNo:{type: Number},
            video: {type: String},
            confidene: {type: String},
            answer: {type: String},
        }
    ],
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("interviewmarks", InterViewMarksSchema);
