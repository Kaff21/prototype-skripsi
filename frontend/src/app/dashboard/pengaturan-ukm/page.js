"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PengaturanUKM from "@/components/PengaturanUKM";

export default function PengaturanUKMPage() {
  const [ukmData, setUkmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gunakan useCallback untuk membungkus fungsi fetch
  // Ini menghilangkan error "React Hook useEffect has a missing dependency"
  const fetchMyUKM = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ambil data user dari localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("Sesi berakhir, silakan login kembali.");
        return;
      }

      const user = JSON.parse(storedUser);
      
      // Pastikan organization_id tersedia
      if (user && user.organization_id) {
        // Tambahkan timestamp (?t=) untuk membunuh cache browser
        const res = await axios.get(
          `http://localhost:5000/api/organizations/${user.organization_id}?t=${new Date().getTime()}`
        );
        setUkmData(res.data);
      } else {
        setError("Akun Anda tidak terhubung dengan organisasi manapun.");
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Data organisasi tidak ditemukan. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect sekarang aman karena fetchMyUKM sudah dibungkus useCallback
  useEffect(() => {
    fetchMyUKM();
  }, [fetchMyUKM]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Menghubungkan ke Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-red-50 border border-red-100 p-10 rounded-[3rem] inline-block max-w-lg">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">info</span>
          <h2 className="text-red-600 font-black uppercase italic text-xl mb-2">Akses Ditolak / Tidak Ditemukan</h2>
          <p className="text-red-400 font-bold text-sm leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
          >
            Coba Sinkronkan Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${ukmData?.color_theme || 'bg-slate-900'} rounded-2xl shadow-xl flex items-center justify-center text-white font-black italic text-xl`}>
                {ukmData?.initial || "UKM"}
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                    Pengaturan Profil organisasi
                </h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tersambung ke {ukmData?.name}
                </p>
            </div>
        </div>
      </header>

      {/* Komponen Form Pengaturan dengan prop onRefresh */}
      {ukmData && <PengaturanUKM data={ukmData} onRefresh={fetchMyUKM} />}
    </div>
  );
}