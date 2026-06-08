"use client";
import { useState } from "react";

export default function AnggotaAktif({ userRole, userOrg }) {
  // Data simulasi anggota yang sudah aktif
  const [anggotaList, setAnggotaList] = useState([
    { id: 1, nama: "Fillah", jabatan: "Ketua", email: "fillah@bem.com", org: "BEM", foto: "https://i.pravatar.cc/150?u=1" },
    { id: 2, nama: "Siti Rahma", jabatan: "Sekretaris", email: "siti@bem.com", org: "BEM", foto: "https://i.pravatar.cc/150?u=2" },
    { id: 3, nama: "Bagas", jabatan: "Ketua Divisi", email: "bagas@mapaswangi.com", org: "Mapaswangi", foto: "https://i.pravatar.cc/150?u=3" },
    { id: 4, nama: "Citra", jabatan: "Anggota", email: "citra@mapaswangi.com", org: "Mapaswangi", foto: "https://i.pravatar.cc/150?u=4" },
    { id: 5, nama: "Deni", jabatan: "Ketua", email: "deni@sms.com", org: "SMS", foto: "https://i.pravatar.cc/150?u=5" },
    { id: 6, nama: "Rina", jabatan: "Anggota", email: "rina@sms.com", org: "SMS", foto: "https://i.pravatar.cc/150?u=6" },
  ]);

  // Logika Filter: Superadmin lihat semua, yang lain lihat org-nya sendiri
  const dataTersaring = userRole === "superadmin" 
    ? anggotaList 
    : anggotaList.filter(item => item.org === userOrg);

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Anggota Aktif</h2>
          <p className="text-slate-500 text-sm mt-1">
            Direktori pengurus dan anggota <strong>{userRole === 'superadmin' ? 'Seluruh Organisasi' : userOrg}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dataTersaring.map((anggota) => (
          <div key={anggota.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Label Organisasi (Muncul khusus Superadmin) */}
            {userRole === "superadmin" && (
              <span className="absolute top-3 left-3 px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                {anggota.org}
              </span>
            )}

            {/* Tombol Aksi (Hanya muncul jika Admin/Superadmin) */}
            {(userRole === "superadmin" || userRole === "admin") && (
              <button className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                <span className="material-symbols-outlined text-sm">person_remove</span>
              </button>
            )}

            <div className="w-20 h-20 rounded-full border-4 border-slate-50 mb-4 shadow-sm overflow-hidden bg-slate-200">
              <img src={anggota.foto} alt={anggota.nama} className="w-full h-full object-cover" />
            </div>
            
            <h3 className="font-bold text-slate-800 text-lg">{anggota.nama}</h3>
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">{anggota.jabatan}</p>
            
            <div className="w-full flex items-center justify-center gap-2 text-slate-500 bg-slate-50 py-2 rounded-lg mt-2">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span className="text-xs">{anggota.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}