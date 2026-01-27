export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    // If it's already a full URL, return it
    if (path.startsWith('http')) {
        return path;
    }

    // Get API base URL from env
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    // Fallback for development if env is missing
    const defaultUrl = 'http://localhost:8000/api';

    const baseUrl = apiBaseUrl || defaultUrl;

    // Remove '/api' from the end to get the server base URL
    const serverBaseUrl = baseUrl.replace(/\/api$/, '');

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    const fullUrl = `${serverBaseUrl}${cleanPath}`;

    // Log for debugging in production (only if image fails to load often)
    // console.log(`Image URL constructed: ${fullUrl} from path: ${path}`);

    return fullUrl;
};
