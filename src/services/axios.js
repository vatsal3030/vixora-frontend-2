import axios from "axios";
import { API_BASE_URL } from "../utils/config";

// Create axios instance with base URL from env
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Critical for HTTP-only cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
            originalRequest._retry = true; // Mark as retried

            try {
                // Attempt to refresh token
                await axios.post(
                    `${API_BASE_URL}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login (unless we are already there)
                if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                    // Optional: Dispatch a logout event or clear local state if needed
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // Silence 401s and other sensitive network errors to avoid leaking backend details in console
        if (error.response?.status === 401) {
            return Promise.reject(error);
        }

        // Handle network errors (like ERR_CONNECTION_REFUSED) silently in production
        if (!error.response && !import.meta.env.DEV) {
            // Log a generic message without revealing internal URLs or config
            // console.warn('Network connection failed. Please check your internet.');
            return Promise.reject(new Error('Network Error'));
        }

        if (import.meta.env.DEV) {
            // Suppress detailed error logging to prevent accidental credential/URL exposure in screenshots
            // console.error('[API Error]:', error.message, error.config?.url);
        }

        return Promise.reject(error);
    }
);

export default api;
