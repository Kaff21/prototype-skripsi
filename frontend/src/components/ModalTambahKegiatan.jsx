"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ModalTambahKegiatan({ isOpen, onClose, onSuccess, editData }) {
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    tanggal: "",
    waktu: "",
    lokasi: "",
    anggaran: "",
    status: "Akan Datang" // Default status
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [proposalFile, setProposalFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        judul: editData.judul || editData.title || "",
        deskripsi: editData.deskripsi || editData.description || "",
        tanggal: editData.tanggal || editData.date_start || "",
        waktu: editData.waktu || "",
        lokasi: editData.lokasi || editData.location || "",
        anggaran: editData.anggaran || "",
        status: editData.status || "Akan Datang", // 🚨 Tangkap status saat diedit
      });
    } else {
      setForm({ judul: "", deskripsi: "", tanggal: "", waktu: "", lokasi: "", anggaran: "", status: "Akan Datang" });
    }
    setImageFile(null);
    setProposalFile(null);
  }, [editData, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const formData = new FormData();
      formData.append("judul", form.judul);
      formData.append("deskripsi", form.deskripsi);
      formData.append("tanggal", form.tanggal);
      formData.append("waktu", form.waktu);
      formData.append("lokasi", form.lokasi);
      formData.append("anggaran", form.anggaran);
      formData.append("status", form.status); // 🚨 Kirim status ke backend
      formData.append("organization_id", user.organization_id);
      
      if (imageFile) formData.append("image", imageFile);

      let kegiatanId = editData?.id;

      if (editData) {
        await axios.put(`http://localhost:5000/api/kegiatan/update/${kegiatanId}`, formData);
      } else {
        const res = await axios.post("http://localhost:5000/api/kegiatan/tambah", formData);
        kegiatanId = res.data.data.id; 
      }

      if (proposalFile && kegiatanId) {
        const proposalData = new FormData();
        proposalData.append("proposal", proposalFile);
        await axios.post(`http://localhost:5000/api/kegiatan/${kegiatanId}/upload-proposal`, proposalData);
      }

      alert(editData ? "Kegiatan berhasil diupdate!" : "Kegiatan dan Proposal berhasil ditambahkan & sedang menunggu persetujuan!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menyimpan kegiatan atau proposal.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {editData ? "Edit Kegiatan" : "Buat Kegiatan Baru"}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {!editData && "Proposal akan diajukan ke BEM, Kemahasiswaan, dan Pembina"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan</label>
            <input required type="text" name="judul" value={form.judul} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Mulai</label>
              <input required type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-700 font-medium" />
            </div>
            
            {/* 🚨 DROPDOWN STATUS (HANYA MUNCUL SAAT MODE EDIT) */}
            {editData ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Status Pelaksanaan</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-2xl outline-none text-indigo-700 font-bold">
                  <option value="Akan Datang">Akan Datang</option>
                  <option value="Berjalan">Berjalan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waktu (Jam)</label>
                <input required type="text" name="waktu" value={form.waktu} onChange={handleChange} placeholder="08:00 - 12:00" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-700 font-medium" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi</label>
              <input required type="text" name="lokasi" value={form.lokasi} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-700 font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anggaran (Rp)</label>
              <input type="number" name="anggaran" value={form.anggaran} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-700 font-medium" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi & Tujuan Kegiatan</label>
            <textarea required name="deskripsi" value={form.deskripsi} onChange={handleChange} rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-700 text-sm"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Poster / Cover</label>
              <div className="border-2 border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50 text-center">
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Proposal (PDF)</label>
              <div className="border-2 border-dashed border-rose-200 p-4 rounded-2xl bg-rose-50 text-center">
                <input type="file" accept="application/pdf" onChange={(e) => setProposalFile(e.target.files[0])} required={!editData} className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-rose-100 file:text-rose-700" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-sm">Batal</button>
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all text-sm flex items-center gap-2">
              {loading ? "Menyimpan..." : "Simpan & Ajukan Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}