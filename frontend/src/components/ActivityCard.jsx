"use client";
import API_BASE_URL from "@/utils/api";
import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getTheme } from '@/utils/theme';
import AlertDialog, { useAlert } from '@/components/Alert';

export default function ActivityCard({ id, judul, deskripsi, orgName, tanggal, lokasi, status, image, isPublished, onRefresh, onEdit, isAdmin }) {
  const [theme, setTheme] = useState(getTheme("bg-indigo-600"));
  const { alertState, showAlert, handleClose } = useAlert();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const savedTheme = user?.color_theme || user?.org_theme;
    if (savedTheme) setTheme(getTheme(savedTheme));
  }, []);

  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Berjalan': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Akan Datang': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.patch(`${API_BASE_URL}/api/kegiatan/${id}/status-pelaksanaan`, { status: newStatus });
      if (onRefresh) onRefresh();
    } catch (error) {
      await showAlert({ type: "error", title: "Gagal!", message: "Gagal merubah status kegiatan. Coba lagi." });
    }
  };

  const handleDelete = async () => {
    const confirmed = await showAlert({
      type: "confirm",
      title: "Hapus Kegiatan?",
      message: `Kegiatan "${judul}" akan dihapus permanen dan tidak bisa dikembalikan.`,
    });
    if (confirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/kegiatan/${id}`);
        await showAlert({ type: "success", title: "Berhasil Dihapus!", message: `Kegiatan "${judul}" telah dihapus.` });
        if (onRefresh) onRefresh();
      } catch (error) {
        await showAlert({ type: "error", title: "Gagal!", message: "Gagal menghapus kegiatan. Coba lagi." });
      }
    }
  };

  const handleDownloadQR = async () => {
    const canvas = document.getElementById(`qr-canvas-${id}`);
    if (!canvas) {
      await showAlert({ type: "warning", title: "QR Belum Siap", message: "Sistem sedang menyiapkan QR, coba klik sekali lagi." });
      return;
    }
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Absensi_${judul.replace(/\s+/g, '_')}.png`; 
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <div className={`group bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col p-3 relative hover:${theme.border}`}>

        {isAdmin && (
          <div className="absolute top-6 left-6 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit({ id, judul, deskripsi, tanggal, lokasi, status, image })} className={`bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg ${theme.text} hover:bg-white active:scale-90 transition-all`}>
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <button onClick={handleDelete} className="bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg text-rose-600 hover:bg-white active:scale-90 transition-all">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        )}

        <div className="h-48 relative overflow-hidden rounded-[1.5rem] bg-slate-100">
          <img alt={judul} src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          
          {/* DROPDOWN STATUS */}
          <div className="absolute top-3 right-3">
            {isAdmin && isPublished ? (
              <select 
                value={status}
                onChange={handleStatusChange}
                className={`${getBadgeStyle(status)} px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm border outline-none cursor-pointer hover:brightness-95 transition-all`}
              >
                <option value="Akan Datang">Akan Datang</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Selesai">Selesai</option>
              </select>
            ) : (
              <span className={`${getBadgeStyle(status)} px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm border`}>
                {status}
              </span>
            )}
          </div>

          {/* LABEL ORMAWA */}
          {orgName && (
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">
              {orgName}
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 line-clamp-2">{judul}</h3>
          <p className="text-xs text-slate-500 line-clamp-2 mb-4">{deskripsi || "Tidak ada deskripsi tersedia untuk kegiatan ini."}</p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
              <span className={`material-symbols-outlined text-[18px] ${theme.text}`}>calendar_today</span>
              <span>{tanggal}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
              <span className={`material-symbols-outlined text-[18px] ${theme.text}`}>location_on</span>
              <span>{lokasi}</span>
            </div>
          </div>

          <div className="hidden">
             <QRCodeCanvas id={`qr-canvas-${id}`} value={`ABSENSI_${id}`} size={500} />
          </div>

          <button onClick={handleDownloadQR} className={`mt-auto w-full ${theme.bg} text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${theme.hover} active:scale-95 transition-all shadow-md ${theme.shadow}`}>
            <span className="material-symbols-outlined text-[16px]">download</span>
            Unduh QR Absensi
          </button>
        </div>
      </div>

      {/* Custom Alert Dialog */}
      <AlertDialog alertState={alertState} onClose={handleClose} />
    </>
  );
}
