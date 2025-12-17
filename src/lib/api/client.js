import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Attach additional headers here if needed (e.g., auth tokens from cookies)
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error shape
    const err = error?.response?.data || { error: error.message };
    return Promise.reject(err);
  }
);

export default apiClient;
