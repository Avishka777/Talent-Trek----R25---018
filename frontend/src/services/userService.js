import axios from "axios";

const userService = {
  register: async (userData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}auth/register`,
        userData
      );
      return response.data; 
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Registration failed",
        }
      );
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Login failed";
    }
  },
};

export default userService;
