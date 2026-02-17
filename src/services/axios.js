import axios from "axios";

// Create axios instance with base URL from env
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:10000/api/v1",
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
                    `${import.meta.env.VITE_API_URL || "http://localhost:10000/api/v1"}/users/refresh-token`,
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

        // Suppress console error for 401s to avoid leaking "Unauthorized" spam
        if (error.response?.status === 401) {
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;
