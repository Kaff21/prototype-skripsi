/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 🚨 KUNCI UTAMA: Menghasilkan folder 'out' saat build
  images: {
    unoptimized: true, // 🚨 Diperlukan karena Next.js Image Optimization tidak berjalan di WebView HP
  },
  // Konfigurasi lainnya...
};

export default nextConfig;
