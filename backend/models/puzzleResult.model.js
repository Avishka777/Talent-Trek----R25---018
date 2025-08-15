const mongoose = require("mongoose");

const PuzzleResultSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    movements: {
      type: Number,
      required: true,
    },
    timeTakenSeconds: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PuzzleResult", PuzzleResultSchema);
