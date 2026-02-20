export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
        return path;
    }

    // Get base URL from env, ensuring no trailing slash
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:10000/api/v1").replace(/\/api\/v1\/?$/, '');

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};

// Quality Preference Persistence
const QUALITY_PREF_KEY = 'vixora_video_quality_pref';

export const getStoredQuality = () => {
    try {
        return localStorage.getItem(QUALITY_PREF_KEY) || 'auto';
    } catch {
        return 'auto';
    }
};

export const setStoredQuality = (quality) => {
    try {
        localStorage.setItem(QUALITY_PREF_KEY, quality);
    } catch (err) {
        console.error('[Storage] Failed to save quality preference:', err);
    }
};
