"use client";

export default function KemahasiswaanView({ data }) {
  const stats = data || {};

  return (
    <div className="p-4 md:p-8 space-y-8 text-left">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none mb-2">
            Dashboard Kemahasiswaan
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Pusat Pengawasan & Validasi Kegiatan Organisasi
          </p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <span className="material-symbols-outlined text-3xl">local_police</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menunggu Validasi</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total_pending || 0}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposal Disetujui</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total_approved || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm min-h-[300px]">
        <h3 className="font-black text-slate-800 text-base uppercase mb-4">Aktivitas Terkini</h3>
        <p className="text-sm text-slate-500 font-medium">Pantau kelancaran agenda kampus dan usulan dana kegiatan di sini.</p>
      </div>
    </div>
  );
}