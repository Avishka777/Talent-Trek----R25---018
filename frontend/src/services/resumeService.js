import axios from "axios";

const resumeService = {
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
          message: "Failed to fetch resume",
        }
      );
    }
  },
};

export default resumeService;
