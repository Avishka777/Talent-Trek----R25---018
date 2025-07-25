import API from './api';

const fetchAllJobs = async () => {
    try {
        const response = await API.get('/jobs');
        return response.data;
    } catch (error) {
        // Handle errors here or pass them up to the caller
        console.error('Failed to fetch jobs:', error.response);
        throw error;
    }
};

export { fetchAllJobs };
