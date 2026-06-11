"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";
import AlertDialog, { useAlert } from "@/components/Alert";
import ProfileView from "@/components/ProfileView";

export default function AnggotaAktif() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [userOrgId, setUserOrgId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { alertState, showAlert, handleClose } = useAlert();

  useEffect(() => {
    const fetchAnggota = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const role = (storedUser.role || "").toLowerCase().trim();
        setUserRole(role);
        setUserOrgId(storedUser.organization_id);

        const response = await axios.get(API_BASE_URL + "/api/users/aktif");
        setAnggotaList(response.data || []);
      } catch (error) {
        console.error("Gagal mengambil data anggota:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnggota();
  }, []);

  // Logika Filter: Superadmin lihat semua, Admin UKM / Bem lihat org-nya sendiri
  const dataTersaring = (userRole === "superadmin" || userRole === "bem")
    ? anggotaList 
    : anggotaList.filter(item => item.organization_id === userOrgId);

  const hapusAnggota = async (id, nama) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: "Keluarkan Anggota?",
      message: `${nama} akan dikeluarkan dari daftar anggota aktif.`,
    });
    if (!confirmed) return;

    try {
      await axios.patch(`${API_BASE_URL}/api/users/${id}/status`, { status: 'pending' });
      setAnggotaList(prev => prev.filter(a => a.id !== id));
      await showAlert({ type: "success", title: "Berhasil!", message: `${nama} telah dikeluarkan dari anggota aktif.` });
    } catch (error) {
      await showAlert({ type: "error", title: "Gagal!", message: "Gagal mengeluarkan anggota. Coba lagi." });
      console.error(error);
    }
  };

  if (selectedUser) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-bold text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Daftar Anggota
            </button>
          </div>
          
          <ProfileView 
            userProfile={selectedUser} 
            isOwnProfile={false} 
          />
        </div>
        <AlertDialog alertState={alertState} onClose={handleClose} />
      </>
    );
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Anggota Aktif</h2>
            <p className="text-slate-500 text-sm mt-1">
              Direktori pengurus dan anggota <strong>{(userRole === 'superadmin' || userRole === 'bem') ? 'Seluruh Organisasi' : 'Organisasi Anda'}</strong>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Memuat anggota...</div>
        ) : dataTersaring.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-400 font-bold">Belum ada anggota aktif.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dataTersaring.map((anggota) => (
              <div 
                key={anggota.id} 
                onClick={() => setSelectedUser(anggota)}
                className="bg-white cursor-pointer rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden"
              >
                
                {/* Label Organisasi (Muncul khusus Superadmin) */}
                {(userRole === "superadmin" || userRole === "bem") && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider z-10">
                    {anggota.organizations?.initial || anggota.organizations?.name || "BEM"}
                  </span>
                )}

                {/* Tombol Aksi (Hanya muncul jika Admin/Superadmin) */}
                {(userRole === "superadmin" || userRole === "admin_ukm") && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); hapusAnggota(anggota.id, anggota.full_name); }}
                    title="Keluarkan Anggota"
                    className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <span className="material-symbols-outlined text-sm">person_remove</span>
                  </button>
                )}

                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-50 mb-4 shadow-sm overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-2xl text-slate-400 uppercase">
                    {anggota.avatar_url ? (
                       <img src={anggota.avatar_url} alt={anggota.full_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                       anggota.full_name?.charAt(0) || "U"
                    )}
                  </div>
                  {/* INDIKATOR ONLINE (Hijau) */}
                  <div className="absolute bottom-5 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg leading-tight truncate w-full px-2 mb-1 group-hover:text-indigo-600 transition-colors">{anggota.full_name}</h3>
                <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                  {anggota.role === 'admin_ukm' ? 'Admin UKM' : (anggota.posisi || anggota.role)}
                </p>
                
                <div className="w-full flex items-center justify-center gap-2 text-slate-500 bg-slate-50 py-2 rounded-lg mt-auto group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Lihat Profil</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog alertState={alertState} onClose={handleClose} />
    </>
  );
}
