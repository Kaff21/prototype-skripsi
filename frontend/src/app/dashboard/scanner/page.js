"use client";
import ScannerAbsensi from "@/components/ScannerAbsensi";

export default function ScannerPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 sm:p-6 md:p-8">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] text-indigo-600 mb-2 shadow-inner">
          <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Pemindai QR Presensi</h1>
        <p className="text-sm text-slate-500 font-medium">
          Arahkan kamera ke QR Code dinamis yang ditampilkan oleh pengurus kegiatan.
        </p>
      </div>

      {/* Kontainer Scanner */}
      <div className="bg-white p-3 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden">
        <ScannerAbsensi />
      </div>

      {/* Petunjuk Penggunaan */}
      <div className="space-y-3">
        <div className="bg-slate-900 rounded-[2rem] p-5 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-amber-400 text-lg">lightbulb</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panduan Pemindaian</p>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-indigo-400">1</span>
                </div>
                <p className="text-xs font-medium text-slate-300">
                  Tekan tombol <strong className="text-white">"Buka Kamera"</strong> untuk mengaktifkan pemindai
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-indigo-400">2</span>
                </div>
                <p className="text-xs font-medium text-slate-300">
                  Arahkan kamera ke <strong className="text-white">QR Code</strong> yang tampil di layar pengurus
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-indigo-400">3</span>
                </div>
                <p className="text-xs font-medium text-slate-300">
                  Pastikan QR Code <strong className="text-white">berada di dalam kotak</strong> dan pencahayaan cukup
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-emerald-400">✓</span>
                </div>
                <p className="text-xs font-medium text-slate-300">
                  Sistem akan <strong className="text-emerald-400">otomatis memverifikasi</strong> dan mencatat presensi Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0 mt-0.5">warning</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Penting</p>
            <p className="text-xs text-amber-700 font-medium">
              QR Code berubah setiap <strong>15 detik</strong>. Jika scan gagal, tunggu QR berganti lalu coba lagi. 
              Pastikan Anda scan saat kegiatan sedang berlangsung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
