"use client";

export default function SuperAdminView({ data }) {
  const stats = data || {};

  return (
    <div className="p-4 md:p-8 space-y-8 text-left">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic leading-none mb-2">
            Superadmin Console
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Manajemen Global SIM-ORMAWA
          </p>
        </div>
        <div className="p-3 bg-slate-800 text-emerald-400 rounded-2xl border border-slate-700">
          <span className="material-symbols-outlined text-3xl">dns</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-slate-100 text-slate-600 rounded-2xl">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pengguna</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total_users || 0}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <span className="material-symbols-outlined">corporate_fare</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organisasi Terdaftar</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total_orgs || 0}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kegiatan Data</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total_activities || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}