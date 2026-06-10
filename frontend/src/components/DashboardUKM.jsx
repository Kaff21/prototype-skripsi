"use client";
import API_BASE_URL from "@/utils/api";
import { useEffect, useState } from "react";
import axios from "axios";
import { getTheme } from "@/utils/theme"; 
import Link from "next/link";

export default function DashboardUKM() {
  const [user, setUser] = useState(null);
  const [ukmDetail, setUkmDetail] = useState(null);
  const [stats, setStats] = useState({ ukm: 0, kegiatanPending: 0, kegiatanAktif: 0 });
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const savedTheme = storedUser?.color_theme || storedUser?.org_theme || "bg-indigo-600";
      return getTheme(savedTheme);
    }
    return getTheme("bg-indigo-600");
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);

        if (storedUser) {
          const savedTheme = storedUser.color_theme || storedUser.org_theme;
          if (savedTheme) setTheme(getTheme(savedTheme));
        }

        const isBirokrasi = ["superadmin", "bem", "kemahasiswaan", "pembina"].includes(storedUser?.role);

        // 🚨 JIKA BIROKRASI: Tarik data global
        if (isBirokrasi) {
          const [resOrg, resKegiatan] = await Promise.all([
             axios.get(API_BASE_URL + "/api/organizations"),
             axios.get(API_BASE_URL + "/api/kegiatan")
          ]);
          
          const pending = resKegiatan.data.filter(k => !k.is_published).length;
          const aktif = resKegiatan.data.filter(k => k.is_published).length;

          setStats({ ukm: resOrg.data.length, kegiatanPending: pending, kegiatanAktif: aktif });
        } 
        // 🚨 JIKA UKM: Tarik data spesifik organisasi
        else if (storedUser && storedUser.organization_id) {
          const res = await axios.get(`${API_BASE_URL}/api/organizations/${storedUser.organization_id}`);
          setUkmDetail(res.data);
          const currentTheme = res.data?.color_theme || res.data?.org_theme;
          if (currentTheme) setTheme(getTheme(currentTheme));
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-indigo-500 text-4xl">sync</span>
    </div>
  );

  const isBirokrasi = ["superadmin", "bem", "kemahasiswaan", "pembina"].includes(user?.role);

  // ===============================================
  // TAMPILAN DASHBOARD UNTUK BEM / KEMAHASISWAAN
  // ===============================================
  if (isBirokrasi) {
    return (
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className={`p-10 rounded-[3rem] text-white shadow-xl ${theme.bg} ${theme.shadow} relative overflow-hidden text-left`}>
          <div className="relative z-10">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Pusat Pantau Ormawa</h1>
            <p className="opacity-90 font-medium mt-2">Selamat Datang, {user?.full_name} ({user?.role?.replace('_', ' ')})!</p>
          </div>
          <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[12rem] opacity-10">monitoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-3xl">corporate_fare</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Ormawa</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.ukm}</h3>
            </div>
          </div>
          
          <Link href="/dashboard/birokrasi" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">pending_actions</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Menunggu ACC</p>
              <h3 className="text-3xl font-black text-amber-600">{stats.kegiatanPending}</h3>
            </div>
          </Link>

          <Link href="/dashboard/kegiatan" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">event_available</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Kegiatan Terbit</p>
              <h3 className="text-3xl font-black text-emerald-600">{stats.kegiatanAktif}</h3>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // ===============================================
  // TAMPILAN DASHBOARD UNTUK ADMIN UKM / ANGGOTA
  // ===============================================
  if (!ukmDetail) return <div className="p-10 text-center">Data UKM tidak ditemukan.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className={`p-10 rounded-[3rem] text-white shadow-xl ${theme.bg} ${theme.shadow} relative overflow-hidden text-left`}>
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">{ukmDetail.name}</h1>
          <p className="opacity-90 font-medium mt-2">Selamat Datang, {user?.full_name}!</p>
        </div>
        <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[12rem] opacity-10">hub</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className={`w-14 h-14 ${theme.light} rounded-2xl flex items-center justify-center ${theme.text}`}>
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Status Akses</p>
            <h3 className={`text-xl font-black uppercase italic ${theme.text}`}>{user?.role?.replace('_', ' ')}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
