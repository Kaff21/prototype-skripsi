"use client";
import { useState } from "react";
import axios from "axios";

export default function PengaturanUKM({ data, onRefresh }) {
  // Form state mengambil data dari database
  const [form, setForm] = useState({
    id: data?.id,
    name: data?.name || "",
    initial: data?.initial || "",
    color_theme: data?.color_theme || "bg-indigo-600", // 🚨 Ini yang akan masuk ke DB
    description: data?.description || "",
    history: data?.history || "",
    vision: data?.vision || "",
    mission: data?.mission || "",
    logo_url: data?.logo_url || ""
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🚨 OPSI WARNA SEDERHANA (Tinggal klik, tidak perlu ngetik)
  const colorOptions = [
    { name: "Biru Nila (Bawaan)", value: "bg-indigo-600" },
    { name: "Biru Laut", value: "bg-blue-600" },
    { name: "Merah Ruby", value: "bg-rose-600" },
    { name: "Hijau Zamrud", value: "bg-emerald-600" },
    { name: "Kuning Emas", value: "bg-amber-500" },
    { name: "Hitam Elegan", value: "bg-slate-800" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    setUploading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/organizations/${form.id}/upload-logo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setForm((prev) => ({ ...prev, logo_url: res.data.url }));
      alert("Logo berhasil diunggah!");
    } catch (err) {
      alert("Gagal mengunggah logo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.id) {
      alert("Error: ID Organisasi tidak ditemukan!");
      return;
    }

    setSaving(true);
    try {
      // 1. Simpan ke Database (Supabase)
      await axios.put(`${API_BASE_URL}/api/organizations/${form.id}`, form);

      // 2. Update LocalStorage agar Sidebar dan komponen lain tahu warna baru
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser) {
        // Simpan warna ke memori browser
        currentUser.org_theme = form.color_theme;
        currentUser.color_theme = form.color_theme;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      alert("Pengaturan UKM dan Warna Tema berhasil disimpan!");

      // 3. Refresh layar otomatis agar warna baru langsung teraplikasi
      window.location.reload();

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Gagal menyimpan pengaturan: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8 animate-in fade-in duration-500">

      {/* IDENTITAS & LOGO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Organisasi</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inisial / Singkatan</label>
            <input name="initial" value={form.initial} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Organisasi</label>
          <div className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border border-white shadow-sm" />
            ) : (
              <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">image</span>
              </div>
            )}
            <div className="flex-1">
              <input type="file" onChange={handleLogoUpload} accept="image/*" className="hidden" id="logo-input" disabled={uploading} />
              <label htmlFor="logo-input" className="cursor-pointer bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 block text-center transition-all">
                {uploading ? "Mengunggah..." : "Ganti Gambar Logo"}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 WARNA TEMA (Opsi Tombol) */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Tema Organisasi</label>
        <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-slate-200 rounded-3xl">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              // Set state form.color_theme saat diklik
              onClick={() => setForm({ ...form, color_theme: color.value })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${form.color_theme === color.value
                  ? `ring-2 ring-offset-2 ring-slate-300 shadow-md ${color.value} text-white`
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"
                }`}
            >
              <div className={`w-4 h-4 rounded-full ${color.value} ${form.color_theme === color.value ? 'border border-white/50' : ''}`}></div>
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* DESKRIPSI & SEJARAH */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="2" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm text-slate-700" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sejarah Organisasi</label>
          <textarea name="history" value={form.history} onChange={handleChange} rows="4" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm text-slate-700" />
        </div>
      </div>

      {/* VISI & MISI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visi</label>
          <textarea name="vision" value={form.vision} onChange={handleChange} rows="4" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm text-slate-700" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Misi</label>
          <textarea name="mission" value={form.mission} onChange={handleChange} rows="4" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm text-slate-700" />
        </div>
      </div>

      {/* TOMBOL SIMPAN */}
      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={saving || uploading} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">{saving ? 'sync' : 'save'}</span>
          {saving ? "Menyimpan..." : "Simpan Perubahan Organisasi"}
        </button>
      </div>
    </div>
  );
}
