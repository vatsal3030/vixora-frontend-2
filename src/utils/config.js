export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:10000/api/v1";

if (import.meta.env.PROD && API_BASE_URL.includes("localhost")) {
    console.warn("WARNING: Running in PROD mode but using localhost API URL. Ensure VITE_API_BASE_URL or VITE_API_URL is set in your environment.");
}
