let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Proteksi otomatis: Jika ENV tidak ada atau masih menyimpan domain Railway lama, paksa ganti ke Vercel backend
if (!API_BASE_URL || API_BASE_URL.includes('railway.app')) {
    API_BASE_URL = "https://prototype-skripsi-backend.vercel.app";
}

// Pastikan selalu menggunakan protokol http:// atau https://
if (API_BASE_URL && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
    API_BASE_URL = 'https://' + API_BASE_URL;
}

if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export default API_BASE_URL;
