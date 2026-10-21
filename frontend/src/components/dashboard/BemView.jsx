"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

function OrgChartMember({ user }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-indigo-100 flex items-center justify-center font-black text-2xl text-indigo-600 uppercase group-hover:scale-110 transition-transform duration-300">
          {user.avatar_url
            ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            : user.full_name?.charAt(0)
          }
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
      </div>
      <div className="text-center">
        <p className="font-black text-slate-800 text-xs leading-tight truncate max-w-[80px]">{user.full_name}</p>
        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">{user.posisi || "Anggota"}</p>
        <p className="text-[8px] text-slate-400 truncate max-w-[80px]">{user.organizations?.initial || ""}</p>
      </div>
    </div>
  );
}

export default function BemView({ data }) {
  const stats = data || {};
  const [allMembers, setAllMembers] = useState([]);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    axios.get(API_BASE_URL + "/api/users/aktif").then(r => setAllMembers(r.data || [])).catch(() => {});
    axios.get(API_BASE_URL + "/api/organizations").then(r => setOrgs(r.data || [])).catch(() => {});
  }, []);

  const admins = allMembers.filter(m => m.role === "admin_ukm");
  const pengurusBerPosisi = allMembers.filter(m => m.posisi && m.posisi !== "");
  const anggotaBiasa = allMembers.filter(m => m.role === "anggota" && (!m.posisi || m.posisi === ""));

  return (
    <div className="space-y-8 text-left">
      {/* HERO BANNER BEM */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 p-8 md:p-10 rounded-3xl text-white shadow-xl">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-200 mb-3 block">Badan Eksekutif Mahasiswa</span>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">Pusat Kendali<br/>Birokrasi</h1>
            <p className="text-amber-100 text-sm font-medium max-w-md">Awasi seluruh kegiatan dan koordinasi antar UKM di bawah naungan BEM.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black">{stats.total_users || 0}</p>
              <p className="text-[10px] font-bold text-amber-200 uppercase tracking-wider mt-1">Total Anggota</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-yellow-300">{stats.total_pending || 0}</p>
              <p className="text-[10px] font-bold text-amber-200 uppercase tracking-wider mt-1">Proposal Pending</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-emerald-300">{stats.total_approved || 0}</p>
              <p className="text-[10px] font-bold text-amber-200 uppercase tracking-wider mt-1">Kegiatan ACC</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "corporate_fare", label: "Jumlah UKM", value: stats.total_orgs || 0, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: "group", label: "Total Anggota", value: stats.total_users || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: "pending_actions", label: "Proposal Pending", value: stats.total_pending || 0, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: "task_alt", label: "Kegiatan Tersetujui", value: stats.total_approved || 0, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`p-3 ${s.bg} w-fit rounded-2xl mb-3`}>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* STRUKTUR KESELURUHAN ANGGOTA */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">account_tree</span>
          Peta Keanggotaan Seluruh Organisasi
        </h3>

        {/* Kelompokkan berdasar Org */}
        {orgs.length === 0 ? (
          <p className="text-center text-slate-400 py-10 text-sm">Memuat data...</p>
        ) : (
          <div className="space-y-8">
            {orgs.map(org => {
              const orgMembers = allMembers.filter(m => m.organization_id === org.id);
              if (orgMembers.length === 0) return null;
              const orgAdmins = orgMembers.filter(m => m.role === "admin_ukm");
              const orgPengurus = orgMembers.filter(m => m.posisi && m.posisi !== "" && m.role !== "admin_ukm");
              const orgAnggota = orgMembers.filter(m => !m.posisi && m.role === "anggota");
              return (
                <div key={org.id} className="border border-slate-100 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm overflow-hidden">
                      {org.logo_url ? <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" /> : org.initial}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{org.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{orgMembers.length} anggota aktif</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {orgAdmins.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-3">Pengurus Inti</p>
                        <div className="flex flex-wrap gap-4"><br/>
                          {orgAdmins.map(m => <OrgChartMember key={m.id} user={m} />)}
                        </div>
                      </div>
                    )}
                    {orgPengurus.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-3">Divisi</p>
                        <div className="flex flex-wrap gap-4">
                          {orgPengurus.map(m => <OrgChartMember key={m.id} user={m} />)}
                        </div>
                      </div>
                    )}
                    {orgAnggota.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Anggota ({orgAnggota.length})</p>
                        <div className="flex flex-wrap gap-3">
                          {orgAnggota.slice(0,8).map(m => <OrgChartMember key={m.id} user={m} />)}
                          {orgAnggota.length > 8 && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-black">+{orgAnggota.length - 8}</div>
                              <p className="text-[8px] text-slate-400">lainnya</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
