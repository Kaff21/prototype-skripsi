"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ManajemenAkun() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE_URL + "/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(API_BASE_URL + "/api/organizations");
      setOrganizations(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data organisasi:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  const filteredUsers = users.filter((user) => {
    const name = user.full_name || ""; 
    const email = user.email || "";
    const nim = user.nim || "";
    const orgName = user.organizations?.name || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orgName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleEditClick = (user) => {
    setEditData(user);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/api/users/${editData.id}`, {
        full_name: editData.full_name,
        nim: editData.nim,
        email: editData.email,
        role: editData.role,
        status: editData.status,
        posisi: editData.posisi,
        organization_id: editData.organization_id === "" ? null : editData.organization_id
      });
      alert("Data berhasil diperbarui!");
      setIsEditModalOpen(false);
      fetchUsers(); 
    } catch (error) {
      alert("Gagal memperbarui data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, nama) => {
    const konfirmasi = confirm(`PERINGATAN: Yakin ingin menendang/menghapus akun atas nama ${nama}? Tindakan ini tidak bisa dibatalkan.`);
    if (!konfirmasi) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`);
      alert(`Akun ${nama} berhasil dihapus dari sistem!`);
      fetchUsers(); 
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert("Gagal menghapus akun. Pastikan server backend menyala.");
    }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-50 text-purple-600';
      case 'admin_ukm': return 'bg-indigo-50 text-indigo-600';
      case 'bem': return 'bg-blue-50 text-blue-600';
      case 'kemahasiswaan': return 'bg-amber-50 text-amber-600';
      case 'pembina': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    // 🚨 KUNCI PERBAIKAN ABSOLUT: Mengubah wadah menjadi grid col 1 dengan min-w-0
    // Ini memaksa browser mengunci lebar maksimal mengikuti ukuran layar HP, tidak peduli selebar apa isi tabelnya.
    <div className="grid grid-cols-1 gap-6 w-full min-w-0 max-w-[100vw] md:max-w-full">
      
      {/* HEADER & SEARCH */}
      <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 w-full min-w-0">
        <div className="text-center md:text-left w-full">
          <h2 className="text-xl font-black text-slate-900">Manajemen Akun</h2>
          <p className="text-xs text-slate-500">Kelola pengguna SIM-ORMAWA</p>
        </div>
        
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            placeholder="Cari nama, email, NIM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
        </div>
      </div>

      {/* WADAH TABEL */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm w-full min-w-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center animate-pulse text-indigo-500 font-semibold text-sm">Memuat data user...</div>
        ) : (
          // 🚨 KUNCI KEDUA: Wadah tabel diberikan display block murni dengan batas w-full
          <div className="w-full overflow-x-auto block">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <th className="p-4 md:p-5">User</th>
                  <th className="p-4 md:p-5">NIM</th>
                  <th className="p-4 md:p-5">Organisasi Terkait</th>
                  <th className="p-4 md:p-5">Role</th>
                  <th className="p-4 md:p-5">Status</th>
                  <th className="p-4 md:p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 md:p-5 whitespace-nowrap">
                      <p className="text-slate-900 font-bold">{user.full_name || "Tanpa Nama"}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </td>
                    <td className="p-4 md:p-5 text-slate-600 whitespace-nowrap">{user.nim || "-"}</td>
                    
                    <td className="p-4 md:p-5 whitespace-nowrap">
                      {user.organizations?.name ? (
                        <span className="text-slate-700 font-bold text-xs">{user.organizations.name}</span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Tidak terikat</span>
                      )}
                    </td>

                    <td className="p-4 md:p-5 whitespace-nowrap">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleStyle(user.role)}`}>
                         {user.role?.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="p-4 md:p-5 whitespace-nowrap">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         user.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 
                         user.status === 'ditolak' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                         {user.status}
                       </span>
                    </td>
                    <td className="p-4 md:p-5 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(user)}
                          title="Edit Data"
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.full_name)}
                          title="Hapus Akun"
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredUsers.length === 0 && !loading && (
          <div className="p-10 text-center text-slate-400 text-sm italic">User tidak ditemukan.</div>
        )}
      </div>

      {/* MODAL EDIT */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Edit Data Pengguna</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                  <input type="text" value={editData.full_name || ""} onChange={(e) => setEditData({...editData, full_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" required />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">NIM</label>
                    <input type="text" value={editData.nim || ""} onChange={(e) => setEditData({...editData, nim: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Posisi</label>
                    <input type="text" value={editData.posisi || ""} onChange={(e) => setEditData({...editData, posisi: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Contoh: Ketua" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Organisasi Terkait</label>
                  <select 
                    value={editData.organization_id || ""} 
                    onChange={(e) => setEditData({...editData, organization_id: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  >
                    <option value="">-- Tidak Terikat --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Role Akun</label>
                    <select value={editData.role || "anggota"} onChange={(e) => setEditData({...editData, role: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                      <option value="anggota">Anggota</option>
                      <option value="admin_ukm">Admin UKM</option>
                      <option value="bem">BEM</option>
                      <option value="kemahasiswaan">Kemahasiswaan</option>
                      <option value="pembina">Pembina UKM</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Status Akun</label>
                    <select value={editData.status || "pending"} onChange={(e) => setEditData({...editData, status: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                      <option value="aktif">Aktif</option>
                      <option value="pending">Pending</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200">Batal</button>
                  <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
