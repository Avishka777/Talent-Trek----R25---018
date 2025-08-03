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
  }
}

export default InterviewService;