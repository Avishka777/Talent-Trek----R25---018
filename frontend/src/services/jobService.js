import axios from "axios";

const jobService = {
  // Fetch All Jobs
  getAllJobs: async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}job`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to Fetch Jobs.",
        }
      );
    }
  },

  // Fetch Job By ID
  getJobById: async (jobId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}job/${jobId}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to Fetch Job Details",
        }
      );
    }
  },

  // Fetch Jobs Created By Specific User
  getJobsByUser: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}job/user/jobs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to Fetch User Jobs.",
        }
      );
    }
  },

  // Delete a job post
  deleteJob: async (jobId, token) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to Delete Job.",
        }
      );
    }
  },

  // Create a new job post
  createJob: async (jobData, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}job/create`,
        jobData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to Create Job.",
        }
      );
    }
  },

  //   // Update a job post
  //   updateJob: async (jobId, jobData, token) => {
  //     try {
  //       const response = await axios.put(
  //         `${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}`,
  //         jobData,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );
  //       return response.data;
  //     } catch (error) {
  //       throw (
  //         error.response?.data || {
  //           success: false,
  //           message: "Failed to update job",
  //         }
  //       );
  //     }
  //   },
};

export default jobService;
