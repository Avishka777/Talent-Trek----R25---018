import axios from "axios";

const userService = {
  // Register User
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
          message: "Registration Failed",
        }
      );
    }
  },

  // Login User
  login: async (credentials) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}auth/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Login Failed",
        }
      );
    }
  },

  // Get User Profile
  getProfile: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}auth/profile`,
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
          message: "Failed to Fetch Profile",
        }
      );
    }
  },

  // Update User Profile
  updateProfile: async (userData, file, token) => {
    try {
      const formData = new FormData();
      formData.append("fullName", userData.fullName);
      formData.append("email", userData.email);
      formData.append("profileType", userData.profileType);

      if (file) {
        formData.append("profilePicture", file);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}auth/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Profile Update Failed",
        }
      );
    }
  },

  // Delete User Profile
  deleteProfile: async (token) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}auth/profile`,
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
          message: "Profile Deletion Failed",
        }
      );
    }
  },
};

export default userService;
