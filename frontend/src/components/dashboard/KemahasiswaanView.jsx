"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

export default function KemahasiswaanView({ data }) {
  const stats = data || {};
  const [allMembers, setAllMembers] = useState([]);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    axios.get(API_BASE_URL + "/api/users/aktif").then(r => setAllMembers(r.data || [])).catch(() => {});
    axios.get(API_BASE_URL + "/api/organizations").then(r => setOrgs(r.data || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-8 text-left">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-700 to-green-700 p-8 md:p-10 rounded-3xl text-white shadow-xl">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-200 mb-3 block">Wakil Rektor / Kemahasiswaan</span>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">Pusat Pantau<br/>Kemahasiswaan</h1>
            <p className="text-teal-100 text-sm font-medium max-w-md">Pantau seluruh aktivitas organisasi mahasiswa secara komprehensif.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black">{stats.total_orgs || 0}</p>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-wider mt-1">Organisasi</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-yellow-300">{stats.total_users || 0}</p>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-wider mt-1">Total Anggota</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-emerald-200">{stats.total_activities || 0}</p>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-wider mt-1">Total Kegiatan</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "corporate_fare", label: "Jumlah UKM", value: stats.total_orgs || 0, color: "text-teal-600", bg: "bg-teal-50" },
          { icon: "group", label: "Total Anggota Aktif", value: stats.total_users || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: "event_note", label: "Total Kegiatan", value: stats.total_activities || 0, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: "pending_actions", label: "Menunggu Persetujuan", value: stats.menunggu_persetujuan || 0, color: "text-amber-600", bg: "bg-amber-50" },
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

      {/* RINGKASAN PER-ORGANISASI */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-500">account_tree</span>
          Ringkasan Setiap Organisasi
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map(org => {
            const orgMembers = allMembers.filter(m => m.organization_id === org.id);
            const adminCount = orgMembers.filter(m => m.role === "admin_ukm").length;
            const anggotaCount = orgMembers.filter(m => m.role === "anggota").length;
            return (
              <div key={org.id} className="border border-slate-100 rounded-2xl p-5 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-black text-white text-sm overflow-hidden flex-shrink-0">
                    {org.logo_url ? <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" /> : org.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{org.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <p className="text-[10px] text-slate-400 font-medium">Aktif</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-indigo-50 rounded-xl py-2">
                    <p className="font-black text-indigo-700 text-lg">{adminCount}</p>
                    <p className="text-[9px] text-indigo-400 font-bold uppercase">Pengurus</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl py-2">
                    <p className="font-black text-slate-700 text-lg">{anggotaCount}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Anggota</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
