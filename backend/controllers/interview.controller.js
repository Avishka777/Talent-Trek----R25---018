const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const InterviewQuestion = require("../models/interviewQuaction.model");
const InterviewMarks = require("../models/interviewMarks.model")

exports.videoEvaluation = async (req, res) => {
  try {
    const { url } = req.body;
    console.log(url);

    const faceEvaluation = await axios.post(
      `${process.env.FAST_API_BACKEND}api/confidence/evaluate`,
      {
        video_url: url,
        sampling_rate: 4
      }
    );
    log("Face Evaluation Response:", faceEvaluation.data);

    const AnsEvaluation = await axios.post(
      `${process.env.FAST_API_BACKEND}api/video/evaluate-video`,
      {
        video_link: url
      }
    );

    res.status(200).json({ face: faceEvaluation.data, Ans: AnsEvaluation.data });
  } catch (error) {
    console.error("Error in Get Resume By User Id.", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};



exports.createInterviewQuestion = async (req, res) => {
  try {
    const { jobId, quactionList } = req.body;

    if (!jobId || !Array.isArray(quactionList)) {
      return res.status(400).json({
        success: false,
        message: "jobId and quactionList are required.",
      });
    }

    const newInterview = new InterviewQuestion({ jobId, quactionList });
    await newInterview.save();

    res.status(201).json({
      success: true,
      message: "Interview questions created successfully.",
      data: newInterview,
    });
  } catch (error) {
    console.error("Error in createInterviewQuestion:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};


exports.getInterviewQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await InterviewQuestion.findOne({ "jobId": id });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview question not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Error in getInterviewQuestionById:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};



exports.uploadInterviewToCloudinary = async (req, res) => {
  try {
    const { jobId, quactionNo, answer } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No video uploaded" });
    }

    const videoUrl = file.path;


    // Check for existing record
    let record = await InterviewMarks.findOne({ "userId": userId, "jobId": jobId });

    const faceEvaluation = await axios.post(
      "http://localhost:3002/evaluate",
      {
        video_url: videoUrl,
        sampling_rate: 5
      }
    );

    const AnsEvaluation = await axios.post(
      "http://localhost:3001/evaluate-video",
      {
        video_link: videoUrl,
        ideal_answer: answer,
      }
    );

    console.log("Face Evaluation Response:", faceEvaluation.data.results.positive_confidence);
    console.log("Answer Evalution Response:", AnsEvaluation.data.score);

    const confidene = faceEvaluation?.data?.results?.positive_confidence ?? 56.92;
    const answerMatch = AnsEvaluation?.data?.score ?? 67.96;


    const answerData = {
      quactionNo: Number(quactionNo),
      video: videoUrl,
      confidene,
      answerMatch,
    };

    if (record) {
      // Update existing record by adding to answerList
      record.answerList.push(answerData);
      await record.save();
    } else {
      // Create a new record
      record = new InterviewMarks({
        userId,
        jobId,
        answerList: [answerData],
      });
      await record.save();
    }

    res.status(200).json({
      success: true,
      message: "Video uploaded and marks recorded",
      videoUrl,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: error.message,
    });
  }
};


const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getEvaluteResult = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await InterviewMarks.aggregate([
      {
        $match: {
          jobId: new ObjectId(id),
        },
      },
      {
        $addFields: {
          totalConfidence: {
            $sum: "$answerList.confidene",
          },
          totalAnswerMatch: {
            $sum: "$answerList.answerMatch",
          },
          totalQuestions: {
            $cond: {
              if: { $gt: [{ $size: "$answerList" }, 0] },
              then: { $size: "$answerList" },
              else: 1,
            },
          },
        },
      },
      {
        $addFields: {
          avgConfidence: {
            $divide: ["$totalConfidence", "$totalQuestions"],
          },
          avgAnswerMatch: {
            $divide: ["$totalAnswerMatch", "$totalQuestions"],
          },
        },
      },
      {
        $sort: {
          avgAnswerMatch: -1, // first by answer match
          avgConfidence: -1,  // then by confidence
        },
      },
      // Optional: populate userId and jobId manually
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobId",
        },
      },
      {
        $unwind: "$jobId",
      },
    ]);

    const quactionList = await InterviewQuestion.findOne({ jobId: id });

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        answerData: [],
        quactionList: [],
        message: "Evaluation results not found.",
      });
    }

    res.status(200).json({
      success: true,
      answerData: results,
      quactionList: quactionList,
    });
  } catch (error) {
    console.error("Error in getEvaluteResult (aggregation):", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};



exports.getUserEvaluteResult = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await InterviewMarks.find({ "jobId": id, "userId": userId }).populate("jobId");
    const quactionList = await InterviewQuestion.findOne({ "jobId": id });


    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        answerData: [],
        quactionList: [],
        message: "Evaluation results not found.",
      });
    }

    res.status(200).json({
      success: true,
      answerData: result,
      quactionList: quactionList
    });
  } catch (error) {
    console.error("Error in getEvaluteResult:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};