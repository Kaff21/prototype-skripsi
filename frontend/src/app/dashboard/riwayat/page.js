"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return;

      const res = await axios.get(`${API_BASE_URL}/api/users/contributions/${user.id}`);
      setRiwayat(res.data || []);
    } catch (err) {
      console.error("Error fetching riwayat:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = riwayat.filter((item) => {
    const matchSearch =
      !search ||
      item.activities?.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.activities?.location?.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === "Semua") return matchSearch;
    return matchSearch && (item.status || "Hadir") === filterStatus;
  });

  // Statistik
  const totalHadir = riwayat.length;
  const bulanIni = riwayat.filter((r) => {
    const d = new Date(r.check_in);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Group by bulan
  const groupedByMonth = {};
  filtered.forEach((item) => {
    const d = new Date(item.check_in);
    const key = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    if (!groupedByMonth[key]) groupedByMonth[key] = [];
    groupedByMonth[key].push(item);
  });

  return (
    <div className="space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined">history</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Riwayat Kehadiran</h1>
        </div>
        <p className="text-slate-500 text-sm font-medium ml-[52px] md:ml-0">
          Catatan lengkap semua presensi kegiatan yang pernah Anda hadiri.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-emerald-50 w-fit rounded-2xl mb-3">
            <span className="material-symbols-outlined text-emerald-600">event_available</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Hadir</p>
          <h3 className="text-2xl font-black text-slate-800">{totalHadir}</h3>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-indigo-50 w-fit rounded-2xl mb-3">
            <span className="material-symbols-outlined text-indigo-600">calendar_month</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bulan Ini</p>
          <h3 className="text-2xl font-black text-slate-800">{bulanIni}</h3>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-amber-50 w-fit rounded-2xl mb-3">
            <span className="material-symbols-outlined text-amber-600">trending_up</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kegiatan Diikuti</p>
          <h3 className="text-2xl font-black text-slate-800">
            {new Set(riwayat.map((r) => r.activities?.title)).size}
          </h3>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-rose-50 w-fit rounded-2xl mb-3">
            <span className="material-symbols-outlined text-rose-600">verified</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <h3 className="text-lg font-black text-emerald-600">Aktif</h3>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Cari kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium text-slate-700 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto hide-scrollbar">
          {["Semua", "Hadir"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterStatus === status
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse">Memuat riwayat kehadiran...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
          </div>
          <h3 className="text-lg font-black text-slate-700 mb-2">Belum Ada Riwayat</h3>
          <p className="text-slate-500 font-medium text-center max-w-sm text-sm">
            {search
              ? `Tidak ditemukan kegiatan dengan kata kunci "${search}".`
              : "Anda belum menghadiri kegiatan apapun. Mulai scan QR Code saat kegiatan berlangsung!"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByMonth).map(([bulan, items]) => (
            <div key={bulan} className="space-y-3">
              {/* Month Header */}
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                  {bulan}
                </div>
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[10px] font-bold text-slate-400">
                  {items.length} kegiatan
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="p-3 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex-shrink-0 transition-colors">
                        <span className="material-symbols-outlined text-emerald-600">event_available</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-sm truncate mb-1">
                          {item.activities?.title || "Kegiatan"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <span className="material-symbols-outlined text-[14px] text-indigo-400">calendar_today</span>
                            <span className="font-bold">
                              {item.activities?.date_start
                                ? new Date(item.activities.date_start).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </span>
                          </div>
                          {item.activities?.location && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <span className="material-symbols-outlined text-[14px] text-indigo-400">location_on</span>
                              <span className="font-bold">{item.activities.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Time */}
                      <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider mb-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Hadir
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          {item.check_in
                            ? new Date(item.check_in).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}{" "}
                          WIB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
