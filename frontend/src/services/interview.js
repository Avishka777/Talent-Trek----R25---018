import axios from "axios";

const InterviewService = {
  // Get the existing company details
  getInterviewQuactions: async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}interview/get-interview-quactions/${id}`,
        // {
        //   headers: { Authorization: `Bearer ${token}` },
        // }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch interview details.",
        }
      );
    }
  },

  uploadInterviewVideo : async (token, formData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}interview/upload-interview`, formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch interview details.",
        }
      );
    }
  },

  getInterviewResults: async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}interview/get-evalute-result/${id}`,
        // {
        //   headers: { Authorization: `Bearer ${token}` },
        // }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch interview details.",
        }
      );
    }
  },
}



export default InterviewService;