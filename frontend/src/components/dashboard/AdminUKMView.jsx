"use client";

export default function AdminUKMView({ data }) {
  const stats = data || {};

  return (
    <div className="p-4 md:p-8 space-y-8 text-left">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none mb-2">
            Ruang Kerja Pengurus
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Kelola Agenda & Administrasi {stats.org_name || "Organisasi"}
          </p>
        </div>
        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
          <span className="material-symbols-outlined text-3xl">edit_document</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-indigo-500">campaign</span>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Kegiatan Aktif</p>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{stats.active_events || 0}</h3>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-emerald-500">account_balance_wallet</span>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Serapan Anggaran</p>
            </div>
            <h3 className="text-2xl font-black text-slate-800">Rp {Number(stats.anggaran_terpakai || 0).toLocaleString('id-ID')}</h3>
          </div>
        </div>

        <div className="bg-indigo-600 text-white border border-indigo-500 p-6 rounded-[2rem] shadow-md flex flex-col justify-center items-center text-center hover:bg-indigo-700 transition-all cursor-pointer active:scale-95">
          <span className="material-symbols-outlined text-5xl mb-3 text-indigo-200">add_circle</span>
          <h3 className="font-black text-lg">Buat Pengajuan</h3>
          <p className="text-xs font-medium text-indigo-200 mt-1">Rancang kegiatan baru</p>
        </div>
      </div>
    </div>
  );
}