import axios from "axios";

const InterviewService = {
  // Get the existing company details
  getCompanyDetails: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}company/company`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch company details.",
        }
      );
    }
  }
}

export default InterviewService;