const mongoose = require("mongoose");

const MCQResultSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    timeTakenSeconds: {
      type: Number,
      required: true,
    },
    questionSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionSet",
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MCQResult", MCQResultSchema);
