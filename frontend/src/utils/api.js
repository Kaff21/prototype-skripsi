/**
 * Titik pusat konfigurasi URL API.
 * Saat development: http://localhost:5000
 * Saat production (Vercel): URL Railway dari environment variable NEXT_PUBLIC_API_URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default API_BASE_URL;

