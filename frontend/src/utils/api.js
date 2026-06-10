/**
 * Titik pusat konfigurasi URL API.
 * Saat development: http://localhost:5000
 * Saat production (Vercel): URL Railway dari environment variable NEXT_PUBLIC_API_URL
 */
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export default API_BASE_URL;

