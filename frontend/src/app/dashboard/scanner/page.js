"use client";
import { useState } from "react";
import ScannerAbsensi from "@/components/ScannerAbsensi"; // Pastikan komponen scanner sudah dibuat

export default function ScannerPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-4 bg-indigo-50 rounded-[2rem] text-indigo-600 mb-2 shadow-sm">
          <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Scanner Absensi</h1>
        <p className="text-sm text-slate-500 font-medium">
          Arahkan kamera Anda ke QR Code kegiatan yang disediakan oleh Admin.
        </p>
      </div>

      {/* Kontainer Kamera */}
      <div className="bg-white p-3 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden">
        <ScannerAbsensi />
      </div>

      {/* Petunjuk Singkat */}
      <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <span className="material-symbols-outlined text-amber-400">lightbulb</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tips Absensi</p>
            <p className="text-xs font-medium opacity-90">Pastikan pencahayaan cukup dan QR Code terlihat jelas di dalam kotak scan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}