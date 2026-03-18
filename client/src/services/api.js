import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If the error response implies an unauthorized token (and we setup refresh in the future), we could handle it here.
    return Promise.reject(error.response?.data?.message || error.message || 'An error occurred');
  }
);

export default api;
