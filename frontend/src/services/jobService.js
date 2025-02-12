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
          message: "Failed to fetch jobs",
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
          message: "Failed to fetch job details",
        }
      );
    }
  },

//   // Fetch jobs created by a specific user
//   getJobsByUser: async (userId, token) => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_BASE_URL}/jobs/user/${userId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       throw (
//         error.response?.data || {
//           success: false,
//           message: "Failed to fetch user jobs",
//         }
//       );
//     }
//   },

//   // Create a new job post
//   createJob: async (jobData, token) => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_API_BASE_URL}/jobs`,
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
//           message: "Failed to create job",
//         }
//       );
//     }
//   },

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

//   // Delete a job post
//   deleteJob: async (jobId, token) => {
//     try {
//       const response = await axios.delete(
//         `${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       throw (
//         error.response?.data || {
//           success: false,
//           message: "Failed to delete job",
//         }
//       );
//     }
//   },
};

export default jobService;
