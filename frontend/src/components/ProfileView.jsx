"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ProfileView({ userProfile, isOwnProfile, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [contributions, setContributions] = useState([]); // 🚨 State untuk kontribusi
  const fileInputRef = useRef(null);

  const [editData, setEditData] = useState({
    bio: userProfile?.bio || "",
  });

  // 🚨 AMBIL DATA KONTRIBUSI DARI BACKEND
  useEffect(() => {
    const fetchContributions = async () => {
      if (!userProfile?.id) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/contributions/${userProfile.id}`);
        setContributions(res.data);
      } catch (err) {
        console.error("Gagal memuat kontribusi:", err);
      }
    };
    fetchContributions();
  }, [userProfile?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/api/users/${userProfile.id}`, {
        bio: editData.bio
      });

      alert("Perubahan profil berhasil disimpan!");
      setIsEditing(false);

      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      alert("Terjadi kesalahan saat menyimpan data profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await axios.put(`${API_BASE_URL}/api/users/${userProfile.id}/upload-avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Foto profil berhasil diubah!");
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error("Gagal upload:", error);
      alert("Gagal mengupload foto.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-24">
        <div className="h-40 md:h-52 w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl shadow-lg"></div>
        
        <div className="absolute -bottom-16 left-6 md:left-10 flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6">
          
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-2xl relative group">
            <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 relative">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl md:text-6xl font-black text-indigo-300 uppercase">
                  {userProfile?.full_name?.charAt(0) || "U"}
                </span>
              )}

              {isOwnProfile && (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                >
                  <span className="material-symbols-outlined text-white text-3xl mb-1">
                    {isUploading ? 'hourglass_empty' : 'photo_camera'}
                  </span>
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest text-center px-2">
                    {isUploading ? 'Mengupload...' : 'Ganti Foto'}
                  </span>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUploadAvatar} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg" 
            />
          </div>
          
          <div className="mb-2 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {userProfile?.full_name || "Nama Pengguna"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">
                {userProfile?.role?.replace('_', ' ') || "Anggota"}
              </span>
              
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${userProfile?.status === 'aktif' || userProfile?.status === 'active' ? 'bg-emerald-50 text-emerald-600' : userProfile?.status === 'ditolak' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                Status: {userProfile?.status || "Pending"}
              </span>

              <span className="text-sm text-slate-500 font-medium">
                • {userProfile?.nim || "NIM Tidak Terdaftar"}
              </span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="absolute -bottom-10 right-6">
            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">{isSaving ? 'sync' : 'save'}</span>
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profil
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Informasi</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 p-2 rounded-lg">corporate_fare</span>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Organisasi</p>
                  <p className="text-sm font-bold text-slate-700">{userProfile?.org_name || 'BEM STIKOM'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-2 rounded-lg">badge</span>
                <div className="w-full">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Posisi</p>
                  <p className="text-sm font-bold text-slate-700">{userProfile?.posisi || 'Belum diatur'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-500 bg-rose-50 p-2 rounded-lg">alternate_email</span>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Email Kampus</p>
                  <p className="text-sm font-bold text-slate-700">{userProfile?.email || 'email@stikom.edu'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Tentang Saya</h3>
            {isEditing ? (
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                rows="4"
                placeholder="Ceritakan sedikit tentang dirimu..."
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              ></textarea>
            ) : (
              <p className="text-slate-600 leading-relaxed text-sm md:text-base italic whitespace-pre-wrap">
                {userProfile?.bio || "Mahasiswa ini belum menuliskan bio."}
              </p>
            )}
          </div>

          {/* 🚨 TAMPILAN KONTRIBUSI KEGIATAN */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Kontribusi Terakhir</h3>
            {contributions.length > 0 ? (
              <div className="space-y-4">
                {contributions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{item.activities?.title || 'Kegiatan Organisasi'}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {item.activities?.location || 'Lokasi Terjadwal'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg uppercase tracking-wider">
                        Hadir
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 mt-2">
                        {new Date(item.check_in).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Belum ada aktivitas.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
