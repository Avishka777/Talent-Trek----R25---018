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
          message: "Resume upload failed",
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
          message: "Failed to fetch resume",
        }
      );
    }
  },
};

export default resumeService;
