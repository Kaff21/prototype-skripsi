"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";

function StatCard({ icon, label, value, color, bgColor, trend }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-2xl`}>
          <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
        </div>
        {trend && (
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">{trend}</span>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
  );
}

export default function SuperAdminView({ data }) {
  const stats = data || {};
  const [orgs, setOrgs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    axios.get(API_BASE_URL + "/api/organizations").then(r => setOrgs(r.data || [])).catch(() => {});
    axios.get(API_BASE_URL + "/api/users/aktif").then(r => setRecentUsers((r.data || []).slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="space-y-8 text-left">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-10 rounded-3xl text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300 mb-3 block">Sistem Informasi Manajemen</span>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">
              Superadmin<br/>Console
            </h1>
            <p className="text-slate-400 text-sm font-medium max-w-md">
              Pantau seluruh ekosistem organisasi mahasiswa kampus secara real-time.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-white">{stats.total_orgs || 0}</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Organisasi</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-emerald-400">{stats.total_users || 0}</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Anggota Aktif</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-amber-400">{stats.menunggu_persetujuan || 0}</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Menunggu ACC</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIK CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="group" label="Total Pengguna Aktif" value={stats.total_users || 0} color="text-indigo-600" bgColor="bg-indigo-50" trend="Aktif" />
        <StatCard icon="corporate_fare" label="Organisasi Terdaftar" value={stats.total_orgs || 0} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard icon="event_note" label="Total Kegiatan" value={stats.total_activities || 0} color="text-rose-600" bgColor="bg-rose-50" />
        <StatCard icon="pending_actions" label="Menunggu Persetujuan" value={stats.menunggu_persetujuan || 0} color="text-amber-600" bgColor="bg-amber-50" />
      </div>

      {/* DAFTAR ORGANISASI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">corporate_fare</span>
            Daftar Organisasi
          </h3>
          {orgs.length === 0 ? (
            <p className="text-slate-400 text-sm">Memuat data...</p>
          ) : (
            <div className="space-y-3">
              {orgs.map((org, i) => (
                <div key={org.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm overflow-hidden">
                    {org.logo_url ? <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" /> : org.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{org.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{org.initial}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ANGGOTA AKTIF TERBARU */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">group</span>
            Anggota Aktif Terbaru
          </h3>
          {recentUsers.length === 0 ? (
            <p className="text-slate-400 text-sm">Memuat data...</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm uppercase overflow-hidden">
                    {u.avatar_url ? <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" /> : u.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{u.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{u.role}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
