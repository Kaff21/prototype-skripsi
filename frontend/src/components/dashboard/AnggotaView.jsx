import API_BASE_URL from "@/utils/api";
"use client";
import { useState, useEffect } from "react";
import axios from "axios";

function OrgChartMember({ user, isCurrentUser }) {
  return (
    <div className={`flex flex-col items-center gap-2 cursor-pointer group`}>
      <div className="relative">
        <div className={`w-16 h-16 rounded-full border-4 shadow-md overflow-hidden flex items-center justify-center font-black text-2xl uppercase group-hover:scale-110 transition-transform duration-300 ${isCurrentUser ? "border-indigo-400 bg-indigo-100 text-indigo-600" : "border-white bg-slate-100 text-slate-500"}`}>
          {user.avatar_url
            ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            : user.full_name?.charAt(0)
          }
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
        {isCurrentUser && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-black">●</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`font-black text-xs leading-tight truncate max-w-[80px] ${isCurrentUser ? "text-indigo-700" : "text-slate-800"}`}>{user.full_name}</p>
        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">{user.posisi || "Anggota"}</p>
        {isCurrentUser && <p className="text-[8px] font-black text-indigo-400">▲ Anda</p>}
      </div>
    </div>
  );
}

export default function AnggotaView({ data }) {
  const [members, setMembers] = useState([]);
  const [orgData, setOrgData] = useState(null);
  const [kontribusi, setKontribusi] = useState([]);
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  useEffect(() => {
    if (!user.organization_id) return;

    // Ambil data org
    axios.get(`${API_BASE_URL}/api/organizations/${user.organization_id}`).then(r => setOrgData(r.data)).catch(() => {});
    // Ambil anggota aktif dari org yang sama
    axios.get(API_BASE_URL + "/api/users/aktif").then(r => {
      const all = r.data || [];
      setMembers(all.filter(m => m.organization_id === user.organization_id));
    }).catch(() => {});
    // Ambil riwayat kontribusi
    if (user.id) {
      axios.get(`${API_BASE_URL}/api/users/contributions/${user.id}`).then(r => setKontribusi((r.data || []).slice(0, 5))).catch(() => {});
    }
  }, []);

  const admins = members.filter(m => m.role === "admin_ukm");
  const pengurus = members.filter(m => m.posisi && m.posisi !== "" && m.role !== "admin_ukm");
  const anggotaBiasa = members.filter(m => m.role === "anggota" && (!m.posisi || m.posisi === ""));

  return (
    <div className="space-y-8 text-left">
      {/* HERO BANNER - Dinamis sesuai org */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 p-8 md:p-10 rounded-3xl text-white shadow-xl">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 left-20 w-24 h-24 bg-white/5 rounded-full"></div>
        <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[10rem] opacity-10">hub</span>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {orgData?.logo_url ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
                <img src={orgData.logo_url} alt={orgData.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center font-black text-2xl">
                {orgData?.initial || "?"}
              </div>
            )}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200 mb-2 block">Profil Organisasi Saya</span>
              <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">{orgData?.name || "Memuat..."}</h1>
              <p className="text-indigo-200 text-xs font-medium mt-2 max-w-sm line-clamp-2">{orgData?.description || ""}</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black">{members.length}</p>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mt-1">Anggota</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-black text-yellow-300">{kontribusi.length}</p>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mt-1">Kegiatan Saya</p>
            </div>
          </div>
        </div>
      </div>

      {/* VISI MISI */}
      {(orgData?.vision || orgData?.mission) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgData?.vision && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-indigo-500">visibility</span>
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Visi</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{orgData.vision}</p>
            </div>
          )}
          {orgData?.mission && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-rose-500">ads_click</span>
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Misi</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{orgData.mission}</p>
            </div>
          )}
        </div>
      )}

      {/* STRUKTUR KEPENGURUSAN + RIWAYAT KEGIATAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STRUKTUR ORG - 2/3 lebar */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">account_tree</span>
            Struktur Organisasi
          </h3>
          {members.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">Belum ada anggota aktif.</p>
          ) : (
            <div className="space-y-6">
              {admins.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 bg-indigo-50 px-4 py-1.5 rounded-full">Pengurus Inti</div>
                  <div className="flex flex-wrap justify-center gap-5">
                    {admins.map(m => <OrgChartMember key={m.id} user={m} isCurrentUser={m.id === user.id} />)}
                  </div>
                  <div className="w-px h-6 bg-slate-200 mt-4"></div>
                </div>
              )}
              {pengurus.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-4 bg-purple-50 px-4 py-1.5 rounded-full">Divisi</div>
                  <div className="flex flex-wrap justify-center gap-5">
                    {pengurus.map(m => <OrgChartMember key={m.id} user={m} isCurrentUser={m.id === user.id} />)}
                  </div>
                  {anggotaBiasa.length > 0 && <div className="w-px h-6 bg-slate-200 mt-4"></div>}
                </div>
              )}
              {anggotaBiasa.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 bg-slate-100 px-4 py-1.5 rounded-full">Anggota ({anggotaBiasa.length})</div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {anggotaBiasa.slice(0, 10).map(m => <OrgChartMember key={m.id} user={m} isCurrentUser={m.id === user.id} />)}
                    {anggotaBiasa.length > 10 && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center font-black text-slate-400 text-sm">+{anggotaBiasa.length - 10}</div>
                        <p className="text-[9px] font-bold text-slate-400">Lainnya</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIWAYAT KEGIATAN - 1/3 lebar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">event_available</span>
            Kegiatan Saya
          </h3>
          {kontribusi.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">event_busy</span>
              <p className="text-slate-400 text-sm font-medium">Belum ada riwayat kehadiran.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {kontribusi.map((k) => (
                <div key={k.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-xl flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">event</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{k.activities?.title || "Kegiatan"}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{k.activities?.location || ""}</p>
                    <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                      {k.activities?.date_start ? new Date(k.activities.date_start).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
