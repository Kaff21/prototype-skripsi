"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ModalRekapPresensi({ isOpen, onClose, kegiatan }) {
  const [rekapData, setRekapData] = useState([]);
  const [kegiatanInfo, setKegiatanInfo] = useState(null);
  const [totalHadir, setTotalHadir] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen && kegiatan?.id) {
      fetchRekap();
    }
    if (!isOpen) {
      setRekapData([]);
      setKegiatanInfo(null);
      setTotalHadir(0);
      setSearch("");
    }
  }, [isOpen, kegiatan?.id]);

  const fetchRekap = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/kegiatan/${kegiatan.id}/rekap-presensi`);
      if (res.data?.status === "sukses") {
        setRekapData(res.data.data || []);
        setKegiatanInfo(res.data.kegiatan || null);
        setTotalHadir(res.data.total_hadir || 0);
      }
    } catch (err) {
      console.error("Fetch rekap error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rekapData.filter(
    (r) =>
      r.nama?.toLowerCase().includes(search.toLowerCase()) ||
      r.nim?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600">groups</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 leading-tight">Rekapitulasi Kehadiran</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {kegiatan?.judul}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold animate-pulse text-sm">Memuat data kehadiran...</p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-black text-emerald-600">{totalHadir}</p>
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                    Total Hadir
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-black text-indigo-600">
                    {kegiatanInfo?.date_start
                      ? new Date(kegiatanInfo.date_start).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })
                      : "-"}
                  </p>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                    Tanggal
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                  <p className="text-sm font-black text-amber-600 truncate px-1">
                    {kegiatanInfo?.location || "-"}
                  </p>
                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mt-1">
                    Lokasi
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari nama, NIM, atau email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium text-slate-700 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              {/* Table Data */}
              {filtered.length > 0 ? (
                <div className="space-y-2">
                  {filtered.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all group border border-transparent hover:border-emerald-100"
                    >
                      {/* Nomor */}
                      <div className="w-8 h-8 bg-slate-200 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                        <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-700">
                          {item.nomor || index + 1}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                        {item.avatar_url ? (
                          <img src={item.avatar_url} alt={item.nama} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-black text-indigo-500 uppercase">
                            {item.nama?.charAt(0) || "?"}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-xs truncate">{item.nama}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{item.nim}</span>
                          <span className="text-slate-200">•</span>
                          <span className="text-[10px] font-bold text-indigo-500">{item.posisi}</span>
                        </div>
                      </div>

                      {/* Waktu & Status */}
                      <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          {item.status || "Hadir"}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          {item.waktu_presensi
                            ? new Date(item.waktu_presensi).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}{" "}
                          WIB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-3xl text-slate-300">person_off</span>
                  </div>
                  <h4 className="font-black text-slate-600 text-sm mb-1">
                    {search ? "Tidak Ditemukan" : "Belum Ada Data"}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium max-w-xs">
                    {search
                      ? `Tidak ada peserta dengan kata kunci "${search}".`
                      : "Belum ada anggota yang melakukan presensi pada kegiatan ini."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50 rounded-b-[2.5rem]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Menampilkan {filtered.length} dari {rekapData.length} data
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
