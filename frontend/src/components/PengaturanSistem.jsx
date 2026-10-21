"use client";

export default function PengaturanSistem() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Pengaturan Umum</h2>
        <p className="text-sm text-slate-500 mb-8">Konfigurasi dasar aplikasi SIM-ORMAWA STIKOM Banyuwangi.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Aplikasi</label>
            <input type="text" defaultValue="SIM-ORMAWA v1.0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Notifikasi</label>
            <input type="email" defaultValue="admin@stikom.ac.id" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-slate-50">
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}
