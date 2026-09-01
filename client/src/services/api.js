import axios from 'axios';

/**
 * Central API client for all backend communication.
 * 
 * WHY THIS FILE EXISTS:
 * Instead of writing `axios.get('http://localhost:5000/api/capsules')` 
 * in every component, we create ONE configured instance here.
 * Every component imports this and uses `api.get('/capsules')`.
 * 
 * Benefits:
 * - Base URL is set once (not repeated everywhere)
 * - Auth token is automatically attached to every request
 * - Token refresh is handled automatically when access token expires
 * - Error handling is centralized
 */

// const api = axios.create({
//   baseURL: '/api',           // Vite proxy forwards this to http://localhost:5000/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,      // Send cookies with every request (for refresh tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
// Runs before every request is sent to the backend
// Automatically attaches the JWT access token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
// Runs after every response comes back from the backend
// If we get a 401 (token expired), try to refresh the token automatically
api.interceptors.response.use(
  (response) => response, // Success - return response as-is
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (unauthorized) and we haven't already tried refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get a new access token using the refresh token (stored in cookies)
        const { data } = await axios.post('/api/auth/refresh');
        
        // Save the new access token
        localStorage.setItem('accessToken', data.accessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired - user must log in again
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
