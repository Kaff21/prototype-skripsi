"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

export default function BirokrasiKegiatanPage() {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
      
      const roleStr = (storedUser.role || "").toLowerCase().trim();
      const orgId = storedUser.organization_id || "null";
      
      let url = `${API_BASE_URL}/api/kegiatan?role=${roleStr}&org_id=${orgId}`;
      
      const res = await axios.get(url);
      setKegiatan(res.data || []);
    } catch (error) {
      console.error("Error fetching birokrasi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, status) => {
    let catatan = "";
    if (status === "revisi") {
      catatan = window.prompt("Masukkan catatan revisi agar UKM tahu apa yang harus diperbaiki:");
      if (!catatan) {
        alert("Catatan revisi wajib diisi!");
        return; 
      }
    }

    // 🚨 FIX UTAMA: Menampung kemungkinan salah ketik (typo) di database
    const roleMap = {
      bem: "bem",
      kemahasiswaan: "kemahasiswaan",
      kemasiswaan: "kemahasiswaan", // Jika database typo tanpa 'ha', tetap dibaca benar
      pembina: "pembina",
      superadmin: "kemahasiswaan"
    };

    const currentRole = (user?.role || "").toLowerCase().trim();
    const roleApprover = roleMap[currentRole];
    
    // Alert pintar untuk melacak kalau ada role yang aneh
    if (!roleApprover) {
      alert(`GAGAL ACC: Sistem mendeteksi role Anda sebagai "${currentRole}". Role ini tidak dikenali sebagai pihak birokrasi.`);
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/api/kegiatan/${id}/persetujuan`, {
        roleApprover,
        status,
        catatan_revisi: catatan
      });
      alert(`Proposal berhasil di-${status}!`);
      fetchData();
    } catch (error) {
      alert("Gagal memproses persetujuan.");
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">ACC</span>;
    if (status === 'revisi') return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Revisi</span>;
    return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Pending</span>;
  };

  const pendingList = kegiatan.filter(k => !k.is_published);
  const publishedList = kegiatan.filter(k => k.is_published);
  const displayList = activeTab === "pending" ? pendingList : publishedList;

  // Kebal terhadap typo 'kemasiswaan'
  const allowedRoles = ["bem", "kemahasiswaan", "kemasiswaan", "pembina", "superadmin"];
  const isApprover = allowedRoles.includes((user?.role || "").toLowerCase().trim());

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left">
        <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none mb-2">Birokrasi & Proposal</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          {isApprover ? "Review dan setujui proposal kegiatan Ormawa" : "Pantau status pengajuan proposal kegiatan Anda"}
        </p>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 w-fit rounded-2xl">
        <button 
          onClick={() => setActiveTab("pending")} 
          className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "pending" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          Proses Pengajuan ({pendingList.length})
        </button>
        <button 
          onClick={() => setActiveTab("published")} 
          className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "published" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          Sudah Terbit / ACC ({publishedList.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Memuat Data...</div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
          <p className="text-slate-400 font-bold italic text-sm">
            {activeTab === "pending" ? "Tidak ada proposal yang menunggu persetujuan." : "Belum ada kegiatan yang resmi diterbitkan."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {displayList.map((item) => {
            const currentRole = (user?.role || "").toLowerCase().trim();
            const canSeeButtons = isApprover && (
              ["bem", "kemahasiswaan", "kemasiswaan", "superadmin"].includes(currentRole) || 
              (currentRole === "pembina" && item.organization_id === user?.organization_id)
            );

            return (
              <div key={item.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col lg:flex-row gap-6 hover:shadow-lg transition-all">
                
                <div className="flex-1 space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{item.title}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Anggaran: Rp {Number(item.anggaran || 0).toLocaleString('id-ID')}</p>
                    </div>
                    {item.is_published && (
                      <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm shadow-emerald-100">
                        LIVE / TERBIT
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {item.date_start}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg"><span className="material-symbols-outlined text-[16px]">schedule</span> {item.waktu || "-"}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg"><span className="material-symbols-outlined text-[16px]">location_on</span> {item.location}</span>
                  </div>

                  {item.proposal_url ? (
                    <a href={item.proposal_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all">
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> Lihat Dokumen Proposal
                    </a>
                  ) : (
                    <span className="text-rose-500 text-xs font-bold italic">Proposal belum dilampirkan</span>
                  )}

                  {item.catatan_revisi && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl mt-4">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Catatan Revisi Terakhir:</p>
                      <p className="text-sm font-medium text-rose-700">{item.catatan_revisi}</p>
                    </div>
                  )}
                </div>

                <div className="lg:w-72 bg-slate-50 p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-3 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3 text-left">Status Persetujuan</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">BEM</span>
                      {getStatusBadge(item.status_bem)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">Kemahasiswaan</span>
                      {getStatusBadge(item.status_kemahasiswaan)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">Pembina UKM</span>
                      {getStatusBadge(item.status_pembina)}
                    </div>
                  </div>

                  {canSeeButtons && !item.is_published && (
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => handleAction(item.id, 'revisi')} className="bg-white border border-rose-200 text-rose-600 py-2 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all">
                        Revisi
                      </button>
                      <button onClick={() => handleAction(item.id, 'approved')} className="bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-200 hover:bg-emerald-600 transition-all">
                        Setujui
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
