const mongoose = require("mongoose");

const InterviewQuactionSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    quactionList: [
        {
            quactionNo:{type: Number},
            quaction: {type: String},
            answer: {type: String},
        }
    ],
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("hrquactions", InterviewQuactionSchema);
