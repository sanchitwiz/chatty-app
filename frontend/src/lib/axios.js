import axios from 'axios';

// Create an Axios instance with default settings
export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:8001/api" : "/api",
    withCredentials: true,
});