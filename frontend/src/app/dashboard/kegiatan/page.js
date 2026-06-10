"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";
import ActivityCard from "@/components/ActivityCard";
import ModalTambahKegiatan from "@/components/ModalTambahKegiatan";

export default function KegiatanPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEdit, setSelectedEdit] = useState(null);
  
  const [userRole, setUserRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole((storedUser.role || "").toLowerCase().trim());

      // 🚨 PERBAIKAN: Kirim role agar backend tahu siapa yang request
      const res = await axios.get(`${API_BASE_URL}/api/kegiatan?org_id=${storedUser.organization_id}&role=${storedUser.role}`);
      setActivities(res.data || []);
    } catch (error) {
      console.error("Error fetching:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // 🚨 CEK APAKAH ADMIN ATAU BUKAN (BEM SEKARANG TERMASUK ADMIN)
  const isAdmin = userRole === 'superadmin' || userRole === 'admin' || userRole === 'admin_ukm' || userRole === 'bem';

  const filteredActivities = filterStatus === "Semua" 
    ? activities 
    : activities.filter(item => item.status === filterStatus);

  const handleOpenEdit = (data) => {
    setSelectedEdit(data);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8">
      {/* Header Section (Menyatu dengan background, tidak pakai kotak putih besar) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">event_note</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Manajemen Kegiatan</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium ml-[52px] md:ml-0">Kelola seluruh agenda, proposal, dan absensi QR anggota.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto max-w-full overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto hide-scrollbar w-full sm:w-auto">
            {["Semua", "Akan Datang", "Berjalan", "Selesai"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  filterStatus === status 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Add Button */}
          {isAdmin && (
            <button 
              onClick={() => { setSelectedEdit(null); setIsModalOpen(true); }}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 transition-all duration-300 active:scale-95 w-full sm:w-auto shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Buat Kegiatan
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse">Memuat data kegiatan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((kegiatan) => (
              <ActivityCard 
                key={kegiatan.id}
                id={kegiatan.id}
                judul={kegiatan.title}
                tanggal={kegiatan.date_start}
                lokasi={kegiatan.location}
                status={kegiatan.status}
                image={kegiatan.image_url}
                
                deskripsi={kegiatan.description} 
                orgName={kegiatan.organizations?.name || kegiatan.organizations?.initial} 
                isPublished={kegiatan.is_published} 

                onRefresh={fetchActivities}
                onEdit={isAdmin ? handleOpenEdit : null} 
                isAdmin={isAdmin}
              />
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="material-symbols-outlined text-5xl text-slate-300">event_busy</span>
              </div>
              <h3 className="text-xl font-black text-slate-700 mb-2">Belum Ada Kegiatan</h3>
              <p className="text-slate-500 font-medium text-center max-w-sm">
                {filterStatus === "Semua" 
                  ? "Organisasi Anda belum memiliki agenda kegiatan sama sekali. Yuk, buat kegiatan pertama Anda!"
                  : `Tidak ada kegiatan yang ditemukan dengan status "${filterStatus}".`}
              </p>
              {isAdmin && filterStatus === "Semua" && (
                <button 
                  onClick={() => { setSelectedEdit(null); setIsModalOpen(true); }}
                  className="mt-6 text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Buat Kegiatan Sekarang
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <ModalTambahKegiatan 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedEdit(null); }} 
          onSuccess={fetchActivities}
          editData={selectedEdit} 
        />
      )}
    </div>
  );
}
