export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    // If it's already a full URL, return it
    if (path.startsWith('http')) {
        return path;
    }

    // Get API base URL from env
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    // Remove '/api' from the end to get the server base URL
    const serverBaseUrl = apiBaseUrl.replace(/\/api$/, '');

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${serverBaseUrl}${cleanPath}`;
};
