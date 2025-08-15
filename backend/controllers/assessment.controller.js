const axios = require("axios");
const Assessment = require("../models/assessment.model");
const PuzzleResult = require("../models/puzzleResult.model");
const QuestionSet = require("../models/mcq.model");
const MCQResult = require("../models/mcqResult.model");
const LeaderboardEntry = require("../models/leaderboard.model");

// Start Assessment
exports.startAssessment = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { jobId, job } = req.body;

    if (!jobId || !job) {
      return res
        .status(400)
        .json({ success: false, message: "jobId and job are required." });
    }

    // ---- Call FastAPI to generate quiz ----
    const fastApiBase = process.env.FAST_API_BACKEND;
    if (!fastApiBase) {
      return res
        .status(500)
        .json({ success: false, message: "FAST_API_BACKEND is not configured." });
    }

    const fastApiUrl = `${fastApiBase}assessments/generate-quiz`;

    const mapJobLevel = (job_level) => {
      const normalized = (job_level || "").toLowerCase();
      if (normalized.includes("intern")) return "Intern";
      if (normalized.includes("associate")) return "Associate";
      if (normalized.includes("junior")) return "Junior";
      if (normalized.includes("senior")) return "Senior";
      // Default fallback
      return "Associate";
    };
    const payload = {
      job_title: job.jobTitle,
      job_description: job.jobDescription,
      job_responsibilities: Array.isArray(job.jobResponsibilities)
        ? job.jobResponsibilities
        : [job.jobResponsibilities],
      job_level: mapJobLevel(job.job_level),
      required_skills: Array.isArray(job.skills)
        ? job.skills
        : [job.skills],
      optional_skills: Array.isArray(job.optionalSkills)
        ? job.optionalSkills
        : [job.optionalSkills],
    };

    const { data: fastApiData } = await axios.post(fastApiUrl, payload, {
      params: { num_questions: 15, include_explanations: true },
    });

    // Some FastAPI implementations return an array directly, others wrap in {questions: [...]}
    const quizQuestions =
      Array.isArray(fastApiData)
        ? fastApiData
        : fastApiData?.questions || fastApiData?.data || [];

    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      return res.status(502).json({
        success: false,
        message: "Quiz generation failed or returned no questions.",
      });
    }

    // ---- Transform to your QuestionSet schema ----
    const questionsForDB = quizQuestions.map((q) => {
      const options = q.options || [];
      const correctAnswerIndex = options.findIndex(
        (opt) => opt === q.correct_answer
      );

      return {
        questionText: q.question,
        options,
        correctAnswerIndex: correctAnswerIndex !== -1 ? correctAnswerIndex : 0,
        explanation: q.explanation || "",
      };
    });

    // Create new QuestionSet
    const questionSet = new QuestionSet({
      title: `Assessment Quiz for Job ${jobId}`,
      description: `Auto-generated quiz for job level ${job.job_level}`,
      questions: questionsForDB,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await questionSet.save();

    // Now create or update Assessment and link to this QuestionSet
    let assessment = await Assessment.findOne({ job: jobId, candidate: candidateId });
    if (!assessment) {
      assessment = new Assessment({
        job: jobId,
        candidate: candidateId,
        status: "started",
        startTime: new Date(),
        questionSet: questionSet._id  // store reference to question set
      });
      await assessment.save();
    } else {
      // If assessment exists but not completed, update questionSet and status if needed
      assessment.questionSet = questionSet._id;
      assessment.status = "started";
      assessment.startTime = new Date();
      await assessment.save();
    }

    res.status(201).json({ success: true, data: { assessment, questionSet } });
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

    // Validate ObjectId
    if (!questionSetId || !mongoose.Types.ObjectId.isValid(questionSetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing questionSetId",
      });
    }

    const questionSet = await QuestionSet.findById(questionSetId)
      .select("-questions.correctAnswerIndex"); // exclude correctAnswerIndex from nested questions

    if (!questionSet) {
      return res.status(404).json({ success: false, message: "Question set not found" });
    }

    res.json({ success: true, data: questionSet });
  } catch (error) {
    console.error("getMCQQuestions error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error.", error: error.message });
  }
};

