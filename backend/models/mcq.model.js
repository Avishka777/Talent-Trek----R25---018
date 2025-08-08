const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  options: [String], // MCQ options
  correctAnswerIndex: Number, // index of correct option in options array
});

const QuestionSetSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
    },
    questions: [QuestionSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuestionSet", QuestionSetSchema);
