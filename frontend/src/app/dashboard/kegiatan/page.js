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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Kegiatan</h1>
          <p className="text-slate-400 text-sm font-medium">Kelola agenda dan absensi QR anggota</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          {/* Tambahkan overflow-x-auto dan hilangkan scrollbar agar bisa digeser di HP */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto hide-scrollbar w-full sm:w-auto">
            {["Semua", "Akan Datang", "Berjalan", "Selesai"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterStatus === status 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button 
              onClick={() => { setSelectedEdit(null); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              + Kegiatan
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Memuat data...</div>
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
                
                // 🚨 KUNCI PERBAIKAN: 3 Baris ini yang sebelumnya hilang!
                deskripsi={kegiatan.description} 
                orgName={kegiatan.organizations?.name || kegiatan.organizations?.initial} 
                isPublished={kegiatan.is_published} 

                onRefresh={fetchActivities}
                onEdit={isAdmin ? handleOpenEdit : null} 
                isAdmin={isAdmin}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic">Tidak ada kegiatan dengan status "{filterStatus}"</p>
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
