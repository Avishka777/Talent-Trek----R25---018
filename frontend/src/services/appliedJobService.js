import axios from "axios";

const appliedJobService = {
  // Apply for a job
  applyForJob: async (jobId, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}applied-jobs/${jobId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      // Enhanced error handling
      const errorData = error.response?.data || {
        success: false,
        message: "Failed to apply for job",
      };

      throw errorData;
    }
  },

  // Recommended for a job
  recommendedForJob: async (jobId, userId, token, recommenderId) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }applied-jobs/recommend/${jobId}/${userId}`,
        { recommenderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {
        success: false,
        message: "Failed to recommend for job",
      };
      throw errorData;
    }
  },
  // Get application status for a specific job
  getApplicationStatus: async (jobId, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}applied-jobs/${jobId}/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to get application status",
        }
      );
    }
  },

  // Get all user's applications
  getUserApplications: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}applied-jobs/user/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to get user applications",
        }
      );
    }
  },
};

export default appliedJobService;
