"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";
import AlertDialog, { useAlert } from "@/components/Alert";

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

        {/* MODAL PROFIL PENGGUNA */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-600">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors bg-black/20 hover:bg-black/40 rounded-full p-1 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <div className="px-8 pb-8 pt-0 relative">
                <div className="relative -mt-12 flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center font-bold text-3xl text-slate-400 uppercase">
                    {selectedUser.avatar_url ? (
                       <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full object-cover" />
                    ) : (
                       selectedUser.full_name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="absolute bottom-1 right-[110px] sm:right-[130px] w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-slate-800">{selectedUser.full_name}</h3>
                  <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mt-1">
                    {selectedUser.role === 'admin_ukm' ? 'Admin UKM' : (selectedUser.posisi || selectedUser.role)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 font-medium">
                    {selectedUser.organizations?.name || "BEM (Sistem Pusat)"}
                  </p>
                </div>

                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-slate-400">mail</span>
                    <span className="font-medium truncate">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-slate-400">badge</span>
                    <span className="font-medium">NIM: {selectedUser.nim || "Tidak ada NIM"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-slate-400 mt-0.5">format_quote</span>
                    <p className="font-medium text-slate-500 italic text-xs leading-relaxed">
                      {selectedUser.bio ? `"${selectedUser.bio}"` : "Belum menuliskan bio apapun."}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog alertState={alertState} onClose={handleClose} />
    </>
  );
}
