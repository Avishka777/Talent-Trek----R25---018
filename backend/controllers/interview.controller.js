const cloudinary = require("cloudinary").v2;
const axios = require("axios");
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


