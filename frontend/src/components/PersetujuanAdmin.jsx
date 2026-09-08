"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";
import AlertDialog, { useAlert } from "@/components/Alert";

export default function PersetujuanAdmin() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { alertState, showAlert, handleClose } = useAlert();

  const fetchPendingUsers = async (user, isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_BASE_URL}/api/users/pending?t=${timestamp}`);
      let data = response.data;
      if (user?.role === "admin_ukm") {
        data = data.filter(pendaftar => pendaftar.organization_id === user.organization_id);
      }
      setPendingUsers(data);
    } catch (error) {
      console.error("Gagal mengambil data pendaftar:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    fetchPendingUsers(user, false);
    const intervalId = setInterval(() => {
      fetchPendingUsers(user, true);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAction = async (id, nama, aksiStatus) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: aksiStatus === 'aktif' ? `Terima Pendaftar?` : `Tolak Pendaftar?`,
      message: `${aksiStatus === 'aktif' ? 'Terima' : 'Tolak'} pendaftaran atas nama "${nama}"?`,
    });
    if (!confirmed) return;

    try {
      await axios.patch(`${API_BASE_URL}/api/users/${id}/status`, { status: aksiStatus });
      await showAlert({
        type: "success",
        title: aksiStatus === 'aktif' ? "Pendaftar Diterima!" : "Pendaftar Ditolak!",
        message: `${nama} berhasil ${aksiStatus === 'aktif' ? 'diterima' : 'ditolak'}.`,
      });
      setPendingUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error("Gagal memproses:", error);
      const serverMsg = error.response?.data?.error || "Terjadi kesalahan";
      const debugId = error.response?.data?.debug_id_diterima;
      const debugStatus = error.response?.data?.debug_status_diterima;
      await showAlert({
        type: "error",
        title: "Gagal Diproses!",
        message: debugId ? `${serverMsg} (ID: ${debugId}, Status: ${debugStatus})` : `Gagal diproses: ${serverMsg}`,
      });
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-black text-2xl text-slate-800 tracking-tight">Persetujuan Mahasiswa Baru</h3>
          <p className="text-slate-500 text-sm mt-1">
            {currentUser?.role === "superadmin"
              ? "Pantau semua pendaftar organisasi mahasiswa di kampus."
              : "Verifikasi pendaftar baru untuk UKM Anda."}
          </p>
        </div>

        {/* Indikator Auto-Sync Aktif */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-xs font-bold shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Sinkronisasi Otomatis Aktif
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 font-medium animate-pulse">
          Memuat data pendaftar...
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">inbox</span>
          <p className="text-slate-500 font-bold">Belum ada pendaftar baru</p>
          <p className="text-slate-400 text-xs mt-1">Data akan disinkronkan otomatis setiap 5 detik.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50 hover:bg-indigo-50/50 transition-colors rounded-3xl gap-4 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-lg shadow-inner">
                  {user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-lg leading-tight">{user.full_name}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    NIM: <span className="text-slate-600">{user.nim || "BELUM DIISI"}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleAction(user.id, user.full_name, 'aktif')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-200"
                >
                  Terima
                </button>

                <button
                  onClick={() => handleAction(user.id, user.full_name, 'ditolak')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 text-[11px] font-black rounded-xl uppercase tracking-widest transition-all"
                >
                  Tolak
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      <AlertDialog alertState={alertState} onClose={handleClose} />
    </div>
  );
}
