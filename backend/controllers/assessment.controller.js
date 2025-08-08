const Assessment = require("../models/assessment.model");
const PuzzleResult = require("../models/puzzleResult.model");
const QuestionSet = require("../models/mcq.model");
const MCQResult = require("../models/mcqResult.model");
const LeaderboardEntry = require("../models/leaderboard.model");

// Start Assessment
exports.startAssessment = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { jobId } = req.body;

    let assessment = await Assessment.findOne({ job: jobId, candidate: candidateId });
    if (assessment) {
      if (assessment.status === "completed")
        return res.status(400).json({ success: false, message: "Assessment already completed." });
      return res.status(200).json({ success: true, data: assessment });
    }

    assessment = new Assessment({
      job: jobId,
      candidate: candidateId,
      status: "started",
      startTime: new Date(),
    });

    await assessment.save();

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    console.error("startAssessment error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error.", error: error.message });
  }
};

// Submit Puzzle Result
exports.submitPuzzleResult = async (req, res) => {
  try {
    const { assessmentId, movements, timeTakenSeconds } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment || assessment.candidate.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: "Assessment not found or unauthorized." });
    }

    const puzzleResult = new PuzzleResult({
      assessment: assessmentId,
      movements,
      timeTakenSeconds,
      completedAt: new Date(),
    });

    await puzzleResult.save();

    res.status(201).json({ success: true, data: puzzleResult });
  } catch (error) {
    console.error("submitPuzzleResult error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error.", error: error.message });
  }
};

// Submit MCQ Result, Complete Assessment, Update Leaderboard
exports.submitMCQResult = async (req, res) => {
  try {
    const { assessmentId, totalQuestions, correctAnswers, timeTakenSeconds, questionSetId } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment || assessment.candidate.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: "Assessment not found or unauthorized." });
    }

    const mcqResult = new MCQResult({
      assessment: assessmentId,
      totalQuestions,
      correctAnswers,
      timeTakenSeconds,
      questionSetId,
      completedAt: new Date(),
    });

    await mcqResult.save();

    // Mark assessment completed
    assessment.status = "completed";
    assessment.endTime = new Date();
    await assessment.save();

    // Calculate final score (example scoring logic)
    const puzzleResult = await PuzzleResult.findOne({ assessment: assessmentId });
    let puzzleScore = 0;
    if (puzzleResult) {
      puzzleScore = 1000 / (puzzleResult.movements * puzzleResult.timeTakenSeconds + 1);
    }
    const mcqScore = (correctAnswers / totalQuestions) * 100;
    const finalScore = (puzzleScore * 0.5) + (mcqScore * 0.5);

    // Update or create leaderboard entry
    let leaderboardEntry = await LeaderboardEntry.findOne({ job: assessment.job, candidate: assessment.candidate });
    if (!leaderboardEntry) {
      leaderboardEntry = new LeaderboardEntry({
        job: assessment.job,
        candidate: assessment.candidate,
        score: finalScore,
      });
    } else {
      leaderboardEntry.score = finalScore;
      leaderboardEntry.updatedAt = new Date();
    }
    await leaderboardEntry.save();

    res.status(201).json({ success: true, data: { mcqResult, finalScore } });
  } catch (error) {
    console.error("submitMCQResult error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error.", error: error.message });
  }
};

// Get MCQ Questions for a given question set, without correct answers
exports.getMCQQuestions = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    const questionSet = await QuestionSet.findById(questionSetId).select("-questions.correctAnswerIndex"); // exclude correctAnswerIndex from nested questions

    if (!questionSet) {
      return res.status(404).json({ success: false, message: "Question set not found" });
    }

    res.json({ success: true, data: questionSet });
  } catch (error) {
    console.error("getMCQQuestions error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error.", error: error.message });
  }
};
