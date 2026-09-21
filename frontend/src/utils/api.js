let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://prototype-skripsi-backend.vercel.app";
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export default API_BASE_URL;
