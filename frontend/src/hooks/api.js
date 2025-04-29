import axios from 'axios';

// Create an instance of axios
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});


export default API;
