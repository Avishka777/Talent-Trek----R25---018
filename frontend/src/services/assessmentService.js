import axios from "axios";

const assessmentService = {
    startAssessment: async (jobId, job, token) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}assessment/start`,
                { jobId, job },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: "Failed to start assessment" };
        }
    },

    submitPuzzleResult: async (assessmentId, movements, timeTakenSeconds, token) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}assessment/submit-puzzle`,
                { assessmentId, movements, timeTakenSeconds },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: "Failed to submit puzzle result" };
        }
    },

    submitMCQResult: async (assessmentId, questionSetId, answers, timeTakenSeconds, token) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}assessment/submit-mcq`,
                { assessmentId, questionSetId, answers, timeTakenSeconds },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: "Failed to submit MCQ result" };
        }
    },


    getMCQQuestions: async (assessmentId, questionSetId, token) => {
        if (!questionSetId) {
            throw { success: false, message: "questionSetId is required" };
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}assessment/mcq-questions/${assessmentId}/${questionSetId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: "Failed to fetch MCQ questions" };
        }
    },

    // fetch questions by assessment or questionSet
    fetchMCQQuestions: async (assessmentId, token) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}assessment/${assessmentId}/questions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data; // { questions: [...], skipToPuzzle: true/false }
        } catch (error) {
            throw error.response?.data || { success: false, message: "Failed to fetch assessment questions" };
        }
    },

    // NEW: Get MCQ Review for completed assessment
    getMCQReview: async (assessmentId, token) => {
        if (!assessmentId) {
            throw { success: false, message: "assessmentId is required" };
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}assessment/review-mcq/${assessmentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: "Failed to fetch MCQ review" };
        }
    },


};



export default assessmentService;
