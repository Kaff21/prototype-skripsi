"use client";

export default function PembinaView({ data }) {
  const stats = data || {};

  return (
    <div className="p-4 md:p-8 space-y-8 text-left">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none mb-2">
            Dashboard Pembina
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Monitoring & Evaluasi {stats.org_name || "Organisasi Mahasiswa"}
          </p>
        </div>
        <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
          <span className="material-symbols-outlined text-3xl">monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Mahasiswa Aktif</h3>
          <p className="text-3xl font-black text-slate-800">{stats.total_anggota || 0}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Proposal Butuh ACC</h3>
          <p className="text-3xl font-black text-amber-500">{stats.proposal_menunggu || 0}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Kegiatan Sukses</h3>
          <p className="text-3xl font-black text-emerald-500">{stats.kegiatan_selesai || 0}</p>
        </div>
      </div>
    </div>
  );
}