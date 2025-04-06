import axios from "axios";

const companyService = {
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
  },

  // Create a new company
  createCompany: async (companyData, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}company/create`,
        companyData,
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
          message: "Failed to create company.",
        }
      );
    }
  },

  // Update an existing company
  updateCompany: async (companyData, token) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}company/update`,
        companyData,
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
          message: "Failed to update company.",
        }
      );
    }
  },
};

export default companyService;
