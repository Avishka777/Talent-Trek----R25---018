import axios from "axios";

const assessmentService = {
  startAssessment: async (jobId, jobDetails, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}assessment/start`,
        { jobId, jobDetails },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: "Failed to start assessment" };
    }
  },

  submitPuzzleResult: async (assessmentId, movements, timeTakenSeconds, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}assessment/submit-puzzle`,
        { assessmentId, movements, timeTakenSeconds },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: "Failed to submit puzzle result" };
    }
  },

  submitMCQResult: async (assessmentId, totalQuestions, correctAnswers, timeTakenSeconds, questionSetId, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}assessment/submit-mcq`,
        { assessmentId, totalQuestions, correctAnswers, timeTakenSeconds, questionSetId },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: "Failed to submit MCQ result" };
    }
  },

  getMCQQuestions: async (questionSetId, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}assessment/mcq-questions/${questionSetId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: "Failed to fetch MCQ questions" };
    }
  },
};

export default assessmentService;
