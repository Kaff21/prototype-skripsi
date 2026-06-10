"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);

  const [formData, setFormData] = useState({
    full_name: "",
    nim: "",
    email: "",
    password: "",
    organization_id: "",
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get(API_BASE_URL + "/api/organizations");
        setOrganizations(res.data);
      } catch (err) {
        console.error("Gagal mengambil data organisasi");
      }
    };
    fetchOrgs();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Log ini akan muncul di Console Browser (F12) untuk memastikan data ada
    console.log("Data siap kirim:", formData);

    try {
      await axios.post(API_BASE_URL + "/api/register", formData);
      alert("Pendaftaran berhasil! Silakan login.");
      router.push("/auth/login");
    } catch (err) {
      alert(err.response?.data?.error || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 mb-2 text-center tracking-tight">Daftar SIM-ORMAWA</h1>
        <p className="text-center text-slate-500 text-sm mb-8 font-medium">Lengkapi data diri mahasiswa</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.full_name} // Tambahkan value agar data terikat sempurna
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIM</label>
            <input
              type="text"
              required
              value={formData.nim} // Tambahkan value agar data terikat sempurna
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Organisasi</label>
            <select
              required
              value={formData.organization_id} // Tambahkan value agar data terikat sempurna
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
              onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
            >
              <option value="">Pilih Ormawa...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Kampus</label>
            <input
              type="email"
              required
              value={formData.email}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
            <input
              type="password"
              required
              value={formData.password}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Sudah punya akun? <Link href="/auth/login" className="text-indigo-600 font-bold">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
