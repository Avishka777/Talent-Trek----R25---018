import axios from "axios";

const resumeService = {
  // Upload Resume
  uploadResume: async (file, token) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}resume/parse`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Resume Upload Failed",
        }
      );
    }
  },

  // Get Resume Data
  getResume: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}resume/parse`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to Fetch Resume",
        }
      );
    }
  },

  // Get Matching Jobs for User
  getMatchingResumes: async (jobId, token, weights) => {
    try {
      const payload = {
        job_id: jobId,
        weights: weights || {
          experience_score: 0.25,
          skills_score: 0.25,
          profession_score: 0.25,
          summary_score: 0.25,
        },
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}resume/match/candidates/${jobId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in Get Matching Resumes:", error.response?.data);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to Fetch Resumes.",
        }
      );
    }
  },
};

export default resumeService;
