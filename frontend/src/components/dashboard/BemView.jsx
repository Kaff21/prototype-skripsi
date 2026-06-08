"use client";

// Terima props 'data' yang dikirim dari page.js utama
export default function BemView({ data }) {
  
  // Berikan nilai default agar UI tidak crash jika data belum ada
  const stats = data || {};

  return (
    <div className="p-4 md:p-8 space-y-8 text-left">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none mb-2">
            Dashboard BEM
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Pusat Kendali Eksekutif Mahasiswa & Birokrasi
          </p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <span className="material-symbols-outlined text-3xl">account_balance</span>
        </div>
      </div>

      {/* METRIK STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposal Pending</p>
            {/* Tampilkan data dari backend (contoh variabel) */}
            <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">
              {stats.total_pending || 0}
            </h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kegiatan ACC</p>
            <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">
              {stats.total_approved || 0}
            </h3>
          </div>
        </div>

      </div>

      {/* AREA GRAFIK ATAU INFORMASI LAINNYA */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm min-h-[300px]">
        <h3 className="font-black text-slate-800 text-base uppercase mb-4">Pengumuman & Aktivitas</h3>
        <p className="text-sm text-slate-500 font-medium">
          Selamat bekerja! Pantau terus usulan proposal dari berbagai UKM untuk kelancaran kegiatan kampus.
        </p>
      </div>

    </div>
  );
}