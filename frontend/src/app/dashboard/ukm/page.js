"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ManajemenUKM() {
  const [daftarUKM, setDaftarUKM] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUKM, setNewUKM] = useState({ name: "", initial: "", color_theme: "bg-indigo-600" });

  const fetchUKM = async () => {
    try {
      // Pastikan port sesuai dengan yang sedang nyala (misal: 5000 atau 5001)
      const res = await axios.get(API_BASE_URL + "/api/organizations");
      setDaftarUKM(res.data);
    } catch (err) {
      console.error("Gagal load UKM", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUKM(); }, []);

  const handleAddUKM = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE_URL + "/api/organizations", newUKM);
      setShowModal(false);
      fetchUKM(); 
    } catch (err) { alert("Gagal menambah UKM"); }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus UKM ini? Anggota di dalamnya mungkin akan kehilangan akses.")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/organizations/${id}`);
        fetchUKM();
      } catch (err) { alert("Gagal menghapus UKM"); }
    }
  };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic text-slate-900 leading-none tracking-tighter">Manajemen UKM</h1>
          <p className="text-sm text-slate-500 font-medium mt-2">Kelola seluruh organisasi mahasiswa di sistem.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Tambah UKM Baru
        </button>
      </div>

      {/* GRID KARTU UKM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daftarUKM.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Belum ada data organisasi di database</p>
          </div>
        )}

        {daftarUKM.map((ukm) => {
          const orgLogo = ukm.logo_url;
          const orgInitial = ukm.initial;
          const orgName = ukm.name;
          const themeColor = ukm.color_theme || "bg-indigo-600";

          return (
            <div key={ukm.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between min-h-[280px]">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  
                  {/* LOGO */}
                  <div className={`w-16 h-16 ${themeColor} rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg overflow-hidden border-2 border-white`}>
                    {orgLogo ? (
                      <img 
                        src={orgLogo} 
                        alt={orgInitial || "Logo"} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-[10px] text-center p-1 uppercase">Link Error</span>'; }}
                      />
                    ) : (
                      <span className={`uppercase ${!orgInitial ? "text-[8px] text-white/50" : "text-xl"}`}>
                        {orgInitial || "NO LOGO"}
                      </span>
                    )}
                  </div>
                  
                  {/* TOMBOL DELETE */}
                  <button 
                    onClick={() => handleDelete(ukm.id)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>

                {/* NAMA UKM */}
                <h3 className={`text-lg font-black leading-tight mb-1 uppercase italic line-clamp-2 min-h-[3rem] ${!orgName ? "text-red-400 text-xs" : "text-slate-900"}`}>
                  {orgName || "⚠️ ERROR: NAMA KOSONG"}
                </h3>
                
                {/* INISIAL UKM */}
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${!orgInitial ? "text-red-400" : "text-slate-400"}`}>
                  {orgInitial || "⚠️ ERROR: INISIAL KOSONG"}
                </p>
                
                {/* STATUS */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <span className={`w-2 h-2 rounded-full ${orgName && orgInitial ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    {orgName && orgInitial ? "Status: Aktif" : "Data Tidak Valid"}
                  </span>
                </div>
              </div>

              {/* DEKORASI WARNA BACKGROUND */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${themeColor} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-all`}></div>
            </div>
          );
        })}
      </div>

      {/* MODAL TAMBAH UKM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl text-left">
            <h2 className="text-xl font-black uppercase italic mb-6 text-slate-900">Daftarkan UKM Baru</h2>
            <form onSubmit={handleAddUKM} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap UKM</label>
                <input 
                  placeholder="Contoh: Mahasiswa Pecinta Alam" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                  onChange={e => setNewUKM({...newUKM, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inisial / Singkatan</label>
                <input 
                  placeholder="Contoh: MAPALA" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all uppercase text-slate-900"
                  onChange={e => setNewUKM({...newUKM, initial: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-all uppercase text-[10px] tracking-widest">Batal</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
