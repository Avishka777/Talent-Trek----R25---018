const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const InterviewQuestion = require("../models/interviewQuaction.model");

exports.videoEvaluation = async (req, res) => {
  try {
    const { url } = req.body;
    console.log(url);
    
    const faceEvaluation = await axios.post(
      "http://127.0.0.1:8000/evaluate",
      {
        video_url: url,
        sampling_rate: 4
      }
    );
    log("Face Evaluation Response:", faceEvaluation.data);

    const AnsEvaluation = await axios.post(
      "http://127.0.0.1:8001/evaluate-video",
      {
        video_link: url
      }
    );

    res.status(200).json({ face:faceEvaluation.data, Ans:AnsEvaluation.data });
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

    const interview = await InterviewQuestion.findById(id);

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



