"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

function OrgChartMember({ user }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-emerald-100 flex items-center justify-center font-black text-2xl text-emerald-600 uppercase group-hover:scale-110 transition-transform duration-300">
          {user.avatar_url
            ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            : user.full_name?.charAt(0)
          }
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
      </div>
      <div className="text-center">
        <p className="font-black text-slate-800 text-xs leading-tight truncate max-w-[80px]">{user.full_name}</p>
        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{user.posisi || "Anggota"}</p>
      </div>
    </div>
  );
}

export default function PembinaView({ data }) {
  const stats = data || {};
  const [members, setMembers] = useState([]);
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  useEffect(() => {
    axios.get(API_BASE_URL + "/api/users/aktif")
      .then(r => {
        const allUsers = r.data || [];
        const filtered = allUsers.filter(m => m.organization_id === user.organization_id);
        setMembers(filtered);
      })
      .catch(() => {});
  }, []);

  const admins = members.filter(m => m.role === "admin_ukm");
  const pengurus = members.filter(m => m.posisi && m.posisi !== "" && m.role !== "admin_ukm");
  const anggota = members.filter(m => m.role === "anggota" && (!m.posisi || m.posisi === ""));

  return (
    <div className="space-y-8 text-left">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 p-8 md:p-10 rounded-3xl text-white shadow-xl">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-200 mb-3 block">Pembina Organisasi</span>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-3">{stats.org_name || "Organisasi"}</h1>
            <p className="text-emerald-100 text-sm font-medium">Pantau perkembangan dan aktivitas organisasi yang Anda bina.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black">{members.length}</p>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mt-1">Total Anggota</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-yellow-300">{stats.active_events || 0}</p>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mt-1">Kegiatan Aktif</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-emerald-200">{stats.kegiatan_selesai || 0}</p>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mt-1">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "groups", label: "Total Anggota", value: members.length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: "campaign", label: "Kegiatan Aktif", value: stats.active_events || 0, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: "task_alt", label: "Kegiatan Selesai", value: stats.kegiatan_selesai || 0, color: "text-teal-600", bg: "bg-teal-50" },
          { icon: "account_balance_wallet", label: "Serapan Anggaran", value: `Rp ${Number(stats.anggaran_terpakai || 0).toLocaleString('id-ID')}`, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`p-3 ${s.bg} w-fit rounded-2xl mb-3`}>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-xl font-black text-slate-800">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* STRUKTUR KEPENGURUSAN - Read Only untuk Pembina */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-500">account_tree</span>
          Struktur Kepengurusan
        </h3>

        {members.length === 0 ? (
          <p className="text-center text-slate-400 py-10 text-sm">Belum ada anggota aktif.</p>
        ) : (
          <div className="space-y-8">
            {admins.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 bg-emerald-50 px-4 py-1.5 rounded-full">Pengurus Inti</div>
                <div className="flex flex-wrap justify-center gap-6">
                  {admins.map(m => <OrgChartMember key={m.id} user={m} />)}
                </div>
                <div className="w-px h-8 bg-slate-200 mt-4"></div>
              </div>
            )}
            {pengurus.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-4 bg-teal-50 px-4 py-1.5 rounded-full">Divisi & Pengurus</div>
                <div className="flex flex-wrap justify-center gap-6">
                  {pengurus.map(m => <OrgChartMember key={m.id} user={m} />)}
                </div>
                {anggota.length > 0 && <div className="w-px h-8 bg-slate-200 mt-4"></div>}
              </div>
            )}
            {anggota.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 bg-slate-100 px-4 py-1.5 rounded-full">Anggota Aktif ({anggota.length})</div>
                <div className="flex flex-wrap justify-center gap-4">
                  {anggota.slice(0, 12).map(m => <OrgChartMember key={m.id} user={m} />)}
                  {anggota.length > 12 && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center font-black text-slate-400 text-sm">+{anggota.length - 12}</div>
                      <p className="text-[9px] font-bold text-slate-400">Lainnya</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
